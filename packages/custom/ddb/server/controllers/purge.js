'use strict';

var mongoose = require('mongoose'),
    Measurement = mongoose.model('Measurement'),
    rebuild = require('./../service/rebuild'),
    _ = require('lodash'),
    async = require('async'),
    moment = require('moment');


module.exports = {
    purgeUser: function (req, res) {
        Measurement.where({user: req.user._id}).setOptions({multi: true}).update({$set: {isDeleted: true}}, function (err) {
            if (err) {
                console.error(err);
            }
            rebuild.rebuildUser(req.user);
            res.status(200).end();
        });
    }
};