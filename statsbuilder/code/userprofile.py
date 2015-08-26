import pymongo
import datetime

def generateProfiles(db):

	db['dailyanalyses'].aggregate([
		{'$match': {
				'ignore': False
			}
		},
		{'$project': {
				'user': 1,
				'todAlc': 1,
				'dayOfWeek': 1,
				'todAlcPilsner': 1,
				'todAlcStrongbeer': 1,
				'todAlcWine': 1,
				'todAlcLiquor': 1,
				'todPilsner': 1,
				'todStrongbeer': 1,
				'todWine': 1,
				'todLiquor': 1,
		 		'month': {'$month': '$date'}, 
		 		'year': {'$year': '$date'},
		 		'drinkingDay': {
		 			'$cond': { 'if': {'$gt': ['$todAlc', 0]}, 'then': { '$literal': 1 }, 'else': { '$literal': 0 } }
		 		},
		 		'todAlcSun': {
		 			'$cond': { 'if': {'$eq': ['$dayOfWeek', 0]}, 'then': '$todAlc', 'else': { '$literal': None } }
		 		},
		 		'todAlcMon': {
		 			'$cond': { 'if': {'$eq': ['$dayOfWeek', 1]}, 'then': '$todAlc', 'else': { '$literal': None } }
		 		},
		 		'todAlcTue': {
		 			'$cond': { 'if': {'$eq': ['$dayOfWeek', 2]}, 'then': '$todAlc', 'else': { '$literal': None } }
		 		},
		 		'todAlcWed': {
		 			'$cond': { 'if': {'$eq': ['$dayOfWeek', 3]}, 'then': '$todAlc', 'else': { '$literal': None } }
		 		},
		 		'todAlcThu': {
		 			'$cond': { 'if': {'$eq': ['$dayOfWeek', 4]}, 'then': '$todAlc', 'else': { '$literal': None } }
		 		},
		 		'todAlcFri': {
		 			'$cond': { 'if': {'$eq': ['$dayOfWeek', 5]}, 'then': '$todAlc', 'else': { '$literal': None } }
		 		},
		 		'todAlcSat': {
		 			'$cond': { 'if': {'$eq': ['$dayOfWeek', 6]}, 'then': '$todAlc', 'else': { '$literal': None } }
		 		}
			}
		},
		{
			'$group': {
				'_id': {
					'user': '$user'
				},
				'avgAlc': {'$avg': '$todAlc'},
				'totAlc': {'$sum': '$todAlc'},
				'minAlc': {'$min': '$todAlc'},
				'maxAlc': {'$max': '$todAlc'},

				'totPilsner': {'$sum': '$todPilsner'},
				'totStrongbeer': {'$sum': '$todStrongbeer'},
				'totWine': {'$sum': '$todWine'},
				'totLiquor': {'$sum': '$todLiquor'},

				'avgPilsner': {'$avg': '$todPilsner'},
				'avgStrongbeer': {'$avg': '$todStrongbeer'},
				'avgWine': {'$avg': '$todWine'},
				'avgLiquor': {'$avg': '$todLiquor'},

				'totAlcPilsner': {'$sum': '$todAlcPilsner'},
				'totAlcStrongbeer': {'$sum': '$todAlcStrongbeer'},
				'totAlcWine': {'$sum': '$todAlcWine'},
				'totAlcLiquor': {'$sum': '$todAlcLiquor'},

				'avgAlcPilsner': {'$avg': '$todAlcPilsner'},
				'avgAlcStrongbeer': {'$avg': '$todAlcStrongbeer'},
				'avgAlcWine': {'$avg': '$todAlcWine'},
				'avgAlcLiquor': {'$avg': '$todAlcLiquor'},

				'totAlcSun': {'$sum': '$todAlcSun'},
				'totAlcMon': {'$sum': '$todAlcMon'},
				'totAlcTue': {'$sum': '$todAlcTue'},
				'totAlcWed': {'$sum': '$todAlcWed'},
				'totAlcThu': {'$sum': '$todAlcThu'},
				'totAlcFri': {'$sum': '$todAlcFri'},
				'totAlcSat': {'$sum': '$todAlcSat'},

				'avgAlcSun': {'$avg': '$todAlcSun'},
				'avgAlcMon': {'$avg': '$todAlcMon'},
				'avgAlcTue': {'$avg': '$todAlcTue'},
				'avgAlcWed': {'$avg': '$todAlcWed'},
				'avgAlcThu': {'$avg': '$todAlcThu'},
				'avgAlcFri': {'$avg': '$todAlcFri'},
				'avgAlcSat': {'$avg': '$todAlcSat'},

				'drinkingDays': {'$sum': '$drinkingDay'},
				'activeDays': {'$sum': 1}
			}
		},
		{'$project': {
				'calculationDate': {'$add': [datetime.datetime.utcnow()]},

				'avgAlc': 1,
				'totAlc': 1,
				'minAlc': 1,
				'maxAlc': 1,

				'totAlcPilsner': 1,
				'totAlcStrongbeer': 1,
				'totAlcWine': 1,
				'totAlcLiquor': 1,

				'totPilsner': 1,
				'totStrongbeer': 1,
				'totWine': 1,
				'totLiquor': 1,

				'avgPilsner': 1,
				'avgStrongbeer': 1,
				'avgWine': 1,
				'avgLiquor': 1,

		 		'drinkingDays': 1,
		 		'activeDays': 1,
		 		'drinkingDayRate': { '$divide' : [ '$drinkingDays', '$activeDays'] },

		 		'totAlcSun': 1,
		 		'totAlcMon': 1,
		 		'totAlcTue': 1,
		 		'totAlcWed': 1,
		 		'totAlcThu': 1,
		 		'totAlcFri': 1,
		 		'totAlcSat': 1,

		 		'avgAlcSun': 1,
		 		'avgAlcMon': 1,
		 		'avgAlcTue': 1,
		 		'avgAlcWed': 1,
		 		'avgAlcThu': 1,
		 		'avgAlcFri': 1,
		 		'avgAlcSat': 1,

		 		'avgAlcPilsner': 1,
				'avgAlcStrongbeer': 1,
				'avgAlcWine': 1,
				'avgAlcLiquor': 1,

		 		'totAlcWorkweek' : { '$add' : [ '$totAlcMon', '$totAlcTue', '$totAlcWed', '$totAlcThu' ] },
		 		'totAlcWeekend' : { '$add' : [ '$totAlcFri', '$totAlcSat', '$totAlcSun' ] }
			}
		},
		{ '$out' : 'profiles'}
	])


if __name__ == "__main__":
	from pymongo import MongoClient
	client = MongoClient()
	db = client['beerkeeper-dev']
	generateMonthlyAnalyses(db)
