// const express = require("express");
// const { Country, State, City } = require("../models");
// console.log("Countries",Country)
// const router = express.Router();

// // Get all countries
// router.get("/countries", async (req, res) => {
//   try {
//     const countries = await Country.findAll();
//     res.json(countries);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Get states by country ID
// router.get("/states/:country_id", async (req, res) => {
//   try {
//     const states = await State.findAll({
//       where: { country_id: req.params.country_id },
//     });
//     res.json(states);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Get cities by state ID
// router.get("/cities/:state_id", async (req, res) => {
//   try {
//     const cities = await City.findAll({
//       where: { state_id: req.params.state_id },
//     });
//     res.json(cities);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;


const express = require("express");
const { Country, State, City } = require("../models");
const router = express.Router();
console.log("Country",Country)
console.log("States",State)
/**
 * @swagger
 * /countries:
 *   get:
 *     summary: Get all countries
 *     tags: [Locations]
 *     responses:
 *       200:
 *         description: List of countries
 *       500:
 *         description: Server error
 */
router.get("/countries", async (req, res) => {
  try {
    const countries = await Country.findAll();
    res.json(countries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /states/{country_id}:
 *   get:
 *     summary: Get states by country ID
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: country_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the country
 *     responses:
 *       200:
 *         description: List of states
 *       500:
 *         description: Server error
 */
router.get("/states/:country_id", async (req, res) => {
  try {
    const states = await State.findAll({
      where: { country_id: req.params.country_id },
    });
    res.json(states);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /cities/{state_id}:
 *   get:
 *     summary: Get cities by state ID
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: state_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the state
 *     responses:
 *       200:
 *         description: List of cities
 *       500:
 *         description: Server error
 */
router.get("/cities/:state_id", async (req, res) => {
  try {
    const cities = await City.findAll({
      where: { state_id: req.params.state_id },
    });
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
