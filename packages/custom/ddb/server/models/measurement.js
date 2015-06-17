'use strict';


var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

//mongoose.set('debug', true);
var MeasurementSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    drinks: [
        {
            drink: {
                type: Schema.ObjectId,
                ref: 'Drink',
                required: true
            },
            amount: {
                type: Number,
                default: 0
            },
            drinkDate: {
                type: Date
            }
        }
    ],
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
    },
    lastModifiedDate: {
        type: Date
    }
});

MeasurementSchema.methods = {

    //getTotalAlcohol: function () {
    //    return pilsner
    //}

};


MeasurementSchema.index({date: 1, user: 1, isDeleted: 1}, {unique: true});

mongoose.model('Measurement', MeasurementSchema);
