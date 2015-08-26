import unittest
import sys
import datetime
sys.path.append('../code')
import monthlyanalysis
from bson.objectid import ObjectId  
from pymongo import MongoClient

class TestMonthlyAnalysis(unittest.TestCase):

	def setUp(self):
		client = MongoClient()
		self.db = client['beerkeeper-test']
		self.db.dailyanalyses.remove()
		userId = ObjectId()
		self.db.dailyanalyses.insert_one({
			'user': userId,
			'date': datetime.datetime(2015, 7, 1, 15, 0, 0, 0),
			'todAlc': 100,
			'dayOfWeek': 1,
			'todAlcPilsner': 10,
			'todAlcStrongbeer': 20,
			'todAlcWine': 30,
			'todAlcLiquor': 40,
			'ignore': False
			})
		self.db.dailyanalyses.insert_one({
			'user': userId,
			'date': datetime.datetime(2015, 8, 1, 15, 0, 0, 0),
			'todAlc': 200,
			'dayOfWeek': 1,
			'todAlcPilsner': 20,
			'todAlcStrongbeer': 40,
			'todAlcWine': 60,
			'todAlcLiquor': 80,
			'ignore': False
			})
		self.db.dailyanalyses.insert_one({
			'user': userId,
			'date': datetime.datetime(2015, 8, 2, 15, 0, 0, 0),
			'todAlc': 0,
			'dayOfWeek': 1,
			'todAlcPilsner': 0,
			'todAlcStrongbeer': 0,
			'todAlcWine': 0,
			'todAlcLiquor': 0,
			'ignore': False
			})

	def testOne(self):
		monthlyanalysis.generateMonthlyAnalyses(self.db)
		result = list(self.db.monthlyanalyses.find().sort('date'))
		self.assertEqual(result[0]['avgAlc'], 100)
		self.assertEqual(result[0]['totAlcSun'], 100)
		self.assertEqual(result[0]['totAlcMon'], 0)
		self.assertEqual(result[0]['totAlcTue'], 0)
		self.assertEqual(result[0]['totAlcWed'], 0)
		self.assertEqual(result[0]['totAlcThu'], 0)
		self.assertEqual(result[0]['totAlcFri'], 0)
		self.assertEqual(result[0]['totAlcSat'], 0)
		self.assertEqual(result[0]['sumAlc'], 100)
		self.assertEqual(result[0]['minAlc'], 100)
		self.assertEqual(result[0]['avgAlc'], 100)
		self.assertEqual(result[0]['maxAlc'], 100)
		self.assertEqual(result[0]['totAlcWorkweek'], 0)
		self.assertEqual(result[0]['totAlcWeekend'], 100)
		self.assertEqual(result[0]['drinkingDays'], 1)
		self.assertEqual(result[0]['totAlcPilsner'], 10)
		self.assertEqual(result[0]['totAlcStrongbeer'], 20)
		self.assertEqual(result[0]['totAlcWine'], 30)
		self.assertEqual(result[0]['totAlcLiquor'], 40)

		self.assertEqual(result[1]['avgAlc'], 100)
		self.assertEqual(result[1]['totAlcSun'], 200)
		self.assertEqual(result[1]['totAlcMon'], 0)
		self.assertEqual(result[1]['totAlcTue'], 0)
		self.assertEqual(result[1]['totAlcWed'], 0)
		self.assertEqual(result[1]['totAlcThu'], 0)
		self.assertEqual(result[1]['totAlcFri'], 0)
		self.assertEqual(result[1]['totAlcSat'], 0)
		self.assertEqual(result[1]['sumAlc'], 200)
		self.assertEqual(result[1]['minAlc'], 0)
		self.assertEqual(result[1]['avgAlc'], 100)
		self.assertEqual(result[1]['maxAlc'], 200)
		self.assertEqual(result[1]['totAlcWorkweek'], 0)
		self.assertEqual(result[1]['totAlcWeekend'], 200)
		self.assertEqual(result[1]['drinkingDays'], 1)
		self.assertEqual(result[1]['totAlcPilsner'], 20)
		self.assertEqual(result[1]['totAlcStrongbeer'], 40)
		self.assertEqual(result[1]['totAlcWine'], 60)
		self.assertEqual(result[1]['totAlcLiquor'], 80)

if __name__ == '__main__':
    unittest.main()