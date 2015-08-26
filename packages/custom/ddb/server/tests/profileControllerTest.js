'use strict';

var expect = require('expect.js'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Measurement = mongoose.model('Measurement'),
    Drink = mongoose.model('Drink'),
    measurementCtrl = require('../controllers/measurement'),
    drinkCtrl = require('../controllers/drink'),
    profileCtrl = require('../controllers/profile'),
    _ = require('lodash'),
    moment = require('moment');

var _user1;
var _drink1, _drink2;

function insertMeasurement(userId, measurement, callback) {
    var req = {
        user: {
            _id: userId
        },
        body: measurement
    };
    var res = {
        json: function (data) {
            callback();
        }
    };
    measurementCtrl.update(req, res, function (err) {
        done(err);
    });
}

describe('<Unit Test>', function () {
    describe('Profile Generator:', function () {

        beforeEach(function (done) {
            // Add a user and two drinks
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
                    var counter = _.after(2, done);
                    Drink.find({}).remove(function (err) {
                        expect(err).to.be(null);

                        drinkCtrl.add({
                            user: {
                                _id: _user1._id
                            },
                            body: {
                                name: 'Drank1',
                                alc: 0.05,
                                type: 'beer'
                            }
                        }, {
                            json: function (data) {
                                _drink1 = data;
                                counter();
                            }
                        }, function (err) {
                            done(err);
                        });

                        drinkCtrl.add({
                            user: {
                                _id: _user1._id
                            },
                            body: {
                                name: 'Drank2',
                                alc: 0.10,
                                type: 'beer'
                            }
                        }, {
                            json: function (data) {
                                _drink2 = data;
                                counter();
                            }
                        }, function (err) {
                            done(err);
                        });

                    });
                });
            });
        });

        describe('Frequent Drinks Calculation', function () {
            it('Returns a sorted list of the drinks the user most frequently drinks', function (done) {
                var afterInsert = _.after(3, function () {
                    profileCtrl.getFrequentDrinks({
                        user: {
                            _id: _user1._id
                        },
                        params: {
                            userId: _user1._id
                        }

                    }, {
                        json: function (data) {
                            expect(data.length).to.eql(2);
                            expect(data[0].drink._id).to.eql(_drink1._id);
                            expect(data[0].nbDays).to.eql(3);
                            expect(data[1].drink._id).to.eql(_drink2._id);
                            expect(data[1].nbDays).to.eql(2);
                            done();
                        }
                    }, function (err) {
                        done(err);
                    });

                });
                insertMeasurement(_user1._id, {
                    consumptions: [
                        {drink: _drink1._id, amount: 50},
                        {drink: _drink2._id, amount: 100}
                    ],
                    date: moment.utc().valueOf()
                }, afterInsert);

                insertMeasurement(_user1._id, {
                    consumptions: [
                        {drink: _drink1._id, amount: 50}
                    ],
                    date: moment.utc().subtract(1, 'days').valueOf()
                }, afterInsert);

                insertMeasurement(_user1._id, {
                    consumptions: [
                        {drink: _drink1._id, amount: 50},
                        {drink: _drink2._id, amount: 50}
                    ],
                    date: moment.utc().subtract(2, 'days').valueOf()
                }, afterInsert);
            });

        });
    });
});
