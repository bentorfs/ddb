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
        type: Number
    },
    todStrongbeer: {
        type: Number
    },
    todWine: {
        type: Number
    },
    todLiquor: {
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
    groups: [
        {
            group: {
                type: Schema.ObjectId,
                ref: 'Group',
                required: true
            },
            lonerFactor: {
                type: Number
            }
        }
    ],
    ignore: {
        type: Boolean,
        default: false
    }
});

DailyAnalysisSchema.index({date: 1, user: 1}, {unique: true});

mongoose.model('DailyAnalysis', DailyAnalysisSchema);
