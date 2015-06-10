'use strict';

module.exports = function (DailyAnalysis, app, auth) {

    var dailyAnalysis = require('../controllers/dailyanalysis')(DailyAnalysis);

    app.route('/api/dailyanalysis')
        .get(auth.requiresLogin, dailyAnalysis.mine);
    app.route('/api/dailyanalysis')
        .post(auth.requiresLogin, dailyAnalysis.mine);

};
