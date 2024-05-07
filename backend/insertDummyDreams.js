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
    return query(`INSERT IGNORE INTO dreamlog 
    VALUES 
    (1, 1, "Flying in the sky", "I had a dream where I was flying above the clouds.", "Don't know yet", NOW(), NOW()),
    (2, 2, "Meeting a celebrity", "I dreamt that I met my favorite actor Christian Bale and we had a conversation.", "Don't know yet", NOW(), NOW()),
    (3, 2, "Winning the lottery", "I dreamt that I won the lottery jackpot without even playing.", "Don't know yet", NOW(), NOW())`)
  })
  .then(() => {
    console.log("Dummy data inserted into `dreams`");
  })
  .then(() => {
    return query(`INSERT IGNORE INTO tags
      VALUES
      (1, "flying"),
      (2, "celebrity"),
      (3, "winning"),
      (4, "money"),
      (5, "lottery"),
      (6, "alternateReality"), 
      (7, "dailyLife")
    `)
  })
  .then(() => console.log("Dummy data inserted into `tags`."))    
  .then(() => {
    return query(`INSERT IGNORE INTO dreamTags
    VALUES
      (1, 1),
      (2, 2),
      (3, 3),
      (3, 4),
      (3, 5),
      (4, 6),
      (4, 7)
    `)
  })
  .then(() => console.log("Dummy data inserted into `dreamTags`."))
  .catch(error => console.error(error))
  .finally(() => connection.end());
};

module.exports = insertDummyDreams;
