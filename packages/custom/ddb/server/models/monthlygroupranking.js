'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var MonthlyGroupRankingSchema = new Schema({
    group: {
        type: Schema.ObjectId,
        ref: 'Group',
        required: true
    },
    calculationDate: {
        type: Date,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    supercup: [
        {user: {type: Schema.ObjectId, ref: 'User'}, value: {type: Number}}
    ],
    trophies: [
        {
            name: String,
            ranking: [
                {user: {type: Schema.ObjectId, ref: 'User'}, value: {type: Number}}
            ],
            description: String
        }
    ]
});

MonthlyGroupRankingSchema.index({group: 1, date: 1}, {unique: true});

mongoose.model('MonthlyGroupRanking', MonthlyGroupRankingSchema);
