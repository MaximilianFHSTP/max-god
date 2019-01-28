import {Connection} from "./connection";
import * as contentTypes from '../config/contentTypes';
import * as contentLanguages from '../config/contentLanguages';

export class DataFactory {
    private static _instance: DataFactory;
    private _connection: Connection;

    public static getInstance(): DataFactory {
        if (DataFactory._instance === null || DataFactory._instance === undefined) {
            DataFactory._instance = new DataFactory();
        }

        return DataFactory._instance;
    }

    public async createData() {
        this.initSettings();
        // order is important don't change!
        await this.createLocationTypes();
        await this.createStatusTypes();
        await this.createRoomLocations();
        await this.createDoorLocations();
        await this.createPassiveLocations();
        await this.createActiveExhibitLocation();
        await this.createActiveExhibitBehaviorLocation();

        await this.createLocationNeighbors();

        await this.createContentTypes();
        await this.createContentLanguages();
        // await this.createExhibitContent();

        await this.createCoatOfArmsTypes();
        await this.createCoatOfArmsParts();
        await this.createCoatOfArmsColors();
    }

    private initSettings(): void {
        this._connection.settings.create({
            guestNumber: 1,
            wifiSSID: 'MEETeUX'
        });
    }

    private async createLocationTypes() {
        return this._connection.sequelize.transaction(t1 => {
            return Promise.all([
                this._connection.locationType.create({id: 1, description: 'room'}),
                this._connection.locationType.create({id: 2, description: 'activeExhibitOn'}),
                this._connection.locationType.create({id: 3, description: 'activeExhibitAt'}),
                this._connection.locationType.create({id: 4, description: 'passiveExhibit'}),
                this._connection.locationType.create({id: 5, description: 'door'}),
                this._connection.locationType.create({id: 6, description: 'activeExhibitBehaviorAt'}),
                this._connection.locationType.create({id: 7, description: 'activeExhibitBehaviorOn'})
            ]);
        });
    }

    private async createStatusTypes() {
        return this._connection.sequelize.transaction(t1 => {
            return Promise.all([
                this._connection.status.create({id: 1, description: 'online'}),
                this._connection.status.create({id: 2, description: 'offline'}),
                this._connection.status.create({id: 3, description: 'free'}),
                this._connection.status.create({id: 4, description: 'occupied'})
            ]);
        });
    }

    private async createContentTypes() {
        return this._connection.sequelize.transaction(t1 => {
            return Promise.all([
                this._connection.contentType.create({id: contentTypes.TEXT, description: 'text'}),
                this._connection.contentType.create({id: contentTypes.IMAGE, description: 'image'})
            ]);
        });
    }

    private async createContentLanguages() {
        return this._connection.sequelize.transaction(t1 => {
            return Promise.all([
                this._connection.contentLanguage.create({id: contentLanguages.ENG, description: 'English', tag: 'ENG'}),
                this._connection.contentLanguage.create({id: contentLanguages.GER, description: 'Deutsch', tag: 'GER'}),
                this._connection.contentLanguage.create({
                    id: contentLanguages.ALL,
                    description: 'All Languages',
                    tag: 'ALL'
                })
            ]);
        });
    }

    private async createExhibitContent() {
        return this._connection.sequelize.transaction(t1 => {
            return Promise.all([
                this._connection.content.create({
                    content: 'Willkommen beim Quiz!',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 100
                }),
                this._connection.content.create({
                    content: 'Welcome to the Quiz!',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 100
                }),
                this._connection.content.create({
                    content: 'https://www.mememaker.net/api/bucket?path=static/img/memes/full/2018/Apr/4/14/it-works-now-1247.png',
                    order: 2,
                    contentTypeId: contentTypes.IMAGE,
                    contentLanguageId: contentLanguages.ALL,
                    locationId: 1011
                }),
                this._connection.content.create({
                    content: 'Willkommen beim Passive Exhibit10011!',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.GER,
                    locationId: 1011
                }),
                this._connection.content.create({
                    content: 'Welcome at the passive exhibit 1011!',
                    order: 1,
                    contentTypeId: contentTypes.TEXT,
                    contentLanguageId: contentLanguages.ENG,
                    locationId: 1011
                })
            ]);
        });
    }

