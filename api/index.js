require('dotenv').config();
// Ensure node can resolve local backend modules
const path = require('path');
process.env.NODE_PATH = path.join(__dirname, 'backend');
require('module').Module._initPaths();

// Require and mount the backend app
const app = require('./backend/app');

module.exports = app;
require('dotenv').config();
const app = require('../backend/app');

module.exports = app;
