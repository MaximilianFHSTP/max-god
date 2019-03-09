
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

export class LocationController
{
    private database: Connection;
    private websocket: any;

    constructor(websocket)
    {
        this.database = Connection.getInstance();
        this.websocket = websocket;
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

    public registerLocation(data: any): any
    {
        const userId: number = data.user;
        const locationId: number = data.location;
        const dismissed: boolean = data.dismissed;

        return this.database.sequelize.transaction( (t1) => {
            return this.database.activity.findOrCreate({
                where: {userId, locationId},
                defaults: {locked: false}
            }).spread((activity, wasCreated) => {
                if(!wasCreated && activity.locked)
                {
                    activity.locked = false;
                    activity.save();
                }

                this.database.activityLog.create({activityId: activity.id});

                if(dismissed)
                    return {data: {location: locationId, dismissed}, message: new Message(SUCCESS_OK, 'Location Registered successfully')};

                this.database.user.update({currentLocation: locationId}, {where: {id: userId}});

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
            }).then(() => {
                return {
                    data: {location: locationId, dismissed},
                    message: new Message(SUCCESS_OK, 'Location Registered successfully')
                };
            });
        });
    }

    public registerTimelineUpdate(data: any): any
    {
        const userId: string = data.user;
        const locationId: number = data.location;

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

                else if(locationId === 4001 || locationId === 6001)
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

    private unlockTimelineAndSection(userId: string, locationId: number)
    {
        return this.database.activity.findOrCreate({
            where: {userId, locationId},
            defaults: {locked: false}
        }).spread((activity, wasCreated) => {
            if(!wasCreated && activity.locked)
            {
                activity.locked = false;
                activity.save();
            }
        }).then( () =>
        {
            let sectionId = 0;
            switch (locationId)
            {
                case 4001: sectionId = 4000; break;
                case 6001: sectionId = 6000; break;
            }

            return this.database.activity.findOrCreate({
                where: {userId, locationId: sectionId},
                defaults: {locked: false}
            }).spread((sectAct, wasCreated) => {
                if(!wasCreated && sectAct.locked)
                {
                    sectAct.locked = false;
                    sectAct.save();
                }
            }).then(() => {
                return this.database.user.findByPk(userId).then( user => {
                    return this.getLookupTable(user).then((locations) => {
                        return {data: {locations}, message: new Message(SUCCESS_OK, "Activity updated successfully")};
                    });
                });
            });
        });
    }

    private unlockTimeline(userId: string, locationId: number)
    {
        return this.database.activity.findOrCreate({
            where: {userId, locationId},
            defaults: {locked: false}
        }).spread((activity, wasCreated) => {
            if(!wasCreated && activity.locked)
            {
                activity.locked = false;
                activity.save();
            }
        }).then(() => {
            return this.database.user.findByPk(userId).then( user => {
                return this.getLookupTable(user).then((locations) => {
                    return {data: {locations}, message: new Message(SUCCESS_OK, "Activity updated successfully")};
                });
            });
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

    public disconnectedFromExhibit(data: any): any
    {
        const parentLocation: number = data.parentLocation;
        const location: number = data.location;
        const user: number = data.user;

        return this.database.sequelize.transaction( (t1) =>
        {
            return this.database.location.findOne({where: {id: location}}).then((location) =>
            {
                if(!location)
                    throw new Error("Location not found");

                location.statusId = statusTypes.FREE;
                location.save();
                return this.database.location.findOne({where: {id: parentLocation}}).then((parLocation) =>
                {
                    if(!parLocation)
                        throw new Error("Location not found");

                    parLocation.currentSeat -= 1;

                    if(parLocation.currentSeat < 0)
                        parLocation.currentSeat = 0;
                    
                    parLocation.save().then(() => {this.updateActiveLocationStatus(parentLocation);});
                    if(parLocation.locationTypeId === locationTypes.NOTIFY_EXHIBIT_AT)
                        this.websocket.to(parLocation.socketId).emit('odLeft', {location});
                });
            }).then(() =>
            {
                if(user)
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

    public tableDisconnectFromExhibit(users: any): void
    {
        for(let u of users)
        {
            this.database.user.findByPk(u.id).then(user =>
            {
                if(user)
                {
                    this.database.location.findByPk(user.currentLocation).then( location =>
                    {
                        if(location)
                        {
                            this.disconnectedFromExhibit({parentLocation: location.parentId, location: location.id});
                            this.registerLocation({user: user.id, location: location.parentId});
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
                console.log("Current seat: " + location.currentSeat + " Max seat: " + location.maxSeat);
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