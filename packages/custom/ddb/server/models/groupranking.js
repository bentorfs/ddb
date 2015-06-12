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
        {user: {type: Schema.ObjectId, ref: 'User'}, value: {type: Number}}
    ],
    rankingConsistencyFactor: [
        {user: {type: Schema.ObjectId, ref: 'User'}, value: {type: Number}}
    ],
    rankingDrinkingDayRate: [
        {user: {type: Schema.ObjectId, ref: 'User'}, value: {type: Number}}
    ],
    rankingLiquor: [
        {user: {type: Schema.ObjectId, ref: 'User'}, value: {type: Number}}
    ],
    rankingWine: [
        {user: {type: Schema.ObjectId, ref: 'User'}, value: {type: Number}}
    ],
    rankingStrongbeer: [
        {user: {type: Schema.ObjectId, ref: 'User'}, value: {type: Number}}
    ],
    rankingPilsner: [
        {user: {type: Schema.ObjectId, ref: 'User'}, value: {type: Number}}
    ],
    rankingWeekend: [
        {user: {type: Schema.ObjectId, ref: 'User'}, value: {type: Number}}
    ],
    rankingWorkWeek: [
        {user: {type: Schema.ObjectId, ref: 'User'}, value: {type: Number}}
    ],
    rankingSun: [
        {user: {type: Schema.ObjectId, ref: 'User'}, value: {type: Number}}
    ],
    rankingSat: [
        {user: {type: Schema.ObjectId, ref: 'User'}, value: {type: Number}}
    ],
    rankingFri: [
        {user: {type: Schema.ObjectId, ref: 'User'}, value: {type: Number}}
    ],
    rankingThu: [
        {user: {type: Schema.ObjectId, ref: 'User'}, value: {type: Number}}
    ],
    rankingWed: [
        {user: {type: Schema.ObjectId, ref: 'User'}, value: {type: Number}}
    ],
    rankingTue: [
        {user: {type: Schema.ObjectId, ref: 'User'}, value: {type: Number}}
    ],
    rankingMon: [
        {user: {type: Schema.ObjectId, ref: 'User'}, value: {type: Number}}
    ],
    rankingSadLoner: [
        {user: {type: Schema.ObjectId, ref: 'User'}, value: {type: Number}}
    ],
    rankingHappyLoner: [
        {user: {type: Schema.ObjectId, ref: 'User'}, value: {type: Number}}
    ]

});


mongoose.model('GroupRanking', GroupRankingSchema);
