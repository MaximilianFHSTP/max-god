const assert = require('assert');
const expect = require('chai').expect;


describe('Unit testing the /users route', function() {

    it('PoST - create a new user should return 201 status', function() {
        return request(app)
            .post('/users')
            .send({username: 'Testuser', email: 'testuser@fhstp.ac.at', password: 'password'})
            .then(function(response){
                assert.equal(response.status, 201)
            })
    });

    it('GET - getting all users should return 200 status', function() {
        return request(app)
            .get('/users')
            .then(function(response){
                assert.equal(response.status, 200)
            })
    });

});
