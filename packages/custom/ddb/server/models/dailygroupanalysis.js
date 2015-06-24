'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var DailyGroupAnalysisSchema = new Schema({

    date: {
        type: Date,
        required: true
    },
    group: {
        type: Schema.ObjectId,
        ref: 'Group',
        required: true
    },
    todAvgAlc: {
        type: Number,
        required: true
    },
    todSumAlc: {
        type: Number,
        required: true
    },
    todMinAlc: {
        type: Number,
        required: true
    },
    todMaxAlc: {
        type: Number,
        required: true
    }
});

DailyGroupAnalysisSchema.index({date: 1, group: 1}, {unique: true});

mongoose.model('DailyGroupAnalysis', DailyGroupAnalysisSchema);
