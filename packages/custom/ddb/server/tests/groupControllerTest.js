'use strict';

var expect = require('expect.js'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Group = mongoose.model('Group'),
    groupCtrl = require('../controllers/group'),
    _ = require('lodash'),
    moment = require('moment');

var _user1, _user2;

describe('<Unit Test>', function () {
    describe('Groups Controller:', function () {

        before(function (done) {
            var trigger = _.after(2, done);
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
                });

                trigger();
            });
        });

        describe('CRUD Operations', function () {
            var groupId;
            it('Contains initially no groups', function (done) {
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
                groupCtrl.listGroups(req, res);
            });

            it('Can create groups, and at the same time invite users', function (done) {
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
                        expect(group.members.length).to.eql(1);
                        expect(group.members[0]).to.eql(_user1._id);
                        expect(group.invitations.length).to.eql(1);
                        expect(group.invitations[0]).to.eql(_user2._id);
                        expect(group.name).to.eql('testGroup');
                        done();
                    }
                };
                groupCtrl.createGroup(req, res);
            });

            it('Cannot create groups with empty name', function (done) {
                var req = {
                    user: {
                        _id: _user1._id
                    },
                    body: {}
                };
                var res = {
                    status: function (code) {
                        expect(code).to.eql(400);
                        return this;
                    },
                    json: function (data) {
                        expect(data).to.eql({
                            error: 'Invalid group data'
                        });
                        done();
                    }
                };
                groupCtrl.createGroup(req, res);
            });

            it('Cannot create groups without a name', function (done) {
                var req = {
                    user: {
                        _id: _user1._id
                    },
                    body: {
                        name: ''
                    }
                };
                var res = {
                    status: function (code) {
                        expect(code).to.eql(400);
                        return this;
                    },
                    json: function (data) {
                        expect(data).to.eql({
                            error: 'Invalid group data'
                        });
                        done();
                    }
                };
                groupCtrl.createGroup(req, res);
            });

            it('Can revoke invitations', function (done) {
                var req = {
                    user: {
                        _id: _user1._id
                    },
                    params: {
                        groupId: groupId,
                        userId: _user2._id
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
                groupCtrl.removeInvitation(req, res);
            });

            it('Can later add invitations', function (done) {
                var req = {
                    user: {
                        _id: _user1._id
                    },
                    params: {
                        groupId: groupId,
                        userId: _user2._id
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
                groupCtrl.addInvitation(req, res);
            });

            it('Can retrieve the data for one group', function (done) {
                var req = {
                    user: {
                        _id: _user1._id
                    },
                    params: {
                        groupId: groupId
                    }
                };
                var res = {
                    json: function (group) {
                        expect(group.members.length).to.eql(1);
                        expect(group.members[0]._id).to.eql(_user1._id);
                        expect(group.invitations.length).to.eql(1);
                        expect(group.invitations[0]._id).to.eql(_user2._id);
                        expect(group.name).to.eql('testGroup');
                        done();
                    }
                };
                groupCtrl.getGroup(req, res);
            });

            it('Cannot retrieve the data for a group you are not a member of', function (done) {
                var req = {
                    user: {
                        _id: _user2._id
                    },
                    params: {
                        groupId: groupId
                    }
                };
                var res = {
                    status: function (code) {
                        expect(code).to.eql(401);
                        return this;
                    },
                    json: function (data) {
                        expect(data).to.eql({error: 'You are not allowed to see this data'});
                        done();
                    }
                };
                groupCtrl.getGroup(req, res);
            });

            it('Return all the groups that a member is invited to', function (done) {
                var req = {
                    user: {
                        _id: _user2._id
                    }
                };
                var res = {
                    json: function (groups) {
                        expect(groups.length).to.eql(1);
                        done();
                    }
                };
                groupCtrl.listInvitations(req, res);
            });

            it('Can approve invitations', function (done) {
                var req = {
                    user: {
                        _id: _user2._id
                    },
                    params: {
                        groupId: groupId
                    }
                };
                var res = {
                    status: function (code) {
                        expect(code).to.eql(200);
                        return this;
                    },
                    end: function () {
                        var req = {
                            user: {
                                _id: _user1._id
                            },
                            params: {
                                groupId: groupId
                            }
                        };
                        var res = {
                            json: function (group) {
                                expect(group.members.length).to.eql(2);
                                done();
                            }
                        };
                        groupCtrl.getGroup(req, res);
                    }
                };
                groupCtrl.approveInvitation(req, res);
            });

            it('Can leave groups', function (done) {
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
                        return this;
                    },
                    end: function () {
                        var req = {
                            user: {
                                _id: _user2._id
                            },
                            params: {
                                groupId: groupId
                            }
                        };
                        var res = {
                            status: function (code) {
                                expect(code).to.not.eql(500);
                                return this;
                            },
                            json: function (group) {
                                expect(group.members.length).to.eql(1);
                                done();
                            }
                        };
                        groupCtrl.getGroup(req, res);
                    }
                };
                groupCtrl.leaveGroup(req, res);
            });
        });

    });
});
