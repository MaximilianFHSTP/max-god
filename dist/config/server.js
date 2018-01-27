"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Express = require("express");
const fs = require("fs");
const https = require("https");
const websockets_1 = require("../websockets");
require('dotenv').config();
//import * as http from 'http';
class Server {
    constructor() {
        const cred = this.loadCredentials();
        this.app = new Express();
        this.server = https.createServer(cred, this.app);
        this.socket = new websockets_1.WebSocket(this.server);
        console.log('Server runs on Port: ' + process.env.SERVER_PORT);
        this.server.listen(process.env.SERVER_PORT);
        /*this.app.get('/', function (req, res)
        {
            console.log(process.env.NODE_PATH);
            res.sendFile(process.env.NODE_PATH + '/assets/godIndex.html');
        });*/
    }
    loadCredentials() {
        const cert = fs.readFileSync(process.env.CERT_PATH + '/fullchain.pem');
        const key = fs.readFileSync(process.env.CERT_PATH + '/privkey.pem');
        return {
            key: key,
            cert: cert
        };
    }
}
exports.default = Server;
//# sourceMappingURL=server.js.map