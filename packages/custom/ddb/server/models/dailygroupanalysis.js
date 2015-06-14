'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var DailyGroupAnalysisSchema = new Schema({

    _id: {
        date: Date,
        group: {
            type: Schema.ObjectId,
            ref: 'Group'
        }
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


mongoose.model('DailyGroupAnalysis', DailyGroupAnalysisSchema);
