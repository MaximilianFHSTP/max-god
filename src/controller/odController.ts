import {Connection} from '../database';
import {Message, SUCCESS_CREATED, SUCCESS_LOGGED_IN, SUCCESS_UPDATED} from "../messages";
import {OD_NOT_CREATED, OD_NOT_FOUND, OD_NOT_UPDATED} from "../messages/odTypes";
import {LOGIN_FAILED} from "../messages/authenticationTypes";
import * as contentLanguages from '../config/contentLanguages';
import * as locationTypes from '../config/locationTypes';
import * as statusTypes from '../config/statusTypes';

export class OdController {
    private database: Connection;

    constructor() {
        this.database = Connection.getInstance();
    }

    private getLookupTable(user): any {
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
                [this.database.content, 'order', 'ASC']
            ]
        }).then((locations) => {
            return this.database.activity.findAll({where: {userId: user.id}}).then((activities) => {
                for (let loc of locations) {
                    // default values must be set if no activity exists yet
                    loc.dataValues.liked = false;
                    loc.dataValues.locked = true;
                    for (let act of activities) {
                        if (loc.id === act.locationId) {
                            loc.dataValues.liked = act.liked;
                            loc.dataValues.locked = act.locked;
                        }
                    }
                }

                return locations;
            });
        });
    }

    public registerOD(data: any, socketId: any): any {
        const identifier: string = data.identifier;
        const deviceAddress: string = data.deviceAddress;
        const deviceOS: string = data.deviceOS;
        const deviceVersion: string = data.deviceVersion;
        const deviceModel: string = data.deviceModel;
        const email: string = data.email;
        const pwd: string = data.password;
        const language: number = data.language;
        //const ipAddress: string = data.ipAddress;

        return this.database.sequelize.transaction((t1) => {
            return this.database.user.create({
                name: identifier,
                email: email,
                password: pwd,
                isGuest: false,
                deviceAddress: deviceAddress,
                deviceOS: deviceOS,
                deviceVersion: deviceVersion,
                deviceModel: deviceModel,
                ipAddress: 'not set',
                contentLanguageId: language,
                socketId
            }).then((user) =>
            {
                this.database.coaPart.findAll({where: {id: {[this.database.sequelize.Op.between]: [10, 13]}}}).then((parts) =>
                {
                    for (let part of parts)
                    {
                        if(part.id === 10)
                            this.database.userCoaPart.create({userId: user.id, coaPartId: part.id, isActive: true});

                        else
                            this.database.userCoaPart.create({userId: user.id, coaPartId: part.id});
                    }
                });

                return this.getLookupTable(user).then((locations) => {
                    // console.log(user);
                    return {
                        data: {user, locations},
                        message: new Message(SUCCESS_CREATED, "User created successfully")
                    };
                });
            }).catch(() => {
                return {data: null, message: new Message(OD_NOT_CREATED, "Could not create user")};
            });
        });
    }

    public registerGuest(data: any, socketId: any): any {
        const next = this.database.getNextGuestNumber();

        const identifier: string = 'Guest' + next;
        const deviceAddress: string = data.deviceAddress;
        const deviceOS: string = data.deviceOS;
        const deviceVersion: string = data.deviceVersion;
        const deviceModel: string = data.deviceModel;
        const language: number = data.language;
        //const ipAddress: string = data.ipAddress;

        // console.log("id: %s language: %d", identifier, language);

        return this.database.sequelize.transaction((t1) => {
            return this.database.user.create({
                name: identifier,
                deviceAddress: deviceAddress,
                deviceOS: deviceOS,
                deviceVersion: deviceVersion,
                deviceModel: deviceModel,
                ipAddress: 'not set',
                contentLanguageId: language,
                socketId
            }).then((user) => {

                this.database.coaPart.findAll({where: {id: {[this.database.sequelize.Op.between]: [10, 13]}}}).then((parts) =>
                {
                    for (let part of parts)
                    {
                        if(part.id === 10)
                            this.database.userCoaPart.create({userId: user.id, coaPartId: part.id, isActive: true});

                        else
                            this.database.userCoaPart.create({userId: user.id, coaPartId: part.id});
                    }
                });

                return this.getLookupTable(user).then((locations) => {
                    return {
                        data: {user, locations},
                        message: new Message(SUCCESS_CREATED, "User created successfully")
                    };
                });
            }).catch(() => {
                return {data: null, message: new Message(OD_NOT_CREATED, "User could not be registered")};
            });
        });
    }

    public findUser(identifier: any): any {
        return this.database.user.findByPk(identifier).then(user => {
            return user;
        });
    }

    public autoLoginUser(identifier: any, socketId: any): any {
        return this.database.user.findByPk(identifier).then(user => {
            if (!user)
                throw new Error('User not found');

            user.socketId = socketId;
            user.save();

            return this.getLookupTable(user).then((locations) => {
                return {
                    data: {user, locations},
                    message: new Message(SUCCESS_LOGGED_IN, "User logged in successfully")
                };
            });
        }).catch(() => {
            return {data: null, message: new Message(LOGIN_FAILED, "User not found!")}
        });
    }

    public loginUser(data: any, socketId: any): any {
        const user = data.user;
        const email = data.email;
        const password = data.password;

        if (user) {
            return this.database.user.findOne({where: {name: user, password}}).then((user) => {
                if (user) {
                    user.socketId = socketId;
                    user.save();

                    return this.getLookupTable(user).then((locations) => {
                        return {
                            data: {user, locations},
                            message: new Message(SUCCESS_LOGGED_IN, "User logged in successfully")
                        };
                    });
                } else {
                    return {data: undefined, message: new Message(OD_NOT_FOUND, "Could not log in user")};
                }
            }).catch(() => {
                return {data: null, message: new Message(LOGIN_FAILED, "User not found!")}
            });
        } else {
            return this.database.user.findOne({where: {email, password}}).then((user) => {
                if (user) {
                    return this.getLookupTable(user).then((locations) => {
                        return {
                            data: {user, locations},
                            message: new Message(SUCCESS_LOGGED_IN, "User logged in successfully")
                        };
                    });
                } else {
                    return {data: undefined, message: new Message(OD_NOT_FOUND, "Could not log in user")};
                }
            }).catch(() => {
                return {data: null, message: new Message(LOGIN_FAILED, "User not found!")}
            });
        }
    }

    public updateUserLanguage(data): any
    {
        const id = data.user;
        const lang = data.language;
        return this.database.user.findByPk(id).then(user =>
        {
            if (!user)
                throw new Error('User not found');

            user.contentLanguageId = lang;
            user.save();

            return this.getLookupTable(user).then((locations) => {
                return {
                    data: {locations, language: lang},
                    message: new Message(SUCCESS_UPDATED, "Updated user language successfully!")
                };
            });
        }).catch(() => {
            return {data: null, message: new Message(OD_NOT_UPDATED, "Could not change language!")}
        });
    }

    public updateUserData(data)
    {
        const id = data.id;
        const username = data.username;
        const email = data.email;
        const password = data.password;
        const newPassword = data.newPassword;

        return this.database.user.findByPk(id).then(user =>
        {
            if (!user)
                throw new Error('User not found');

            if(username && username !== '')
                user.name = username;

            if(email && email !== '')
                user.email = email;

            if(password && password === user.password && newPassword && newPassword !== user.password && newPassword !== '')
                user.password = newPassword;

            user.save();

            return {data: {user}, message: new Message(SUCCESS_UPDATED, "Updated user data successfully!")};
        }).catch(() => {
            return {data: null, message: new Message(OD_NOT_UPDATED, "Could not update user data!")}
        });
    }

    public makeToRealUser(data: any): any
    {
        const id = data.id;
        const username = data.username;
        const email = data.email;
        const password = data.password;

        return this.database.user.findByPk(id).then(user =>
        {
            if (!user)
                throw new Error('User not found');

            if(username && username !== '')
                user.name = username;

            if(email && email !== '')
                user.email = email;

            if(password && password !== '')
                user.password = password;

            user.isGuest = false;

            user.save();

            return {data: {user}, message: new Message(SUCCESS_UPDATED, "Updated user data successfully!")};
        }).catch(() => {
            return {data: null, message: new Message(OD_NOT_UPDATED, "Could not update user data!")}
        });
    }

    public deleteOD(userId: number)
    {
        this.database.user.destroy({where: {id: userId}});
    }

    public async checkUserNameExists(name: String): Promise<boolean> {
        return this.database.user.count({where: {name: name}}).then(count => {
            return count != 0;
        });
    }

    public checkEmailExists(email: String): any {
        return this.database.user.count({where: {email}}).then(count => {
            return count != 0;
        });
    }

    public checkNameOrEmailExists(data): any {
        let nameExists = this.checkUserNameExists(data.name);
        let mailExists = this.checkEmailExists(data.email);

        return Promise.all([nameExists, mailExists]).then(values =>
        {
            return {name: values[0], email: values[1]};
        });
    }

    public resetUserLocation(od): void
    {
        this.database.user.findByPk(od.id).then( (user) =>
        {
            if(!user) return;
            
           const currUserLoc = user.currentLocation;
           this.database.location.findByPk(currUserLoc).then((location) => {
               if (!location) return;

               const locType = location.locationTypeId;
               const isNotifyOrActiveOn = locType === locationTypes.NOTIFY_EXHIBIT_ON || locType === locationTypes.ACTIVE_EXHIBIT_ON;

               if (isNotifyOrActiveOn && location.statusId === statusTypes.OCCUPIED)
               {
                   location.statusId = statusTypes.FREE;
                   location.save();
               }

              if(isNotifyOrActiveOn || locType === locationTypes.ACTIVE_EXHIBIT_BEHAVIOR_ON)
              {
                  this.database.location.findByPk(location.parentId).then(parentLoc =>
                  {
                      if(parentLoc)
                      {
                          parentLoc.currentSeat -= 1;

                          if(parentLoc.currentSeat < 0)
                              parentLoc.currentSeat = 0;

                          parentLoc.save();
                      }
                  });
              }

              this.database.location.findOne({where: {isStartPoint: true}}).then(startLocation =>
              {
                 if(startLocation)
                    user.currentLocation = startLocation.id;

                 user.save();
              });
           });
        });
    }
}