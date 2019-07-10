import { Connection } from '../database';
import {Message, SUCCESS_OK} from "../messages";
import * as authTypes from '../messages/authenticationTypes';

export class ConfigController
{
    private database: Connection;

    constructor()
    {
        this.database = Connection.getInstance();
    }

    public isWifiSSIDMatching(): any
    {
        const correctSSID = this.database.currentSettings.wifiSSID;
        const pass = this.database.currentSettings.wifiPassword;
        return { data: { ssid: correctSSID, password:  pass}, message: new Message(SUCCESS_OK, 'SSID and Password was found!') };
    }

    public checkVersion(data): any
    {
        const version = data.version;
        const currentVersion = this.database.currentSettings.appVersion;

        if(version === currentVersion)
            return { data: {versionIsCorrect: true}, message: new Message(SUCCESS_OK, 'Version is correct')};

        else
            return { data: {versionIsCorrect: false, currentVersion}, message: new Message(authTypes.INCORRECT_VERSION, 'Version is incorrect')};

    }
}
