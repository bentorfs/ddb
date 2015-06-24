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
    // Daily drinks
    todPilsner: {
        type: Number,
        required: true
    },
    todStrongbeer: {
        type: Number,
        required: true
    },
    todWine: {
        type: Number,
        required: true
    },
    todLiquor: {
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

DailyAnalysisSchema.index({date: 1, user: 1}, {unique: true});

mongoose.model('DailyAnalysis', DailyAnalysisSchema);
