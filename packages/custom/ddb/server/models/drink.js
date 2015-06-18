'use strict';


var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DrinkSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    alc: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String
    }],
    type: {
        type: String,
        required: true
    },
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
