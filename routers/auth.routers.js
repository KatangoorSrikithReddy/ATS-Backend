const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../models');
const { authenticateToken } = require('../middlewaare/auth');
const User = db.User;
const SECRET_KEY = 'ced35672f556c0ade93da500e7b579a9bf2543f6499c082463dbf1fd87768f93';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - username
 *         - passworde
 *         - firstName
 *         - lastName
 *         - role
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the user
 *         email:
 *           type: string
 *           description: Email of the user
 *         username:
 *           type: string
 *           description: Username of the user
 *         firstName:
 *           type: string
 *           description: First name of the user
 *         lastName:
 *           type: string
 *           description: Last name of the user
 *         role:
 *           type: string
 *           description: Role of the user
 *         hashedPassword:
 *           type: string
 *           description: The hashed password of the user
 *       example:
 *         email: test@example.com
 *         username: testuser
 *         password: password123
 *         firstName: John
 *         lastName: Doe
 *         role: user
 */

/**
 * @swagger
 * /auth/registers:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: The user was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       500:
 *         description: Some server error
 */
// router.post('/registers', async (req, res) => {
//   const { email, username, password, firstName, lastName, role } = req.body;
//   console.log("testing", req.body)
//   const hashedPassword = bcrypt.hashSync(password, 10);
//     console.log("hasedpassword ", hashedPassword)
//     console.log(User)
//   try {
//     const user = await User.create({
//       email,
//       username,
//       firstName,
//       lastName,
//       hashedPassword,
//       role,
//     });
//     res.status(201).json(user);
//   } catch (error) {
//     res.status(500).json({ error: 'Unable to register user' });
//   }
// });
router.post('/registers', async (req, res) => {
  try {
    // Destructure snake_case fields from the frontend request
    const { email, username, password, first_name, last_name, role } = req.body;
    console.log("Received registration data:", req.body);

    // Validate incoming data
    if (!email || !username || !password || !first_name || !last_name || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);
    console.log("Hashed password: ", hashedPassword);

    // Try to create a new user, mapping snake_case to camelCase
    const newUser = {
      email,
      username,
      firstName: first_name,  // Map first_name to firstName
      lastName: last_name,    // Map last_name to lastName
      hashedPassword,         // The hashed password must be saved here
      role,
    };

    console.log("Attempting to create a new user with data:", newUser);

    const user = await User.create(newUser);

    // If user is successfully created, return the user data
    res.status(201).json(user);

  } catch (error) {
    // Log the detailed error for further investigation
    console.error('Error during user registration:', error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Email or username already exists' });
    }

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors.map(e => e.message) });
    }

    // Fallback for generic errors
    return res.status(500).json({ error: 'Unable to register user', details: error.message });
  }
}); 


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the user
 *               password:
 *                 type: string
 *                 description: The user's password
 *             example:
 *               username: test@example.com
 *               password: password123
 *     responses:
 *       200:
 *         description: The user was successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                   description: JWT token for authorization
 *                 token_type:
 *                   type: string
 *                   description: Type of the token
 *               example:
 *                 access_token: your_token_here
 *                 token_type: bearer
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Some server error
 */
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      // Fetch user using the username (email in this case)
      const user = await User.findOne({ where: { email: username } });
      if (!user || !bcrypt.compareSync(password, user.hashedPassword)) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      // Generate the full name by concatenating firstName and lastName
      const fullName = `${user.firstName} ${user.lastName}`;
  
      // Generate the token including the full name
      const token = jwt.sign(
        { id: user.id, fullName }, // Include the full name in the token
        SECRET_KEY,
        { expiresIn: '60m' }
      );
  
      // Send the token back to the client
      res.json({ access_token: token, token_type: 'bearer' });
    } catch (error) {
      res.status(500).json({ error: 'Something went wrong' });
    }
  });
  


