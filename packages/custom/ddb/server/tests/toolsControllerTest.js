'use strict';

var expect = require('expect.js'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Group = mongoose.model('Group'),
    groupCtrl = require('../controllers/group'),
    toolsCtrl = require('../controllers/tools'),
    _ = require('lodash'),
    moment = require('moment');

var _user1, _user2;

describe('<Unit Test>', function () {
    describe('Tools Controller:', function () {

        before(function (done) {
            var trigger = _.after(3, done);
            Group.find({}).remove(function (err) {
                expect(err).to.be(null);
                trigger();
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
                    trigger();
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
                    trigger();
                });

            });
        });

        describe('User purging', function () {
            it('Deletes groups invitations', function (done) {
                var req = {
                    user: {
                        _id: _user1._id
                    },
                    body: {
                        name: 'testGroup',
                        invitations: [_user2.id]
                    }
                };
                var res = {
                    json: function (group) {
                        expect(group.members.length).to.eql(1);
                        expect(group.invitations.length).to.eql(1);
                        toolsCtrl.purgeUser(
                            {
                                user: {
                                    _id: _user2._id
                                },
                                params: {
                                    userId: _user2._id
                                }
                            },
                            {
                                status: function (code) {
                                    expect(code).to.eql(200);
                                    return this;
                                },
                                end: function () {
                                    groupCtrl.listGroups({
                                        user: {
                                            _id: _user1._id
                                        }
                                    }, {
                                        json: function (data) {
                                            expect(data.length).to.eql(1);
                                            expect(data[0].invitations.length).to.eql(0);
                                            done();
                                        }
                                    });
                                }
                            },
                            function (err) {
                                done(err);
                            });
                    }
                };
                groupCtrl.createGroup(req, res);
            });

            it('Deletes groups memberships', function (done) {
                var req = {
                    user: {
                        _id: _user1._id
                    },
                    body: {
                        name: 'testGroup'
                    }
                };
                var res = {
                    json: function (group) {
                        expect(group.members.length).to.eql(1);
                        expect(group.members[0]).to.eql(_user1._id);

                        toolsCtrl.purgeUser(
                            {
                                user: {
                                    _id: _user1._id
                                },
                                params: {
                                    userId: _user1._id
                                }
                            },
                            {
                                status: function (code) {
                                    expect(code).to.eql(200);
                                    return this;
                                },
                                end: function () {
                                    groupCtrl.listGroups({
                                        user: {
                                            _id: _user1._id
                                        }
                                    }, {
                                        json: function (data) {
                                            expect(data.length).to.eql(0);
                                            done();
                                        }
                                    });
                                }
                            },
                            function (err) {
                                done(err);
                            });
                    }
                };
                groupCtrl.createGroup(req, res);
            });
        });
    });
});
