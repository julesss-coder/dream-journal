/*
Database:
users: root, dreamjournaluser - different password
identification methods, passwords, etc. need to be configured for each user separately!!!
*/

require('dotenv').config();
const insertDummyDreams = require('./insertDummyDreams');
const mySQL = require('mysql');
const express = require('express');
const app = express();
const port = 8000;
app.use(express.json());
const util = require('util');

let dreams = [{id: 1, title: "test"}, {id: 2, title: "test again"}];

const connection = mySQL.createConnection({
  host: 'localhost',
  user: 'dreamjournaluser',
  password: process.env.DB_PASSWORD
});

const query = util.promisify(connection.query).bind(connection);

connection.connect((error) => {
  if (error) {
    console.error('Error connecting to MySQL: ', error);
    return;
  }
  console.log('Connected to MySQL');

  query("SHOW DATABASES LIKE 'dreams'")
  .then((result) => {
    if (result.length > 0) {
      console.log("Database dreams exists.");
      return query('USE dreams');
    } else {
      console.log("Database 'dreams' does not exist");
      throw new Error("Database 'dreams' does not exist");
    }
  })
  .then(() => {
    return query(`CREATE TABLE IF NOT EXISTS dreamlog (
      id INT PRIMARY KEY, 
      userid INT, 
      title VARCHAR(255), 
      description TEXT, 
      thoughts TEXT, 
      dateCreated DATETIME, 
      lastEdited DATETIME
    )`);
  })
  .then(() => {
    console.log("Table `dreamlog` created, or already exists.");
    return query(`CREATE TABLE IF NOT EXISTS tags (
      id INT PRIMARY KEY, 
      tag VARCHAR(255), 
      UNIQUE (tag)
    )`);
  })
  .then(() => {
    console.log("Table `tags` created, or already exists.");
    return query(`CREATE TABLE IF NOT EXISTS dreams_tags (
      dream_id INT,
      tag_id INT,
      PRIMARY KEY (dream_id, tag_id),
      FOREIGN KEY (dream_id) REFERENCES dreamlog(id),
      FOREIGN KEY (tag_id) REFERENCES tags(id)
    )`);
  })
  .then(() => {
    console.log("Table `drams_tags` created, or already exists.");
    return insertDummyDreams();
  })
  .then(() => console.log("Dummy data inserted successfully into tables."))
  .catch((error) => console.error(error));
});

// Routes
/*
  on get request to this route:
    read tables `dreams`, `tags` and `dreams_tags` from database `dreams`
    send data to client

*/
app.get('/', (request, response) => {
  console.log("request: ", request.method, request.url);

  return query("SHOW DATABASES LIKE 'dreams'")
    .then(() => {
      return query('SELECT * FROM dreamlog');
    })
    .then(dreamlogData => {
      console.log("dreamlog table data: ", dreamlogData);
      response.status(200).json(dreamlogData);
    })
    .catch((error) => console.error(error));
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});