    private async createRoomLocations() {
        return this._connection.sequelize.transaction(t1 => {
            return Promise.all([
                this._connection.location.create({
                    id: 1,
                    description: 'Klosterneuburg',
                    locationTypeId: 1,
                    statusId: 1,
                    ipAddress: '0.0.0.0'
                }),
                this._connection.location.create({
                    id: 10,
                    description: 'Section (10): introduction',
                    locationTypeId: 1,
                    statusId: 1,
                    parentId: 1,
                    ipAddress: '0.0.0.0'
                }),
                this._connection.location.create({
                    id: 20,
                    description: 'Section (20): canonization and conflicts',
                    locationTypeId: 1,
                    statusId: 1,
                    parentId: 1,
                    ipAddress: '0.0.0.0'
                }),
                this._connection.location.create({
                    id: 30,
                    description: 'Section (30): maximilian',
                    locationTypeId: 1,
                    statusId: 1,
                    parentId: 1,
                    ipAddress: '0.0.0.0'
                }),
                this._connection.location.create({
                    id: 40,
                    description: 'Section (40): Klosterneuburg legend',
                    locationTypeId: 1,
                    statusId: 1,
                    parentId: 1,
                    ipAddress: '0.0.0.0'
                }),
                this._connection.location.create({
                    id: 50,
                    description: 'Section (50): translation',
                    locationTypeId: 1,
                    statusId: 1,
                    parentId: 1,
                    ipAddress: '0.0.0.0'
                }),
                this._connection.location.create({
                    id: 60,
                    description: 'Section (60): death',
                    locationTypeId: 1,
                    statusId: 1,
                    parentId: 1,
                    ipAddress: '0.0.0.0'
                })
            ]);
        });
    }

    private async createDoorLocations() {
        return this._connection.sequelize.transaction(t1 => {
            return Promise.all([
                this._connection.location.create({
                    id: 1000,
                    description: 'Intro to section 1:',
                    locationTypeId: 5,
                    statusId: 1,
                    parentId: 10,
                    ipAddress: '0.0.0.0',
                    showInTimeline: true,
                    startDate: 1450,
                    endDate: 1499
                }),
                this._connection.location.create({
                    id: 2000,
                    description: 'Intro to section 2:',
                    locationTypeId: 5,
                    statusId: 1,
                    parentId: 20,
                    ipAddress: '0.0.0.0',
                    showInTimeline: true,
                    startDate: 1450,
                    endDate: 1507
                }),
                this._connection.location.create({
                    id: 3000,
                    description: 'Intro to section 3:',
                    locationTypeId: 5,
                    statusId: 1,
                    parentId: 30,
                    ipAddress: '0.0.0.0',
                    showInTimeline: true,
                    startDate: 1459,
                    endDate: 1577
                }),
                this._connection.location.create({
                    id: 4000,
                    description: 'Intro to section 4:',
                    locationTypeId: 5,
                    statusId: 1,
                    parentId: 40,
                    ipAddress: '0.0.0.0',
                    showInTimeline: true,
                    startDate: 1485,
                    endDate: 1505
                }),
                this._connection.location.create({
                    id: 5000,
                    description: 'Intro to section 5:',
                    locationTypeId: 5,
                    statusId: 1,
                    parentId: 50,
                    ipAddress: '0.0.0.0',
                    showInTimeline: true,
                    startDate: 1506,
                    endDate: 1507
                }),
                this._connection.location.create({
                    id: 6000,
                    description: 'Intro to section',
                    locationTypeId: 5,
                    statusId: 1,
                    parentId: 60,
                    ipAddress: '0.0.0.0',
                    showInTimeline: true,
                    startDate: 1519,
                    endDate: 1520,
                    unlockCoa: true
                })
            ]);
        });
    }

