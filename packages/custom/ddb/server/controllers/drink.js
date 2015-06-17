'use strict';

var mongoose = require('mongoose'),
    Drink = mongoose.model('Drink'),
    _ = require('lodash'),
    moment = require('moment');

module.exports = {
    list: function (req, res) {
        var search = {};
        if (req.query && req.query.name) {
            search.name = {$regex: req.query.name, $options: 'i'};
        }
        Drink.find(search).limit(20).exec(function (err, drinks) {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Cannot list the drinks'
                });
            }
            res.json(drinks);
        });
    },
    get: function (req, res) {
        Drink.findById(req.params.drinkId).exec(function (err, drink) {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Cannot retrieve the drink'
                });
            }
            res.json(drink);
        });
    },
    update: function (req, res) {
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
                return res.status(500).json({
                    error: 'Cannot update the drink'
                });
            }
            if (updatedDrink) {
                console.info('Updated drink ' + updatedDrink._id);
                res.json(updatedDrink);
            } else {
                res.status(404);
            }

        });
    },
    add: function (req, res) {
        var newDrink = new Drink(req.body);
        newDrink.creationDate = moment.utc().valueOf();
        newDrink.lastModifiedDate = moment.utc().valueOf();
        newDrink.save(function (err, drink) {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Cannot add the drink'
                });

            }
            console.info('Added drink ' + drink._id);
            res.json(drink);
        })
    }
};