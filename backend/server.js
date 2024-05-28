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
const morgan = require('morgan');
const app = express();
const port = 8000;

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
const util = require('util');

const connection = mySQL.createConnection({
  host: 'localhost',
  user: 'dreamjournaluser',
  password: process.env.DB_PASSWORD
});

const query = util.promisify(connection.query).bind(connection);
const beginTransaction = util.promisify(connection.beginTransaction).bind(connection);
const commit = util.promisify(connection.commit).bind(connection);
const rollback = util.promisify(connection.rollback).bind(connection);

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
    /*
    For each dream_id, all tags are added to dream_tags. 
    => Tags can be duplicate across dreams (not in same dream).
    Reason: When updating a tag for dream X, I do not want to update it for the other dreams. 
    If I used an junction table that catalogues which tag is associated to which dream, and a table that lists tag_ids and their tags, then updating a tag in one dream would update it in the other dreams where it occurs, as well. 
    */
    console.log("Table `dream_log` created, or already exists.");
    // Creating an index for the tag_text column, as table `dream_tags` is often queried based on this column and this needs to be fast
    return query(`CREATE TABLE IF NOT EXISTS dream_tags (
      dream_id INT,
      tag_id INT AUTO_INCREMENT,
      tag_text VARCHAR(255),
      PRIMARY KEY (tag_id),
      INDEX idx_tag_text (tag_text)
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
  console.log("GET request received");
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
      response.status(200).json({message: "Received POST request to add a dream."});
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

  let sql = 'DELETE FROM `dream_log` WHERE `dream_id` = ?';
  sql = mySQL.format(sql, dreamId);
  return query(sql)
  .then(() => {
    console.log(`Successfully deleted dream with dream_id ${dreamId}.`);
    sql = 'DELETE FROM `dream_tags` WHERE `dream_id` = ?';
    sql = mySQL.format(sql, dreamId);
    return query(sql)
  })
  .then(() => {
    console.log(`Successfully deleted entry in 'dream_tags' with dream_id ${dreamId}.`);
    response.status(200).json({message: `Successfully deleted dream with dream_id ${dreamId} and its tags.`});
  })
  .catch(error => console.error(error));
});

// Update a dream (excluding the dream tags)
app.put("/updateDreamLog", (request, response) => {
  const {dreamId, prop, value} = request.body;
  console.log(dreamId, prop, value);

  // update dream_log set prop = value, lastEdited = now() where id = dreamId
  let sql = 'UPDATE `dream_log` SET ?? = ?, last_edited = NOW() WHERE dream_id = ?';
  sql = mySQL.format(sql, [prop, value, dreamId]);
  return query(sql)
  .then(() => {
    console.log(`Successfully updated dream with dream_id ${dreamId}.`);
    response.status(200).json({message: `Successfully updated dream with dream_id ${dreamId}.`});
  })
  .catch(error => console.log(error));
});

// Update a dream's tags
// TODO Decide if I want to use database transactions to make sure that ALL updates are performed
app.put("/updateDreamTags", (request, response) => {
  const {tagsToUpdate} = request.body;
  console.log("tagsToUpdate: ", tagsToUpdate);

  const tagIDs = [];
  for (const entry of tagsToUpdate) {
    if (entry.tag_id !== null) {
      tagIDs.push(entry.tag_id);
    }
  }
  console.log("tagIDs: ", tagIDs);
  
  let promiseChain = Promise.resolve();

  if (tagsToUpdate.length > 0) {
    if (tagIDs.length > 0) {
      // Delete no longer needed tags
      let deleteSql = 'DELETE FROM dream_tags WHERE dream_id = ? AND tag_id NOT IN (?)';
      deleteSql = mySQL.format(deleteSql, [tagsToUpdate[0].dream_id, tagIDs]);
      promiseChain = promiseChain.then(() => query(deleteSql));
    }

    // Update the tags that have a tag_id
    for (const entry of tagsToUpdate) {
      if (entry.tag_id !== null) {
        let updateSql = 'UPDATE dream_tags SET tag_text = ? WHERE dream_id = ? AND tag_id = ?';
        updateSql = mySQL.format(updateSql, [entry.tag_text, entry.dream_id, entry.tag_id]);
        promiseChain = promiseChain.then(() => query(updateSql));
      // Add newly created tags that don't have a tag_id yet
      } else if (entry.tag_id === null) {
        let addSql = 'INSERT INTO dream_tags(dream_id, tag_text) VALUES(?, ?)';
        addSql = mySQL.format(addSql, [entry.dream_id, entry.tag_text]);
        promiseChain = promiseChain.then(() => query(addSql));
      }
    }

    console.log("promiseChain: ", promiseChain);

    promiseChain
      .then(() => {
        console.log("All tag updates and deletions complete.");
        response.status(200).json({message: "All tag updates and deletes complete."});
      })
      .catch(error => {
        console.error("An error occurred: ", error);
      });
  }
});

// Tag cloud view
app.get("/tagCloudView", (request, response) => {
  let sql = `SELECT tag_text AS value, COUNT(tag_text) AS count
  FROM dream_tags
  GROUP BY value`;
  return query(sql)
  .then(data => {
    response.status(200).json(data);
  })
  .catch(error => {
    console.error(error);
    response.status(500).json({message: "There was a problem fetching your dream tags. Please try again."})
  });
});

app.get("/getDreamsWithTag", (request, response) => {
  let tag = request.query.tagValue;
  let sql = 'SELECT dream_id FROM dream_tags WHERE tag_text = ?';
  sql = mySQL.format(sql, [tag]);
  return query(sql)
  .then(dreamIds => {
    let dreamIdsFilteredByTagText = dreamIds.map(item => item.dream_id);
    response.status(202).json({data: dreamIdsFilteredByTagText})
    })
    .catch(error => console.error(error));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


// TODO when do I need to end the connection to sql?