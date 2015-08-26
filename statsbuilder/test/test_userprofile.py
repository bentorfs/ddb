import unittest
import sys
import datetime
sys.path.append('../code')
import userprofile
from bson.objectid import ObjectId  
from pymongo import MongoClient

class TestProfile(unittest.TestCase):

	def setUp(self):
		client = MongoClient()
		self.db = client['beerkeeper-test']
		self.db.dailyanalyses.remove()
		self.db.profiles.remove()
		userId = ObjectId()
		self.db.dailyanalyses.insert_one({
			'user': userId,
			'date': datetime.datetime(2015, 7, 1, 15, 0, 0, 0),
			'todAlc': 100,
			'dayOfWeek': 0,
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
			'dayOfWeek': 0,
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
			'dayOfWeek': 0,
			'todAlcPilsner': 0,
			'todAlcStrongbeer': 0,
			'todAlcWine': 0,
			'todAlcLiquor': 0,
			'ignore': False
			})

	def testOne(self):
		userprofile.generateProfiles(self.db)
		result = self.db.profiles.find_one()
		self.assertEqual(result['avgAlc'], 100)
		self.assertEqual(result['totAlcSun'], 300)
		self.assertEqual(result['totAlcMon'], 0)
		self.assertEqual(result['totAlcTue'], 0)
		self.assertEqual(result['totAlcWed'], 0)
		self.assertEqual(result['totAlcThu'], 0)
		self.assertEqual(result['totAlcFri'], 0)
		self.assertEqual(result['totAlcSat'], 0)
		self.assertEqual(result['totAlc'], 300)
		self.assertEqual(result['minAlc'], 0)
		self.assertEqual(result['avgAlc'], 100)
		self.assertEqual(result['maxAlc'], 200)
		self.assertEqual(result['totAlcWorkweek'], 0)
		self.assertEqual(result['totAlcWeekend'], 300)
		self.assertEqual(result['drinkingDays'], 2)
		self.assertEqual(result['totAlcPilsner'], 30)
		self.assertEqual(result['totAlcStrongbeer'], 60)
		self.assertEqual(result['totAlcWine'], 90)
		self.assertEqual(result['totAlcLiquor'], 120)


if __name__ == '__main__':
    unittest.main()