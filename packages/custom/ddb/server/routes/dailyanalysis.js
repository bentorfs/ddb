'use strict';

module.exports = function (DailyAnalysis, app, auth) {

    var dailyAnalysis = require('../controllers/dailyanalysis')(DailyAnalysis);

    app.route('/api/dailyanalysis/:userId')
        .get(auth.requiresLogin, dailyAnalysis.get);


};
