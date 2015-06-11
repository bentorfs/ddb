'use strict';


var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var MeasurementSchema = new Schema({
    date: {
        type: Date
    },
    pilsner: {
        type: Number
    },
    strongbeer: {
        type: Number
    },
    wine: {
        type: Number
    },
    liquor: {
        type: Number
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});


mongoose.model('Measurement', MeasurementSchema);
