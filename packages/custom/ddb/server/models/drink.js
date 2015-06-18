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
    tags: [{ // style, type, .. spirit type
        type: String
    }],
    type: { // beer/liquor/wine
        type: String
    },
    creationDate: {
        type: Date,
        required: true
    },
    lastModifiedDate: {
        type: Date,
        required: true
    },
    producer: { // Brewery / brand / bottler
        type: String
    },
    firstBrewed: {
        type: Date
    },
    location: { // Or region
        type: String
    },
    article: {
        type: String
    },
    website: {
        type: String
    },
    age: {
        type: Number
    },
    components: [{
        type: String
    }]
});

mongoose.model('Drink', DrinkSchema);