// /**
//  * @swagger
//  * /update/me:
//  *   patch:
//  *     summary: Update specific user details
//  *     description: Update the authenticated user's details. Fields not provided in the request will remain unchanged.
//  *     tags:
//  *       - Users
//  *     security:
//  *       - bearerAuth: []  # Ensure you have bearer token auth setup in swagger
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               firstName:
//  *                 type: string
//  *                 description: First name of the user.
//  *               lastName:
//  *                 type: string
//  *                 description: Last name of the user.
//  *               phone:
//  *                 type: string
//  *                 description: Phone number of the user.
//  *               avatar:
//  *                 type: string
//  *                 description: Avatar URL of the user.
//  *               workStatus:
//  *                 type: string
//  *                 description: Work status of the user.
//  *               totalExperience:
//  *                 type: number
//  *                 description: Total experience in years.
//  *               month:
//  *                 type: integer
//  *                 description: Experience in months.
//  *               currentSalary:
//  *                 type: number
//  *                 description: Current salary of the user.
//  *               currency:
//  *                 type: string
//  *                 description: Salary currency.
//  *               salaryBreakdown:
//  *                 type: string
//  *                 description: Breakdown of the salary.
//  *               fixedSalary:
//  *                 type: number
//  *                 description: Fixed salary.
//  *               variableSalary:
//  *                 type: number
//  *                 description: Variable salary.
//  *               currentLocation:
//  *                 type: string
//  *                 description: Current location of the user.
//  *               state:
//  *                 type: string
//  *                 description: State of the user.
//  *               country:
//  *                 type: string
//  *                 description: Country of the user.
//  *               availability:
//  *                 type: string
//  *                 description: Availability status of the user.
//  *     responses:
//  *       200:
//  *         description: Successfully updated the user details.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 id:
//  *                   type: integer
//  *                   description: ID of the user.
//  *                 first_name:
//  *                   type: string
//  *                   description: First name of the user.
//  *                 last_name:
//  *                   type: string
//  *                   description: Last name of the user.
//  *                 phone:
//  *                   type: string
//  *                   description: Phone number of the user.
//  *                 avatar:
//  *                   type: string
//  *                   description: Avatar URL of the user.
//  *                 work_status:
//  *                   type: string
//  *                   description: Work status of the user.
//  *                 total_experience:
//  *                   type: number
//  *                   description: Total experience of the user in years.
//  *                 month:
//  *                   type: integer
//  *                   description: Experience in months.
//  *                 current_salary:
//  *                   type: number
//  *                   description: Current salary of the user.
//  *                 currency:
//  *                   type: string
//  *                   description: Salary currency.
//  *                 salary_breakdown:
//  *                   type: string
//  *                   description: Breakdown of the salary.
//  *                 fixed_salary:
//  *                   type: number
//  *                   description: Fixed salary of the user.
//  *                 variable_salary:
//  *                   type: number
//  *                   description: Variable salary of the user.
//  *                 current_location:
//  *                   type: string
//  *                   description: Current location of the user.
//  *                 state:
//  *                   type: string
//  *                   description: State of the user.
//  *                 country:
//  *                   type: string
//  *                   description: Country of the user.
//  *                 availability:
//  *                   type: string
//  *                   description: Availability status of the user.
//  *       404:
//  *         description: User not found.
//  *       500:
//  *         description: Internal server error.
//  */

// router.patch('/update/me', authenticateToken, async (req, res) => {
//   try {
//     const userUpdate = req.body; // This contains the fields to update from the request body
//     const userId = req.user.id;  // The authenticated user's ID

//     // Retrieve the existing user from the database
//     const dbUser = await User.findByPk(userId);

//     if (!dbUser) {
//       return res.status(404).json({ error: 'User not found.' });
//     }

//     // Update only the fields provided in the request
//     for (const [key, value] of Object.entries(userUpdate)) {
//       if (value !== undefined) {
//         dbUser[key] = value;
//       }
//     }

//     // If the work status is "fresher", reset the experience-related fields to null
//     if (userUpdate.workStatus === "fresher") {
//       dbUser.totalExperience = null;
//       dbUser.month = null;
//       dbUser.currentSalary = null;
//       dbUser.currency = null;
//       dbUser.salaryBreakdown = null;
//       dbUser.fixedSalary = null;
//       dbUser.variableSalary = null;
//     }

//     // Commit the changes to the database
//     await dbUser.save();

//     // Return the updated user data
//     return res.json({
//       id: dbUser.id,
//       first_name: dbUser.firstName,
//       last_name: dbUser.lastName,
//       phone: dbUser.phone,
//       avatar: dbUser.avatar,
//       work_status: dbUser.workStatus,
//       total_experience: dbUser.totalExperience,
//       month: dbUser.month,
//       current_salary: dbUser.currentSalary,
//       currency: dbUser.currency,
//       salary_breakdown: dbUser.salaryBreakdown,
//       fixed_salary: dbUser.fixedSalary,
//       variable_salary: dbUser.variableSalary,
//       current_location: dbUser.currentLocation,
//       state: dbUser.state,
//       country: dbUser.country,
//       availability: dbUser.availability,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

  
module.exports = router;
  