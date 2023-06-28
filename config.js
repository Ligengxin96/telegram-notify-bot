const dotenv = require('dotenv');
dotenv.config();


const TOKEN = process.env.TOKEN;
if (!TOKEN) throw new Error('No TOKEN environment variable set.');

let AUTH_USER_ID = process.env.AUTH_USER_ID;
if (AUTH_USER_ID) {
  AUTH_USER_ID = parseInt(AUTH_USER_ID);
  if (isNaN(AUTH_USER_ID)) {
    throw new Error('AUTH_USER_ID is not a number');
  }
}


module.exports = {
  TOKEN,
  AUTH_USER_ID,
  PROXY: process.env.PROXY,
}