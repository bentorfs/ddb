'use strict';

module.exports = function (Drink, app, auth) {

    var drink = require('../controllers/drink');

    app.route('/api/drink/:drinkId')
        .get(drink.get)
        .put(auth.requiresLogin, drink.update)
        .delete(auth.requiresAdmin, drink.delete);

    app.route('/api/drink')
        .get(drink.list)
        .post(auth.requiresLogin, drink.add);
};
