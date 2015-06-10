'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var DailyAnalysisSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    date: {
        type: Date
    },
    dayOfWeek: {
        type: Number
    },
    // Daily alcohol content
    pilsnerAlc: {
        type: Number
    },
    strongbeerAlc: {
        type: Number
    },
    wineAlc: {
        type: Number
    },
    liquorAlc: {
        type: Number
    },
    totalAlc: {
        type: Number
    },
    // Cumulative up till this day
    pilsnerCum: {
        type: Number
    },
    strongbeerCum: {
        type: Number
    },
    wineCum: {
        type: Number
    },
    liquorCum: {
        type: Number
    },
    totalCum: {
        type: Number
    },
    // 7-Day Average
    spreadAverage: {
        type: Number
    }
});


mongoose.model('DailyAnalysis', DailyAnalysisSchema);
