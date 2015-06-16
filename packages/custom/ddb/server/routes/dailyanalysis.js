'use strict';

module.exports = function (DailyAnalysis, app, auth) {

    var dailyAnalysis = require('../controllers/dailyanalysis');

    app.route('/api/dailyanalysis/:userId')
        .get(auth.requiresLogin, dailyAnalysis.all);


};
