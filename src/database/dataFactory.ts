import {Connection} from "./connection";
import * as contentTypes from '../config/contentTypes';
import * as contentLanguages from '../config/contentLanguages';
import * as storytTellers from '../config/contentStoryTellers';
import * as locationTypes from '../config/locationTypes';

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
        await this.createNotfiyLocations();

        await this.createLocationNeighbors();

        await this.createContentTypes();
        await this.createContentLanguages();
        await this.createContentStoryTellers();
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
                this._connection.locationType.create({id: 7, description: 'activeExhibitBehaviorOn'}),
                this._connection.locationType.create({id: 8, description: 'interactiveExhibit'}),
                this._connection.locationType.create({id: 9, description: 'notifyActiveExhibitAt'}),
                this._connection.locationType.create({id: 10, description: 'notifyActiveExhibitOn'})
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
                this._connection.contentType.create({id: contentTypes.IMAGE, description: 'image'}),
                this._connection.contentType.create({id: contentTypes.EVENT, description: 'event'})
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

    private async createContentStoryTellers() {
        return this._connection.sequelize.transaction(t1 => {
            return Promise.all([
                this._connection.storyTeller.create({id: storytTellers.MAXIMILIAN, name: 'Maximilian'}),
                this._connection.storyTeller.create({id: storytTellers.SUNTHAYM, name: 'Sunthaym'}),
                this._connection.storyTeller.create({id: storytTellers.TILL, name: 'Till'}),
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
                    locationTypeId: locationTypes.ROOM,
                    statusId: 1,
                    ipAddress: '0.0.0.0'
                }),
                this._connection.location.create({
                    id: 10,
                    description: 'Section (10): introduction',
                    locationTypeId: locationTypes.ROOM,
                    statusId: 1,
                    parentId: 1,
                    ipAddress: '0.0.0.0'
                }),
                this._connection.location.create({
                    id: 20,
                    description: 'Section (20): canonization and conflicts',
                    locationTypeId: locationTypes.ROOM,
                    statusId: 1,
                    parentId: 1,
                    ipAddress: '0.0.0.0'
                }),
                this._connection.location.create({
                    id: 30,
                    description: 'Section (30): maximilian',
                    locationTypeId: locationTypes.ROOM,
                    statusId: 1,
                    parentId: 1,
                    ipAddress: '0.0.0.0'
                }),
                this._connection.location.create({
                    id: 40,
                    description: 'Section (40): Klosterneuburg legend',
                    locationTypeId: locationTypes.ROOM,
                    statusId: 1,
                    parentId: 1,
                    ipAddress: '0.0.0.0'
                }),
                this._connection.location.create({
                    id: 50,
                    description: 'Section (50): translation',
                    locationTypeId: locationTypes.ROOM,
                    statusId: 1,
                    parentId: 1,
                    ipAddress: '0.0.0.0'
                }),
                this._connection.location.create({
                    id: 60,
                    description: 'Section (60): death',
                    locationTypeId: locationTypes.ROOM,
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
                    locationTypeId: locationTypes.DOOR,
                    statusId: 1,
                    parentId: 10,
                    ipAddress: '0.0.0.0',
                    showInTimeline: true,
                    startDate: 1450,
                    endDate: 1499,
                    contentURL: 'passive'
                }),
                this._connection.location.create({
                    id: 2000,
                    description: 'Intro to section 2:',
                    locationTypeId: locationTypes.DOOR,
                    statusId: 1,
                    parentId: 20,
                    ipAddress: '0.0.0.0',
                    showInTimeline: true,
                    startDate: 1450,
                    endDate: 1507,
                    contentURL: 'passive'
                }),
                this._connection.location.create({
                    id: 3000,
                    description: 'Intro to section 3:',
                    locationTypeId: locationTypes.DOOR,
                    statusId: 1,
                    parentId: 30,
                    ipAddress: '0.0.0.0',
                    showInTimeline: true,
                    startDate: 1459,
                    endDate: 1577,
                    contentURL: 'passive'
                }),
                this._connection.location.create({
                    id: 4000,
                    description: 'Intro to section 4:',
                    locationTypeId: locationTypes.DOOR,
                    statusId: 1,
                    parentId: 40,
                    ipAddress: '0.0.0.0',
                    showInTimeline: true,
                    startDate: 1485,
                    endDate: 1505,
                    contentURL: 'passive'
                }),
                this._connection.location.create({
                    id: 5000,
                    description: 'Intro to section 5:',
                    locationTypeId: locationTypes.DOOR,
                    statusId: 1,
                    parentId: 50,
                    ipAddress: '0.0.0.0',
                    showInTimeline: true,
                    startDate: 1506,
                    endDate: 1507,
                    contentURL: 'passive'
                }),
                this._connection.location.create({
                    id: 6000,
                    description: 'Intro to section',
                    locationTypeId: locationTypes.DOOR,
                    statusId: 1,
                    parentId: 60,
                    ipAddress: '0.0.0.0',
                    showInTimeline: true,
                    startDate: 1519,
                    endDate: 1520,
                    unlockCoa: true,
                    contentURL: 'passive'
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
                    description: 'Explore transcription of accounting book',
                    contentURL: 'interactive',
                    ipAddress: '0.0.0.0',
                    locationTypeId: locationTypes.INTERACTIVE_EXHIBIT,
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
                    description: 'Solve exercise',
                    contentURL: 'interactive',
                    ipAddress: '0.0.0.0',
                    locationTypeId: locationTypes.INTERACTIVE_EXHIBIT,
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
                    description: 'Doing something with panel',
                    contentURL: 'interactive',
                    ipAddress: '0.0.0.0',
                    locationTypeId: locationTypes.INTERACTIVE_EXHIBIT,
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
                    description: 'Observe the inside of shrine',
                    contentURL: 'interactive',
                    ipAddress: '0.0.0.0',
                    locationTypeId: locationTypes.INTERACTIVE_EXHIBIT,
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
                    description: 'Weyßkunig Quiz atLocation',
                    contentURL: 'tableat',
                    ipAddress: '192.168.178.252',
                    locationTypeId: locationTypes.ACTIVE_EXHIBIT_BEHAVIOR_AT,
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
                    description: 'Weyßkunig Quiz onLocation',
                    parentId: 301,
                    contentURL: 'tableon',
                    ipAddress: '0.0.0.0',
                    locationTypeId: locationTypes.ACTIVE_EXHIBIT_BEHAVIOR_ON,
                    contentTypeId: 1,
                    statusId: 2
                })
            ]);
        });
    }

    private async createNotfiyLocations()
    {
        return this._connection.sequelize.transaction(t1 => {
            return Promise.all([
                this._connection.location.create({
                    id: 403,
                    parentId: 40,
                    description: 'Legend game AtLocation',
                    contentURL: 'tableNotifyAt',
                    ipAddress: '0.0.0.0',
                    locationTypeId: locationTypes.NOTIFY_EXHIBIT_AT,
                    contentTypeId: 1,
                    statusId: 2,
                    currentSeat: 0,
                    maxSeat: 1,
                    showInTimeline: true,
                    startDate: 1491,
                    endDate: 1505,
                    unlockCoa: true
                }),
                this._connection.location.create({
                        id: 4031,
                        description: 'Legend game AtLocation OnLocation',
                        parentId: 403,
                        contentURL: 'tableNotifyAt',
                        ipAddress: '0.0.0.0',
                        locationTypeId: locationTypes.NOTIFY_EXHIBIT_ON,
                        contentTypeId: 1,
                        statusId: 2
                    }),
                    this._connection.location.create({
                        id: 502,
                        parentId: 50,
                        description: 'Genealogy Vis atLocation',
                        contentURL: 'tableNotifyAt',
                        ipAddress: '0.0.0.0',
                        locationTypeId: locationTypes.NOTIFY_EXHIBIT_AT,
                        contentTypeId: 1,
                        statusId: 2,
                        currentSeat: 0,
                        maxSeat: 2,
                        showInTimeline: true,
                        startDate: 1506,
                        endDate: 1507,
                        unlockCoa: true
                    }),
                    this._connection.location.create({
                        id: 5021,
                        description: 'Genealogy Vis onLocation',
                        parentId: 502,
                        contentURL: 'tableNotifyAt',
                        ipAddress: '0.0.0.0',
                        locationTypeId: locationTypes.NOTIFY_EXHIBIT_ON,
                        contentTypeId: 1,
                        statusId: 2
                    }),
                    this._connection.location.create({
                        id: 5022,
                        description: 'Genealogy Vis onLocation',
                        parentId: 502,
                        contentURL: 'tableNotifyAt',
                        ipAddress: '0.0.0.0',
                        locationTypeId: locationTypes.NOTIFY_EXHIBIT_ON,
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
                    locationTypeId: locationTypes.PASSIVE_EXHIBIT,
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
                    locationTypeId: locationTypes.PASSIVE_EXHIBIT,
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
                    locationTypeId: locationTypes.PASSIVE_EXHIBIT,
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
                    locationTypeId: locationTypes.PASSIVE_EXHIBIT,
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
                    locationTypeId: locationTypes.PASSIVE_EXHIBIT,
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
                    locationTypeId: locationTypes.PASSIVE_EXHIBIT,
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
                    locationTypeId: locationTypes.PASSIVE_EXHIBIT,
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
                    prevLocation: 1000,
                    nextLocation: 101
                }),
                this._connection.neighbor.create({
                    prevLocation: 101,
                    nextLocation: 102
                }),
                this._connection.neighbor.create({
                    prevLocation: 102,
                    nextLocation: 2000
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
                    image: 'Emblem2',
                    taskENG: 'Switch to Sunthaym’s perspective on any exhibit.',
                    taskGER: 'Wechsle zu Sunthayms Geschichte in irgendeinem Ausstellungsstück.'
                }),
                this._connection.coaPart.create({
                    id: 21,
                    coaTypeId: 2,
                    name: 'Lion',
                    image: 'Emblem5',
                    taskENG: 'Have 5 questions right in the Weißkunig game.',
                    taskGER: 'Habe 5 Fragen richtig in dem Weißlunig Quiz.'
                }),
                this._connection.coaPart.create({
                    id: 22,
                    coaTypeId: 2,
                    name: 'Dragon',
                    image: 'Emblem1',
                    taskENG: 'Create the legend of Klosterneuburg in the Legend Game.',
                    taskGER: 'Erstellen Sie die Legende von Klosterneuburg in dem Legendenspiel.'
                }),
                this._connection.coaPart.create({
                    id: 23,
                    coaTypeId: 2,
                    name: 'Horse',
                    image: 'Emblem6',
                    taskENG: 'Participate in the Legend Game.',
                    taskGER: 'Nehmen Sie am Legendenspiel teil.'
                }),
                this._connection.coaPart.create({
                    id: 24,
                    coaTypeId: 2,
                    name: 'Gryphon',
                    image: 'Emblem3',
                    taskENG: 'Attend the audience (unlock all exhibits until throne).',
                    taskGER: 'Nehmen Sie am Publikum teil (schalten Sie alle Ausstellungsstücke bis zum Thron frei).'
                }),
                this._connection.coaPart.create({
                    id: 25,
                    coaTypeId: 2,
                    name: 'Unicorn',
                    image: 'Emblem4',
                    taskENG: 'Participate in the GenVis',
                    taskGER: 'Nehmen sie an dem GenVis teil.'
                }),
                this._connection.coaPart.create({
                    id: 30,
                    coaTypeId: 3,
                    name: 'Side-facing knight helmet',
                    image: 'Helmet1',
                    taskENG: 'Explore the Sunthaym Panels with AR.',
                    taskGER: 'Entdecken Sie die Sunthaym-Panels mit AR'
                }),
                this._connection.coaPart.create({
                    id: 31,
                    coaTypeId: 3,
                    name: 'Front-facing helmet',
                    image: 'Helmet2',
                    taskENG: 'Create any legend in the Legend Game.',
                    taskGER: 'Erstellen sie eine beliebige Legende im Legendenspiel'
                }),
                this._connection.coaPart.create({
                    id: 32,
                    coaTypeId: 3,
                    name: 'Decorated helmet',
                    image: 'Helmet3',
                    taskENG: 'Have 10 questions right in the Weißkunig game.',
                    taskGER: 'Beantworten Sie 10 Fragen richtig im Weißkunig Quiz.'
                }),
                this._connection.coaPart.create({
                    id: 33,
                    coaTypeId: 3,
                    name: 'Crowned helmet',
                    image: 'Helmet4',
                    taskENG: 'Learn more about Maximilian’s death on the upper floor.',
                    taskGER: 'Erfahre mehr über Maximilians Tod im oberen Stockwerk'
                }),
                this._connection.coaPart.create({
                    id: 40,
                    coaTypeId: 4,
                    name: 'Crossed swords',
                    image: 'Mantle1',
                    taskENG: 'Explore the shrine with AR.',
                    taskGER: 'Erkunde den Schrein mit AR.'
                }),
                this._connection.coaPart.create({
                    id: 41,
                    coaTypeId: 4,
                    name: 'Crossed axes',
                    image: 'Mantle2',
                    taskENG: 'Switch to Till’s perspective on any exhibit.',
                    taskGER: 'Schauen Sie sich Tills Geschichte an bei einem beliebigen Ausstellungsstück.'
                }),
                this._connection.coaPart.create({
                    id: 42,
                    coaTypeId: 4,
                    name: 'Ornamental mantling',
                    image: 'Mantle3',
                    taskENG: 'Participating in the Weißkunig game.',
                    taskGER: 'Nehmen Sie am Weißkunigspiel teil.'
                }),
                this._connection.coaPart.create({
                    id: 43,
                    coaTypeId: 4,
                    name: 'Wings',
                    image: 'Mantle4',
                    taskENG: 'Find one special person in the GenVis.',
                    taskGER: 'Finden Sie eine besondere Person im GenVis Spiel.'
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