- [x] Set password for database
- [ ] Add database security
- [x] Create `dreams` database.
- [x] Create table `dreams`.
- [x] Create table `tags`.
- [ ] Create table `users`.
- [x] Create table `dream_tags`, describing the m:n relationship between `dreams` and `tags`.
- [x] Add dummy data to tables `dreams`, `tags` and `dream_tags`.

GOAL
- [x] Path for adding dream. Save new dream and display it in frontend.
- [x] Path for deleting dream. Update database display it in frontend.
- [ ] Path for updating new dream. Update database and display u pdated data in frontend.
- [ ] Update tags on all crud operations
    - [x] on delete
    - [ ] on add: not necessary - no tags in newly created dream
    - [x] in `insertDummyDreams()`
    - [ ] on update
        - [x] Update content except tags
        - [ ] Update tags
- [*] Display tags in frontend on read operation - see `data` in App.js, line 39
- [ ] Frontend: Set `dreamsUpdated` instead of setting `dreams` in local state

QUESTIONS   
- Do I need to adapt the frontend to the new database structure, ie. create a `tags` database and add the tags there instead of to `dreams`?

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
);

CREATE TABLE tags (
    id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tag VARCHAR(255) NOT NULL,
    UNIQUE (tag)
);

// m to n relationship: One dream has 0 - * tags. One tag is contained in 1 to * dreams.
CREATE TABLE dream_tags (
    dream_id SMALLINT UNSIGNED,
    tag_id SMALLINT UNSIGNED,
    PRIMARY KEY (dream_id, tag_id),
    FOREIGN KEY (dream_id) REFERENCES dreams(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
);



