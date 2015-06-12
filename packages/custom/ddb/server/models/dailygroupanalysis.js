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
    avg: {
        type: Number
    },
    sum: {
        type: Number
    },
    min: {
        type: Number
    },
    max: {
        type: Number
    }
});


mongoose.model('DailyGroupAnalysis', DailyGroupAnalysisSchema);
