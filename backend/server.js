/*
Database:
users: root, dreamjournaluser - different password
identification methods, passwords, etc. need to be configured for each user separately!!!
*/

/*
set up server
if database does not exist:
  create database dreams

*/

// const http = require('http');
// const port = 8000;
// const server = http.createServer((request, response) => {
//   response.writeHead(200, {"Content-Type": "text"});
//   response.end("Hello, world!");
// });

// server.listen(port);
require('dotenv').config();
const mySQL = require('mysql');
const express = require('express');
const app = express();
const port = 8000;

const connection = mySQL.createConnection({
  // host: process.env.DB_HOST,
  // user: process.env.DB_USER,
  // database: process.env.DB_NAME,
  // password: process.env.DB_PASSWORD
  host: 'localhost',
  user: 'dreamjournaluser',
  password: process.env.DB_PASSWORD
//   DB_HOST=localhost
// DB_USER=dreamjournaluser
// DB_PASSWORD=Password123!
// DB_NAME=dreams
});

// connection.connect((error) => {
//   if (error) throw error;
//   console.log('Connected to MySQL');

//   connection.query('SHOW DATABASES', (error, result) => {
//     if (error) throw error;

//     console.log('Databases: ', result);
//   });
// });

connection.connect((error) => {
  if (error) {
    console.error('Error connecting to MySQL: ', error);
    return;
  }
  console.log('Connected to MySQL');
});

// Routes
app.get('/', (request, response) => {
  console.log("request: ", request.method, request.url);
  // console.log("request.headers: ", request.headers);
  // console.log("request.body: ", request.body);
  // console.log("response: ", response); // (undefined, 2%) (huge object)
  response.send("Hello, world!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});