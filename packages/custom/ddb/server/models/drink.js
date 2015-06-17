'use strict';


var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DrinkSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    alcoholContent: {
        type: Number,
        default: 0
    },
   /* categories: [{
        type: String
    }],
    tags: [{
        type: String
    }],*/
    brewery: {
        type: String
    },
    creationDate: {
        type: Date,
        required: true
    },
    lastModifiedDate: {
        type: Date,
        required: true
    }
});

mongoose.model('Drink', DrinkSchema);
