'use strict';


var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var MeasurementSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    pilsner: {
        type: Number,
        default: 0
    },
    strongbeer: {
        type: Number,
        default: 0
    },
    wine: {
        type: Number,
        default: 0
    },
    liquor: {
        type: Number,
        default: 0
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});


mongoose.model('Measurement', MeasurementSchema);
