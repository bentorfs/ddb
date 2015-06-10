'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Measurement = mongoose.model('Measurement'),
    User = mongoose.model('User'),
    ObjectId = mongoose.Types.ObjectId,
    _ = require('lodash'),
    moment = require('moment');

module.exports = function (Profile) {

    return {
        mine: function (req, res) {

            Measurement.aggregate(
                [
                    {
                        $match: {
                            user: new ObjectId(req.user._id)
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totPilsner: {$sum: "$pilsner"},
                            totStrongbeer: {$sum: "$strongbeer"},
                            totWine: {$sum: "$wine"},
                            totLiquor: {$sum: "$liquor"},
                            totPilsnerAlc: {$sum: "$pilsnerAlc"},
                            totStrongbeerAlc: {$sum: "$strongbeerAlc"},
                            totWineAlc: {$sum: "$wineAlc"},
                            totLiquorAlc: {$sum: "$liquorAlc"}
                        }
                    }
                ],
                function (err, result) {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({
                            error: 'Cannot generate the profile'
                        });
                    }
                    res.json(result);
                }
            );


            //Measurement.aggregate(
            //    [
            //        {
            //            $group: {
            //                _id: "$user",
            //                totPilsner: {$sum: "$pilsner"},
            //                totStrongbeer: {$sum: "$strongbeer"},
            //                totWine: {$sum: "$wine"},
            //                totLiquor: {$sum: "$liquor"},
            //                avgPilsner: {$avg: "$pilsner"},
            //                avgStrongbeer: {$avg: "$strongbeer"},
            //                avgWine: {$avg: "$wine"},
            //                avgLiquor: {$avg: "$liquor"}
            //            }
            //        }
            //    ],
            //    function (err, result) {
            //        if (err) {
            //            console.log(err);
            //            return res.status(500).json({
            //                error: 'Cannot generate the profile'
            //            });
            //        }
            //        User.populate(result, {path: "_id"}, function (err, result) {
            //            if (err) {
            //                console.log(err);
            //                return res.status(500).json({
            //                    error: 'Cannot generate the profile'
            //                });
            //            }
            //            res.json(result);
            //        });
            //
            //        // Result is an array of documents
            //    }
            //);

        }
    };
};