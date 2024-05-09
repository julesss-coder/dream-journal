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
    return query(`CREATE TABLE IF NOT EXISTS dream_log (
      dream_id INT PRIMARY KEY, 
      user_id INT, 
      title VARCHAR(255), 
      description TEXT, 
      thoughts TEXT, 
      date_created DATETIME, 
      last_edited DATETIME
    )`);
  })
  .then(() => {
    console.log("Table `dream_log` created, or already exists.");
    return query(`CREATE TABLE IF NOT EXISTS dream_tags (
      dream_id INT,
      tag_id INT AUTO_INCREMENT,
      tag_text VARCHAR(255),
      PRIMARY KEY (tag_id)
    )`);
  })
  .then(() => {
    console.log("Table `dream_tags` created, or already exists.");
    // Add dummy dreams if table `dream_log` is empty
    return query('SELECT * FROM dream_log');
  })
  .then(dream_logData => {
    if (dream_logData.length === 0) {
      return query(`INSERT INTO dream_log 
        VALUES 
        (1, 1, "Flying in the sky", "I had a dream where I was flying above the clouds.", "Don't know yet", NOW(), NOW()),
        (2, 2, "Meeting a celebrity", "I dreamt that I met my favorite actor Christian Bale and we had a conversation.", "Don't know yet", NOW(), NOW()),
        (3, 2, "Winning the lottery", "I dreamt that I won the lottery jackpot without even playing.", "Don't know yet", NOW(), NOW())`)
      .then(() => {console.log("Dummy data inserted into table `dream_log`.")})
    }
  })
  .then(() => {
    return query('SELECT * FROM dream_tags');
  })
  .then((dreamtagData) => {
    // Add dummy tags if table `dream_tags` is empty
    if (dreamtagData.length === 0) {
      return query(`INSERT INTO dream_tags (dream_id, tag_text)
        VALUES
        (1, "flying"),
        (2, "celebrity"),
        (3, "winning"),
        (3, "money"),
        (3, "lottery"),
        (4, "alternateReality"), 
        (4, "dailyLife")
      `)
      .then(() => console.log('Dummy data inserted into table `dream_tags`.'));
    }
  })
  .catch((error) => console.error(error));
});

// Routes
// get data from dream_log and dream_tags and send to frontend in one object
app.get('/', (request, response) => {
  let dreamData = {};

  // Do I need to use prepared statements in all cases, or only where values are inserted?
  return query("SHOW DATABASES LIKE 'dreams'")
  // Get data from table `dream_log`
    .then(() => {
      return query('SELECT * FROM dream_log');
    })
    .then(dream_logData => {
      // Format dream_logData into an object where the dream ids are the keys
      const dreams = {};
      for (const dream of dream_logData) {
        dreams[dream.dream_id] = dream;
      }

      dreamData.dreams = dreams;
      return query('SELECT * FROM dream_tags');
    })
    .then(dreamTagData => {
      const dreamTags = {};
      for (const dreamIdTagPair of dreamTagData) {
        dreamTags[dreamIdTagPair.tag_id] = dreamIdTagPair;
      }
      dreamData.tags = dreamTags;
      response.status(200).json(dreamData);
    })
    .catch((error) => console.error(error));
});

// Add a dream
// Table `dream_tags` is not updated, as a new dream does not have tags
app.post("/", (request, response) => {
  return query("SHOW DATABASES LIKE 'dreams'")
    .then(() => {
      let sql = `INSERT INTO dream_log VALUES (?, ?, ?, ?, ?, NOW(), NULL)`;
      let valuesToInsert = Object.values(request.body);
      console.log("valuesToInsert: ", valuesToInsert);
      sql = mySQL.format(sql, valuesToInsert);
      return query(sql);
    })
    .then(() => {
      console.log("Successfully added new dream to database 'dream_log'.");
      response.status(200).json({message: "Received POST request"});
    })
    .catch((error) => console.error(error));
});

// Delete a dream
/*
Delete the dream with the given id from table `dream_log`

In `dream_tags`: 
  Delete all entries with the given dream_id
*/
app.delete("/", (request, response) => {
  const {dreamId} = request.body;

  let sql = 'DELETE FROM `dream_log` WHERE `id` = ?';
  sql = mySQL.format(sql, dreamId);
  return query(sql)
  .then(() => {
    console.log(`Successfully deleted dream with dreamid ${dreamId}.`);
    sql = 'DELETE FROM `dream_tags` WHERE `dream_id` = ?';
    sql = mySQL.format(sql, dreamId);
    return query(sql)
  })
  .then(() => {
    console.log(`Successfully deleted entry in 'dream_tags' with dream_id ${dreamId}.`);
    response.status(200).json({message: `Successfully deleted dream with dreamid ${dreamId} and it tags.`});
  })
  .catch(error => console.error(error));
});

app.put("/", (request, response) => {
  const {dreamId, prop, value} = request.body;
  console.log(dreamId, prop, value);

  // update dream_log set prop = value, lastEdited = now() where id = dreamId
  let sql = 'UPDATE `dream_log` SET ?? = ?, lastEdited = NOW() WHERE id = ?';
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