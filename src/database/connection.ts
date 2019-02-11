import * as Sequelize from 'sequelize';
import * as CLS from 'continuation-local-storage';
import {DataFactory} from "./dataFactory";
import * as Winston from 'winston';
import Logger from "../config/logger";

require('dotenv').config();

export class Connection {
    private static _instance: Connection;
    private readonly _sequelize: any;
    private readonly _namespace: any;
    private _user: any;
    private _group: any;
    private _location: any;
    private _locationType: any;
    private _contentType: any;
    private _status: any;
    private _position: any;
    private _activity: any;
    private _activityLog: any;
    private _neighbor: any;
    private _settings: any;
    private _contentLanguage: any;
    private _content: any;
    private _coaPart: any;
    private _coaType: any;
    private _coaColor: any;
    private _userCoaPart: any;
    private _storyTeller: any;

    private _currentSettings: any;

    private constructor() {
        this._namespace = CLS.createNamespace('MEETeUX');
        Sequelize.useCLS(this._namespace);
        this._sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
            host: 'localhost',
            dialect: 'mysql',
            operatorsAliases: {$and: Sequelize.Op.and},
            logging: false
        });

        this.initDatabaseTables();
        this.initDatabaseRelations();

        const dataFactory = new DataFactory();
        dataFactory.connection = this;

        this._sequelize.sync({force: true}).then(() => {
            dataFactory.createData().catch(err => {
                console.log("Could not create data!");
            });
        }).then(this._settings.findByPk(1).then(result => this._currentSettings = result));


        // this._sequelize.sync().then( this._settings.findById(1).then(result => this._currentSettings = result));

    }

    public static getInstance(): Connection {
        if (Connection._instance === null || Connection._instance === undefined) {
            Connection._instance = new Connection();
        }

        return Connection._instance;
    }

    private initDatabaseRelations(): void {
        //User to Group Relation (1:n)
        this._group.hasMany(this._user, {onDelete: 'cascade'});
        this._user.belongsTo(this._group);

        //User to Location Relation (n:m)
        this._user.hasMany(this._activity, {onDelete: 'cascade', foreignKey: {allowNull: false}});
        this._activity.belongsTo(this._user, {foreignKey: {allowNull: false}});
        this._location.hasMany(this._activity, {onDelete: 'cascade', foreignKey: {allowNull: false}});
        this._activity.belongsTo(this._location, {foreignKey: {allowNull: false}});

        //ActivityLog to Activity Relation (1:n)
        this._activity.hasMany(this._activityLog, {onDelete: 'cascade'});
        this._activityLog.belongsTo(this._activity);

        //_location to _location relation (1:n)
        this._location.hasMany(this._location, {
            onDelete: 'cascade', foreignKey: {
                name: 'parentId',
                allowNull: true
            }
        });
        this._location.belongsTo(this._location, {
            foreignKey: {
                name: 'parentId',
                allowNull: true
            }
        });

        //_user to _location relation (1:n)
        this._location.hasMany(this._user, {foreignKey: 'currentLocation'});
        this._user.belongsTo(this._location, {foreignKey: 'currentLocation'});

        // user to code of arms part (n:m)
        this._user.belongsToMany(this._coaPart, { through: this._userCoaPart });
        this._coaPart.belongsToMany(this._user, { through: this._userCoaPart });

        // coaPart to coaType (1:n)
        this._coaType.hasMany(this._coaPart, {foreignKey: {allowNull: false}, onDelete: 'cascade'});
        this._coaPart.belongsTo(this._coaType, {foreignKey: {allowNull: false}, onDelete: 'cascade'});

        //_coaColor to _user relation (1:n)
        this._coaColor.hasMany(this._user, {foreignKey: {name: 'primaryColor'}, onDelete: 'cascade'});
        this._user.belongsTo(this._coaColor, {foreignKey: {name: 'primaryColor'}, onDelete: 'cascade'});

        this._coaColor.hasMany(this._user, {foreignKey: {name: 'secondaryColor'}, onDelete: 'cascade'});
        this._user.belongsTo(this._coaColor, {foreignKey: {name: 'secondaryColor'}, onDelete: 'cascade'});

        //_location to _location relation (n:m)
        this._location.belongsToMany(this._location, {
            as: 'previousLocation',
            through: {
                model: this._neighbor
            },
            foreignKey: {
                name: 'prevLocation',
                primaryKey: true
            }
        });
        this._location.belongsToMany(this._location, {
            as: 'nextLocation',
            through: {
                model: this._neighbor
            },
            foreignKey: {
                name: 'nextLocation',
                primaryKey: true
            }
        });

        //_location to _locationType relation (1:n)
        this._locationType.hasMany(this._location, {foreignKey: {allowNull: false}, onDelete: 'cascade'});
        this._location.belongsTo(this._locationType, {foreignKey: {allowNull: false}, onDelete: 'cascade'});

        //_location to _content relation (1:n)
        this._content.belongsTo(this._location, {foreignKey: {allowNull: false}, onDelete: 'cascade'});
        this._location.hasMany(this._content, {foreignKey: {allowNull: false}, onDelete: 'cascade'});

        //_content to _contentType relation (1:n)
        this._content.belongsTo(this._contentType, {foreignKey: {allowNull: false}, onDelete: 'cascade'});
        this._contentType.hasMany(this._content, {foreignKey: {allowNull: false}, onDelete: 'cascade'});

        //_content to _storyTeller relation (1:n)
        this._content.belongsTo(this._storyTeller, {foreignKey: {allowNull: false}, onDelete: 'cascade'});
        this._storyTeller.hasMany(this._content, {foreignKey: {allowNull: false}, onDelete: 'cascade'});

        //_content to _contentLanguage relation (1:n)
        this._content.belongsTo(this._contentLanguage, {foreignKey: {allowNull: false}, onDelete: 'cascade'});
        this._contentLanguage.hasMany(this._content, {foreignKey: {allowNull: false}, onDelete: 'cascade'});

        //_user to _contentLanguage relation (1:n)
        this._user.belongsTo(this._contentLanguage, {foreignKey: {allowNull: false}, onDelete: 'cascade'});
        this._contentLanguage.hasMany(this._user, {foreignKey: {allowNull: false}, onDelete: 'cascade'});

        //_location to _status relation (1:n)
        this._status.hasMany(this._location, {foreignKey: {allowNull: false}, onDelete: 'cascade'});
        this._location.belongsTo(this._status, {foreignKey: {allowNull: false}, onDelete: 'cascade'});

        //_location to _position relation (1:n)
        this._position.hasMany(this._location, {foreignKey: {allowNull: true}, onDelete: 'cascade'});
        this._location.belongsTo(this._position, {foreignKey: {allowNull: true}, onDelete: 'cascade'});
    }

    private initDatabaseTables(): void {
        this._settings = this._sequelize.define('setting', {
            guestNumber: {
                type: Sequelize.INTEGER
            },
            wifiSSID: {
                type: Sequelize.STRING
            }
        });

        this._user = this._sequelize.define('user', {
            id: {
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            password: {
                type: Sequelize.STRING,
                allowNull: true
            },
            email: {
                type: Sequelize.STRING,
                unique: true
            },
            isGuest: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            currentLocation: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            avatar: {
                type: Sequelize.STRING
            },
            deviceAddress: {
                type: Sequelize.STRING,
                allowNull: false
            },
            ipAddress: {
                type: Sequelize.STRING,
                allowNull: false
            },
            deviceOS: {
                type: Sequelize.STRING,
                allowNull: true
            },
            deviceVersion: {
                type: Sequelize.STRING,
                allowNull: true
            },
            deviceModel: {
                type: Sequelize.STRING,
                allowNull: true
            }
        });

        this._group = this._sequelize.define('group', {
            name: {
                type: Sequelize.STRING,
                allowNull: false
            }
        });

        this._location = this._sequelize.define('location', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: false
            },
            contentURL: {
                type: Sequelize.STRING
            },
            ipAddress: {
                type: Sequelize.STRING,
                allowNull: false
            },
            description: {
                type: Sequelize.STRING,
                allowNull: false
            },
            currentSeat: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            maxSeat: {
                type: Sequelize.INTEGER,
                allowNull: true,
                defaultValue: 1
            },
            isStartPoint: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            showInTimeline: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            unlockCoa: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            startDate: {
                type: Sequelize.INTEGER
            },
            endDate: {
                type: Sequelize.INTEGER
            },
            socketId: {
                type: Sequelize.STRING
            },
            locationTag: {
                type: Sequelize.STRING
            }
        });

        this._neighbor = this._sequelize.define('neighbor', {
            previous: {
                type: Sequelize.INTEGER,
                unique: 'compositeIndex'
            },
            next: {
                type: Sequelize.INTEGER,
                unique: 'compositeIndex'
            }
        });

        this._locationType = this._sequelize.define('locationType', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: false
            },
            description: {
                type: Sequelize.STRING,
                allowNull: false
            }
        });

        this._content = this._sequelize.define('content', {
            content: {
                type: Sequelize.STRING,
                allowNull: false
            },
            order: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            year: {
                type: Sequelize.INTEGER
            }
        });

        this._storyTeller = this._sequelize.define('storyTeller',
        {
             name: {
                 type: Sequelize.STRING,
                 allowNull: false
             }
        });

        this._contentLanguage = this._sequelize.define('contentLanguage', {
            description: {
                type: Sequelize.STRING,
                allowNull: false
            },
            tag: {
                type: Sequelize.STRING,
                allowNull: false
            }
        });

        this._contentType = this._sequelize.define('contentType', {
            description: {
                type: Sequelize.STRING,
                allowNull: false
            }
        });

        this._status = this._sequelize.define('status', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: false
            },
            description: {
                type: Sequelize.STRING,
                allowNull: false
            }
        });

        this._position = this._sequelize.define('position', {
            longitude: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            latitude: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            floor: {
                type: Sequelize.INTEGER,
                allowNull: false
            }
        });

        this._activity = this._sequelize.define('activity', {
            liked: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            locked: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            }
        });

        this._activityLog = this._sequelize.define('activityLog', {
            timestamp: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            }
        });

        this._coaPart = this._sequelize.define('coaPart',
        {
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            image: {
                type: Sequelize.STRING,
                allowNull: false
            },
            taskENG: {
                type: Sequelize.STRING
            },
            taskGER: {
                type: Sequelize.STRING
            }
        });

        this._coaType = this._sequelize.define('coaType',
        {
            description: {
                type: Sequelize.STRING,
                allowNull: false
            }
        });

        this._coaColor = this._sequelize.define('coaColor',
            {
                name: {
                    type: Sequelize.STRING,
                    allowNull: false
                }
            });

        this._userCoaPart = this._sequelize.define('UserCoaPart',
            {
                isActive: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: false
                }
            });
    }

    public getNextGuestNumber(): Number {
        const numb = this._currentSettings.guestNumber;
        this._currentSettings.guestNumber = numb + 1;
        this._currentSettings.save();

        return numb;
    }

    get activity(): any {
        return this._activity;
    }

    get activityLog(): any {
        return this._activityLog;
    }

    get user(): any {
        return this._user;
    }

    get group(): any {
        return this._group;
    }

    get location(): any {
        return this._location;
    }

    get locationType(): any {
        return this._locationType;
    }

    get contentType(): any {
        return this._contentType;
    }

    get status(): any {
        return this._status;
    }

    get position(): any {
        return this._position;
    }

    get neighbor(): any {
        return this._neighbor;
    }

    get content(): any {
        return this._content;
    }

    get storyTeller(): any {
        return this._storyTeller;
    }

    get contentLanguage(): any {
        return this._contentLanguage;
    }

    get currentSettings(): any {
        return this._currentSettings;
    }

    get sequelize(): any {
        return this._sequelize;
    }

    get settings(): any {
        return this._settings;
    }

    get coaPart(): any {
        return this._coaPart;
    }

    get userCoaPart(): any {
        return this._userCoaPart;
    }

    get coaColor(): any {
        return this._coaColor;
    }

    get coaType(): any {
        return this._coaType;
    }
}
