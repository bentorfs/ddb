import pymongo
import pymongo
import datetime


def getFieldRanking(monthlyAnalyses, fieldName, reverse):
	sortedList = sorted(monthlyAnalyses, key=lambda x: x[fieldName], reverse=not reverse)

	return map(lambda x: {'user': x['_id']['user'], 'value': x[fieldName]}, sortedList)

def getSuperCup(members, monthlyGroupRankings):
	scores = {}
	for member in members:
		scores[member] = 0

	for groupRanking in monthlyGroupRankings:
		for trophy in groupRanking['trophies']:
			if len(trophy['ranking']) > 0:
				scores[trophy['ranking'][0]['user']] += 1
	
	superCup = []
	for user, score in scores.iteritems():
		superCup.append({'user': user, 'value': score})
	return sorted(superCup, key=lambda x: x['value'], reverse=True)

def generateMonthlyGroupRankings(db):
	for group in list(db['groups'].find()):
		month = 1
		year = 2015
		now = datetime.datetime.now()
		currentYear = now.year
		currentMonth = now.month

		monthlyGroupRankings = []

		while (month <= currentMonth and year <= currentYear):

			thisDate = datetime.datetime(year, month, 1, 0, 0, 0, 0)
			creationMonth = datetime.datetime(group['creationDate'].year, group['creationDate'].month, 1, 0, 0, 0, 0)
			if (thisDate >= creationMonth):

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

				rankingSuperCup = getSuperCup(group['members'], monthlyGroupRankings)

				
				newRanking = {
					'group': group['_id'],
					'calculationDate': datetime.datetime.utcnow(),
					'date': thisDate,
					'supercup': rankingSuperCup,
					'trophies': [
						{
							'name': 'Pilsner Trophy',
							'ranking': rankingPilsner,
							'description': 'Awarded to the member who drinks the most pilsner beer'
						},
						{
							'name': 'Trappist Trophy',
							'ranking': rankingStrongbeer,
							'description': 'Awarded to the member who drinks the most strong beer'
						},
						{
							'name': 'Wine Trophy',
							'ranking': rankingWine,
							'description': 'Awarded to the member who drinks the most wine'
						},
						{
							'name': 'Liquor Trophy',
							'ranking': rankingLiquor,
							'description': 'Awarded to the member who drinks the most liquor'
						},
					
						{
							'name': 'Weekend Trophy',
							'ranking': rankingWeekend,
							'description': 'Awarded to the member with the highest average alcohol intake on weekend days'
						},
						{
							'name': 'Working Week Trophy',
							'ranking': rankingWorkweek,
							'description': 'Awarded to the member with the highest average alcohol intake from Monday to Thursday'
						},

						{
							'name': 'Binge Trophy',
							'ranking': rankingHighestBinge,
							'description': 'Awarded to the member with the highest alcohol intake in one day'
						},
						{
							'name': 'Village Drunk Trophy',
							'ranking': rankingAlcohol,
							'description': 'Awarded to the member with the highest average daily alcohol intake'
						},
						{
							'name': 'Habitual Drinker Trophy',
							'ranking': rankingDrinkingDays,
							'description': 'Awarded to the member who is drinking most frequently'
						}
					]
					
				}

				monthlyGroupRankings.append(newRanking)

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







