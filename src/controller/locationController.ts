
import { Connection } from '../database';

export class LocationController
{
    private database: Connection;

    constructor()
    {
        this.database = Connection.getInstance();
    }

    public registerLocation(data: any): any
    {
        const user: number = data.user;
        const location: number = data.location;

        return this.database.activity.create({
            userId: user,
            locationId: location,
            timestamp: Date.now()
        }).then( () => {
            return location;
        }).catch((err) => {
            //console.log(err);
            return "FAILED";
        });

    }

    public checkLocationStatus(locationId: number): any
    {
        let status: String = "NOT FOUND";
        return this.database.user.findById(locationId).then( (location) =>
        {
            if(location.locationType != 3)
                status = "NOT ACTIVE EXHIBIT";

            else if(location.statusId == 3 && location.currentSeat < location.maxSeat)
                status = "FREE";

            else
                status = "OCCUPIED";

            return status;
        }).catch((err) => {
            //console.log(err);
            return "FAILED";
        });
    }
}