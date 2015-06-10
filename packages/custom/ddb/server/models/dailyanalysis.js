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
    todAlcPilsner: {
        type: Number
    },
    todAlcStrongbeer: {
        type: Number
    },
    todAlcWine: {
        type: Number
    },
    todAlcLiquor: {
        type: Number
    },
    todAlc: {
        type: Number
    },

    // Cumulative up till this day
    cumPilsner: {
        type: Number
    },
    cumStrongbeer: {
        type: Number
    },
    cumWine: {
        type: Number
    },
    cumLiquor: {
        type: Number
    },
    cumAlcPilsner: {
        type: Number
    },
    cumAlcStrongbeer: {
        type: Number
    },
    cumAlcWine: {
        type: Number
    },
    cumAlcLiquor: {
        type: Number
    },
    cumAlc: {
        type: Number
    },
    // 7-Day Average
    spreadAverage: {
        type: Number
    }
});


mongoose.model('DailyAnalysis', DailyAnalysisSchema);
