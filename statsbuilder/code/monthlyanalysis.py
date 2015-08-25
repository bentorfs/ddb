import pymongo

def generateMonthlyAnalyses(db):

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
		 		'month': {'$month': '$date'}, 
		 		'year': {'$year': '$date'},
		 		'drinkingDay': {
		 			'$cond': { 'if': {'$gt': ['$todAlc', 0]}, 'then': { '$literal': 1 }, 'else': { '$literal': 0 } }
		 		},
		 		'todAlcSun': {
		 			'$cond': { 'if': {'$eq': ['$dayOfWeek', 1]}, 'then': '$todAlc', 'else': { '$literal': 0 } }
		 		},
		 		'todAlcMon': {
		 			'$cond': { 'if': {'$eq': ['$dayOfWeek', 2]}, 'then': '$todAlc', 'else': { '$literal': 0 } }
		 		},
		 		'todAlcTue': {
		 			'$cond': { 'if': {'$eq': ['$dayOfWeek', 3]}, 'then': '$todAlc', 'else': { '$literal': 0 } }
		 		},
		 		'todAlcWed': {
		 			'$cond': { 'if': {'$eq': ['$dayOfWeek', 4]}, 'then': '$todAlc', 'else': { '$literal': 0 } }
		 		},
		 		'todAlcThu': {
		 			'$cond': { 'if': {'$eq': ['$dayOfWeek', 5]}, 'then': '$todAlc', 'else': { '$literal': 0 } }
		 		},
		 		'todAlcFri': {
		 			'$cond': { 'if': {'$eq': ['$dayOfWeek', 6]}, 'then': '$todAlc', 'else': { '$literal': 0 } }
		 		},
		 		'todAlcSat': {
		 			'$cond': { 'if': {'$eq': ['$dayOfWeek', 7]}, 'then': '$todAlc', 'else': { '$literal': 0 } }
		 		}
			}
		},
		{
			'$group': {
				'_id': {
					'month': '$month',
					'year': '$year',
					'user': '$user'
				},
				'avgAlc': {'$avg': '$todAlc'},
				'sumAlc': {'$sum': '$todAlc'},
				'minAlc': {'$min': '$todAlc'},
				'maxAlc': {'$max': '$todAlc'},

				'totAlcPilsner': {'$sum': '$todAlcPilsner'},
				'totAlcStrongbeer': {'$sum': '$todAlcStrongbeer'},
				'totAlcWine': {'$sum': '$todAlcWine'},
				'totAlcLiquor': {'$sum': '$todAlcLiquor'},

				'totAlcSun': {'$sum': '$todAlcSun'},
				'totAlcMon': {'$sum': '$todAlcMon'},
				'totAlcTue': {'$sum': '$todAlcTue'},
				'totAlcWed': {'$sum': '$todAlcWed'},
				'totAlcThu': {'$sum': '$todAlcThu'},
				'totAlcFri': {'$sum': '$todAlcFri'},
				'totAlcSat': {'$sum': '$todAlcSat'},

				'drinkingDays': {'$sum': '$drinkingDay'},
			}
		},
		{'$project': {
				'avgAlc': 1,
				'sumAlc': 1,
				'minAlc': 1,
				'maxAlc': 1,
				'totAlcPilsner': 1,
				'totAlcStrongbeer': 1,
				'totAlcWine': 1,
				'totAlcLiquor': 1,
		 		'drinkingDays': 1,
		 		'totAlcSun': 1,
		 		'totAlcMon': 1,
		 		'totAlcTue': 1,
		 		'totAlcWed': 1,
		 		'totAlcThu': 1,
		 		'totAlcFri': 1,
		 		'totAlcSat': 1,
		 		'totAlcWorkweek' : { '$add' : [ '$totAlcMon', '$totAlcTue', '$totAlcWed', '$totAlcThu' ] },
		 		'totAlcWeekend' : { '$add' : [ '$totAlcFri', '$totAlcSat', '$totAlcSun' ] }
			}
		},
		{ '$out' : 'monthlyanalyses'}
	])


if __name__ == "__main__":
	from pymongo import MongoClient
	client = MongoClient()
	db = client['beerkeeper-dev']
	generateMonthlyAnalyses(db)
