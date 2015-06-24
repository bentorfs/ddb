'use strict';

var mongoose = require('mongoose'),
    Profile = mongoose.model('Profile'),
    Measurement = mongoose.model('Measurement'),
    Drink = mongoose.model('Drink'),
    permissions = require('./../service/permissions'),
    ObjectId = mongoose.Types.ObjectId,
    _ = require('lodash'),
    moment = require('moment');

module.exports = {
    getUser: function (req, res, next) {
        permissions.ifProfilePermission(req.user, req.params.userId, function () {
            Profile.findOne({user: req.params.userId}).exec(function (err, profile) {
                if (err) {
                    return next(err);
                }
                if (profile) {
                    res.json(profile);
                } else {
                    res.status(404).end()
                }
            });
        }, function () {
            res.status(401).end();
        });
    },
    getFrequentDrinks: function (req, res, next) {
        permissions.ifProfilePermission(req.user, req.params.userId, function () {
            Measurement.aggregate([
                {$match: {'user': new ObjectId(req.params.userId)}},
                {$project: {consumptions: 1}},
                {$unwind: "$consumptions"},
                {
                    '$group': {
                        _id: '$consumptions.drink',
                        nbDays: {$sum: 1}
                    }
                },
                {$project: {_id: 0, drink: "$_id", nbDays: 1}},
                {$sort: {nbDays: -1}},
                {$limit: 10}
            ]).exec(function (err, frequentDrinks) {
                Drink.populate(frequentDrinks, {path: "drink"}, function (err, docs) {
                    if (err) {
                        return next(err);
                    }
                    res.json(docs);
                });
            });
        }, function () {
            res.status(401).end();
        });
    }
};