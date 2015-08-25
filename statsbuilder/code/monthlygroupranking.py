import pymongo
import datetime


def getFieldRanking(monthlyAnalyses, fieldName, reverse):
	sortedList = sorted(monthlyAnalyses, key=lambda x: x[fieldName], reverse=not reverse)

	return map(lambda x: {'user': x['_id']['user'], 'value': x[fieldName]}, sortedList)

def generateMonthlyGroupRankings(db):
	for group in list(db['groups'].find()):
		month = 1
		year = 2015
		now = datetime.datetime.now()
		currentYear = now.year
		currentMonth = now.month

		while (month <= currentMonth and year <= currentYear):
			monthlyAnalyses = list(db['monthlyanalyses'].find({
				'_id.user': {'$in': group['members']}, 
				'_id.year': year,
				'_id.month': month
				}))

			# rankingSun = getFieldRanking(monthlyAnalyses, 'totAlcSun', False)
			# rankingMon = getFieldRanking(monthlyAnalyses, 'totAlcMon', False)
			# rankingTue = getFieldRanking(monthlyAnalyses, 'totAlcTue', False)
			# rankingWed = getFieldRanking(monthlyAnalyses, 'totAlcWed', False)
			# rankingThu = getFieldRanking(monthlyAnalyses, 'totAlcThu', False)
			# rankingFri = getFieldRanking(monthlyAnalyses, 'totAlcFri', False)
			# rankingSat = getFieldRanking(monthlyAnalyses, 'totAlcSat', False)

			rankingPilsner = getFieldRanking(monthlyAnalyses, 'totAlcPilsner', False)
			rankingStrongbeer = getFieldRanking(monthlyAnalyses, 'totAlcStrongbeer', False)
			rankingWine = getFieldRanking(monthlyAnalyses, 'totAlcWine', False)
			rankingLiquor = getFieldRanking(monthlyAnalyses, 'totAlcLiquor', False)
			rankingWeekend = getFieldRanking(monthlyAnalyses, 'totAlcWeekend', False)
			rankingWorkweek = getFieldRanking(monthlyAnalyses, 'totAlcWorkweek', False)
			rankingHighestBinge = getFieldRanking(monthlyAnalyses, 'maxAlc', False)
			rankingAlcohol = getFieldRanking(monthlyAnalyses, 'avgAlc', False)
			rankingDrinkingDays = getFieldRanking(monthlyAnalyses, 'drinkingDays', False)

			thisDate = datetime.datetime(year, month, 1, 0, 0, 0, 0)
			newRanking = {
				'group': group['_id'],
				'date': thisDate,
				'rankingPilsner': rankingPilsner,
				'rankingStrongbeer': rankingStrongbeer,
				'rankingWine': rankingWine,
				'rankingLiquor': rankingLiquor,
				
				'rankingWeekend': rankingWeekend,
				'rankingWorkweek': rankingWorkweek,

				'rankingHighestBinge': rankingHighestBinge,
				'rankingAlcohol': rankingAlcohol,
				'rankingDrinkingDays': rankingDrinkingDays,
			}
			db['monthlygrouprankings'].replace_one({'group': group['_id'], 'date': thisDate}, newRanking, upsert=True)

			month = month + 1
			if (month > 12):
				month = 1
				year = year + 1



if __name__ == "__main__":
	from pymongo import MongoClient
	client = MongoClient()
	db = client['beerkeeper-dev']
	generateMonthlyGroupRankings(db)







