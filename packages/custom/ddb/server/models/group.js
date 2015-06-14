'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var GroupSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    members: [
        {
            type: Schema.ObjectId,
            ref: 'User'
        }
    ],
    invitations: [
        {
            type: Schema.ObjectId,
            ref: 'User'
        }
    ],
    creationDate: {
        type: Date,
        required: true
    }
});


mongoose.model('Group', GroupSchema);
