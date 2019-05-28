
import { Connection } from '../database';
import {
    Message,
    LOCATION_NOT_FOUND,
    SUCCESS_OK,
    LOCATION_NOT_UPDATED,
    LOCATION_NOT_CREATED,
    SUCCESS_CREATED
} from '../messages';
import * as statusTypes from '../config/statusTypes';
import * as locationTypes from '../config/locationTypes';
import * as contentLanguages from "../config/contentLanguages";
import * as activityLogTypes from "../config/activityLogTypes";
import Logger from "../config/logger";

export class LocationController
{
    private database: Connection;
    private websocket: any;
    private _logger: Logger;

    constructor(websocket)
    {
        this.database = Connection.getInstance();
        this.websocket = websocket;
        this._logger = Logger.getInstance();
    }

    private getLookupTable(user): any
    {
        return this.database.location.findAll({
            include: [
                {
                    model: this.database.content,
                    where: {contentLanguageId: {[this.database.sequelize.Op.or]: [user.contentLanguageId, contentLanguages.ALL]}},
                    required: false
                }
            ],
            order: [
                ['id', 'ASC'],
                [this.database.content, 'order', 'asc']
            ]
        }).then( (locations) =>
        {
            return this.database.activity.findAll({where: {userId: user.id}}).then( (activities) =>
            {
                for(let loc of locations)
                {
                    // default values must be set if no activity exists yet
                    loc.dataValues.liked = false;
                    loc.dataValues.locked = true;
                    for(let act of activities)
                    {
                        if(loc.id === act.locationId)
                        {
                            loc.dataValues.liked = act.liked;
                            loc.dataValues.locked = act.locked;
                        }
                    }
                }

                return locations;
            });
        });
    }

    public sendLookupTable(data: any): any
    {
        const userId: string = data.user;

        return this.database.user.findByPk(userId).then( user => {
            return this.getLookupTable(user).then((locations) => {
                return {data: {locations}, message: new Message(SUCCESS_OK, "Activity updated successfully")};
            });
        });
    }

