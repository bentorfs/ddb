'use strict';

var mongoose = require('mongoose'),
    Measurement = mongoose.model('Measurement'),
    DailyAnalysis = mongoose.model('DailyAnalysis'),
    Group = mongoose.model('Group'),
    DailyGroupAnalysis = mongoose.model('DailyGroupAnalysis'),
    ObjectId = mongoose.Types.ObjectId,
    _ = require('lodash'),
    moment = require('moment'),
    async = require('async');

module.exports = {
    processUser: function (user, date, callback) {
        // Get the users groups first
        Group.find({members: user._id}, function (err, groups) {
            if (err) {
                console.error('Could not load groups that user ' + user.username + 'is a member of, because: ' + err);
                return callback(err);
            }
            async.parallel(
                {
                    measurements: function (callback) {
                        var search = {
                            user: user,
                            isDeleted: false
                        };
                        if (date) {
                            search.date = new Date(date);
                        }
                        Measurement.find(search).sort('date').populate('consumptions.drink').exec(function (err, measurements) {
                            if (err) {
                                console.error('Could not load measurement to update daily analyses: ' + err);
                            }
                            callback(err, measurements);
                        });
                    },
                    groupAnalyses: function (callback) {
                        var search = {'group': {'$in': groups}};
                        if (date) {
                            search.date = date;
                        }
                        DailyGroupAnalysis.find(search).sort('date').exec(function (err, dailyGroupAnalyses) {
                            if (err) {
                                console.error('Could not load group analyses to update daily user analyses: ' + err);
                            }
                            callback(err, dailyGroupAnalyses);
                        });
                    }
                },
                function (err, result) {
                    if (err) {
                        return callback(err);
                    }

                    var dailyAnalyses = getDailyAnalyses(result.measurements, user);
                    calculateLonerFactor(dailyAnalyses, result.groupAnalyses);
                    saveDailyAnalyses(dailyAnalyses, user, callback);
                }
            );

        });
    }
};

function getDailyAnalyses(measurements, user) {
    var result = [];
    var todAlc = 0;
    _.forEach(measurements, function (measurement) {
        todAlc = getTotalAlcohol(measurement);
        var analysisData = {
            user: new ObjectId(user._id),
            date: measurement.date,
            dayOfWeek: moment(measurement.date).day(),

            todPilsner: getTotPilsner(measurement),
            todStrongbeer: getTotStrongbeer(measurement),
            todWine: getTotWine(measurement),
            todLiquor: getTotLiquor(measurement),

            todAlcPilsner: getTotAlcPilsner(measurement),
            todAlcStrongbeer: getTotAlcStrongbeer(measurement),
            todAlcWine: getTotAlcWine(measurement),
            todAlcLiquor: getTotAlcLiquor(measurement),
            todAlc: todAlc,

            groups: []
        };
        result.push(analysisData);
    });

    return result;
}

function getTotalAlcohol(measurement) {
    var result = 0;
    // Take into account deprecated fields
    result += measurement.pilsner * 0.055 + measurement.strongbeer * 0.075 + measurement.wine * 0.125 + measurement.liquor * 0.43;
    if (measurement.consumptions.length > 0) {
        result += _.reduce(measurement.consumptions, function (prevValue, curElement) {
            return prevValue + (curElement.amount * curElement.drink.alc);
        }, 0);
    }
    return result;
}

var getPilsners = function (consumptions) {
    return _.filter(consumptions, function (consumption) {
        return consumption.drink.type === 'beer' && consumption.drink.alc <= 0.06;
    });
};

var getStrongbeers = function (consumptions) {
    return _.filter(consumptions, function (consumption) {
        return consumption.drink.type === 'beer' && consumption.drink.alc > 0.06;
    });
};

var getWines = function (consumptions) {
    return _.filter(consumptions, function (consumption) {
        return consumption.drink.type === 'wine';
    });
};

var getLiquors = function (consumptions) {
    return _.filter(consumptions, function (consumption) {
        return consumption.drink.type === 'liquor';
    });
};

function getTotPilsner(measurement) {
    var result = 0;
    result += measurement.pilsner;
    var matchingDrinks = getPilsners(measurement.consumptions);
    if (matchingDrinks.length > 0) {
        result += _.reduce(matchingDrinks, function (prevValue, curElement) {
            return prevValue + curElement.amount;
        }, 0);
    }
    return result;
}

