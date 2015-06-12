'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var GroupRankingSchema = new Schema({
    group: {
        type: Schema.ObjectId,
        ref: 'Group'
    },
    calculationDate: {
        type: Date
    },
    rankingHighestBinge: [
        {
            user: {
                type: Schema.ObjectId,
                ref: 'User'
            },
            value: {
                type: Number
            }
        }
    ]

});


mongoose.model('GroupRanking', GroupRankingSchema);
