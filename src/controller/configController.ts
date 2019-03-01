import { Connection } from '../database';
import {Message, SUCCESS_OK} from "../messages";
import * as statusTypes from '../config/statusTypes';

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

}