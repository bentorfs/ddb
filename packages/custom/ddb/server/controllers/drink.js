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
            search = {
                '$or': [
                    {
                        name: {
                            $regex: req.query.name,
                            $options: 'i'
                        }
                    },
                    {
                        type: {
                            $regex: req.query.name,
                            $options: 'i'
                        }
                    }]
            };
        }
        var query = Drink.find(search).sort('name');
        if (req.query.skip) {
            query.skip(req.query.skip)
        }
        if (req.query.limit) {
            query.limit(req.query.limit)
        }
        query.exec(function (err, drinks) {
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
                if (result.drink) {
                    var enrichedResult = result.drink.toJSON();
                    enrichedResult.topDrinkers = result.topDrinkers;
                    res.json(enrichedResult);
                } else {
                    res.status(404).end();
                }
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
    },
    delete: function (req, res, next) {
        var drinkIdToDelete = req.params.drinkId;
        var drinkIdToReplace = req.query.replacementId;
        if (!drinkIdToReplace) {
            Measurement.update(
                {'consumptions.drink': drinkIdToDelete},
                {'$pull': {'consumptions': {drink: drinkIdToDelete}}},
                {multi: true},
                function (err) {
                    if (err) {
                        return next(err);
                    }
                    Drink.findByIdAndRemove(drinkIdToDelete).remove(function (err) {
                        if (err) {
                            return next(err);
                        }
                        res.status(200).end();
                    });
                }
            );
        } else {
            Measurement.find({'consumptions.drink': drinkIdToDelete}).exec(function (err, docs) {
                if (err) {
                    return next(err);
                }
                var counter = _.after(docs.length, function () {
                    Drink.findByIdAndRemove(drinkIdToDelete).remove(function (err) {
                        if (err) {
                            return next(err);
                        }
                        res.status(200).end();
                    });
                });
                _.forEach(docs, function (doc) {
                    var subCounter = _.after(doc.consumptions.length, function () {
                        counter();
                    });
                    _.forEach(doc.consumptions, function (consumption) {
                        if (JSON.stringify(consumption.drink) === JSON.stringify(drinkIdToDelete)) {
                            consumption.drink = ObjectId(drinkIdToReplace);
                            doc.save(function (err) {
                                subCounter();
                            });
                        } else {
                            subCounter();
                        }
                    });
                });
            });
        }
    }
};