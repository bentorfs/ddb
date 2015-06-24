'use strict';

var expect = require('expect.js'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Measurement = mongoose.model('Measurement'),
    measurementCtrl = require('../controllers/measurement'),
    dailyAnalysisCtrl = require('../controllers/dailyanalysis'),
    _ = require('lodash'),
    moment = require('moment');

var _user1;

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
    measurementCtrl.update(req, res,
        function (err) {
            done(err);
        });
}

describe('<Unit Test>', function () {
    describe('Daily Analysis Generator:', function () {

        beforeEach(function (done) {
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
                    done();
                });
            });

        });

        describe('Daily Analysis Generation', function () {
            it('Generates one daily analysis for every measurement', function (done) {
                var afterInsert = _.after(2, function () {

                    var req = {
                        user: {
                            _id: _user1._id
                        },
                        params: {
                            userId: _user1._id
                        },
                        query: {}
                    };
                    var res = {
                        json: function (data) {
                            expect(data.length).to.eql(2);
                            expect(data[0].todPilsner).to.eql(100);
                            expect(data[0].todStrongbeer).to.eql(100);
                            expect(data[0].todWine).to.eql(100);
                            expect(data[0].todLiquor).to.eql(100);
                            expect(data[0].todAlcPilsner).to.eql(5.5);
                            expect(data[0].todAlcStrongbeer).to.eql(7.5);
                            expect(data[0].todAlcWine).to.eql(12.5);
                            expect(data[0].todAlcLiquor).to.eql(43);
                            expect(data[0].todAlc).to.eql(68.5);

                            expect(data[1].todPilsner).to.eql(100);
                            expect(data[1].todStrongbeer).to.eql(100);
                            expect(data[1].todWine).to.eql(100);
                            expect(data[1].todLiquor).to.eql(100);
                            expect(data[1].todAlcPilsner).to.eql(5.5);
                            expect(data[1].todAlcStrongbeer).to.eql(7.5);
                            expect(data[1].todAlcWine).to.eql(12.5);
                            expect(data[1].todAlcLiquor).to.eql(43);
                            expect(data[1].todAlc).to.eql(68.5);
                            done();
                        }
                    };
                    dailyAnalysisCtrl.all(req, res,
                        function (err) {
                            done(err);
                        });

                });
                insertMeasurement(_user1._id, {
                    pilsner: 100,
                    strongbeer: 100,
                    wine: 100,
                    liquor: 100,
                    date: moment.utc().valueOf()
                }, afterInsert);

                insertMeasurement(_user1._id, {
                    pilsner: 100,
                    strongbeer: 100,
                    wine: 100,
                    liquor: 100,
                    date: moment.utc().subtract(1, 'days').valueOf()
                }, afterInsert);
            });

            it('Generates only one daily analysis for every measurement (no duplicates because of race conditions!)', function (done) {
                var afterInsert = _.after(3, function () {

                    var req = {
                        user: {
                            _id: _user1._id
                        },
                        params: {
                            userId: _user1._id
                        },
                        query: {}
                    };
                    var res = {
                        json: function (data) {
                            expect(data.length).to.eql(1);
                            done();
                        }
                    };
                    dailyAnalysisCtrl.all(req, res, function (err) {
                        done(err);
                    });

                });
                // Three measurements quickly on the same day
                insertMeasurement(_user1._id, {
                    pilsner: 100,
                    date: moment.utc().valueOf()
                }, afterInsert);

                insertMeasurement(_user1._id, {
                    pilsner: 100,
                    date: moment.utc().valueOf()
                }, afterInsert);

                insertMeasurement(_user1._id, {
                    pilsner: 100,
                    date: moment.utc().valueOf()
                }, afterInsert);
            });

            it('Will not retrieve daily analysis if the users do not share a group', function (done) {
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
                        },
                        query: {}
                    };
                    var res = {
                        status: function (code) {
                            expect(code).to.eql(401);
                            return this;
                        },
                        end: function () {
                            done();
                        }
                    };
                    dailyAnalysisCtrl.all(req, res, function (err) {
                        done(err);
                    });
                });

            });
        });

    });
});
