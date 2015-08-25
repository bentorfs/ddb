'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var MonthlyGroupRankingSchema = new Schema({
    group: {
        type: Schema.ObjectId,
        ref: 'Group',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    rankingPilsner: [
        {user: {type: Schema.ObjectId, ref: 'User'}, value: {type: Number}}
    ],
    rankingStrongbeer: [
        {user: {type: Schema.ObjectId, ref: 'User'}, value: {type: Number}}
    ],
    rankingWine: [
        {user: {type: Schema.ObjectId, ref: 'User'}, value: {type: Number}}
    ],
    rankingLiquor: [
        {user: {type: Schema.ObjectId, ref: 'User'}, value: {type: Number}}
    ],
    rankingWeekend: [
        {user: {type: Schema.ObjectId, ref: 'User'}, value: {type: Number}}
    ],
    rankingWorkweek: [
        {user: {type: Schema.ObjectId, ref: 'User'}, value: {type: Number}}
    ],
    rankingHighestBinge: [
        {user: {type: Schema.ObjectId, ref: 'User'}, value: {type: Number}}
    ],
    rankingAlcohol: [
        {user: {type: Schema.ObjectId, ref: 'User'}, value: {type: Number}}
    ],
    rankingDrinkingDays: [
        {user: {type: Schema.ObjectId, ref: 'User'}, value: {type: Number}}
    ],
    rankingSuperCup: [
        {user: {type: Schema.ObjectId, ref: 'User'}, value: {type: Number}}
    ]
});

MonthlyGroupRankingSchema.index({group: 1, date: 1}, {unique: true});

mongoose.model('MonthlyGroupRanking', MonthlyGroupRankingSchema);
