# Requirements general
- [x] Set password for database
- [ ] Add database security
- [x] Create `dreams` database.
- [x] Create table `dream_log`.
- [x] Create table `dream_tags`.
- [ ] Create table `users`.
- [x] Add dummy data to tables `dream_log` and `dream_tags`.
- [?] Update serverside code for all routes after changing database design.
- [x] Update clientside code for all crud operations after changing database design.
    - [x] Read dream
        - [x] Format create date to weekday, date
    - [x] Add dream
    - [x] Delete dream
        - [x] On deleting a dream, also delete all entries in dream_tags with this dream_id
    - [x] Update dream
        - [x] Reduce number of HTTP requests - send update to backend once user stops typing
        - [x] Implement server route for updating dream_tags table.
- [x] Add user-friendly error message in component when database query fails
    
- [ ] Use transactions when updating dream tags? Or in general?
- [ ] Comment out unnecessary calls to setState()
- [ ] Async in frontend (and backend): Decide between using then() and async/await. Read up on both.
- [ ] Should I keep setting `dreams` in local state in case the database request goes wrong? Or if it does, would it not be better to let the user know instead of keeping working with data from local state?

## General todos
- [ ] Add complete error handling - send response to frontend

## Requirements for tags in dream view
- [ ] Tags can be added by writing comma-separated text. If a tag consists of more than one word, write it in camelCase. Otherwise, the single words will be saved as indivual tags. 
- [ ] Saved tags are displayed as comma-separated words.
 ### Database design for tags in dream view
 - Tags can be saved as a string.
 - If required, make a table with a 1-n relationship between a dream and its tags. I.e. one extra table

 Table dreamTags:
 ================
 DreamId | TagID | Tag
 ---------------------
 1       | 1     | "money"
 1       | 2     | "lottery"
 1       | 3     | "luck"
 2       | 4     | "money"
 2       | 5     | "flying"

 SQL query to create `dreamTags`:
 CREATE TABLE dream_tags (
    DreamId INT,
    TagID INT AUTO_INCREMENT,
    Tag VARCHAR(255),
    PRIMARY KEY (TagID)
);

 Cons:
 - redundancy
 Pros:
 - Each dream has its own set of tags. Changing a tag in one dream does not change it in another this tag is associated with, as would be the case when using a `tags` table (tagId, tag text) and a junction table (dream id, tag Id).

 Example:
 - In dream 1, I change the tag "money" to "gold".
 => In table `dreamTags`, I search for dream with tag "money" and change the value to "gold". The id stays the same.

 SQL query to update a tag:
 UPDATE `dream_tags` SET Tag = 'gold' WHERE DreamId = 1 AND Tag = 'money';

 ### How to find out the number of occurrences of each tag?
 Table dreamTags:
 ================
 DreamId | TagID | Tag
 ---------------------
 1       | 1     | "money"
 1       | 2     | "lottery"
 1       | 3     | "luck"
 2       | 4     | "money"
 2       | 5     | "flying"

 SQL query:
 SELECT Tag, COUNT(*) as Count
FROM dream_tags
GROUP BY Tag;


### How to find all dreams where tag with text `x` occurs?
Select dreamId from dreamTags where tag = "money"

# Requirements tag cloud
- [ ] Clicking "cloud view" renders tag cloud in new view (sider still accessible)
- [ ] The more dreams a tag is contained in, the bigger the tag text.
- [ ] On clicking a tag, sidebar should list all dreams that contain this tag.

Suggested library: reacttagcloud: URL: https://www.npmjs.com/package/react-tagcloud. Requires value and count for each element of the cloud. Has onClick handler for each element. 

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
- [x] Display tags in frontend on read operation - see `data` in App.js, line 39
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

======

# Strategoes for improving the performance of web apps (GitHub CoPilot)

Sure, here are descriptions of those strategies:

1. **Caching**: Caching is the process of storing copies of files in a cache, or temporary storage location, so that they can be accessed more quickly. There are many different types of caching that can be implemented, including browser caching, server caching, and database caching. For example, you might cache the results of a database query so that the next time the same query is made, it can be retrieved from the cache instead of hitting the database again.

2. **Batching Updates**: Batching is the process of grouping related operations together so that they can be executed in a single operation. This can significantly reduce the overhead of performing many small operations. For example, instead of sending a network request every time a user types a character in a form, you might batch these updates together and send a single network request when the user finishes typing.

3. **Moving Processing to the Client Side**: This strategy involves performing some of the processing on the client side (i.e., in the user's browser) instead of on the server. This can reduce server load and network latency, leading to a faster and more responsive application. However, it's important to be mindful of the user's device capabilities and network conditions, as too much client-side processing can lead to a slow or unresponsive application on less powerful devices or slow networks. 

For example, instead of having the server render HTML and send it to the client, you might use a JavaScript framework like React to render HTML on the client side. Or, instead of performing all data validation on the server, you might perform some basic validation on the client side to provide immediate feedback to the user.