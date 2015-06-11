'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var GroupSchema = new Schema({
    name: {
        type: String
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
        type: Date
    }
});


mongoose.model('Group', GroupSchema);