    public registerLocation(data: any, socketId: any): any
    {
        const userId: number = data.user;
        const locationId: number = data.location;
        const dismissed: boolean = data.dismissed;

        if(!userId || !locationId)
            return {data: null, message: new Message(LOCATION_NOT_FOUND, "Could register location. User or location id not provided!")};


        return this.database.sequelize.transaction( (t1) => {
            return this.database.activity.findOrCreate({
                where: {userId, locationId},
                defaults: {locked: false}
            }).spread((activity, wasCreated) =>
            {
                if(!wasCreated && activity.locked)
                {
                    activity.locked = false;
                    activity.save();
                }

                if(dismissed)
                {
                    this.database.activityLog.create({activityLocationId: locationId, activityUserId: userId, activityLogTypeId: activityLogTypes.REGISTER_LOCATION_DISMISSED});
                    return {
                        data: {location: locationId, dismissed},
                        message: new Message(SUCCESS_OK, 'Location Registered successfully')
                    };
                }

                this.database.activityLog.create({activityLocationId: locationId, activityUserId: userId, activityLogTypeId: activityLogTypes.REGISTER_LOCATION});


                this.database.user.findByPk(userId).then( (user) =>
                {
                    if(user.currentLocation === locationId)
                        return {data: null, message: new Message(LOCATION_NOT_UPDATED, 'Users current location is already the registered one')};

                    this.database.user.update({currentLocation: locationId, socketId}, {where: {id: userId}}).then( () =>
                    {
                        this.database.location.findByPk(locationId).then((currentLocation) =>
                        {
                            if (currentLocation.statusId === statusTypes.FREE &&
                                (currentLocation.locationTypeId === locationTypes.ACTIVE_EXHIBIT_ON ||
                                    currentLocation.locationTypeId === locationTypes.ACTIVE_EXHIBIT_BEHAVIOR_ON ||
                                    currentLocation.locationTypeId === locationTypes.NOTIFY_EXHIBIT_ON))
                            {
                                this.database.location.findOne({where: {id: currentLocation.parentId}}).then((parentLocation) =>
                                {
                                    if(parentLocation && parentLocation.currentSeat < parentLocation.maxSeat)
                                    {
                                        parentLocation.currentSeat += 1;
                                        parentLocation.save().then(() => {this.updateActiveLocationStatus(currentLocation.parentId);});
                                        if (currentLocation.locationTypeId === locationTypes.ACTIVE_EXHIBIT_ON)
                                            this.database.location.update({statusId: statusTypes.OCCUPIED}, {where: {id: currentLocation.id}});

                                        if(currentLocation.locationTypeId === locationTypes.NOTIFY_EXHIBIT_ON)
                                        {
                                            this.database.location.update({statusId: statusTypes.OCCUPIED}, {where: {id: currentLocation.id}});
                                            this.database.user.findByPk(userId).then( user =>
                                            {
                                                if(user)
                                                    this.websocket.to(parentLocation.socketId).emit('odJoined', {location: currentLocation, user});
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    });
                });
            }).then(() => {
                return {
                    data: {location: locationId, dismissed},
                    message: new Message(SUCCESS_OK, 'Location Registered successfully')
                };
            }).catch((err) => {
                // this._logger.error(err);
            });
        });
    }

    public registerTimelineUpdate(data: any): any
    {
        const userId: string = data.user;
        const locationId: number = data.location;

        if(!userId || !locationId)
            return {data: null, message: new Message(LOCATION_NOT_FOUND, "Could not register timeline update. User or location id not provided!")};


        return this.database.sequelize.transaction( (t1) =>
        {
            return this.database.neighbor.findOne({where: {nextLocation: locationId}}).then((neighbor) =>
            {
                if(neighbor)
                {
                    return this.database.location.findByPk(neighbor.prevLocation).then(prevLocation =>
                    {
                        return this.database.activity.findOne({where: {locationId: prevLocation.id, userId}})
                            .then((prevLocationActivity) =>
                            {
                                if(prevLocationActivity && !prevLocationActivity.locked)
                                    return this.unlockTimeline(userId, locationId);

                                else
                                    return {data: null, message: new Message(LOCATION_NOT_UPDATED, 'Could not register timeline update')};
                            });
                    });
                }

                else if(this.checkUnlockTimelineAndSection(locationId))
                    return this.unlockTimelineAndSection(userId, locationId);

                else
                    return this.unlockTimeline(userId, locationId);
            });
        });
    }

    public unlockAllTimelineLocations(data: any): any
    {
        const userId: string = data.user;

        return this.database.sequelize.transaction( (t1) =>
        {
            return this.database.user.findByPk(userId).then( (user) =>
            {
                if(!user) return;

                // unlock all locations in timeline
                this.registerTimelineUpdate({user: user.id, location: 1000}).then( () => {
                    this.registerTimelineUpdate({user: user.id, location: 101}).then( () => {
                        this.registerTimelineUpdate({user: user.id, location: 102}).then( () => {
                            this.registerTimelineUpdate({user: user.id, location: 2000}).then(() => {
                                this.registerTimelineUpdate({user: user.id, location: 2001});
                            });
                        });
                    });
                });
                this.registerTimelineUpdate({user: user.id, location: 2002});
                this.registerTimelineUpdate({user: user.id, location: 2003});
                this.registerTimelineUpdate({user: user.id, location: 2004});
                this.registerTimelineUpdate({user: user.id, location: 3000});
                this.registerTimelineUpdate({user: user.id, location: 301});
                this.registerTimelineUpdate({user: user.id, location: 4001});
                this.registerTimelineUpdate({user: user.id, location: 402}).then(() => {
                    this.registerTimelineUpdate({user: user.id, location: 403}).then(() => {
                        this.registerTimelineUpdate({user: user.id, location: 4004}).then(() => {
                            this.registerTimelineUpdate({user: user.id, location: 5000}).then(() => {
                                this.registerTimelineUpdate({user: user.id, location: 501}).then(() => {
                                    this.registerTimelineUpdate({user: user.id, location: 5001});
                                });
                            });
                        });
                    });
                });
                this.registerTimelineUpdate({user: user.id, location: 502});
                this.registerTimelineUpdate({user: user.id, location: 6001});

                return {data: null, message: new Message(SUCCESS_OK, "Activity updated successfully")};
            });
        });
    }

    private checkUnlockTimelineAndSection(locationId: number): boolean
    {
        let check = false;

        switch(locationId)
        {
            case 2001:
            case 301:
            case 4001:
            case 501:
            case 6001:
                check = true;
        }

        return check;
    }

    private unlockTimelineAndSection(userId: string, locationId: number)
    {
        if(!userId || !locationId)
            return {data: null, message: new Message(LOCATION_NOT_FOUND, "Could not unlock timeline. User or location id not provided!")};


            return this.database.activity.findOrCreate({
                where: {userId, locationId},
                defaults: {locked: false}
            }).spread((activity, wasCreated) => {
                if (!wasCreated && activity.locked) {
                    activity.locked = false;
                    activity.save();
                }

                if (wasCreated)
                    this.database.activityLog.create({
                        activityLocationId: locationId,
                        activityUserId: userId,
                        activityLogTypeId: activityLogTypes.UNLOCK_TIMELINE_LOACATION
                    });

                else
                    this.database.activityLog.create({
                        activityLocationId: locationId,
                        activityUserId: userId,
                        activityLogTypeId: activityLogTypes.RECEIVED_TIMELINE_LOCATION
                    });

            }).then(() => {
                // get first digit of locationId (e.g. 501 => 5
                let sectionIdString = String(locationId).charAt(0);
                // multiply with 1000 to get the sectionId (e.g. 5000)
                const sectionId = Number(sectionIdString) * 1000;

                if (!sectionId)
                    return {
                        data: null,
                        message: new Message(LOCATION_NOT_FOUND, "Could not unlock timeline. User or location id not provided!")
                    };

                return this.database.activity.findOrCreate({
                    where: {userId, locationId: sectionId},
                    defaults: {locked: false}
                }).spread((sectAct, wasCreated) => {
                    if (!wasCreated && sectAct.locked) {
                        sectAct.locked = false;
                        sectAct.save();
                    }

                    if (wasCreated)
                        this.database.activityLog.create({
                            activityLocationId: locationId,
                            activityUserId: userId,
                            activityLogTypeId: activityLogTypes.UNLOCK_TIMELINE_LOACATION
                        });

                    else
                        this.database.activityLog.create({
                            activityLocationId: locationId,
                            activityUserId: userId,
                            activityLogTypeId: activityLogTypes.RECEIVED_TIMELINE_LOCATION
                        });

                }).then(() => {
                    return this.database.user.findByPk(userId).then(user => {
                        return this.getLookupTable(user).then((locations) => {
                            return {
                                data: {locations},
                                message: new Message(SUCCESS_OK, "Activity updated successfully")
                            };
                        });
                    });
                });
            }).catch((err) => {
                // this._logger.error(err);
                return {data: null, message: new Message(LOCATION_NOT_FOUND, "Could not unlock timeline. User or location id not provided!")};
            });

    }

    private unlockTimeline(userId: string, locationId: number)
    {
        if(!userId || !locationId)
            return {data: null, message: new Message(LOCATION_NOT_FOUND, "Could not unlock timeline. User or location id not provided!")};


            return this.database.activity.findOrCreate({
                where: {userId, locationId},
                defaults: {locked: false}
            }).spread((activity, wasCreated) => {
                if (!wasCreated && activity.locked) {
                    activity.locked = false;
                    activity.save();
                }

                if (wasCreated)
                    this.database.activityLog.create({
                        activityLocationId: locationId,
                        activityUserId: userId,
                        activityLogTypeId: activityLogTypes.UNLOCK_TIMELINE_LOACATION
                    });

                else
                    this.database.activityLog.create({
                        activityLocationId: locationId,
                        activityUserId: userId,
                        activityLogTypeId: activityLogTypes.RECEIVED_TIMELINE_LOCATION
                    });

            })
                .then(() => {
                return this.database.user.findByPk(userId).then(user => {
                    return this.getLookupTable(user).then((locations) => {
                        return {data: {locations}, message: new Message(SUCCESS_OK, "Activity updated successfully")};
                    });
                });
            }).catch((err) => {
                    // this._logger.error(err);
                    return {data: null, message: new Message(LOCATION_NOT_FOUND, "Could not unlock timeline. User or location id not provided!")};
                });
    }

    public updateLocationLike(data: any): any
    {
        const userId: number = data.user;
        const location: number = data.location;
        const like: boolean = data.like;

        return this.database.sequelize.transaction( (t1) => {
            return this.database.activity.update({liked: like}, {
                where: {
                    userId: userId,
                    locationId: location
                }
            }).then(() => {
                return this.database.user.findByPk(userId).then( user => {
                    return this.getLookupTable(user).then((locations) => {
                        return {data: {locations}, message: new Message(SUCCESS_OK, "Activity updated successfully")};
                    });
                });
            }).catch(() => {
                return {data: null, message: new Message(LOCATION_NOT_UPDATED, 'Could not update activity')};
            });
        });
    }

    public updateLocationSeat(data: any): any
    {
        const locationId: number = data.location;

        return this.database.sequelize.transaction( (t1) =>
        {
            this.database.location.findByPk(locationId).then((currentLocation) => {
                if (currentLocation.statusId === statusTypes.FREE &&
                    (currentLocation.locationTypeId === locationTypes.ACTIVE_EXHIBIT_ON || currentLocation.locationTypeId === locationTypes.ACTIVE_EXHIBIT_BEHAVIOR_ON || currentLocation.locationTypeId === locationTypes.NOTIFY_EXHIBIT_ON)) {
                    this.database.location.findOne({where: {id: currentLocation.parentId}}).then((parentLocation) =>
                    {
                        if(parentLocation && parentLocation.currentSeat < parentLocation.maxSeat)
                        {
                            parentLocation.currentSeat += 1;
                            parentLocation.save();
                            if (currentLocation.locationTypeId === locationTypes.ACTIVE_EXHIBIT_ON || currentLocation.locationTypeId === locationTypes.NOTIFY_EXHIBIT_ON)
                                this.database.location.update({statusId: statusTypes.OCCUPIED}, {where: {id: currentLocation.id}});

                            this.updateActiveLocationStatus(currentLocation.parentId);
                        }
                    });
                }
            });
        });
    }

    public disconnectedFromExhibit(data: any, ): any
    {
        //console.log('------------------------- disconnectedFromExhibit -------------------------');
        //console.log(JSON.stringify(data));
        //console.log('---------------------------------------------------------------------------');
        const parentLocation: number = data.parentLocation;
        const locationId: number = data.location;

        return this.database.sequelize.transaction( (t1) =>
        {
            return this.database.location.findOne({where: {id: locationId}}).then((location) =>
            {
                if(!location)
                    return {data: {location: locationId, parent: parentLocation}, message: new Message(LOCATION_NOT_UPDATED, "Location not found")};

                if(location.statusId === statusTypes.FREE)
                    return {data: {location: locationId, parent: parentLocation}, message: new Message(SUCCESS_OK, "Location status already free")};

                location.statusId = statusTypes.FREE;
                location.save();
                return this.database.location.findOne({where: {id: parentLocation}}).then((parLocation) =>
                {
                    if(!parLocation)
                        return {data: {location: locationId, parent: parentLocation}, message: new Message(LOCATION_NOT_UPDATED, "Parent location not found")};

                    parLocation.currentSeat -= 1;

                    if(parLocation.currentSeat < 0)
                        parLocation.currentSeat = 0;

                    parLocation.save().then(() => {this.updateActiveLocationStatus(parentLocation);});
                    if(parLocation.locationTypeId === locationTypes.NOTIFY_EXHIBIT_AT)
                        this.websocket.to(parLocation.socketId).emit('odLeft', {location});

                    return {data: {location: locationId, parent: parentLocation}, message: new Message(SUCCESS_OK, 'Disconnected successfully from Exhibit')};
                });
            }).catch((err) => {
                console.log(err);
                return {data: {location: locationId, parent: parentLocation}, message: new Message(LOCATION_NOT_UPDATED, "Could not update location status")};
            });
        });
    }

    public exhibitDisconnectedFromExhibit(data: any, ): any
    {
        //console.log('------------------------- exhibitDisconnectedFromExhibit -------------------------');
        //console.log(JSON.stringify(data));
        //console.log('---------------------------------------------------------------------------');
        const parentLocation: number = data.parentLocation;
        const location: number = data.location;
        const user: string = data.user;

        return this.database.sequelize.transaction( (t1) =>
        {
            return this.database.location.findOne({where: {id: location}}).then((location) =>
            {
                if(!user)
                    return {data: null, message: new Message(LOCATION_NOT_UPDATED, "User id not provided")};

                if(!location)
                    return {data: null, message: new Message(LOCATION_NOT_UPDATED, "Location not found")};

                if(location.statusId === statusTypes.FREE)
                    return {data: null, message: new Message(SUCCESS_OK, "Location status already free")};

                location.statusId = statusTypes.FREE;
                location.save();
                return this.database.location.findOne({where: {id: parentLocation}}).then((parLocation) =>
                {
                    if(!parLocation)
                        return {data: null, message: new Message(LOCATION_NOT_UPDATED, "Parent location not found")};

                    parLocation.currentSeat -= 1;

                    if(parLocation.currentSeat < 0)
                        parLocation.currentSeat = 0;

                    parLocation.save().then(() => {this.updateActiveLocationStatus(parentLocation);});
                });
            }).then(() =>
            {
                if(user && user !== 'localUser')
                {
                    this.database.user.findByPk(user).then((user) =>
                    {
                        this.websocket.to(user.socketId).emit('userKickedFromExhibit', {data: {parentId: parentLocation}, message: new Message(SUCCESS_OK, 'You were kicked from the exhibit.')})
                    });
                }
                return {data: {location, parent: parentLocation}, message: new Message(SUCCESS_OK, 'Disconnected successfully from Exhibit')};
            }).catch(() => {
                return {data: null, message: new Message(LOCATION_NOT_UPDATED, "Could not update location status")};
            });
        });
    }

    public tableDisconnectFromExhibit(data: any): void
    {
        const users = data.users;
        console.log('------------------------- tableDisconnectFromExhibit -------------------------');
        console.log(JSON.stringify(data));
        console.log('---------------------------------------------------------------------------');
        const location = data.location;

        for(let u of users)
        {
            this.database.user.findByPk(u.id).then(user =>
            {
                if(user && user.currentLocation === location)
                {
                    this.database.location.findByPk(user.currentLocation).then( location =>
                    {
                        if(location)
                        {
                            this.exhibitDisconnectedFromExhibit({parentLocation: location.parentId, location: location.id, user: user.id});
                            // this.registerLocation({user: user.id, location: location.parentId});
                        }
                    });
                }
            });
        }
    }

    public checkLocationStatus(locationId: number): any
    {
        //console.log(locationId);
        let status: String = "NOT FOUND";
        return this.database.location.findByPk(locationId).then( (location) =>
        {
            // console.log("CheckLocationStatus:\n-typeId: " + location.locationTypeId + "\n-statusId: " + location.statusId);
            if(location.locationTypeId != locationTypes.ACTIVE_EXHIBIT_ON && location.locationTypeId != locationTypes.ACTIVE_EXHIBIT_AT &&
                location.locationTypeId != locationTypes.ACTIVE_EXHIBIT_BEHAVIOR_ON && location.locationTypeId != locationTypes.ACTIVE_EXHIBIT_BEHAVIOR_AT &&
                location.locationTypeId != locationTypes.NOTIFY_EXHIBIT_ON && location.locationTypeId != locationTypes.NOTIFY_EXHIBIT_AT)
                status = "NOT ACTIVE EXHIBIT";

            else if(location.locationTypeId === locationTypes.ACTIVE_EXHIBIT_AT && location.statusId === statusTypes.FREE && location.currentSeat < location.maxSeat)
                status = "FREE";

            else if(location.locationTypeId === locationTypes.ACTIVE_EXHIBIT_BEHAVIOR_AT && location.statusId === statusTypes.FREE && location.currentSeat < location.maxSeat)
                status = "FREE";

            else if(location.locationTypeId === locationTypes.ACTIVE_EXHIBIT_ON && location.statusId === statusTypes.FREE)
                status = "FREE";

            else if(location.locationTypeId === locationTypes.NOTIFY_EXHIBIT_AT && location.statusId === statusTypes.FREE && location.currentSeat < location.maxSeat)
                status = "FREE";

            else if(location.locationTypeId === locationTypes.NOTIFY_EXHIBIT_ON && location.statusId === statusTypes.FREE)
                status = "FREE";

            else if(location.statusId === statusTypes.OFFLINE)
                status = "OFFLINE";

            else
                status = "OCCUPIED";

            return {data: {status, location: locationId} , message: new Message(SUCCESS_OK, "Status queried successfully")};
        }).catch(() => {
            return {data: null, message: new Message(LOCATION_NOT_FOUND, "Could not find location")};
        });
    }

    public updateActiveLocationStatus(locationId: number): any
    {
        return this.database.location.findByPk(locationId).then( (location) =>
        {
            if(location.locationTypeId === locationTypes.ACTIVE_EXHIBIT_AT ||
                location.locationTypeId === locationTypes.ACTIVE_EXHIBIT_BEHAVIOR_AT ||
                location.locationTypeId === locationTypes.NOTIFY_EXHIBIT_AT)
            {
                if(location.currentSeat < location.maxSeat && location.statusId === statusTypes.OCCUPIED)
                {
                    location.statusId = statusTypes.FREE;
                }

                else if(location.currentSeat >= location.maxSeat && location.statusId === statusTypes.FREE)
                {
                    location.statusId = statusTypes.OCCUPIED;
                }

                location.save();
            }
        });
    }
}
