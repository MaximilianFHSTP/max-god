import * as IO from 'socket.io';
import * as jwt from 'jsonwebtoken';
import  { Connection } from '../database';
import {OdController, LocationController, ConfigController} from "../controller";
import {ExhibitController} from "../controller/exhibitController";
import {Message} from "../messages";
import {INVALID_TOKEN} from "../messages/authenticationTypes";
import {CoaController} from "../controller/coaController";
import Logger from "../config/logger";

export class WebSocket
{
    private io: any;
    private database: any;
    private odController: OdController;
    private locationController: LocationController;
    private exhibitController: ExhibitController;
    private configController: ConfigController;
    private coaController: CoaController;
    private _logger: Logger;

    constructor(server: any)
    {
        this.io = new IO(server);
        this.odController = new OdController();
        this.locationController = new LocationController(this.io);
        this.exhibitController = new ExhibitController();
        this.configController = new ConfigController();
        this.coaController = new CoaController();
        this.database = Connection.getInstance();

        this._logger = Logger.getInstance();

        this.attachListeners();
    }

    public async connectDatabase()
    {
        await this.database.syncDatabase();
    }

    private attachListeners(): void
    {
        this.io.on('connection', (socket) =>
        {
            socket.use((packet, next) =>
            {
                const event: String = packet[0];
                const token = socket.token;

                if(this.checkEventsTokenNeeded(event))
                {
                    // this._logger.info('JWT: ' + token);
                    jwt.verify(token, process.env.SECRET, (err, decoded) =>
                    {
                        if(err)
                        {
                            this._logger.error('JWT Error - Event: ' + event + ' Error: ' + err);
                            return next(new Error('Invalid token Error'));
                        }

                        const user = decoded.user;

                        if(user)
                        {
                            if(user.isGuest)
                            {
                                if(this.checkGuestAccess(event))
                                {
                                    next();
                                }
                                else
                                {
                                    this._logger.error('Access Restricted Error');
                                    next(new Error('Access Restricted Error'));
                                }
                            }
                            else {
                                next();
                            }
                        }

                        next();
                    });
                }
                else {
                    next();
                }
            });

            socket.once('reconnecting', (attemptNumber) => {
                // console.log("Trying to reconnect to " + socket.id + ": " + attemptNumber);
            });

            socket.once('disconnect', (reason) =>
            {
                // if(reason === 'transport close') return;
                if(socket.token)
                {
                    const token = socket.token;
                    jwt.verify(token, process.env.SECRET, (err, decoded) =>
                    {
                        if (err || !decoded.user) return;

                        const user = decoded.user;
                        this.odController.resetUserLocation(user);
                    });
                }
                else {
                    this.exhibitController.shutdownExhibit(socket.id);
                }
            });

            socket.emit('news', { hello: 'world' });

            socket.once('addTokenToSocket', (token) =>
            {
                socket.token = token;
            });

            socket.once('registerOD', (data) =>
            {
                this.odController.registerOD(data, socket.id).then( (result) =>
                {
                    if(result.data)
                    {
                        const user = result.data.user;
                        const locations = result.data.locations;

                        // Generate token
                        const token = jwt.sign({user}, process.env.SECRET);

                        // Add token to result and to the socket connection
                        result.data = {token, user, locations};
                        socket.token = token;
                    }

                    socket.emit('registerODResult', result);
                });
            });

            socket.once('autoLoginOD', (data) => {
                jwt.verify(data, process.env.SECRET, (err, decoded) =>
                {
                    if(err || !decoded)
                    {
                        socket.emit('autoLoginODResult', {data: null, message: new Message(INVALID_TOKEN, "Invalid token!")});
                        this._logger.error('Autologin token error: ' + err);
                        return;
                    }

                    const user = decoded.user;

                    if(user)
                    {
                        this.odController.autoLoginUser(user.id, socket.id).then( (result) =>
                        {
                            if(result.message.code <= 299)
                            {
                                const user = result.data.user;
                                const locations = result.data.locations;

                                // Generate token
                                const token = jwt.sign({user}, process.env.SECRET);

                                // Add token to result and to the socket connection
                                result.data = {token, user, locations};
                                socket.token = token;
                            }

                            socket.emit('autoLoginODResult', result);
                        });
                    }
                });
            });

            socket.once('loginOD', (data) =>
            {
                this.odController.loginUser(data, socket.id).then( (result) =>
                {
                    if(result.data)
                    {
                        const user = result.data.user;
                        const locations = result.data.locations;

                        // Generate token
                        const token = jwt.sign({user}, process.env.SECRET);

                        // Add token to result and to the socket connection
                        result.data = {token, user, locations};
                        socket.token = token;
                    }

                    socket.emit('loginODResult', result);
                });
            });

            socket.once('registerODGuest', (data) =>
            {
                this.odController.registerGuest(data, socket.id).then( (result) =>
                {
                    if(result.data && result.data.user)
                    {
                        const user = result.data.user;
                        const locations = result.data.locations;

                        // Generate token
                        const token = jwt.sign({user}, process.env.SECRET);

                        // Add token to result and to the socket connection
                        result.data = {token, user, locations};
                        socket.token = token;
                    }

                    socket.emit('registerODGuestResult', result);
                });
            });

            socket.once('deleteOD', (data) =>
            {
                this.odController.deleteOD(data);
            });

            socket.once('questionnaireAnswered', (data) => {
                this.odController.updateUserQuestionnaireAnswered(data).then((res) =>
                {
                    socket.emit('questionnaireAnsweredResult', res);
                })
            });

            socket.once('registerLocation', (data) =>
            {
                // console.log("register location: " + data.location + ", " + data.user);
                this.locationController.registerLocation(data, socket.id).then( (message) =>
                {
                    socket.emit('registerLocationResult', message);
                });
            });

            socket.once('registerTimelineUpdate', (data) =>
            {
                this.locationController.registerTimelineUpdate(data).then( (result) =>
                {
                    socket.emit('registerTimelineUpdateResult', result);
                });
            });

            socket.once('unlockAllTimelineLocations', (data) =>
            {
                this.locationController.unlockAllTimelineLocations(data).then((result) =>
                {
                    socket.emit('unlockAllTimelineLocationsResult', result);
                });
            });

            socket.once('registerLocationLike', (data) =>
            {
                this.locationController.updateLocationLike(data).then( (message) =>
                {
                    socket.emit('registerLocationLikeResult', message);
                });
            });

            socket.once('disconnectedFromExhibit', (data) =>
            {
                this.locationController.disconnectedFromExhibit(data).then( (message) =>
                {
                    socket.emit('disconnectedFromExhibitResult', message);
                });
            });

            socket.once('exhibitDisconnectedFromExhibit', (data) =>
            {
                this.locationController.exhibitDisconnectedFromExhibit(data).then( (message) =>
                {
                    socket.emit('exhibitDisconnectedFromExhibitResult', message);
                });
            });

            socket.once('disconnectUsers', (data) =>
            {
                this.locationController.tableDisconnectFromExhibit(data);
            });

            socket.once('checkLocationStatus', (data) =>
            {
               this.locationController.checkLocationStatus(data).then( (message) =>
               {
                  socket.emit('checkLocationStatusResult', message);
               });
            });

            socket.once('checkUsernameExists', (name) =>
            {
               this.odController.checkUserNameExists(name).then(exists =>
               {
                   socket.emit('checkUsernameExistsResult', exists);
               });
            });

            socket.once('checkEmailExists', (mail) =>
            {
                this.odController.checkEmailExists(mail).then(exists =>
                {
                    socket.emit('checkEmailExistsResult', exists);
                });
            });

            socket.once('checkNameOrEmailExists', (data) =>
            {
                this.odController.checkNameOrEmailExists(data).then(result =>
                {
                    socket.emit('checkNameOrEmailExistsResult', result);
                });
            });

            socket.once('loginExhibit', (ipAddress) =>
            {
                this.exhibitController.loginExhibit(ipAddress, socket.id).then( (message) =>
                {
                    socket.emit('loginExhibitResult', message);
                });
            });

            socket.once('getWifiSSID', () =>
            {
                const result = this.configController.isWifiSSIDMatching();
                socket.emit('getWifiSSIDResult', result);
            });

            socket.once('updateUserLanguage', (data) =>
            {
                this.odController.updateUserLanguage(data).then(result =>
                {
                    socket.emit('updateUserLanguageResult',result);
                })
            });

            socket.once('changeODCredentials', (data) =>
            {
                this.odController.updateUserData(data).then(result =>
                {
                    const user = result.data.user;

                    // Generate token
                    const token = jwt.sign({user}, process.env.SECRET);

                    // Add token to result and to the socket connection
                    result.data = {token, user};
                    socket.token = token;

                    socket.emit('changeODCredentialsResult',result);
                })
            });

            socket.once('makeToRealUser', (data) =>
            {
                this.odController.makeToRealUser(data).then(result =>
                {
                    const user = result.data.user;

                    // Generate token
                    const token = jwt.sign({user}, process.env.SECRET);

                    // Add token to result and to the socket connection
                    result.data = {token, user};
                    socket.token = token;

                    socket.emit('makeToRealUserResult', result);
                });
            });

            socket.once('getUserCoaParts', (data) =>
            {
                this.coaController.getUserCoaParts(data).then(result =>
                {
                    socket.emit('getUserCoaPartsResult', result);
                });
            });

            socket.once('getCoaParts', () =>
            {
                this.coaController.getCoaParts().then(result =>
                {
                    socket.emit('getCoaPartsResult', result);
                });
            });

            socket.once('getCoaColors', () =>
            {
                this.coaController.getCoaColors().then(result =>
                {
                    socket.emit('getCoaColorsResult', result);
                });
            });

            socket.once('changeUserCoaColors', (data) =>
            {
                this.coaController.changeUserCoaColors(data).then(result =>
                {
                    socket.emit('changeUserCoaColorsResult', result);
                });
            });

            socket.once('changeUserCoaPart', (data) =>
            {
                this.coaController.changeUserCoaPart(data).then(result =>
                {
                    socket.emit('changeUserCoaPartResult', result);
                });
            });

            socket.once('unlockCoaPart', (data) =>
            {
                this.coaController.unlockCoaPart(data).then(result =>
                {
                    socket.emit('unlockCoaPartResult', result);
                });
            });

            socket.once('unlockCoaPartFromExhibit', (data) =>
            {
                this._logger.info(JSON.stringify(data));
                this.coaController.unlockCoaPart(data).then(result =>
                {
                    socket.emit('unlockCoaPartFromExhibitResult', result);
                });
            });

            socket.once('updateSeat', (data) =>
            {
                this.locationController.updateLocationSeat(data);
            });

            socket.once('getLookupTable', (data)  =>
            {
                this.locationController.sendLookupTable(data).then(result =>
                {
                    socket.emit('getLookupTableResult', result);
                });
            });

            socket.once('checkAppVersion', (data) =>
            {
                this.configController.checkVersion(data).then(res =>
                {
                    socket.emit('checkAppVersionResult', res);
                })
            });

            socket.once('addUserLogEntry', (data) =>
            {
                this.odController.addUserLogEntry(data).then(res =>
                {
                    socket.emit('addUserLogEntryResult', res);
                })
            });
        });
    }

    private checkGuestAccess(event: String): boolean
    {
        let ok = true;

        // TODO: Check with restricted events

        return ok;
    }

    private checkEventsTokenNeeded(event: String): boolean
    {
        let needed = true;
        switch (event)
        {
            case 'registerOD':
            case 'autoLoginOD':
            case 'loginOD':
            case 'disconnectUsers':
            case 'registerODGuest':
            case 'exhibitDisconnectedFromExhibit':
            case 'checkUsernameExists':
            case 'checkEmailExists':
            case 'checkNameOrEmailExists':
            case 'loginExhibit':
            case 'updateSeat':
            case 'addTokenToSocket':
            case 'unlockCoaPartFromExhibit':
            case 'getWifiSSID':
                needed = false;
                break;
        }
        return needed;
    }
}
