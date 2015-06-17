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
    getUser: function (req, res) {
        permissions.ifProfilePermission(req.user, req.params.userId, function () {
            Profile.findOne({user: req.params.userId}).exec(function (err, profile) {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        error: 'Cannot retrieve profile for user'
                    });
                }
                if (profile) {
                    res.json([profile]);
                } else {
                    res.status(404).json({error: 'Profile does not exist'})
                }
            });
        }, function () {
            res.status(401);
        });
    },
    getFrequentDrinks: function (req, res) {
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
                        console.error(err);
                        return res.status(500).json({
                            error: 'Cannot populate drinks'
                        });
                    }
                    res.json(docs);
                });
            });
        }, function () {
            res.status(401);
        });
    }
};