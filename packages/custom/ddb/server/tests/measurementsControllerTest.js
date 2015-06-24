'use strict';

var expect = require('expect.js'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Measurement = mongoose.model('Measurement'),
    measurementCtrl = require('../controllers/measurement'),
    drinkCtrl = require('../controllers/drink'),
    _ = require('lodash'),
    moment = require('moment');

var _user1;
var _drink1;

describe('<Unit Test>', function () {
    describe('Measurements Controller:', function () {

        before(function (done) {
            var counter = _.after(1, done);
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
                    });
                });
            });
        });

        describe('CRUD Operations', function () {
            it('Creates a measurement for the current day, when getting the list, if it doesnt exist', function (done) {
                var req = {
                    user: {
                        _id: _user1._id,
                        username: 'test1'
                    }
                };
                var res = {
                    json: function (data) {
                        expect(data.length).to.eql(1);
                        done();
                    }
                };
                measurementCtrl.all(req, res, function (err) {
                    done(err);
                });
            });

            it('Can manually create a measurement. They are stored in UTC', function (done) {
                var testDate = moment.utc();
                var req = {
                    user: {
                        _id: _user1._id,
                        username: 'test1'
                    },
                    body: {
                        pilsner: 100,
                        date: testDate.valueOf()
                    }
                };
                var res = {
                    json: function (data) {
                        expect(moment.utc(data.date).valueOf()).to.eql(testDate.startOf('day').valueOf());
                        expect(data.pilsner).to.eql(100);
                        expect(data.strongbeer).to.eql(0);
                        expect(data.wine).to.eql(0);
                        expect(data.liquor).to.eql(0);
                        done();
                    }
                };
                measurementCtrl.update(req, res, function (err) {
                    done(err);
                });
            });

            it('It is possible create a measurement in the past. All subsequent dates will be generated on the next GET', function (done) {
                var testDate = moment.utc().subtract(3, 'days');
                var req = {
                    user: {
                        _id: _user1._id,
                        username: 'test1'
                    },
                    body: {
                        date: testDate.valueOf()
                    }
                };
                var res = {
                    json: function (data) {
                        expect(moment.utc(data.date).valueOf()).to.eql(testDate.startOf('day').valueOf());

                        var req = {
                            user: {
                                _id: _user1._id
                            }
                        };
                        var res = {
                            json: function (data) {
                                expect(data.length).to.eql(4);
                                done();
                            }
                        };
                        measurementCtrl.all(req, res, function (err) {
                            done(err);
                        });
                    }
                };
                measurementCtrl.update(req, res, function (err) {
                    done(err);
                });
            });

            it('It is not possible to create measurements more than 60 days in the past', function (done) {
                var testDate = moment.utc().subtract(65, 'days');
                var req = {
                    user: {
                        _id: _user1._id
                    },
                    body: {
                        date: testDate.valueOf()
                    }
                };
                var res = {
                    status: function (code) {
                        expect(code).to.eql(400);
                        return this;
                    },
                    end: function (data) {
                        done();
                    }
                };
                measurementCtrl.update(req, res, function (err) {
                    done(err);
                });
            });

            it('It is not possible to create measurements more than 3 days in the future', function (done) {
                var testDate = moment.utc().add(4, 'days');
                var req = {
                    user: {
                        _id: _user1._id
                    },
                    body: {
                        date: testDate.valueOf()
                    }
                };
                var res = {
                    status: function (code) {
                        expect(code).to.eql(400);
                        return this;
                    },
                    end: function (data) {
                        done();
                    }
                };
                measurementCtrl.update(req, res, function (err) {
                    done(err);
                });
            });

        });

        describe('Updating consumptions', function () {

            var measurement;
            it('can add a consumption to an already existing measurement', function (done) {
                measurementCtrl.get({
                    user: {
                        _id: _user1._id
                    },
                    params: {
                        date: moment().valueOf()
                    }
                }, {
                    json: function () {
                        var counter = _.after(2, done);
                        measurementCtrl.addConsumption({
                            user: {
                                _id: _user1._id
                            },
                            params: {
                                date: moment().valueOf()
                            },
                            body: {
                                amount: 100,
                                drink: _drink1._id
                            }
                        }, {
                            json: function (data) {
                                measurement = data;
                                counter();
                            }
                        }, function (err) {
                            done(err);
                        });
                        measurementCtrl.addConsumption({
                            user: {
                                _id: _user1._id
                            },
                            params: {
                                date: moment().valueOf()
                            },
                            body: {
                                amount: 200,
                                drink: _drink1._id
                            }
                        }, {
                            json: function (data) {
                                measurement = data;
                                counter();
                            }
                        }, function (err) {
                            done(err);
                        });
                    }
                });
            });

            it('can remove an individual consumption', function (done) {
                measurementCtrl.get({
                    user: {
                        _id: _user1._id
                    },
                    params: {
                        date: moment().valueOf()
                    }
                }, {
                    json: function (data) {
                        measurementCtrl.removeConsumption({
                            user: {
                                _id: _user1._id
                            },
                            params: {
                                date: moment().valueOf()
                            },
                            query: {
                                consumptionId: measurement.consumptions[0]._id
                            }
                        }, {
                            json: function (data) {
                                expect(data.consumptions.length).to.eql(1);
                                done();
                            }
                        }, function (err) {
                            done(err);
                        });
                    }
                });

            });

        });

    });
});
