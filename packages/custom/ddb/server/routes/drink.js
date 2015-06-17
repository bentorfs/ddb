'use strict';

module.exports = function (Drink, app, auth) {

    var drink = require('../controllers/drink');

    app.route('/api/drink/:drinkId')
        .get(auth.requiresLogin, drink.get)
        .put(auth.requiresLogin, drink.update);

    app.route('/api/drink')
        .get(auth.requiresLogin, drink.list)
        .post(auth.requiresLogin, drink.add);
};
