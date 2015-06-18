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
        status: function (code) {
            expect(code).to.not.eql(500);
        },
        json: function (data) {
            callback();
        }
    };
    measurementCtrl.update(req, res);
}

describe('<Unit Test>', function () {
    describe('Daily Analysis Generator:', function () {

        beforeEach(function (done) {
            var counter = _.after(3, done);
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
                    counter();
                });
            });

            Drink.find({}).remove(function (err) {
                expect(err).to.be(null);

                drinkCtrl.add({
                    user: {
                        _id: _user1._id
                    },
                    body: {
                        name: 'Drank1',
                        alc: 0.05
                    }
                }, {
                    json: function (data) {
                        _drink1 = data;
                        counter();
                    }
                });

                drinkCtrl.add({
                    user: {
                        _id: _user1._id
                    },
                    body: {
                        name: 'Drank2',
                        alc: 0.10
                    }
                }, {
                    json: function (data) {
                        _drink2 = data;
                        counter();
                    }
                });

            });
        });

        describe('Profile generation', function () {
            it('Generates one profile for every user', function (done) {
                var afterInsert = _.after(2, function () {
                    var req = {
                        user: {
                            _id: _user1._id
                        },
                        params: {
                            userId: _user1._id
                        }

                    };
                    var res = {
                        status: function (code) {
                            expect(code).to.eql(200);
                        },
                        json: function (data) {
                            expect(data.highestBinge).to.eql(137);
                            expect(data.drinkingDayRate).to.eql(1);
                            expect(data.drinkingDays).to.eql(2);
                            expect(data.activeDays).to.eql(2);
                            expect(Math.round(data.consistencyFactor * 100) / 100).to.eql(0.33);
                            expect(data.avgAlc).to.eql(102.75);
                            expect(data.avgAlcLiquor).to.eql(64.5);
                            expect(data.avgAlcWine).to.eql(18.75);
                            expect(data.avgAlcStrongbeer).to.eql(11.25);
                            expect(data.avgAlcPilsner).to.eql(8.25);
                            expect(data.avgLiquor).to.eql(150);
                            expect(data.avgWine).to.eql(150);
                            expect(data.avgStrongbeer).to.eql(150);
                            expect(data.avgPilsner).to.eql(150);
                            expect(data.totAlc).to.eql(205.5);
                            expect(data.totAlcLiquor).to.eql(129);
                            expect(data.totAlcWine).to.eql(37.5);
                            expect(data.totAlcStrongbeer).to.eql(22.5);
                            expect(data.totAlcPilsner).to.eql(16.5);
                            expect(data.totLiquor).to.eql(300);
                            expect(data.totWine).to.eql(300);
                            expect(data.totStrongbeer).to.eql(300);
                            expect(data.totPilsner).to.eql(300);
                            expect(data.series.length).to.eql(2);
                            expect(data.series[0].cumAlc).to.eql(137);
                            expect(Math.round(data.series[0].spreadAlc)).to.eql(20);
                            expect(data.series[1].cumAlc).to.eql(205.5);
                            expect(Math.round(data.series[1].spreadAlc)).to.eql(29);
                            done();
                        }
                    };
                    profileCtrl.getUser(req, res);

                });
                // Two measurements
                insertMeasurement(_user1._id, {
                    pilsner: 100,
                    strongbeer: 100,
                    wine: 100,
                    liquor: 100,
                    date: moment.utc().valueOf()
                }, afterInsert);

                insertMeasurement(_user1._id, {
                    pilsner: 200,
                    strongbeer: 200,
                    wine: 200,
                    liquor: 200,
                    date: moment.utc().subtract(1, 'days').valueOf()
                }, afterInsert);
            });

            it('Will not retrieve the profile if the users do not share a group', function (done) {
                var user2 = {
                    name: 'Full name',
                    email: 'test2@test.com',
                    username: 'test2',
                    password: 'password',
                    provider: 'local'
                };
                var _user2 = new User(user2);
                _user2.save(function (err) {
                    expect(err).to.be(null);

                    var req = {
                        user: {
                            _id: _user2._id
                        },
                        params: {
                            userId: _user1._id
                        }

                    };
                    var res = {
                        status: function (code) {
                            expect(code).to.eql(401);
                            done();
                        }
                    };
                    profileCtrl.getUser(req, res);
                });

            });
        });

        describe('Frequent Drinks Calculation', function () {
            it('Returns a sorted list of the drinks the user most frequently measures', function (done) {
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
