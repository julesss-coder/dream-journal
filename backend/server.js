/*
Database:
users: root, dreamjournaluser - different password
identification methods, passwords, etc. need to be configured for each user separately!!!
*/

require('dotenv').config();
const cors = require("cors")
const insertDummyDreams = require('./insertDummyDreams');
const mySQL = require('mysql');
const express = require('express');
const app = express();
const port = 8000;
app.use(express.json());
app.use(cors());
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
      id INT PRIMARY KEY AUTO_INCREMENT, 
      tag VARCHAR(255), 
      UNIQUE (tag)
    )`);
  })
  .then(() => {
    console.log("Table `tags` created, or already exists.");
    return query(`CREATE TABLE IF NOT EXISTS dreamTags (
      dream_id INT,
      tag_id INT,
      PRIMARY KEY (dream_id, tag_id),
      FOREIGN KEY (dream_id) REFERENCES dreamlog(id),
      FOREIGN KEY (tag_id) REFERENCES tags(id)
    )`);
  })
  .then(() => {
    console.log("Table `dreamTags` created, or already exists.");
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
  let dreamData = {};

  // Do I need to use prepared statements in all cases, or only where values are inserted?
  return query("SHOW DATABASES LIKE 'dreams'")
    .then(() => {
      return query('SELECT * FROM dreamlog');
    })
    .then(dreamlogData => {
      // if no dreams in dreamlog, insert dummy dreams and fetch data again (on page refresh)
      if (dreamlogData.length === 0) {
        insertDummyDreams();
        // return insertDummyDreams()
        // .then(() => {
        //   return query('SELECT * FROM dreamlog');
        // })
      } else {
        return dreamlogData;
      }
    })
    .then((dreamlogData) => {
      console.log("dreamLogData: ", dreamlogData);
      // Format dreamlogData into an object where the dream ids are the keys
      const dreams = {};
      for (const dream of dreamlogData) {
        dreams[dream.id] = dream;
      }

      dreamData.dreams = dreams;
      return query('SELECT * FROM tags');
    })
    .then((tagData) => {
      const tags = {};
      for (const tag of tagData) {
        tags[tag.id] = tag;
      }
      dreamData.tags = tags;
      return query('SELECT * FROM dreamTags');
    })
    .then((dreamsAndTagsData) => {
      const dreamIdTagIdPair = {};

      for (const tagPair of dreamsAndTagsData) {
        // Set dream_id as key of object
        dreamIdTagIdPair[tagPair.dream_id] = tagPair;
      }
      dreamData.dreamIdTagIdPair = dreamIdTagIdPair;
      response.status(200).json(dreamData);
    })
    .catch((error) => console.error(error));
});

// Add a dream
app.post("/", (request, response) => {
  return query("SHOW DATABASES LIKE 'dreams'")
    .then(() => {
      let sql = `INSERT INTO dreamlog VALUES (?, ?, ?, ?, ?, NOW(), NULL)`;
      let valuesToInsert = Object.values(request.body);
      console.log("valuesToInsert: ", valuesToInsert);
      sql = mySQL.format(sql, valuesToInsert);
      return query(sql);
    })
    .then(() => {
      console.log("Successfully added new dream to database 'dreamlog'.");
      response.status(200).json({message: "Received POST request"});
    })
  // TODO Update tables `tags` and `dreams_tags` as well

    .catch((error) => console.error(error));
});

// Delete a dream
app.delete("/", (request, response) => {
  console.log("request.body: ", request.body);
  const {dreamId} = request.body;
  console.log("id: ", typeof dreamId);

  // Delete the current dream's id from `dreamTags`, as it is a foreign key there (as `dream_id`)
  sql = 'DELETE FROM `dreamTags` WHERE `dream_id` = ?';
  sql = mySQL.format(sql, dreamId);
  return query(sql)
  .then(() => {
    console.log(`Successfully deleted entry in 'dreamTags' with dream_id ${dreamId}.`);

    // Delete all tags whose ids are not listed in the tag_id column of dreamTags
    sql = 'DELETE FROM `tags` WHERE `id` NOT IN (SELECT `tag_id` FROM `dreamTags`)';
    sql = mySQL.format(sql);
    return query(sql);
  })
  .then(() => {
    console.log("Successfully deleted all tags from `tags` that are not referenced in `dreamTags`.");
    
    // Delete dream from `dreamlog`
    let sql = 'DELETE FROM `dreamlog` WHERE `id` = ?';
    sql = mySQL.format(sql, dreamId);
    return query(sql);
  })
  .then(() => {
    console.log(`Successfully deleted dream with dreamid ${dreamId}.`);
    response.status(200).json({message: `Successfully deleted dream with dreamid ${dreamId} and it tags and tag references.`});
  })
  .catch(error => console.error(error));
});

app.put("/", (request, response) => {
  const {dreamId, prop, value} = request.body;
  console.log(dreamId, prop, value);

  // update dreamlog set prop = value, lastEdited = now() where id = dreamId
  let sql = 'UPDATE `dreamlog` SET ?? = ?, lastEdited = NOW() WHERE id = ?';
  sql = mySQL.format(sql, [prop, value, dreamId]);
  return query(sql)
  .then(() => {
    console.log(`Successfully updated dream with dreamId ${dreamId}.`);
    response.send(`Successfully updated dream with dreamId ${dreamId}.`);
  })
  .catch(error => console.log(error));
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


// TODO when do I need to end the connection to sql?