    private async createActiveExhibitLocation() {
        return this._connection.sequelize.transaction(t1 => {
            return Promise.all([
                this._connection.location.create({
                    id: 101,
                    parentId: 10,
                    description: 'Active exhibit',
                    contentURL: 'tableat',
                    ipAddress: '0.0.0.0',
                    locationTypeId: 3,
                    contentTypeId: 1,
                    statusId: 2,
                    currentSeat: 0,
                    maxSeat: 4,
                    showInTimeline: true,
                    startDate: 1450,
                    endDate: 1499
                }),
                this._connection.location.create({
                    id: 102,
                    parentId: 10,
                    description: 'Active exhibit',
                    contentURL: 'tableat',
                    ipAddress: '0.0.0.0',
                    locationTypeId: 3,
                    contentTypeId: 1,
                    statusId: 2,
                    currentSeat: 0,
                    maxSeat: 4,
                    showInTimeline: true,
                    startDate: 1450,
                    endDate: 1499
                }),
                this._connection.location.create({
                    id: 402,
                    parentId: 40,
                    description: 'Active exhibit',
                    contentURL: 'tableat',
                    ipAddress: '0.0.0.0',
                    locationTypeId: 3,
                    contentTypeId: 1,
                    statusId: 2,
                    currentSeat: 0,
                    maxSeat: 4,
                    showInTimeline: true,
                    startDate: 1491,
                    endDate: 1492,
                    unlockCoa: true
                }),
                this._connection.location.create({
                    id: 501,
                    parentId: 50,
                    description: 'Active exhibit',
                    contentURL: 'tableat',
                    ipAddress: '0.0.0.0',
                    locationTypeId: 3,
                    contentTypeId: 1,
                    statusId: 2,
                    currentSeat: 0,
                    maxSeat: 4,
                    showInTimeline: true,
                    startDate: 1506,
                    endDate: 1507,
                    unlockCoa: true
                }),
            ]);
        });
    }

    private async createActiveExhibitBehaviorLocation() {
        return this._connection.sequelize.transaction(t1 => {
            return Promise.all([
                this._connection.location.create({
                    id: 301,
                    parentId: 30,
                    description: 'activeExhibitBehaviorAt',
                    contentURL: 'tableat',
                    ipAddress: '192.168.178.252',
                    locationTypeId: 6,
                    contentTypeId: 1,
                    statusId: 2,
                    currentSeat: 0,
                    maxSeat: 15,
                    showInTimeline: true,
                    startDate: 1459,
                    endDate: 1577,
                    unlockCoa: true
                }),
                this._connection.location.create({
                    id: 3011,
                    description: 'activeExhibitBehaviorOn',
                    parentId: 301,
                    contentURL: 'tableon',
                    ipAddress: '0.0.0.0',
                    locationTypeId: 7,
                    contentTypeId: 1,
                    statusId: 2
                }),
                this._connection.location.create({
                    id: 403,
                    parentId: 40,
                    description: 'activeExhibitBehaviorAt',
                    contentURL: 'tableat',
                    ipAddress: '192.168.178.252',
                    locationTypeId: 6,
                    contentTypeId: 1,
                    statusId: 2,
                    currentSeat: 0,
                    maxSeat: 15,
                    showInTimeline: true,
                    startDate: 1491,
                    endDate: 1505,
                    unlockCoa: true
                }),
                this._connection.location.create({
                    id: 4031,
                    description: 'activeExhibitBehaviorOn',
                    parentId: 403,
                    contentURL: 'tableon',
                    ipAddress: '0.0.0.0',
                    locationTypeId: 7,
                    contentTypeId: 1,
                    statusId: 2
                }),
                this._connection.location.create({
                    id: 502,
                    parentId: 50,
                    description: 'activeExhibitBehaviorAt',
                    contentURL: 'tableat',
                    ipAddress: '192.168.178.252',
                    locationTypeId: 6,
                    contentTypeId: 1,
                    statusId: 2,
                    currentSeat: 0,
                    maxSeat: 15,
                    showInTimeline: true,
                    startDate: 1506,
                    endDate: 1507,
                    unlockCoa: true
                }),
                this._connection.location.create({
                    id: 5021,
                    description: 'activeExhibitBehaviorOn',
                    parentId: 502,
                    contentURL: 'tableon',
                    ipAddress: '0.0.0.0',
                    locationTypeId: 7,
                    contentTypeId: 1,
                    statusId: 2
                }),
                this._connection.location.create({
                    id: 5022,
                    description: 'activeExhibitBehaviorOn',
                    parentId: 502,
                    contentURL: 'tableon',
                    ipAddress: '0.0.0.0',
                    locationTypeId: 7,
                    contentTypeId: 1,
                    statusId: 2
                })
            ]);
        });
    }

