'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Article Schema
 */
var MeasurementSchema = new Schema({
    date: {
        type: Date
    },
    pilsner: {
        type: Number
    },
    pilsnerAlc: {
        type: Number
    },
    strongbeer: {
        type: Number
    },
    strongbeerAlc: {
        type: Number
    },
    wine: {
        type: Number
    },
    wineAlc: {
        type: Number
    },
    liquor: {
        type: Number
    },
    liquorAlc: {
        type: Number
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});

///**
// * Statics
// */
//MeasurementSchema.statics.load = function(id, cb) {
//  this.findOne({
//    _id: id
//  }).populate('user', 'name username').exec(cb);
//};



mongoose.model('Measurement', MeasurementSchema);
