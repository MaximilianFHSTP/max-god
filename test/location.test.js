const assert = require('assert');
const expect = require('chai').expect;

function updateTimeline(done, socket, user, location)
{
    socket.emit('registerTimelineUpdate', {user: user.id, location: location});

    socket.on('registerTimelineUpdateResult', function(result)
    {
        const message = result.message;
        const data = result.data;

        if(location === 100)
        {
            expect(message.code).to.be.equal(300);
            expect(data).to.be.equal(null);
        }

        if(location === 101)
        {
            expect(message.code).to.be.equal(302);
            expect(data).to.be.equal(null);
        }

        if(location === 2001)
        {
            expect(message.code).to.be.equal(200);
            expect(data.locations).to.have.lengthOf(37);
        }

        socket.removeAllListeners('registerTimelineUpdateResult');

        done();
    });
}

module.exports.updateTimeline = updateTimeline;

function registerLocation(done, socket, user, location)
{
    socket.emit('registerLocation', {user: user.id, location: location});

    socket.on('registerLocationResult', function(result)
    {
        const message = result.message;
        const data = result.data;

        if(location === 100)
        {
            expect(message.code).to.be.equal(300);
            expect(data).to.be.equal(null);
        }

        if(location === 101)
        {
            expect(message.code).to.be.equal(200);
            expect(data.location).to.be.equal(101);
        }

        if(location === 2001)
        {
            expect(message.code).to.be.equal(200);
            expect(data.location).to.be.equal(2001);
        }

        socket.removeAllListeners('registerLocationResult');

        done();
    });
}

module.exports.registerLocation = registerLocation;
