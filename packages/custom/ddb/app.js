'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Ddb = new Module('ddb');

Ddb.register(function (app, auth, database) {

    //We enable routing. By default the Package Object is passed to the routes
    Ddb.routes(app, auth, database);

    Ddb.menus.add({
        title: 'Profile',
        link: 'profile',
        roles: ['authenticated'],
        menu: 'main'
    });

    Ddb.menus.add({
        title: 'Tools',
        link: 'tools',
        roles: ['authenticated'],
        menu: 'main'
    });

    Ddb.aggregateAsset('css', 'ddb.css', {weight: -10});

    Ddb.aggregateAsset('js', '../lib/lodash/lodash.min.js', {global: true, weight: -100});
    Ddb.aggregateAsset('js', '../lib/moment/min/moment.min.js', {global: true, weight: -10});
    Ddb.aggregateAsset('js', '../lib/Chart.js/Chart.js', {global:true, weight: -20});
    Ddb.aggregateAsset('js', '../lib/angular-chart.js/dist/angular-chart.js', {weight: 101});
    Ddb.aggregateAsset('css', '../lib/angular-chart.js/dist/angular-chart.css');

    Ddb.angularDependencies(['mean.system', 'chart.js']);
    /**
     //Uncomment to use. Requires meanio@0.3.7 or above
     // Save settings with callback
     // Use this for saving data from administration pages
     Ddb.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

     // Another save settings example this time with no callback
     // This writes over the last settings.
     Ddb.settings({
        'anotherSettings': 'some value'
    });

     // Get settings. Retrieves latest saved settigns
     Ddb.settings(function(err, settings) {
        //you now have the settings object
    });
     */

    return Ddb;
});
