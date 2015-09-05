import unittest
import sys
import pymongo
import datetime
sys.path.append('../code')
import monthlygroupranking
from bson.objectid import ObjectId  
from pymongo import MongoClient

class TestGenerationOfRankings(unittest.TestCase):

	def setUp(self):
		client = MongoClient()
		self.db = client['beerkeeper-test']
		self.db.monthlygrouprankings.remove()
		self.db.monthlyanalyses.remove()
		self.db.groups.remove()
		self.userId1 = ObjectId()
		self.userId2 = ObjectId()

		self.db.groups.insert_one({
			'_id': ObjectId(),
			'members': [self.userId1, self.userId2],
			'creationDate': datetime.datetime(2014, 1, 1, 0, 0)
			})

		self.db.monthlyanalyses.insert_one({
			'_id': {'year': 2015, 'month': 1, 'user': self.userId1},
			'avgAlc' : 100,
			'sumAlc' : 100,
			'minAlc' : 100,
			'maxAlc' : 100,
			'drinkingDays' : 1,
			'totAlcLiquor' : 40,
			'totAlcStrongbeer' : 20,
			'totAlcPilsner' : 10,
			'totAlcWine' : 30,
			'totAlcSun' : 100,
			'totAlcMon' : 0,
			'totAlcTue' : 0,
			'totAlcWed' : 0,
			'totAlcThu' : 0,
			'totAlcFri' : 0,
			'totAlcSat' : 0,
			'totAlcWorkweek' : 0,
			'totAlcWeekend' : 100
			})

		self.db.monthlyanalyses.insert_one({
			'_id': {'year': 2015, 'month': 1, 'user': self.userId2},
			'avgAlc' : 200,
			'sumAlc' : 200,
			'minAlc' : 200,
			'maxAlc' : 200,
			'drinkingDays' : 2,
			'totAlcLiquor' : 20,
			'totAlcStrongbeer' : 10,
			'totAlcPilsner' : 5,
			'totAlcWine' : 15,
			'totAlcSun' : 10,
			'totAlcMon' : 0,
			'totAlcTue' : 0,
			'totAlcWed' : 0,
			'totAlcThu' : 0,
			'totAlcFri' : 0,
			'totAlcSat' : 0,
			'totAlcWorkweek' : 100,
			'totAlcWeekend' : 0
			})

	def testGenerateMonthlyGroupRankings(self):
		monthlygroupranking.generateMonthlyGroupRankings(self.db)
		result = list(self.db.monthlygrouprankings.find().sort('date'))
		self.assertEqual(result[0]['date'], datetime.datetime(2015, 1, 1, 0, 0))

		pilsnerTrophy = next(trophy for trophy in result[0]['trophies'] if trophy['name']=='Pilsner Trophy')

		self.assertEqual(pilsnerTrophy['ranking'][0]['user'], self.userId1)
		self.assertEqual(pilsnerTrophy['ranking'][0]['value'], 10)
		self.assertEqual(pilsnerTrophy['ranking'][1]['user'], self.userId2)
		self.assertEqual(pilsnerTrophy['ranking'][1]['value'], 5)


		self.assertEqual(result[1]['date'], datetime.datetime(2015, 2, 1, 0, 0))
		self.assertEqual(result[1]['supercup'][0]['user'], self.userId1)
		self.assertEqual(result[1]['supercup'][0]['value'], 5)
		self.assertEqual(result[1]['supercup'][1]['user'], self.userId2)
		self.assertEqual(result[1]['supercup'][1]['value'], 4)


if __name__ == '__main__':
    unittest.main()