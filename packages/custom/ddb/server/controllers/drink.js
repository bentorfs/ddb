'use strict';

var mongoose = require('mongoose'),
    Drink = mongoose.model('Drink'),
    User = mongoose.model('User'),
    Measurement = mongoose.model('Measurement'),
    permissions = require('./../service/permissions'),
    ObjectId = mongoose.Types.ObjectId,
    _ = require('lodash'),
    moment = require('moment'),
    async = require('async');

module.exports = {
    list: function (req, res) {
        var search = {};
        if (req.query && req.query.name) {
            search.name = {$regex: req.query.name, $options: 'i'};
        }
        Drink.find(search).limit(20).exec(function (err, drinks) {
            if (err) {
                console.error(err);
                return res.status(500).end();
            }
            res.json(drinks);
        });
    },
    get: function (req, res) {
        async.parallel(
            {
                drink: function (callback) {
                    Drink.findById(req.params.drinkId).exec(function (err, drink) {
                        if (err) {
                            console.error(err);
                            return res.status(500).end();
                        }
                        callback(err, drink);
                    });
                },
                topDrinkers: function (callback) {
                    Measurement.aggregate([
                        {$project: {user: 1, consumptions: 1}},
                        {$unwind: "$consumptions"},
                        {$match: {'consumptions.drink': new ObjectId(req.params.drinkId)}},
                        {
                            '$group': {
                                _id: '$user',
                                totalAmount: {$sum: '$consumptions.amount'}
                            }
                        },
                        {$project: {_id: 0, user: "$_id", totalAmount: 1}},
                        {$sort: {totalAmount: -1}},
                        {$limit: 5}
                    ]).exec(function (err, topDrinkers) {
                        User.populate(topDrinkers, {path: "user", select: 'name _id'}, function (err, docs) {
                            if (err) {
                                console.error(err);
                                return res.status(500).end();
                            }
                            callback(err, docs);
                        });
                    });
                }
            },
            function (error, result) {
                if (error) {
                    console.error(err);
                    return res.status(500).end();
                }
                var enrichedResult = result.drink.toJSON();
                enrichedResult.topDrinkers = result.topDrinkers;
                res.json(enrichedResult);
            }
        );
    },
    update: function (req, res) {
        permissions.ifDrinkPermission(req.user, req.params.drinkId, function () {
            var upsertData = req.body;
            delete upsertData._id;
            delete upsertData.__v;
            delete upsertData.creationDate;
            upsertData.lastModifiedDate = moment.utc().valueOf();

            Drink.findOneAndUpdate({'_id': req.params.drinkId}, upsertData, {
                new: true
            }, function (err, updatedDrink) {
                if (err) {
                    console.error(err);
                    return res.status(500).end();
                }
                if (updatedDrink) {
                    console.info('Updated drink ' + updatedDrink._id);
                    res.json(updatedDrink);
                } else {
                    res.status(404).end();
                }

            });
        }, function () {
            res.status(401).end();
        });
    },
    add: function (req, res) {
        var newDrink = new Drink(req.body);
        newDrink.createdBy = req.user;
        newDrink.creationDate = moment.utc().valueOf();
        newDrink.lastModifiedDate = moment.utc().valueOf();
        newDrink.save(function (err, drink) {
            if (err) {
                console.error(err);
                return res.status(500).end();

            }
            console.info('Added drink ' + drink._id);
            res.json(drink);
        })
    }
};