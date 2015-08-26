import pymongo
import monthlyanalysis
import monthlygroupranking
import userprofile

if __name__ == "__main__":
	from pymongo import MongoClient
	client = MongoClient()
	db = client['beerkeeper-dev']
	userprofile.generateProfiles(db)
	monthlyanalysis.generateMonthlyAnalyses(db)
	monthlygroupranking.generateMonthlyGroupRankings(db)


