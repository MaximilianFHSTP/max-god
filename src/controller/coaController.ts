import { Connection } from '../database';
import {Message, OD_NOT_FOUND, SUCCESS_OK, COA_NOT_CREATED, COA_NOT_FOUND, OD_NOT_UPDATED} from "../messages";

export class CoaController
{
    private database: Connection;

    constructor()
    {
        this.database = Connection.getInstance();
    }

    public getCoaColors(): any
    {
        return this.database.coaColor.findAll().then((colors) =>
        {
            return {data: colors, message: new Message(SUCCESS_OK, "Found coa colors")};
        }).catch( () =>
        {
            return { data: null, message: new Message(COA_NOT_FOUND, "Could not find coa parts")};
        });
    }

    public changeUserCoaColors(data): any
    {
        const userId = data.userId;
        const prim = data.primary;
        const sec = data.secondary;

        return this.database.user.findByPk(userId).then( (user) =>
        {
            if(!user)
                return {data: null, message: new Message(OD_NOT_FOUND, "Could not find user")};

            user.primaryColor = prim;
            user.secondaryColor = sec;
            user.save();

            return {data: user, message: new Message(SUCCESS_OK, "User updated successfully")};

        }).catch( () =>
        {
            return { data: null, message: new Message(OD_NOT_UPDATED, "Could not create user coa part")};
        });
    }

    public unlockCoaPart(data): any
    {
        const coaId = data.coaId;
        const userId = data.userId;

        return this.database.user.findByPk(userId).then( (user) =>
        {
            if(!user)
                return {data: null, message: new Message(OD_NOT_FOUND, "Could not find user")};

            return this.database.coaPart.findByPk(coaId).then((coaPart) =>
            {
                if(!coaPart)
                    return {data: null, message: new Message(COA_NOT_FOUND, "Could not find coa part")};

                return user.addCoaPart(coaPart).then(() =>
                {
                    return user.getCoaParts().then((userParts) =>
                    {
                        return {data: userParts, message: new Message(SUCCESS_OK, "Success: created user coa part")};
                    });
                });
            });
        }).catch( () =>
        {
            return { data: null, message: new Message(COA_NOT_CREATED, "Could not create user coa part")};
        });
    }

    public getUserCoaParts(data): any
    {
        const userId = data.userId;

        return this.database.user.findByPk(userId).then( (user) =>
        {
            if(!user)
                return {data: null, message: new Message(OD_NOT_FOUND, "Could not find user")};

            return user.getCoaParts().then((userParts) =>
            {
                return {data: userParts, message: new Message(SUCCESS_OK, "Success: created user coa part")};
            });
        }).catch( () =>
        {
            return { data: null, message: new Message(COA_NOT_FOUND, "Could not find user coa parts")};
        });
    }

    public getCoaParts(): any
    {
        return this.database.coaPart.findAll().then((parts) =>
        {
           return {data: parts, message: new Message(SUCCESS_OK, "Found coa parts")};
        }).catch( () =>
        {
            return { data: null, message: new Message(COA_NOT_FOUND, "Could not find coa parts")};
        });
    }
}