    private async createPassiveLocations() {
        return this._connection.sequelize.transaction(t1 => {
            return Promise.all([
                this._connection.location.create({
                    id: 2001,
                    parentId: 20,
                    description: 'passive exhibit',
                    contentURL: 'passive',
                    ipAddress: '0.0.0.0',
                    locationTypeId: 4,
                    contentTypeId: 1,
                    statusId: 1,
                    showInTimeline: true,
                    startDate: 1450,
                    endDate: 1493
                }),
                this._connection.location.create({
                    id: 2002,
                    parentId: 20,
                    description: 'passive exhibit',
                    contentURL: 'passive',
                    ipAddress: '0.0.0.0',
                    locationTypeId: 4,
                    contentTypeId: 1,
                    statusId: 1,
                    showInTimeline: true,
                    startDate: 1468,
                    endDate: 1470
                }),
                this._connection.location.create({
                    id: 2003,
                    parentId: 20,
                    description: 'passive exhibit',
                    contentURL: 'passive',
                    ipAddress: '0.0.0.0',
                    locationTypeId: 4,
                    contentTypeId: 1,
                    statusId: 1,
                    showInTimeline: true,
                    startDate: 1470,
                    endDate: 1490
                }),
                this._connection.location.create({
                    id: 2004,
                    parentId: 20,
                    description: 'passive exhibit',
                    contentURL: 'passive',
                    ipAddress: '0.0.0.0',
                    locationTypeId: 4,
                    contentTypeId: 1,
                    statusId: 1,
                    showInTimeline: true,
                    startDate: 1507,
                    endDate: 1508
                }),
                this._connection.location.create({
                    id: 4001,
                    parentId: 40,
                    description: 'passive exhibit',
                    contentURL: 'passive',
                    ipAddress: '0.0.0.0',
                    locationTypeId: 4,
                    contentTypeId: 1,
                    statusId: 1,
                    showInTimeline: true,
                    startDate: 1485,
                    endDate: 1486
                }),
                this._connection.location.create({
                    id: 4004,
                    parentId: 40,
                    description: 'passive exhibit',
                    contentURL: 'passive',
                    ipAddress: '0.0.0.0',
                    locationTypeId: 4,
                    contentTypeId: 1,
                    statusId: 1,
                    showInTimeline: true,
                    startDate: 1505,
                    endDate: 1506
                }),
                this._connection.location.create({
                    id: 5001,
                    parentId: 50,
                    description: 'passive exhibit',
                    contentURL: 'passive',
                    ipAddress: '0.0.0.0',
                    locationTypeId: 4,
                    contentTypeId: 1,
                    statusId: 1,
                    showInTimeline: true,
                    startDate: 1506,
                    endDate: 1507,
                    unlockCoa: true
                })
            ]);
        });
    }

    private async createLocationNeighbors()
    {
        return this._connection.sequelize.transaction(t1 => {
            return Promise.all([
                this._connection.neighbor.create({
                    previous: 1000,
                    next: 101
                }),
                this._connection.neighbor.create({
                    previous: 101,
                    next: 102
                }),
                this._connection.neighbor.create({
                    previous: 102,
                    next: 2000
                })
            ]);
        });
    }

