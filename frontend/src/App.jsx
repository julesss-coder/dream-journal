import React, { useEffect, useState } from 'react';
// Library component imports
import Box from '@mui/joy/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import IconButton from '@mui/joy/IconButton';
import Menu from '@mui/icons-material/Menu';
// Custom component imports
import DreamEditor from './components/DreamEditor.jsx';
import Sider from './components/Sider.jsx';

function App() {
  const [dreams, setDreams] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [selectedDreamId, setSelectedDreamId] = useState(null);
  const [dreamsUpdated, setDreamsUpdated] = useState(true);
  const [tagData, setTagData] = useState(null);

  useEffect(() => {
    const fetchDreams = async () => {
      try {
        let response = await fetch('http://localhost:8000');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        let data = await response.json();
        console.log("data from backend: ", data);
        setTagData(Object.values(data.tags));
        setDreams(Object.values(data.dreams));
      } catch (error) {
        console.error('A problem occurred when fetching the data: ', error);
      }
    };

    // Once this is a fullstack project, this should run and fetch the updated dreams lit 1) on first render, 2) when a dream is added, 3) when a dream is deleted. 4) Also on every change to a dream? Debounce? Or only when navigating away from input field?  
    // It should also run 5) when an error is thrown, to make sure that the local state and the database have the same data, 3) on a page refresh, 6) periodically, in case this app ever support real-time updates (for example, if multiple users can update the same dream at the same time).
    if (dreamsUpdated === true) {
      console.log("useEffect runs");
      fetchDreams();
      setDreamsUpdated(false);
    }
  }, [dreamsUpdated]);

  const getLastDreamId = () => {
    let lastDreamId = -1;
    if (dreams.length > 0) {
      dreams.forEach(dream => {
        if (dream.dream_id > lastDreamId) {
          lastDreamId = dream.dream_id;
        }
      });
    }

    console.log("lastDreamId: ", lastDreamId);
    return lastDreamId;
  };

  const handleDreamClick = (dreamId) => {
    setSelectedDreamId(dreamId);
    setOpen(false);
  };
  
  // TODO: Why does this return 0 as the `newDreamId` the first time it is called?
  const handleAddDream = () => {
    let newDreamId = getLastDreamId() + 1;

    let newDream = {
      "dream_id": newDreamId,
      "user_id": 1, // TODO Change depending on user logged in
      "title": "test",
      "description": "",
      "thoughts": "No thoughts just yet.",
      // Will be set in backend
      "date_created": null,
      "last_edited": null,
    };

    fetch('http://localhost:8000', {
      method: 'POST', 
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(newDream),
    })
    .then(response => response.json())
    .then(data => console.log(data.message))
    .catch(error => console.error(error));

    setDreams(prevDreams => [...prevDreams, newDream]);
    setDreamsUpdated(true);
    setSelectedDreamId(newDreamId);
  };

  /*
  To reduce the number of HTTP requests, create the new tag data in the front end, so it only needs to be inserted in the backend (all entries for current dreamId deleted, new ones inserted?)

  Debounce the user input on tags field: only run `handleUserInput` 300ms after keyup event. If user types again before that, timer is reset. 

  Handle input and tag input separately

  To change tags in backend, pass in current tag data and new tag data so we can compare it in backend
  Get current tags for current dream:
    [money, winning, lottery]

  Changed tags are a string:
    Turn into array `new Tags`:
    For each element of newTags:
      If an element was changed

  */

      // TODO DEBOUNCE!!! It runs on every change!!
  const handleTagInput = (dreamId, value) => {
    console.log("handleTagInput() runs, dreamId, value: ", dreamId, value);
    // The filter operation needs to be done only the first time the tags are changed. After that, it is updated with the new tags and thus only contains entries for the current dreamId.
    let tagsToUpdate = tagData.filter(entry => entry.dream_id === dreamId);
    console.log("tagsToUpdate: ", tagsToUpdate);
    // TODO filter out additional commas
    let updatedTags = value.split(", ").map(tag => tag.trim()).filter(tag => tag !== "");
    // Remove duplicate entries from `updatedTags`
    updatedTags = [...new Set(updatedTags)];
    console.log("updatedTags: ", updatedTags);

    // If there are the same number of or more tags than before:
    // Replace the previous tags with the new ones
    if (tagsToUpdate.length <= updatedTags.length) {
      for (let i = 0; i < tagsToUpdate.length; i++) {
        tagsToUpdate[i].tag_text = updatedTags[i];
      }
      
      // For all the newly added tags, create new entries in tagsToUpdate
      for (let i = tagsToUpdate.length; i < updatedTags.length; i++) {
        let newTagEntry = {dream_id: dreamId, tag_id: null, tag_text: updatedTags[i]};
        tagsToUpdate.push(newTagEntry);
      }
    }
    // Else if there are fewer tags than before:
    // Replace, the previous tags with the new ones
    else if (tagsToUpdate.length > updatedTags.length) {
      for (let i = 0; i < updatedTags.length; i++) {
        tagsToUpdate[i].tag_text = updatedTags[i];
      }

      // Delete the rest of the previous tags
      tagsToUpdate = tagsToUpdate.slice(0, updatedTags.length);
    }
    
    console.log("updated tagsToUpdate: ", tagsToUpdate);

    fetch('http://localhost:8000/updateDreamTags', {
      method: 'PUT', 
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({tagsToUpdate}),
    })
    .then(response => response.json())
    .then(data => console.log(data.message))
    .catch(error => console.error(error));

    // TODO Before setting the local state, I need to actually update the tags in the backend.
    // setDreamsUpdated(true);
  };

  // Handles input in dream editor form, except for tag input (see `handleTagInput()`)
  const handleFormInput = (dreamId, prop, value) => {
    console.log("handleFormInput() runs");
    if (prop === "tags") {
      // console.log("tags: ", value);
      // setDreams(prevDreams => {
      //   return prevDreams.map(dream => {
      //     if (dream.dream_id === dreamId) {
      //       return {
      //         ...dream,
      //         [prop]: value.split(", ").map(tag => tag.trim()).filter(tag => tag !== ""),
      //         last_edited: new Date(Date.now()).toUTCString()
      //       };
      //     } else {
      //       return dream;
      //     }
      //   });
      // });

      /*
      Change data model to deal with tags: in current model, if changing the tag text for a tag used in one dream, it is also changed in the other dreams, but that should not be the case.

      ----------
      CoPilot: 

      You're correct. If tags are shared between dreams and can be edited independently by each dream, then updating the tag directly would affect all dreams that use that tag, which could lead to incorrect data.

      In this case, you might want to consider a different data model. Instead of having a many-to-many relationship between dreams and tags, you could have a one-to-many relationship between dreams and tags, and a many-to-one relationship between tags and dreams.

      This means that each dream has its own set of tags, and each tag can be associated with multiple dreams. When a tag is edited in one dream, a new tag is created and associated with that dream, but the original tag remains unchanged for the other dreams.

      Here's how you can implement this:

      1. When a tag is added to a dream, add a new entry to the `tags` table with the tag text and dream id, and get the id of the new tag.

      2. When a tag is edited in a dream, add a new entry to the `tags` table with the updated tag text and dream id
      -------------

      STRATEGY 1  **
      add tag to tags table
      each time tags are changed, update the whole entry in tags table? ie delete content and start table again? 
      lottery (id 1), money (id 2)
      if lottery is changed:
        update content of tag with id 1
        no need to update dreamTags

      else if lottery is deleted:
        update dreamTags
        if tagId is not in dreamTags anymore:
          delete this tag from tags table

      STRATEGY 2
      Store tags as one string
      SPlit by "," only when displaying them in the frontend - then no tables `tags` and `dreamTags` necessary
      BUT necessary for creating tag cloud:
        When showing tag cloud:
          // Delete content of tags and dreamTags table?
          For each dream in `dreamLog`:
            For each tag in dream:
              Add it to table `tags` with tag_id and text
              Add dreamId and tagId to table `dreamTags`

      */

    } else {
      fetch('http://localhost:8000/updateDreamLog', {
        method: 'PUT', 
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({dreamId, prop, value})
      })
      .then(response => response.json())
      .then(data => console.log(data.message))
      .catch(error => console.error(error));


      setDreams(prevDreams => {
        return prevDreams.map(dream => {
          if (dream.dream_id === dreamId) {
            return {
              ...dream,
              [prop]: value,
              lastEdited: new Date(Date.now()).toUTCString()
            };
          } else {
            return dream;
          }
        });
      });
      setDreamsUpdated(true);
    }
  };

  const handleDeleteDream = () => {
    fetch('http://localhost:8000', {
      method: 'DELETE', 
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({dreamId: selectedDreamId})
    })
    .then(response => response.json())
    .then(data => console.log(data.message))
    .catch(error => console.error(error));

    // Update dreams
    // Setting `dreams` in the local state triggers effect that fetches dreams from database, so it is not necessary. => How to solve this?
    setDreams(prevDreams => {
      return prevDreams.filter(dream => {
        return selectedDreamId !== dream.dream_id;
      });
    });

    // Update tags
    setSelectedDreamId(null);
    setDreamsUpdated(true);
  };

  console.log("dreams: ", dreams);
  console.log("selectedDreamId: ", selectedDreamId);

  return (
    <Box
      component="main"
      variant="outlined"
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
      }}
    >
      {/* Sider menu icon */}
      <IconButton
        variant="outlined"
        color="neutral"
        onClick={() => setOpen(true)}
        sx={{
          justifyContent: "flex-start"
        }}
      >
        <Menu />
      </IconButton>
      {/* Sider */}
      <Sider 
        open={open}
        setOpen={setOpen}
        dreams={dreams}
        handleDreamClick={handleDreamClick}
      />
      {/* Dream editor */}
      <DreamEditor 
        selectedDreamId={selectedDreamId}
        handleDeleteDream={handleDeleteDream}
        dreams={dreams}
        tagData={tagData}
        handleFormInput={handleFormInput}
        handleTagInput={handleTagInput}
      />

      {/* Bottom Nav */}
      <BottomNavigation
        showLabels
        sx={{
          position: "fixed",
          top: "auto",
          bottom: 0,
          width: "100%"
        }}
      >
        <BottomNavigationAction
          label="Add dream"
          icon={<AddCircleOutlineIcon />}
          onClick={handleAddDream}
        />
        <BottomNavigationAction label="Analyze" icon={<BubbleChartIcon />} />
      </BottomNavigation>
    </Box>
  );
}

export default App;