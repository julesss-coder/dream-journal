import React, { useEffect, useState } from 'react';
import './App.css';

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
import DreamTagCloud from './components/DreamTagCloud.jsx';

function App() {
  const [dreams, setDreams] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [selectedDreamId, setSelectedDreamId] = useState(null);
  const [dreamsUpdated, setDreamsUpdated] = useState(true);
  const [tagData, setTagData] = useState(null);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCloudView, setIsCloudView] = useState(false);
  const [tagCloudData, setTagCloudData] = useState([]);
  const [filteredDreams, setFilteredDreams] = useState({currentTag: null, dreamIds: []});

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
        setIsError(false);
      } catch (error) {
        console.error('A problem occurred when fetching the data: ', error);
        setIsError(true);
        setErrorMessage("A problem occurred when trying to get your dreams from the database. Please refresh the page to try again.");
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
    setIsCloudView(false);
  };
  
  // TODO: Why does this return 0 as the `newDreamId` the first time it is called?
  const handleAddDream = () => {
    let newDreamId = getLastDreamId() + 1;

    let newDream = {
      "dream_id": newDreamId,
      "user_id": 1, // TODO Change depending on user logged in
      "title": "Untitled",
      "description": null,
      "thoughts": null,
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

    // setDreams(prevDreams => [...prevDreams, newDream]);
    setDreamsUpdated(true);
    setSelectedDreamId(newDreamId);
    setIsCloudView(false);
  };

  // Handles input in dream editor form, except for tag input (see `handleTagInput()`)
  const handleFormInput = (dreamId, prop, value) => {
    console.log("handleFormInput() runs");
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

    // setDreams(prevDreams => {
    //   return prevDreams.map(dream => {
    //     if (dream.dream_id === dreamId) {
    //       return {
    //         ...dream,
    //         [prop]: value,
    //         lastEdited: new Date(Date.now()).toUTCString()
    //       };
    //     } else {
    //       return dream;
    //     }
    //   });
    // });
    setDreamsUpdated(true);
  };

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
    .then(data => {
      console.log(data.message);
      setDreamsUpdated(true);
    })
    .catch(error => console.error(error));
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
    // setDreams(prevDreams => {
    //   return prevDreams.filter(dream => {
    //     return selectedDreamId !== dream.dream_id;
    //   });
    // });

    // Update tags
    setSelectedDreamId(null);
    setDreamsUpdated(true);
  };

  const handleCloudViewClick = () => {
    console.log("handleCloudViewClick() runs");
    setIsCloudView(true);

    fetch('http://localhost:8000/tagCloudView', {
      method: 'GET'
    })
    .then(response =>  response.json())
    .then(tagCountData => {
      console.log("tag cloud data from backend: ", tagCountData);
      setTagCloudData(tagCountData);
    })
    .catch(error => console.error(error));
  };

  const handleTagClick = (tag) => {
    console.log("handleTagClick, tag: ", tag);
    fetch(`http://localhost:8000/getDreamsWithTag?tagValue=${encodeURIComponent(tag.value)}`, {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
      }
    })
    .then(response =>  response.json())
    .then(filteredDreamIds => {
      setFilteredDreams(prevFilteredDreams => ({
        ...prevFilteredDreams,
        currentTag: tag.value,
        dreamIds: filteredDreamIds.data
      }));
      setOpen(true);

      // I don't need to fetch the current dreams from the backend, as the local state will be up-to-date after any change to a dream.

    })
    .catch(error => console.error(error));
  };

  const handleClearTagFilter = () => {
    setFilteredDreams(prevFilteredDreams => ({
      ...prevFilteredDreams,
      currentTag: null, 
      dreamIds: []
    }));
  };

  console.log("dreams: ", dreams);
  console.log("selectedDreamId: ", selectedDreamId);
  console.log("isError: ", isError);
  console.log("filteredDreams: ", filteredDreams);

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
        dreams={
          isCloudView === true && filteredDreams.dreamIds.length > 0 ?
          dreams.filter(dream => filteredDreams.dreamIds.includes(dream.dream_id)) :
          dreams
        }
        handleDreamClick={handleDreamClick}
        currentTag={filteredDreams.currentTag}
        handleClearTagFilter={handleClearTagFilter}
      />
      
      {/* Tag Cloud */}
      { isCloudView === true && (
        <DreamTagCloud 
          tagCloudData={tagCloudData}
          handleTagClick={handleTagClick}
        />
      )}

      {/* Dream Editor */}
      { isCloudView === false && (
        <DreamEditor 
          selectedDreamId={selectedDreamId}
          handleDeleteDream={handleDeleteDream}
          dreams={dreams}
          tagData={tagData}
          handleFormInput={handleFormInput}
          handleTagInput={handleTagInput}
          isError={isError}
          errorMessage={errorMessage}
        />
      )}

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
        <BottomNavigationAction 
          label="Cloud View" 
          icon={<BubbleChartIcon />} 
          onClick={handleCloudViewClick}
        />
      </BottomNavigation>
    </Box>
  );
}

export default App;