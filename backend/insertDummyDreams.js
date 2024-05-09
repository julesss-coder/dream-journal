const mySQL = require('mysql');
require('dotenv').config();
const util = require('util');

const connection = mySQL.createConnection({
  host: 'localhost',
  user: 'dreamjournaluser',
  password: process.env.DB_PASSWORD
});

const query = util.promisify(connection.query).bind(connection);

const insertDummyDreams = () => {
  return query(`USE dreams`)
  .then(() => {
    return query(`INSERT INTO dream_log 
    VALUES 
    (1, 1, "Flying in the sky", "I had a dream where I was flying above the clouds.", "Don't know yet", NOW(), NOW()),
    (2, 2, "Meeting a celebrity", "I dreamt that I met my favorite actor Christian Bale and we had a conversation.", "Don't know yet", NOW(), NOW()),
    (3, 2, "Winning the lottery", "I dreamt that I won the lottery jackpot without even playing.", "Don't know yet", NOW(), NOW())`)
  })
  .then(() => {
    console.log("Dummy data inserted into `dream_log`");
    // dream_id, tag_text
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
  })
  .then(() => console.log("Dummy data inserted into `dream_tags`."))    
  .catch(error => console.error(error))
  // .finally(() => connection.end());
};

module.exports = insertDummyDreams;
