import * as Express from 'express';
import * as fs from 'fs';
import * as https from 'https';
import * as http from 'http';
import  { WebSocket } from '../websockets';
import Logger from './logger';
require('dotenv').config();

export default class Server
{
    private server: any;
    private socket: WebSocket;
    private app: any;
    private _logger: Logger;

    constructor()
    {
        this._logger = Logger.getInstance();

        this.app = new Express();

        const runAsHttps:number = parseInt(process.env.https);
        if(runAsHttps)
        {
            const cred = this.loadCredentials();
            this.server = https.createServer(cred, this.app);
        }
        else {
            this.server = http.createServer(this.app);
        }
        
        this.socket = new WebSocket(this.server);

        this.socket.connectDatabase().then( () =>
        {
            this.server.listen(process.env.SERVER_PORT, () => {
                this._logger.info('Server runs on Port ' + process.env.SERVER_PORT);
            });

            this.app.get('/', function (req, res)
            {
                res.sendFile(process.env.NODE_PATH + '/assets/localIndex.html');
            });
        });
    }

    private loadCredentials(): any
    {
        const cert = fs.readFileSync(process.env.CERT_PATH);
        const key = fs.readFileSync(process.env.KEY_PATH);
        const ca = fs.readFileSync(process.env.CA_PATH);

        return {
            key: key,
            cert: cert,
            ca: ca
        };
    }
}

