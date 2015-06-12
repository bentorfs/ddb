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
        type: Number
    },
    todSumAlc: {
        type: Number
    },
    todMinAlc: {
        type: Number
    },
    todMaxAlc: {
        type: Number
    }
});


mongoose.model('DailyGroupAnalysis', DailyGroupAnalysisSchema);
