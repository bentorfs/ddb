'use strict';

var mongoose = require('mongoose'),
    Notification = mongoose.model('Notification'),
    _ = require('lodash'),
    moment = require('moment'),
    async = require('async');

module.exports = {
    all: function (req, res, next) {
        Notification.find({'user': req.user, 'read': false}).sort('date').limit(10).exec(function (err, docs) {
            if (err) {
                return next(err);
            }
            res.json(docs);
        });
    },
    markAsRead: function (req, res, next) {
        Notification.findOneAndUpdate({
            '_id': req.params.notificationId,
            'user': req.user._id
        }, {read: true}, function (err, doc) {
            if (err) {
                return next(err);
            }
            if (!doc) {
                return res.status(404).end();
            }
            res.status(200).end();
        });
    }
};