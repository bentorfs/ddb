'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DailyAnalysisSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    date: {
        type: Date,
        required: true
    },
    dayOfWeek: {
        type: Number,
        required: true
    },
    // Daily alcohol content
    todAlcPilsner: {
        type: Number,
        required: true
    },
    todAlcStrongbeer: {
        type: Number,
        required: true
    },
    todAlcWine: {
        type: Number,
        required: true
    },
    todAlcLiquor: {
        type: Number,
        required: true
    },
    todAlc: {
        type: Number,
        required: true
    },

    // Cumulative up till this day
    cumPilsner: {
        type: Number,
        required: true
    },
    cumStrongbeer: {
        type: Number,
        required: true
    },
    cumWine: {
        type: Number,
        required: true
    },
    cumLiquor: {
        type: Number,
        required: true
    },
    cumAlcPilsner: {
        type: Number,
        required: true
    },
    cumAlcStrongbeer: {
        type: Number,
        required: true
    },
    cumAlcWine: {
        type: Number,
        required: true
    },
    cumAlcLiquor: {
        type: Number,
        required: true
    },
    cumAlc: {
        type: Number,
        required: true
    },
    // 7-Day Average
    spreadAverage: {
        type: Number,
        required: true
    },
    groups: [
        {
            group: {
                type: Schema.ObjectId,
                ref: 'Group',
                required: true
            },
            lonerFactor: {
                type: Number,
                required: true
            }
        }
    ]
});


mongoose.model('DailyAnalysis', DailyAnalysisSchema);
