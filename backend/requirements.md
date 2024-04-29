- [ ] Set password for database
- [ ] Add database security
- [x] Create `dreams` database.
- [ ] Create table for dreams based on JSON server database `db.json`.
- [ ] Create table for users based on JSON server database `db.json`.
Currently no password, just start MySQL in Terminal with `sudo mysql`.


Table dreams
CREATE TABLE dreams (
    id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    userId SMALLINT UNSIGNED,
    title VARCHAR(255),
    description TEXT,
    thoughts TEXT,
    dateCreated DATETIME,
    lastEdited DATETIME 
)

CREATE TABLE tags (
    id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tag VARCHAR(255) NOT NULL,
    UNIQUE (tag) // was heisst das genau?
);

// Wie macht man eine many-to-one relatioship?
CREATE TABLE dream_tags (
    dream_id SMALLINT UNSIGNED,
    tag_id SMALLINT UNSIGNED,
    PRIMARY KEY (dream_id, tag_id),
    FOREIGN KEY (dream_id) REFERENCES dreams(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
);


create table dreams;

