import pymongo
import monthlyanalysis
import monthlygroupranking

if __name__ == "__main__":
	from pymongo import MongoClient
	client = MongoClient()
	db = client['beerkeeper-dev']
	monthlyanalysis.generateMonthlyAnalyses(db)
	monthlygroupranking.generateMonthlyGroupRankings(db)


