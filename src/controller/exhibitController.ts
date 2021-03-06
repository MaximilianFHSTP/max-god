
import { Connection } from '../database';
import {LOCATION_NOT_FOUND, Message, SUCCESS_OK} from "../messages";
import * as statusTypes from '../config/statusTypes';

export class ExhibitController
{
    private database: Connection;

    constructor()
    {
        this.database = Connection.getInstance();
    }

    public loginExhibit(ipAddress: String, socketId: String): any
    {
        return this.database.location.findOne({where: {ipAddress: ipAddress}}).then( (exhibit) =>
        {
            if(!exhibit)
                throw new Error("Exhibit not found");

            exhibit.socketId = socketId;
            exhibit.save();

            return this.database.location.update({statusId: statusTypes.FREE, currentSeat: 0}, {where: {[this.database.sequelize.Op.or]: [{id: exhibit.id}, {parentId: exhibit.id}]}}).then(() =>
            {
                return this.database.location.findAll({where: {parentId: exhibit.id}}).then(childLocations =>
                {
                    return { data: {exhibit, childLocations} , message: new Message(SUCCESS_OK, "location data found")};
                });
            });
        }).catch( () =>
        {
            return { data: null, message: new Message(LOCATION_NOT_FOUND, "Could not find location")};
        });
    }

    public shutdownExhibit(socketId: any): void
    {
        this.database.location.findOne({where: {socketId}}).then( (exhibit) =>
        {
            if(!exhibit) return;

            this.database.location.update({statusId: statusTypes.OFFLINE}, {where: {[this.database.sequelize.Op.or]: [{id: exhibit.id}, {parentId: exhibit.id}]}})
        });
    }

    public addExhibitLogEntry(locationId: number, comment: string, userId: string, type: number): void
    {
        this.database.log.create({locationId, comment, userId, logTypeId: type});
    }
}
