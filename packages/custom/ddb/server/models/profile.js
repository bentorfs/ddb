'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var ProfileSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    },
    // Weekdays
    totAlcMon: {
        type: Number
    },
    totAlcTue: {
        type: Number
    },
    totAlcWed: {
        type: Number
    },
    totAlcThu: {
        type: Number
    },
    totAlcFri: {
        type: Number
    },
    totAlcSat: {
        type: Number
    },
    totAlcSun: {
        type: Number
    },
    avgAlcMon: {
        type: Number
    },
    avgAlcTue: {
        type: Number
    },
    avgAlcWed: {
        type: Number
    },
    avgAlcThu: {
        type: Number
    },
    avgAlcFri: {
        type: Number
    },
    avgAlcSat: {
        type: Number
    },
    avgAlcSun: {
        type: Number
    },
    avgAlcWorkWeek: {
        type: Number
    },
    avgAlcWeekend: {
        type: Number
    },
    // Types of drinks
    totPilsner: {
        type: Number
    },
    totStrongbeer: {
        type: Number
    },
    totWine: {
        type: Number
    },
    totLiquor: {
        type: Number
    },
    totAlcPilsner: {
        type: Number
    },
    totAlcStrongbeer: {
        type: Number
    },
    totAlcWine: {
        type: Number
    },
    totAlcLiquor: {
        type: Number
    },
    totAlc: {
        type: Number
    },
    avgPilsner: {
        type: Number
    },
    avgStrongbeer: {
        type: Number
    },
    avgWine: {
        type: Number
    },
    avgLiquor: {
        type: Number
    },
    avgAlcPilsner: {
        type: Number
    },
    avgAlcStrongbeer: {
        type: Number
    },
    avgAlcWine: {
        type: Number
    },
    avgAlcLiquor: {
        type: Number
    },
    avgAlc: {
        type: Number
    },
    // Various
    drinkingDays: {
        type: Number
    },
    drinkingDayRate: {
        type: Number
    },
    activeDays: {
        type: Number
    },
    consistencyFactor: {
        type: Number
    },
    // Binge
    highestBinge: {
        type: Number
    },
    highestBingeDate: {
        type: Date
    },
    // Loner
    sadLonerFactor: {
        type: Number
    },
    happyLonerFactor: {
        type: Number
    },
    // Group-related data
    groups: [
        {
            group: {
                type: Schema.ObjectId,
                ref: 'Group'
            },
            sadLonerFactor: Number,
            happyLonerFactor: Number
        }
    ],
    // Chart data
    series: [
        {
            date: Date,
            cumAlc: Number,
            spreadAlc: Number
        }
    ]
});


mongoose.model('Profile', ProfileSchema);