function getTotStrongbeer(measurement) {
    var result = 0;
    result += measurement.strongbeer;
    var matchingDrinks = getStrongbeers(measurement.consumptions);
    if (matchingDrinks.length > 0) {
        result += _.reduce(matchingDrinks, function (prevValue, curElement) {
            return prevValue + curElement.amount;
        }, 0);
    }
    return result;
}

function getTotWine(measurement) {
    var result = 0;
    result += measurement.wine;
    var matchingDrinks = getWines(measurement.consumptions);
    if (matchingDrinks.length > 0) {
        result += _.reduce(matchingDrinks, function (prevValue, curElement) {
            return prevValue + curElement.amount;
        }, 0);
    }
    return result;
}

function getTotLiquor(measurement) {
    var result = 0;
    result += measurement.liquor;
    var matchingDrinks = getLiquors(measurement.consumptions);
    if (matchingDrinks.length > 0) {
        result += _.reduce(matchingDrinks, function (prevValue, curElement) {
            return prevValue + curElement.amount;
        }, 0);
    }
    return result;
}

function getTotAlcPilsner(measurement) {
    var result = 0;
    result += measurement.pilsner * 0.055;
    var matchingDrinks = getPilsners(measurement.consumptions);
    if (matchingDrinks.length > 0) {
        result += _.reduce(matchingDrinks, function (prevValue, curElement) {
            return prevValue + (curElement.amount * curElement.drink.alc);
        }, 0);
    }
    return result;
}

function getTotAlcStrongbeer(measurement) {
    var result = 0;
    result += measurement.strongbeer * 0.075;
    var matchingDrinks = getStrongbeers(measurement.consumptions);
    if (matchingDrinks.length > 0) {
        result += _.reduce(matchingDrinks, function (prevValue, curElement) {
            return prevValue + (curElement.amount * curElement.drink.alc);
        }, 0);
    }
    return result;
}

function getTotAlcWine(measurement) {
    var result = 0;
    result += measurement.wine * 0.125;
    var matchingDrinks = getWines(measurement.consumptions);
    if (matchingDrinks.length > 0) {
        result += _.reduce(matchingDrinks, function (prevValue, curElement) {
            return prevValue + (curElement.amount * curElement.drink.alc);
        }, 0);
    }
    return result;
}

function getTotAlcLiquor(measurement) {
    var result = 0;
    result += measurement.liquor * 0.43;
    var matchingDrinks = getLiquors(measurement.consumptions);
    if (matchingDrinks.length > 0) {
        result += _.reduce(matchingDrinks, function (prevValue, curElement) {
            return prevValue + (curElement.amount * curElement.drink.alc);
        }, 0);
    }
    return result;
}


function saveDailyAnalyses(dailyAnalyses, user, callback) {
    console.info('Updating ' + dailyAnalyses.length + ' new daily analyses for: ' + user.username);

    if (dailyAnalyses.length > 0) {
        var counter = _.after(dailyAnalyses.length, function () {
            console.info('Successfully updated ' + dailyAnalyses.length + ' daily analyses for ' + user.username);
            callback();
        });

        _.forEach(dailyAnalyses, function (dailyAnalysis) {
            DailyAnalysis.findOneAndUpdate({
                user: dailyAnalysis.user,
                date: dailyAnalysis.date
            }, dailyAnalysis, {upsert: true}, function (err) {
                if (err) {
                    console.error('Failed to updated daily analysis for: ' + user.username + ', due to: ' + err);
                    return;
                }
                counter();
            });

        });
    } else {
        console.info('Not saving any daily analyses for ' + user.username);
        callback();
    }
}

function calculateLonerFactor(dailyAnalyses, dailyGroupAnalyses) {
    _.forEach(dailyAnalyses, function (dailyAnalysis) {

        var groupAnalysesForThisDay = _.filter(dailyGroupAnalyses, function (groupAnalysis) {
            var result = _.isEqual(dailyAnalysis.date, groupAnalysis.date);
            return result;
        });

        _.forEach(groupAnalysesForThisDay, function (groupAnalysis) {
            dailyAnalysis.groups.push(
                {
                    group: groupAnalysis.group,
                    lonerFactor: dailyAnalysis.todAlc - groupAnalysis.todAvgAlc
                }
            );
        })
    });
}