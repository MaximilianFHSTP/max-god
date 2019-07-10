import {Connection} from '../database';
import {
    LOG_NOT_CREATED,
    Message,
    OD_NOT_DELETED,
    SUCCESS_CREATED,
    SUCCESS_LOGGED_IN,
    SUCCESS_OK,
    SUCCESS_UPDATED
} from "../messages";
import {OD_NOT_CREATED, OD_NOT_FOUND, OD_NOT_UPDATED, OD_CREDENTIALS_NOT_MATCHING} from "../messages/odTypes";
import {LOGIN_FAILED} from "../messages/authenticationTypes";
import * as contentLanguages from '../config/contentLanguages';
import * as locationTypes from '../config/locationTypes';
import * as statusTypes from '../config/statusTypes';
import * as bcrypt from 'bcrypt';
import Logger from "../config/logger";
import * as logTypes from '../config/logTypes';

export class OdController {
    private _database: Connection;
    private _logger: Logger;

    constructor() {
        this._database = Connection.getInstance();
        this._logger = Logger.getInstance();
    }

    private getLookupTable(user): any {
        return this._database.location.findAll({
            include: [
                {
                    model: this._database.content,
                    where: {contentLanguageId: {[this._database.sequelize.Op.or]: [user.contentLanguageId, contentLanguages.ALL]}},
                    required: false
                }
            ],
            order: [
                ['id', 'ASC'],
                [this._database.content, 'order', 'ASC']
            ]
        }).then((locations) => {
            return this._database.activity.findAll({where: {userId: user.id}}).then((activities) => {
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

        const hash = this.hashPassword(pwd);

        return this.checkNameOrEmailExists({name: identifier, email}).then( (result) =>
        {
            if(result.name)
                return {data: null, message: new Message(OD_NOT_CREATED, "Username is already existing!")};

            if(result.email)
                return {data: null, message: new Message(OD_NOT_CREATED, "Email is already existing!")};

            return this._database.sequelize.transaction((t1) => {
                return this._database.user.create({
                    name: identifier,
                    email: email,
                    password: hash,
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
                    this._database.coaPart.findAll({where: {id: {[this._database.sequelize.Op.between]: [10, 13]}}}).then((parts) =>
                    {
                        for (let part of parts)
                        {
                            if(part.id === 10)
                                this._database.userCoaPart.create({userId: user.id, coaPartId: part.id, isActive: true});

                            else
                                this._database.userCoaPart.create({userId: user.id, coaPartId: part.id});
                        }
                    });

                    return this.getLookupTable(user).then((locations) => {
                        // console.log(user);
                        return {
                            data: {user, locations},
                            message: new Message(SUCCESS_CREATED, "User created successfully")
                        };
                    });
                }).catch((err) => {
                    this._logger.error(err);
                    return {data: null, message: new Message(OD_NOT_CREATED, "Could not create user")};
                });
            });
        });
    }

    public async registerGuest(data: any, socketId: any): Promise<any> {
        const next = this._database.getNextGuestNumber();

        let identifier: string = 'Guest' + next;
        const deviceAddress: string = data.deviceAddress;
        const deviceOS: string = data.deviceOS;
        const deviceVersion: string = data.deviceVersion;
        const deviceModel: string = data.deviceModel;
        const language: number = data.language;
        //const ipAddress: string = data.ipAddress;

        let nameIsExisting = true;

        while(nameIsExisting)
        {
            let count = await this._database.user.count({where: {name: identifier}});
            nameIsExisting = count !== 0;

            if(nameIsExisting)
                identifier = 'Guest' + this._database.getNextGuestNumber();
        }
        // console.log("id: %s language: %d", identifier, language);

        return this._database.sequelize.transaction((t1) => {
            return this._database.user.create({
                name: identifier,
                deviceAddress: deviceAddress,
                deviceOS: deviceOS,
                deviceVersion: deviceVersion,
                deviceModel: deviceModel,
                ipAddress: 'not set',
                contentLanguageId: language,
                socketId
            }).then((user) => {

                this._database.coaPart.findAll({where: {id: {[this._database.sequelize.Op.between]: [10, 13]}}}).then((parts) =>
                {
                    for (let part of parts)
                    {
                        if(part.id === 10)
                            this._database.userCoaPart.create({userId: user.id, coaPartId: part.id, isActive: true});

                        else
                            this._database.userCoaPart.create({userId: user.id, coaPartId: part.id});
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
        return this._database.user.findByPk(identifier).then(user => {
            return user;
        });
    }

    public updateUserQuestionnaireAnswered(userId: any): any
    {
         return this._database.user.update({answeredQuestionnaire: true}, {where: {id: userId}}).then(() =>
         {
             return this._database.user.findByPk(userId).then(user =>
             {
                 return {
                     data: user,
                     message: new Message(SUCCESS_UPDATED, "User updated successfully")
                 };
             });
         }).catch( err => {
             return {
                 data: null,
                 message: new Message(OD_NOT_UPDATED, "Could not update user information")
             };
         });
    }

    public autoLoginUser(identifier: string, device: any, socketId: any): any
    {
        const deviceAddress: string = device.deviceAddress;
        const deviceOS: string = device.deviceOS;
        const deviceVersion: string = device.deviceVersion;
        const deviceModel: string = device.deviceModel;

        return this._database.user.findByPk(identifier).then(user => {
            if (!user)
                throw new Error('User not found');

            user.socketId = socketId;
            if(device !== null && device !== undefined)
            {
                user.deviceAddress = deviceAddress;
                user.deviceOS = deviceOS;
                user.deviceVersion = deviceVersion;
                user.deviceModel = deviceModel;
            }

            this._database.log.create({userId: user.id, logTypeId: logTypes.AUTO_LOGIN});

            return user.save().then(() =>
            {
                return this.getLookupTable(user).then((locations) => {
                    return {
                        data: {user, locations},
                        message: new Message(SUCCESS_LOGGED_IN, "User logged in successfully")
                    };
                });
            });
        }).catch(() => {
            return {data: null, message: new Message(LOGIN_FAILED, "User not found!")}
        });
    }

    public loginUser(data: any, socketId: any): any
    {
        const user = data.user;
        const email = data.email;
        const password = data.password;

        const deviceAddress: string = data.deviceAddress;
        const deviceOS: string = data.deviceOS;
        const deviceVersion: string = data.deviceVersion;
        const deviceModel: string = data.deviceModel;

        if (user)
        {
            return this._database.user.findOne({where: {name: user}}).then((user) =>
            {
                if (user)
                {
                    const valid = bcrypt.compareSync(password, user.password);
                    if(!valid) return {data: undefined, message: new Message(OD_NOT_FOUND, "Could not log in user")};

                    user.socketId = socketId;

                    if(deviceAddress !== undefined && deviceOS !== undefined && deviceVersion !== undefined && deviceModel !== undefined)
                    {
                        user.deviceAddress = deviceAddress;
                        user.deviceOS = deviceOS;
                        user.deviceVersion = deviceVersion;
                        user.deviceModel = deviceModel;
                    }

                    this._database.log.create({userId: user.id, logTypeId: logTypes.USER_LOGIN});

                    return user.save().then(() =>
                    {
                        return this.getLookupTable(user).then((locations) => {
                            return {
                                data: {user, locations},
                                message: new Message(SUCCESS_LOGGED_IN, "User logged in successfully")
                            };
                        });
                    });
                }
                else {
                    return {data: undefined, message: new Message(OD_NOT_FOUND, "Could not log in user")};
                }
            }).catch(() => {
                return {data: null, message: new Message(LOGIN_FAILED, "User not found!")}
            });
        } else {
            return this._database.user.findOne({where: {email, password}}).then((user) => {
                if (user) {
                    return this.getLookupTable(user).then((locations) => {
                        return {
                            data: {user, locations},
                            message: new Message(SUCCESS_LOGGED_IN, "User logged in successfully")
                        };
                    });
                } else {
                    return {data: null, message: new Message(OD_NOT_FOUND, "Could not log in user")};
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
        return this._database.user.findByPk(id).then(user =>
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

        return this._database.user.findByPk(id).then(user =>
        {
            if (!user)
                throw new Error('User not found');

            if(username && username !== '')
                user.name = username;

            if(email && email !== '')
                user.email = email;

            if(newPassword && newPassword !== '')
            {
                const valid = bcrypt.compareSync(password, user.password);
                if(!valid) return {data: null, message: new Message(OD_NOT_UPDATED, "Could not update user data!")};

                user.password = this.hashPassword(newPassword);
            }

            return user.save().then( () =>
            {
                return {data: {user}, message: new Message(SUCCESS_UPDATED, "Updated user data successfully!")};
            });
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

        return this._database.user.findByPk(id).then(user =>
        {
            if (!user)
                throw new Error('User not found');

            if(username && username !== '')
                user.name = username;

            if(email && email !== '')
                user.email = email;

            if(password && password !== '')
                user.password = this.hashPassword(password);

            user.isGuest = false;

            return user.save().then(() => {
                return {data: {user}, message: new Message(SUCCESS_UPDATED, "Updated user data successfully!")};
            });
        }).catch(() => {
            return {data: null, message: new Message(OD_NOT_UPDATED, "Could not update user data!")}
        });
    }

    public deleteOD(userId: number)
    {
        return this._database.user.update({isDeleted: true},{where: {id: userId}}).then( () =>
        {
            return {data: null, message: new Message(SUCCESS_OK, "User deleted successfully")};
        }).catch((err) =>
        {
            return {data: null, message: new Message(OD_NOT_DELETED, "Could not delete user")};
        });
    }

    public async checkUserNameExists(name: String): Promise<boolean> {
        return this._database.user.count({where: {name: name}}).then(count => {
            return count != 0;
        });
    }

    public checkEmailExists(email: String): any {
        return this._database.user.count({where: {email, isDeleted: false}}).then(count => {
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
        this._database.user.findByPk(od.id).then( (user) =>
        {
            if(!user) return;

           const currUserLoc = user.currentLocation;
           this._database.location.findByPk(currUserLoc).then((location) => {
               if (!location) return;

               const locType = location.locationTypeId;
               const isNotifyOrActiveOn = locType === locationTypes.NOTIFY_EXHIBIT_ON || locType === locationTypes.ACTIVE_EXHIBIT_ON;

               if (isNotifyOrActiveOn && location.statusId === statusTypes.OCCUPIED)
               {
                   location.statusId = statusTypes.FREE;
                   location.save();

                   if(locType === locationTypes.ACTIVE_EXHIBIT_BEHAVIOR_ON)
                   {
                       this._database.location.findByPk(location.parentId).then(parentLoc =>
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
               }

              this._database.location.findOne({where: {isStartPoint: true}}).then(startLocation =>
              {
                 if(startLocation)
                    user.currentLocation = startLocation.id;

                 user.save();
              });
           });
        });
    }

    public addUserLogEntry(data: any): any
    {
        const logType = data.logType;
        const user = data.user;
        const location = data.location;
        const comment = data.comment;

        return this._database.log.create({
            userId: user,
            logTypeId: logType,
            locationId: location,
            comment
        }).then((logEntry) =>
        {
            return {data: logEntry, message: new Message(SUCCESS_CREATED, "Log entry created successfully")};
        }).catch( err =>
        {
            this._logger.error(err);
            return {data: null, message: new Message(LOG_NOT_CREATED, "Could not create log entry")};
        });
    }

    public checkUserDeviceData(data): any
    {
        const userId: string = data.userId;
        const deviceAddress: string = data.deviceAddress;
        const deviceOS: string = data.deviceOS;
        const deviceVersion: string = data.deviceVersion;
        const deviceModel: string = data.deviceModel;
        const shouldBeUpdated: boolean = data.shouldBeUpdated;

        return this._database.user.findByPk(userId).then(user =>
        {
            if(user.deviceAddress !== deviceAddress || user.deviceOS !== deviceOS || user.deviceVersion !== deviceVersion || user.deviceModel !== deviceModel)
            {
                if(shouldBeUpdated)
                {
                    user.deviceAddress = deviceAddress;
                    user.deviceOS = deviceOS;
                    user.deviceVersion = deviceVersion;
                    user.deviceModel = deviceModel;

                    return user.save().then(() =>
                    {
                        return {data: user, message: new Message(SUCCESS_UPDATED, "Device data was not matching but updated successfully")};
                    });
                }

                else
                    return {data: user, message: new Message(OD_CREDENTIALS_NOT_MATCHING, "Device data is not matching")};
            }

            else
                return {data: user, message: new Message(SUCCESS_OK, "Device data are matching")};

        });
    }

    private hashPassword(password: string): string
    {
        return bcrypt.hashSync(password, 10);
    }
}