    private async createCoatOfArmsParts() {
        return this._connection.sequelize.transaction(t1 => {
            return Promise.all([
                this._connection.coaPart.create({
                    id: 10,
                    coaTypeId: 1,
                    name: 'Curved Shield',
                    image: 'Shield1'
                }),
                this._connection.coaPart.create({
                    id: 11,
                    coaTypeId: 1,
                    name: 'Rounded Shield',
                    image: 'Shield2'
                }),
                this._connection.coaPart.create({
                    id: 12,
                    coaTypeId: 1,
                    name: 'Ornamental Shield',
                    image: 'Shield3'
                }),
                this._connection.coaPart.create({
                    id: 13,
                    coaTypeId: 1,
                    name: 'Classic Shield',
                    image: 'Shield4'
                }),
                this._connection.coaPart.create({
                    id: 20,
                    coaTypeId: 2,
                    name: 'Eagle',
                    image: 'Eagle'
                }),
                this._connection.coaPart.create({
                    id: 21,
                    coaTypeId: 2,
                    name: 'Lion',
                    image: 'Lion'
                }),
                this._connection.coaPart.create({
                    id: 22,
                    coaTypeId: 2,
                    name: 'Dragon',
                    image: 'Dragon'
                }),
                this._connection.coaPart.create({
                    id: 23,
                    coaTypeId: 2,
                    name: 'Horse',
                    image: 'Horse'
                }),
                this._connection.coaPart.create({
                    id: 24,
                    coaTypeId: 2,
                    name: 'Gryphon',
                    image: 'Gryphon'
                }),
                this._connection.coaPart.create({
                    id: 25,
                    coaTypeId: 2,
                    name: 'Unicorn',
                    image: 'Unicorn'
                }),
                this._connection.coaPart.create({
                    id: 30,
                    coaTypeId: 3,
                    name: 'Side-facing knight helmet',
                    image: 'Helmet1'
                }),
                this._connection.coaPart.create({
                    id: 31,
                    coaTypeId: 3,
                    name: 'Front-facing helmet',
                    image: 'Helmet2'
                }),
                this._connection.coaPart.create({
                    id: 32,
                    coaTypeId: 3,
                    name: 'Decorated helmet',
                    image: 'Helmet2+'
                }),
                this._connection.coaPart.create({
                    id: 33,
                    coaTypeId: 3,
                    name: 'Crowned helmet',
                    image: 'Helmet2++'
                }),
                this._connection.coaPart.create({
                    id: 40,
                    coaTypeId: 4,
                    name: 'Crossed swords',
                    image: 'Mantle1'
                }),
                this._connection.coaPart.create({
                    id: 41,
                    coaTypeId: 4,
                    name: 'Crossed axes',
                    image: 'Mantle2'
                }),
                this._connection.coaPart.create({
                    id: 42,
                    coaTypeId: 4,
                    name: 'Ornamental mantling',
                    image: 'Mantle3'
                }),
                this._connection.coaPart.create({
                    id: 43,
                    coaTypeId: 4,
                    name: 'Wings',
                    image: 'Mantle4'
                })
            ]);
        });
    }

    private async createCoatOfArmsTypes() {
        return this._connection.sequelize.transaction(t1 => {
            return Promise.all([
                this._connection.coaType.create({
                    id: 1,
                    description: 'shield'
                }),
                this._connection.coaType.create({
                    id: 2,
                    description: 'symbol'
                }),
                this._connection.coaType.create({
                    id: 3,
                    description: 'helmet'
                }),
                this._connection.coaType.create({
                    id: 4,
                    description: 'mantling'
                }),
            ]);
        });
    }

    private async createCoatOfArmsColors() {
        return this._connection.sequelize.transaction(t1 => {
            return Promise.all([
                this._connection.coaColor.create({
                    id: 1,
                    name: 'Color1'
                }),
                this._connection.coaColor.create({
                    id: 2,
                    name: 'Color2'
                }),
                this._connection.coaColor.create({
                    id: 3,
                    name: 'Color3'
                }),
                this._connection.coaColor.create({
                    id: 4,
                    name: 'Color4'
                }),
                this._connection.coaColor.create({
                    id: 5,
                    name: 'Color5'
                })
            ]);
        });
    }

    set connection(value: any) {
        this._connection = value;
    }
}