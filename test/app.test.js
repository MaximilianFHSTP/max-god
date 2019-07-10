const assert = require('assert');
const expect = require('chai').expect;
const io = require('socket.io-client');
const updateTimeline = require('./location.test').updateTimeline;
const registerLocation = require('./location.test').registerLocation;
require('dotenv').config();

describe('User socket events', function()
{
    var socket;

    before('establish socket connection...', function(done)
    {
        if(process.env.https === '1')
            socket = io.connect('https://localhost:' + process.env.SERVER_PORT);

        else
            socket = io.connect('http://localhost:' + process.env.SERVER_PORT);

       socket.on('connect', function()
       {
          done();
       });
    });

    after('closing socket connection...', function(done)
    {
       if(socket.connected)
           socket.disconnect();

       else
           console.log('no connection to close...');

       done();
    });

    describe('#testing general functionality', function()
    {
        describe('##checkWifiSSID', function()
        {
            it('getWifiSSID', function(done)
            {
                socket.emit('getWifiSSID');

                socket.on('getWifiSSIDResult', function (result) {
                    const message = result.message;
                    const data = result.data;

                    expect(message.code).to.be.equal(200);
                    expect(data.ssid).to.be.equal('DesKaisersNeuerHeiliger');
                    expect(data.password).to.be.equal('maximilian');

                    socket.removeAllListeners('getWifiSSIDResult');
                    done();
                });
            });
        });
    });

    describe('#testing guest functionality', function()
    {
        let user;
        let token;

        let today = new Date();
        const username = 'Raggnor.' + today.toString();
        const email = username + '@fhstp.ac.at';

        it('registerAsGuest', function(done)
        {
            socket.emit('registerODGuest', {
                deviceAddress: 'deviceAddress',
                deviceOS: 'deviceOS',
                deviceVersion: 'deviceVersion',
                deviceModel: 'deviceModel',
                language: 1
            });

            socket.on('registerODGuestResult', function(result)
            {
                const message = result.message;
                const data = result.data;

                token = data.token;
                user = data.user;
                const locations = data.locations;

                expect(message.code).to.be.equal(201);
                expect(token).to.exist;
                expect(user).to.exist;
                expect(locations).to.exist.and.to.have.lengthOf(37);

                socket.removeAllListeners('registerODGuestResult');
                done();
            });
        });

        describe('##autoLoginGuest', function()
        {
            it('sendAutoLogin', function(done)
            {
                socket.emit('autoLoginOD', {token, device: {deviceAddress: "deviceAddress", deviceOS: "iOS", deviceVersion: "10.9.1", deviceModel: "Iphone XS"}});

                socket.on('autoLoginODResult', function(result)
                {
                    const message = result.message;
                    const data = result.data;

                    token = data.token;
                    user = data.user;
                    const locations = data.locations;

                    expect(message.code).to.be.equal(202);
                    expect(token).to.exist;
                    expect(user).to.exist;
                    expect(locations).to.exist.and.to.have.lengthOf(37);

                    socket.removeAllListeners('autoLoginODResult');
                    done();
                });
            });
        });

        describe('##sendTimelineUpdateForLocations', function()
        {
            it('updateTimeline for location 100', function(done)
            {
                updateTimeline(done, socket, user, 100);
            });

            it('updateTimeline for location 101', function(done)
            {
                updateTimeline(done, socket, user, 101);
            });

            it('updateTimeline for location 2001', function(done)
            {
                updateTimeline(done, socket, user, 2001);
            });
        });

        describe('##sendRegisterLocations', function()
        {
            it('updateTimeline for location 100', function(done)
            {
                updateTimeline(done, socket, user, 100);
            });

            it('registerLocation for location 101', function(done)
            {
                registerLocation(done, socket, user, 101);
            });

            it('registerLocation for location 2001', function(done)
            {
                registerLocation(done, socket, user, 2001);
            });
        });

        describe('##guestAnswerQuestionnaire', function()
        {
            it('questionnaireAnswered', function(done)
            {
                socket.emit('questionnaireAnswered', user.id);

                socket.on('questionnaireAnsweredResult', function (result) {
                    const message = result.message;
                    const data = result.data;

                    expect(message.code).to.be.equal(203);
                    expect(data.id).to.be.equal(user.id);

                    socket.removeAllListeners('questionnaireAnsweredResult');
                    done();
                });
            });
        });

        describe('##makeGuestToRealUser', function ()
        {
            it('makeToRealUser', function (done)
            {
                socket.emit('makeToRealUser', {id: user.id, username, email, password: 'P@ssw0rd'});

                socket.on('makeToRealUserResult', function (result) {
                    const message = result.message;
                    const data = result.data;

                    const u = data.user;

                    expect(message.code).to.be.equal(203);
                    expect(u.id).to.be.equal(user.id);

                    socket.removeAllListeners('makeToRealUserResult');
                    done();
                });
            })
        });

        describe('##deleteGuest', function()
        {
            it('deleteGuestOD', function(done)
            {
                socket.emit('deleteOD', user.id);

                socket.on('deleteODResult', function (result) {
                    const message = result.message;
                    const data = result.data;

                    expect(message.code).to.be.equal(200);
                    expect(data).to.be.equal(null);

                    socket.removeAllListeners('deleteODResult');
                    done();
                });
            });
        });
    });

    describe('#testing user functionality', function()
    {
        let user;
        let token;

        let today = new Date();
        const username = 'Schlese.' + today.toString();
        const email = username + '@fhstp.ac.at';

        it('checkUsernameExists', function(done)
        {
            socket.emit('checkUsernameExists', username);

            socket.on('checkUsernameExistsResult', function(exists)
            {
                expect(exists).to.be.false;

                socket.removeAllListeners('checkUsernameExistsResult');
                done();
            });
        });

        it('checkEmailExists', function(done)
        {
            socket.emit('checkEmailExists', username);

            socket.on('checkEmailExistsResult', function(exists)
            {
                expect(exists).to.be.false;

                socket.removeAllListeners('checkUsernameExistsResult');
                done();
            });
        });

        it('checkNameOrEmailExists', function(done)
        {
            socket.emit('checkNameOrEmailExists', {name: username, email});

            socket.on('checkNameOrEmailExistsResult', function(result)
            {
                const email = result.email;
                const name = result.name;

                expect(email).to.be.false;
                expect(name).to.be.false;

                socket.removeAllListeners('checkUsernameExistsResult');
                done();
            });
        });

        it('registerOD', function(done)
        {
            socket.emit('registerOD', {
                identifier: username,
                email,
                password: 'P@ssw0rd',
                isGuest: false,
                deviceAddress: 'deviceAddress',
                deviceOS: 'deviceOS',
                deviceVersion: 'deviceVersion',
                deviceModel: 'deviceModel',
                language: 1
            });

            socket.on('registerODResult', function(result)
            {
                const message = result.message;
                const data = result.data;

                token = data.token;
                user = data.user;
                const locations = data.locations;

                expect(message.code).to.be.equal(201);
                expect(token).to.exist;
                expect(user).to.exist;
                expect(locations).to.exist.and.to.have.lengthOf(37);

                socket.removeAllListeners('registerODResult');
                done();
            });
        });

        it('registerODAgain', function(done)
        {
            socket.emit('registerOD', {
                identifier: username,
                email,
                password: 'P@ssw0rd',
                isGuest: false,
                deviceAddress: 'deviceAddress',
                deviceOS: 'deviceOS',
                deviceVersion: 'deviceVersion',
                deviceModel: 'deviceModel',
                language: 1
            });

            socket.on('registerODResult', function(result)
            {
                const message = result.message;
                const data = result.data;

                expect(message.code).to.be.equal(401);
                expect(data).to.be.equal(null);

                socket.removeAllListeners('registerODResult');
                done();
            });
        });

        describe('##autoLoginUser', function()
        {
            it('sendUserAutoLogin', function(done)
            {
                socket.emit('autoLoginOD', {token, device: {deviceAddress: "deviceAddress", deviceOS: "iOS", deviceVersion: "10.9.1", deviceModel: "Iphone XS"}});

                socket.on('autoLoginODResult', function(result)
                {
                    const message = result.message;
                    const data = result.data;

                    token = data.token;
                    user = data.user;
                    const locations = data.locations;

                    expect(message.code).to.be.equal(202);
                    expect(token).to.exist;
                    expect(user).to.exist;
                    expect(locations).to.exist.and.to.have.lengthOf(37);

                    socket.removeAllListeners('autoLoginODResult');
                    done();
                });
            });
        });

        describe('##loginUser', function()
        {
            it('sendUserLogin', function(done)
            {
                socket.emit('loginOD', {user: user.name, email: user.email, password: 'P@ssw0rd'});

                socket.on('loginODResult', function(result)
                {
                    const message = result.message;
                    const data = result.data;

                    token = data.token;
                    user = data.user;
                    const locations = data.locations;

                    expect(message.code).to.be.equal(202);
                    expect(token).to.exist;
                    expect(user).to.exist;
                    expect(locations).to.exist.and.to.have.lengthOf(37);

                    socket.removeAllListeners('loginODResult');
                    done();
                });
            });
        });

        describe('##sendTimelineUpdateForLocations', function()
        {
            it('updateTimeline for location 100', function(done)
            {
                updateTimeline(done, socket, user, 100);
            });

            it('updateTimeline for location 101', function(done)
            {
                updateTimeline(done, socket, user, 101);
            });

            it('updateTimeline for location 2001', function(done)
            {
                updateTimeline(done, socket, user, 2001);
            });
        });

        describe('##sendRegisterLocations', function()
        {
            it('updateTimeline for location 100', function(done)
            {
                updateTimeline(done, socket, user, 100);
            });

            it('registerLocation for location 101', function(done)
            {
                registerLocation(done, socket, user, 101);
            });

            it('registerLocation for location 2001', function(done)
            {
                registerLocation(done, socket, user, 2001);
            });
        });

        describe('##userAnswerQuestionnaire', function()
        {
            it('questionnaireAnswered', function(done)
            {
                socket.emit('questionnaireAnswered', user.id);

                socket.on('questionnaireAnsweredResult', function (result) {
                    const message = result.message;
                    const data = result.data;

                    expect(message.code).to.be.equal(203);
                    expect(data.id).to.be.equal(user.id);

                    socket.removeAllListeners('questionnaireAnsweredResult');
                    done();
                });
            });
        });

        describe('##unlockAllTimelineLocations', function ()
        {
            it('unlockAllTimelineLocations', function (done)
            {
                socket.emit('unlockAllTimelineLocations', {user: user.id});

                socket.on('unlockAllTimelineLocationsResult', function (result) {
                    const message = result.message;
                    const data = result.data;

                    expect(message.code).to.be.equal(200);
                    expect(data).to.be.equal(null);

                    socket.removeAllListeners('unlockAllTimelineLocationsResult');
                    done();
                });
            })
        });

        describe('##updateUserLanguageToGerman', function ()
        {
            it('updateUserLanguage', function (done)
            {
                socket.emit('updateUserLanguage', {user: user.id, language: 2});

                socket.on('updateUserLanguageResult', function (result) {
                    const message = result.message;
                    const data = result.data;

                    const locations = data.locations;
                    const language = data.language;

                    expect(message.code).to.be.equal(203);
                    expect(locations).to.exist.and.to.have.lengthOf(37);
                    expect(language).to.be.equal(2);

                    socket.removeAllListeners('updateUserLanguageResult');
                    done();
                });
            })
        });

        describe('##changeODCredentials', function ()
        {
            it('changeODCredentials', function (done)
            {
                socket.emit('changeODCredentials', {id: user.id, username: user.name + ' changed', email: user.email + ' changed', password: 'P@ssw0rd', newPassword: 'P@sswOrd'});

                socket.on('changeODCredentialsResult', function (result) {
                    const message = result.message;
                    const data = result.data;

                    const u = data.user;

                    expect(message.code).to.be.equal(203);
                    expect(u.id).to.be.equal(user.id);

                    socket.removeAllListeners('changeODCredentialsResult');
                    done();
                });
            })
        });

        describe('##changeUserCoaColors', function ()
        {
            it('changeUserCoaColors', function (done)
            {
                socket.emit('changeUserCoaColors', {userId: user.id, primary: 2, secondary: 5});

                socket.on('changeUserCoaColorsResult', function (result) {
                    const message = result.message;
                    const data = result.data;

                    expect(message.code).to.be.equal(200);
                    expect(data.id).to.be.equal(user.id);

                    socket.removeAllListeners('changeUserCoaColorsResult');
                    done();
                });
            })
        });

        describe('##getCoaParts', function ()
        {
            it('getCoaParts', function(done)
            {
                socket.emit('getCoaParts');

                socket.on('getCoaPartsResult', function(result)
                {
                    const data = result.data;
                    const message = result.message;

                    expect(message.code).to.be.equal(200);
                    expect(data).to.have.lengthOf(18);

                    socket.removeAllListeners('getCoaPartsResult');
                    done();
                });
            });
        });

        describe('##getCoaColors', function ()
        {
            it('getCoaColors', function(done)
            {
                socket.emit('getCoaColors');

                socket.on('getCoaColorsResult', function(result)
                {
                    const data = result.data;
                    const message = result.message;

                    expect(message.code).to.be.equal(200);
                    expect(data).to.have.lengthOf(5);

                    socket.removeAllListeners('getCoaColorsResult');
                    done();
                });
            });
        });

        describe('##getUserCoaParts', function ()
        {
            it('getUserCoaParts', function (done)
            {
                socket.emit('getUserCoaParts', {userId: user.id});

                socket.on('getUserCoaPartsResult', function (result) {
                    const message = result.message;
                    const data = result.data;

                    expect(message.code).to.be.equal(200);
                    expect(data).to.exist.and.to.have.lengthOf(4);

                    socket.removeAllListeners('getUserCoaPartsResult');
                    done();
                });
            })
        });

        describe('##unlockUserCoaPart', function ()
        {
            it('unlockCoaPart', function (done)
            {
                socket.emit('unlockCoaPart', {userId: user.id, coaId: 22});

                socket.on('unlockCoaPartResult', function (result) {
                    const message = result.message;
                    const data = result.data;

                    expect(message.code).to.be.equal(200);
                    expect(data).to.exist.and.to.have.lengthOf(5);

                    socket.removeAllListeners('unlockCoaPartResult');
                    done();
                });
            })
        });

        describe('##changeUserCoaPart', function ()
        {
            it('changeUserCoaPart', function (done)
            {
                socket.emit('changeUserCoaPart', {userId: user.id, coaType: 2, coaId: 22});

                socket.on('changeUserCoaPartResult', function (result)
                {
                    const message = result.message;
                    const data = result.data;

                    expect(message.code).to.be.equal(200);

                    for(part in data)
                    {
                        if(part.id === 22 )
                            expect(part.UserCoaPart.isActive).to.be.true;
                    }

                    socket.removeAllListeners('changeUserCoaPartResult');
                    done();
                });
            })
        });

        describe('##checkUserDeviceData', function ()
        {
            it('checkUserDeviceData', function (done)
            {
                socket.emit('checkUserDeviceData',
                {
                    userId: user.id,
                    shouldBeUpdated: true,
                    deviceAddress: 'newDeviceAddress',
                    deviceOS: 'newOS',
                    deviceVersion: 'newDeviceVersion',
                    deviceModel: 'newDeviceModel',
                });

                socket.on('checkUserDeviceDataResult', function (result)
                {
                    const message = result.message;
                    const data = result.data;

                    expect(message.code).to.be.equal(203);
                    expect(data.id).to.be.equal(user.id);
                    expect(data.deviceAddress).to.be.equal('newDeviceAddress');
                    expect(data.deviceOS).to.be.equal('newOS');
                    expect(data.deviceVersion).to.be.equal('newDeviceVersion');
                    expect(data.deviceModel).to.be.equal('newDeviceModel');

                    socket.removeAllListeners('checkUserDeviceDataResult');
                    done();
                });
            })
        });

        describe('##addUserLogEntry', function ()
        {
            it('addUserLogEntry', function (done)
            {
                socket.emit('addUserLogEntry',
                    {
                        user: user.id,
                        logType: 6,
                        comment: 'New logout entry created by unit test'
                    });

                socket.on('addUserLogEntryResult', function (result)
                {
                    const message = result.message;
                    const data = result.data;

                    expect(message.code).to.be.equal(201);
                    expect(data.userId).to.be.equal(user.id);
                    expect(data.logTypeId).to.be.equal(6);
                    expect(data.comment).to.be.equal('New logout entry created by unit test');

                    socket.removeAllListeners('addUserLogEntryResult');
                    done();
                });
            })
        });

        describe('##checkAppVersion', function ()
        {
            it('checkAppVersion', function (done)
            {
                socket.emit('checkAppVersion', { version: '2.4' });

                socket.on('checkAppVersionResult', function (result)
                {
                    const message = result.message;
                    const data = result.data;

                    expect(message.code).to.be.equal(200);
                    expect(data.versionIsCorrect).to.be.true;

                    socket.removeAllListeners('checkAppVersionResult');
                    done();
                });
            })
        });

        describe('##getLookupTable', function ()
        {
            it('getLookupTable', function (done)
            {
                socket.emit('getLookupTable', {user: user.id});

                socket.on('getLookupTableResult', function (result)
                {
                    const message = result.message;
                    const data = result.data;

                    expect(message.code).to.be.equal(200);
                    expect(data.locations).to.have.lengthOf(37);

                    socket.removeAllListeners('getLookupTableResult');
                    done();
                });
            })
        });

        describe('##deleteUser', function()
        {
            it('deleteOD', function(done)
            {
                socket.emit('deleteOD', user.id);

                socket.on('deleteODResult', function (result) {
                    const message = result.message;
                    const data = result.data;

                    expect(message.code).to.be.equal(200);
                    expect(data).to.be.equal(null);

                    socket.removeAllListeners('deleteODResult');
                    done();
                });
            });
        });
    });
});
