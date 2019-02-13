import { Connection } from '../database';
import {Message, OD_NOT_FOUND, SUCCESS_OK, COA_NOT_CREATED, COA_NOT_FOUND, OD_NOT_UPDATED} from "../messages";
import * as contentLanguages from "../config/contentLanguages";

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

    public changeUserCoaPart(data): any
    {
        const userId = data.userId;
        const coaType = data.coaType;
        const coaId = data.coaId;

        return this.database.user.findByPk(userId).then( (user) =>
        {
            if(!user)
                return {data: null, message: new Message(OD_NOT_FOUND, "Could not find user")};

            return user.getCoaParts().then((userParts) =>
            {
                for(let part of userParts)
                {
                    if(part.coaTypeId === coaType)
                    {
                        if(part.id === coaId)
                        {
                            this.database.userCoaPart.update({isActive: true}, {where: {userId: user.id, coaPartId: part.id}});
                        }

                        else if(part.UserCoaPart.isActive === true)
                        {
                            this.database.userCoaPart.update({isActive: false}, {where: {userId: user.id, coaPartId: part.id}});
                        }
                    }
                }
                return user.getCoaParts().then(parts =>
                {
                    return {data: parts, message: new Message(SUCCESS_OK, "Success: created user coa part")};
                });
            });

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

    public unlockStartCoaParts(userId: number): void
    {
        this.database.sequelize.transaction( (t1) =>
        {
            this.database.user.findByPk(userId).then((user) =>
            {
                if(!user) return;
                
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
            });
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