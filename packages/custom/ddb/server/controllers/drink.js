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
    list: function (req, res, next) {
        var search = {};
        if (req.query && req.query.name) {
            search.name = {$regex: req.query.name, $options: 'i'};
        }
        Drink.find(search).limit(20).exec(function (err, drinks) {
            if (err) {
                return next(err);
            }
            res.json(drinks);
        });
    },
    get: function (req, res, next) {
        async.parallel(
            {
                drink: function (callback) {
                    Drink.findById(req.params.drinkId).exec(function (err, drink) {
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
                            callback(err, docs);
                        });
                    });
                }
            },
            function (err, result) {
                if (err) {
                    return next(err);
                }
                var enrichedResult = result.drink.toJSON();
                enrichedResult.topDrinkers = result.topDrinkers;
                res.json(enrichedResult);
            }
        );
    },
    update: function (req, res, next) {
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
                    return next(err);
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
    add: function (req, res, next) {
        var newDrink = new Drink(req.body);
        newDrink.createdBy = req.user;
        newDrink.creationDate = moment.utc().valueOf();
        newDrink.lastModifiedDate = moment.utc().valueOf();
        newDrink.save(function (err, drink) {
            if (err) {
                return next(err);
            }
            console.info('Added drink ' + drink._id);
            res.json(drink);
        })
    }
};