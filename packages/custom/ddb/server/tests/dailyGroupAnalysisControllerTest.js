'use strict';

var expect = require('expect.js'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Measurement = mongoose.model('Measurement'),
    groupCtrl = require('../controllers/group'),
    measurementCtrl = require('../controllers/measurement'),
    dailyGroupAnalysisCtrl = require('../controllers/dailygroupanalysis'),
    _ = require('lodash'),
    moment = require('moment');

var _user1, _user2;

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
    describe('Daily Group Analysis Generator:', function () {
        var groupId;
        beforeEach(function (done) {
            User.find({}).remove(function (err) {
                expect(err).to.be(null);

                // After having created two users
                var counter = _.after(2, function () {
                    // Let them join a group together
                    var req = {
                        user: {
                            _id: _user1._id
                        },
                        body: {
                            name: 'testGroup',
                            invitations: [_user2._id]
                        }
                    };
                    var res = {
                        json: function (group) {
                            groupId = group._id;
                            var req = {
                                user: {
                                    _id: _user2._id
                                },
                                params: {
                                    groupId: group._id
                                }
                            };
                            var res = {
                                status: function (code) {
                                    expect(code).to.eql(200);
                                    return this;
                                },
                                end: function () {
                                    done();
                                }
                            };
                            groupCtrl.approveInvitation(req, res);
                        }
                    };
                    groupCtrl.createGroup(req, res);
                });


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

                var user2 = {
                    name: 'Full name',
                    email: 'test2@test.com',
                    username: 'test2',
                    password: 'password',
                    provider: 'local'
                };
                _user2 = new User(user2);
                _user2.save(function (err) {
                    expect(err).to.be(null);
                    counter();
                });
            });

        });

        describe('Daily Group Analysis Generation', function () {
            it('Generates one daily group analysis for every day', function (done) {
                var afterInsert = _.after(4, function () {
                    var req = {
                        user: {
                            _id: _user1._id
                        },
                        params: {
                            groupId: groupId
                        }

                    };
                    var res = {
                        status: function (code) {
                            expect(code).to.eql(200);
                        },
                        json: function (data) {
                            expect(data.length).to.eql(2);
                            expect(data[0].todAvgAlc).to.eql(11);
                            expect(data[0].todSumAlc).to.eql(22);
                            expect(data[0].todMinAlc).to.eql(5.5);
                            expect(data[0].todMaxAlc).to.eql(16.5);

                            expect(data[1].todAvgAlc).to.eql(22);
                            expect(data[1].todSumAlc).to.eql(44);
                            expect(data[1].todMinAlc).to.eql(11);
                            expect(data[1].todMaxAlc).to.eql(33);
                            done();
                        }
                    };
                    dailyGroupAnalysisCtrl.all(req, res);

                });
                insertMeasurement(_user2._id, {
                    pilsner: 100,
                    date: moment.utc().subtract(1, 'days').valueOf()
                }, afterInsert);

                insertMeasurement(_user1._id, {
                    pilsner: 300,
                    date: moment.utc().subtract(1, 'days').valueOf()
                }, afterInsert);

                insertMeasurement(_user1._id, {
                    pilsner: 200,
                    date: moment.utc().valueOf()
                }, afterInsert);

                insertMeasurement(_user2._id, {
                    pilsner: 600,
                    date: moment.utc().valueOf()
                }, afterInsert);

            });
        });

        describe('Daily Group Analysis Generation', function () {
            it('Generates only one daily group analysis for every day  (no duplicates because of race conditions!)', function (done) {
                var afterInsert = _.after(4, function () {
                    var req = {
                        user: {
                            _id: _user1._id
                        },
                        params: {
                            groupId: groupId
                        }

                    };
                    var res = {
                        status: function (code) {
                            expect(code).to.eql(200);
                        },
                        json: function (data) {
                            expect(data.length).to.eql(1);
                            done();
                        }
                    };
                    dailyGroupAnalysisCtrl.all(req, res);

                });
                // Two measurements quickly for each user, all on the same day
                insertMeasurement(_user1._id, {
                    pilsner: 100,
                    date: moment.utc().valueOf()
                }, afterInsert);

                insertMeasurement(_user1._id, {
                    pilsner: 100,
                    date: moment.utc().valueOf()
                }, afterInsert);

                insertMeasurement(_user2._id, {
                    pilsner: 100,
                    date: moment.utc().valueOf()
                }, afterInsert);

                insertMeasurement(_user2._id, {
                    pilsner: 100,
                    date: moment.utc().valueOf()
                }, afterInsert);
            });
        });

    });
});
