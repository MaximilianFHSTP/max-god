import * as Sequelize from 'sequelize';
require('dotenv').config();

export class Connection
{
    private static _instance: Connection;
    private _sequelize: any;
    private _user: any;
    private _group: any;
    private _location: any;
    private _locationType: any;
    private _contentType: any;
    private _status: any;
    private _position: any;
    private _activity: any;
    private _neighbor:any;

    private constructor()
    {
        this._sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
            host: 'localhost',
            dialect: 'mysql',
        });
        this.initDatabaseTables();
        this.initDatabaseRelations();

        this._sequelize.sync({force: true}).then(() => {

            this._locationType.create({
                description: 'room'
            });

            this._contentType.create({
                description: 'webContent'
            });

            this._status.create({
               description: 'running'
            });

            this._position.create({
                longitude: 12,
                latitude: 25,
                floor: 1
            });

            this._location.create({
                id: 100,
                description: 'Kerstin onExhibit',
               contentURL: 'http://www.google.at',
               ipAddress: '192.168.0.112',
                locationTypeId: 1,
                contentTypeId: 1,
                statusId: 1,
                positionId: 1
            });

            this._location.create({
                id: 101,
                description: 'Kerstin atExhibit',
                contentURL: 'http://www.google.at',
                ipAddress: '192.168.0.113',
                locationTypeId: 1,
                contentTypeId: 1,
                statusId: 1,
                positionId: 1
            });

            this._location.create({
                id: 1000,
                description: 'Flo atExhibit',
                contentURL: 'http://www.google.at',
                ipAddress: '192.168.0.114',
                locationTypeId: 1,
                contentTypeId: 1,
                statusId: 1,
                positionId: 1
            });

            this._location.create({
                id: 1001,
                description: 'Drucker atExhibit',
                contentURL: 'http://www.google.at',
                ipAddress: '192.168.0.115',
                locationTypeId: 1,
                contentTypeId: 1,
                statusId: 1,
                positionId: 1
            });

            this._location.create({
                id: 1002,
                description: 'Stud-Assi atExhibit',
                contentURL: 'http://www.google.at',
                ipAddress: '192.168.0.116',
                locationTypeId: 1,
                contentTypeId: 1,
                statusId: 1,
                positionId: 1
            });

            this._location.create({
                id: 10,
                description: 'Door',
                contentURL: 'http://www.google.at',
                ipAddress: '192.168.0.117',
                locationTypeId: 1,
                contentTypeId: 1,
                statusId: 1,
                positionId: 1
            });
        });
        // this._sequelize.sync();
    }

    public static getInstance(): Connection
    {
        if(Connection._instance === null || Connection._instance === undefined)
        {
            Connection._instance = new Connection();
        }

        return Connection._instance;
    }

    private initDatabaseRelations(): void
    {
        //User to Group Relation (1:n)
        this._group.hasMany(this._user, {onDelete: 'cascade'});
        this._user.belongsTo(this._group);

        //User to Location Relation (n:m)
        this._user.hasMany(this._activity, {onDelete: 'cascade', foreignKey: {allowNull: false}});
        this._activity.belongsTo(this._user, {foreignKey: {allowNull: false}});
        this._location.hasMany(this._activity, {onDelete: 'cascade', foreignKey: {allowNull: false}});
        this._activity.belongsTo(this._location, {foreignKey: {allowNull: false}});

        //_location to _location relation (1:n)
        this._location.hasMany(this._location, {onDelete: 'cascade', foreignKey: {
            name: 'parentId',
            allowNull: true
            }
        });
        this._location.belongsTo(this._location, {foreignKey: {
            name: 'parentId',
            allowNull: true
         }
        });

        //_user to _location relation (1:n)
        this._location.hasMany(this._user, {foreignKey: 'currentLocation'});
        this._user.belongsTo(this._location, {foreignKey: 'currentLocation'});

        //_location to _location relation (n:m)
        this._location.belongsToMany(this._location, {
            as: 'location1',
            through: {
                model: this._neighbor
            },
            foreignKey: {
                name: 'locationOne',
                primaryKey: true
            }
        });
        this._location.belongsToMany(this._location, {
            as: 'location2',
            through: {
                model: this._neighbor
            },
            foreignKey: {
                name: 'locationTwo',
                primaryKey: true
            }
        });

        //_location to _locationType relation (1:n)
        this._locationType.hasMany(this._location, {foreignKey: {allowNull: false}});
        this._location.belongsTo(this._locationType, {foreignKey: {allowNull: false}});

        //_location to _contentType relation (1:n)
        this._location.belongsTo(this._contentType, {foreignKey: {allowNull: false}});
        this._contentType.hasMany(this._location, {foreignKey: {allowNull: false}});

        //_location to _status relation (1:n)
        this._status.hasMany(this._location, {foreignKey: {allowNull: false}});
        this._location.belongsTo(this._status, {foreignKey: {allowNull: false}});

        //_location to _position relation (1:n)
        this._position.hasMany(this._location, {foreignKey: {allowNull: false}});
        this._location.belongsTo(this._position, {foreignKey: {allowNull: false}});
    }

    private initDatabaseTables():void
    {
        this._user = this._sequelize.define('user', {
            name: {
                type: Sequelize.STRING,
                allowNull: false
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
            }
        });

        this._group = this._sequelize.define('group', {
            name: {
                type: Sequelize.STRING,
                allowNull: false
            }
        })

        this._location = this._sequelize.define('location', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: false
            },
            contentURL: {
               type: Sequelize.STRING
            },
            contentVersion: {
               type: Sequelize.DOUBLE,
                defaultValue: 1.0
            },
            ipAddress: {
               type: Sequelize.STRING,
                allowNull: false
            },
            description: {
                type: Sequelize.STRING,
                allowNull: false
            }
        });

        this._neighbor = this._sequelize.define('neighbor', {
            locationOne: {
                type: Sequelize.INTEGER,
                unique: 'compositeIndex'
            },
            locationTwo: {
                type: Sequelize.INTEGER,
                unique: 'compositeIndex'
            }
        });

        this._locationType = this._sequelize.define('locationType', {
            description: {
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
            timestamp: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });
    }

    get activity(): any {
        return this._activity;
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
}
