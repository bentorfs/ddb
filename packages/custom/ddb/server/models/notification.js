'use strict';


var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var NotificationSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true
    },
    creationDate: {
        type: Date,
        required: true
    },
    targetState: {
        type: String,
        required: true
    },
    targetStateParameters: {},
    data: {},
    read: {
        type: Boolean,
        default: false
    }
});

mongoose.model('Notification', NotificationSchema);
