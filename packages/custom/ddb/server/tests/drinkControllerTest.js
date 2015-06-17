'use strict';

var expect = require('expect.js'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Drink = mongoose.model('Drink'),
    drinkCtrl = require('../controllers/drink'),
    _ = require('lodash'),
    moment = require('moment');

var _user1;

describe('<Unit Test>', function () {
    describe('Drinks Controller:', function () {

        before(function (done) {
            var counter = _.after(2, done);
            Drink.find({}).remove(function (err) {
                expect(err).to.be(null);
                counter()
            });

            User.find({}).remove(function (err) {
                expect(err).to.be(null);
                var user1 = {
                    name: 'Full name',
                    email: 'test1@test.com',
                    username: 'test1',
                    password: 'password',
                    provider: 'local'
                };
                _user1 = new User(user1);
                _user1.save(function (err) {
                    expect(err).to.be(null);
                    counter();
                });
            });
        });

        describe('CRUD Operations', function () {
            var drinkId;
            var lastModifiedDate;
            it('Can list the drinks initially, when there are none', function (done) {
                var req = {
                    user: {
                        _id: _user1._id
                    }
                };
                var res = {
                    json: function (data) {
                        expect(data.length).to.eql(0);
                        done();
                    }
                };
                drinkCtrl.list(req, res);
            });

            it('Can add a drink', function (done) {
                var req = {
                    user: {
                        _id: _user1._id
                    },
                    body: {
                        name: 'TestBier',
                        alcoholContent: 0.05
                    }
                };
                var res = {
                    json: function (data) {
                        drinkId = data._id;
                        lastModifiedDate = data.lastModifiedDate;
                        expect(data.alcoholContent).to.eql(0.05);
                        expect(data.name).to.be.eql('TestBier');
                        expect(data._id).to.not.be.null;
                        expect(data.creationDate).to.not.be.null;
                        expect(data.lastModifiedDate).to.not.be.null;
                        done();
                    }
                };
                drinkCtrl.add(req, res);
            });

            it('Can retrieve the list of drinks', function (done) {
                var req = {
                    user: {
                        _id: _user1._id
                    }
                };
                var res = {
                    json: function (data) {
                        expect(data.length).to.eql(1);
                        done();
                    }
                };
                drinkCtrl.list(req, res);
            });

            it('Can add update drink', function (done) {
                var req = {
                    user: {
                        _id: _user1._id
                    },
                    params: {
                        drinkId: drinkId
                    },
                    body: {
                        name: 'TestBier',
                        alcoholContent: 0.10
                    }
                };
                var res = {
                    json: function (data) {
                        expect(data.alcoholContent).to.eql(0.10);
                        expect(data.lastModifiedDate).to.not.eql(lastModifiedDate);
                        done();
                    }
                };
                drinkCtrl.update(req, res);
            });

            it('Can get one specific drink', function (done) {
                var req = {
                    user: {
                        _id: _user1._id
                    },
                    params: {
                        drinkId: drinkId
                    }
                };
                var res = {
                    json: function (data) {
                        expect(data.alcoholContent).to.eql(0.10);
                        done();
                    }
                };
                drinkCtrl.get(req, res);
            });
        });

    });
});
