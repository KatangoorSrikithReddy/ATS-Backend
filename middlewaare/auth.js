const jwt = require('jsonwebtoken');
const SECRET_KEY = 'ced35672f556c0ade93da500e7b579a9bf2543f6499c082463dbf1fd87768f93';

// Middleware to authenticate token
// function authenticateToken(req, res, next) {
//   const authHeader = req.headers['authorization'];
//   console.log("authheader", authHeader)
  
//   const token = authHeader && authHeader.split(' ')[1];
//   console.log("Token", token)
//   if (!token) return res.sendStatus(401);

//   jwt.verify(token, SECRET_KEY, (err, user) => {
//     if (err) return res.sendStatus(403);
//     req.user = user;
//     next();
//   });
// }

// module.exports = authenticateToken ;
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    console.log("authHeader", authHeader);
  
    // Ensure that we only get the token part and avoid double 'bearer'
    let token = authHeader && authHeader.split(' ')[1];
  
    // Check if there's an additional 'bearer' string
    if (token && token.toLowerCase() === 'bearer') {
      token = authHeader.split(' ')[2]; // Get the actual token if 'bearer' is repeated
    }
  
    console.log("Token", token);
  
    if (!token) return res.sendStatus(401);
  
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  }
  
  module.exports = authenticateToken;
  

// const jwt = require('jsonwebtoken');
// const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET || 'ced35672f556c0ade93da500e7b579a9bf2543f6499c082463dbf1fd87768f93'; // Use environment variable if available
// const ALGORITHM = 'HS256'
// // Middleware to authenticate token
// function authenticateToken(req, res, next) {
//     const authHeader = req.headers.authorization;
   
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         return res.status(401).json({ message: 'Authorization header is missing or invalid' });
//     }
 
//     const token = authHeader.split(' ')[1];
 
//     try {
//         // Decode and verify the JWT token
//         const payload = jwt.verify(token, SECRET_KEY, { algorithms: [ALGORITHM] });
 
//         const userId = payload.id;    // Extracting user ID from the token
//         const email = payload.email;  // Extracting email from the token
//         const role = payload.role;    // Extracting user role from the token
 
//         if (!userId || !email) {
//             return res.status(401).json({ message: 'Invalid token' });
//         }
 
//         // Attach user details to the request object for future middleware or routes
//         req.user = { id: userId, email, role };
//         next(); // Proceed to the next middleware or route handler
//     } catch (error) {
//         return res.status(401).json({ message: 'Could not validate token', error: error.message });
//     }
// };

// module.exports = authenticateToken;
