// GOAL: Finish testing and correcting functions in app.jsx

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
import { ColorRing } from 'react-loader-spinner';

// Custom component imports
import DreamEditor from './components/DreamEditor.jsx';
import Sider from './components/Sider.jsx';
import DreamTagCloud from './components/DreamTagCloud.jsx';

function App() {
  const [loading, setLoading] = useState(false);
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
        setLoading(false);
      } catch (error) {
        console.error('A problem occurred when fetching the data: ', error);
        setIsError(true);
        setErrorMessage("A problem occurred when trying to get your dreams from the database. Please refresh the page to try again.");
      }
    };

    // When a dream is added/deleted/edited, I don't send the updated data from the backend. Instead, I fetch the updated data from the frontend. Then I set the local state `dreams` to this new data.
    // Reason: I want to make sure the frontend always displays the most up-to-date data.
    // Alternative to possibly implement later: Web Sockets or Server Sent Events
    if (dreamsUpdated === true) {
      console.log("useEffect runs");
      setLoading(true)
      fetchDreams();
      setDreamsUpdated(false);
    }
  }, [dreamsUpdated]);

  // - [x] OK
  const getLastDreamId = () => {
    let lastDreamId = -1;
    if (dreams.length > 0) {
      dreams.forEach(dream => {
        if (dream.dream_id > lastDreamId) {
          lastDreamId = dream.dream_id;
        }
      });
    }

    return lastDreamId;
  };

  // - [X] OK
  const handleDreamClick = (dreamId) => {
    setSelectedDreamId(dreamId);
    setOpen(false);
    setIsCloudView(false);
  };
  
  // - [ ] OK
  const handleAddDream = () => {
    let newDreamId = getLastDreamId() + 1;

    let newDream = {
      "dream_id": newDreamId,
      "user_id": 1, // TODO Change depending on user logged in
      "title": "Untitled",
      "description": null,
      "thoughts": null,
      // `date_created` and `last_edited` will be set in backend
      "date_created": null,
      "last_edited": null,
    };

    setLoading(true);
    fetch('http://localhost:8000', {
      method: 'POST', 
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(newDream),
    })
    .then(response => response.json())
    .then(data => {
      console.log(data.message);
      setLoading(false);
      setDreamsUpdated(true);
      setSelectedDreamId(newDreamId);
      setIsCloudView(false);
    })
    .catch(error => console.error(error));
  };

  // -[x] OK
  // Handles input in dream editor form, except for tag input (see `handleTagInput()`)
  const handleFormInput = (dreamId, prop, value) => {
    fetch('http://localhost:8000/updateDreamLog', {
      method: 'PUT', 
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({dreamId, prop, value})
    })
    .then(response => response.json())
    .then(data => {
      console.log(data.message);
      setDreamsUpdated(true);
    })
    .catch(error => console.error(error));
  };

  // - [x] OK
  const handleTagInput = (dreamId, value) => {
    let tagsToUpdate = tagData.filter(entry => entry.dream_id === dreamId);
    let newTagTexts = value.split(", ").map(tag => tag.trim()).filter(tag => tag !== "");
    // Remove duplicate entries from `newTagTexts`
    newTagTexts = [...new Set(newTagTexts)];

    // If there are more new tags than old tags:
    // Update the entries in `tagsToUpdate` with the new tag text in `newTagTexts`
    if (newTagTexts.length >= tagsToUpdate.length) {
      for (let i = 0; i < tagsToUpdate.length; i++) {
        tagsToUpdate[i].tag_text = newTagTexts[i];
      }
      
      // For all the newly added tags, create new entries in tagsToUpdate
      for (let i = tagsToUpdate.length; i < newTagTexts.length; i++) {
        let newTagEntry = {dream_id: dreamId, tag_id: null, tag_text: newTagTexts[i]};
        tagsToUpdate.push(newTagEntry);
      }
    }
    // Else if there are fewer tags than before:
    // Replace, the previous tags with the new ones
    else if (tagsToUpdate.length > newTagTexts.length) {
      for (let i = 0; i < newTagTexts.length; i++) {
        tagsToUpdate[i].tag_text = newTagTexts[i];
      }

      // Delete the rest of the previous tags
      tagsToUpdate = tagsToUpdate.slice(0, newTagTexts.length);
    }
    
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

  // - [x] OK
  const handleDeleteDream = () => {
    setLoading(true);
    fetch('http://localhost:8000', {
      method: 'DELETE', 
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({dreamId: selectedDreamId})
    })
    .then(response => response.json())
    .then(data => {
      console.log(data.message);
      setLoading(false);
      setDreamsUpdated(true);
      // Update tags
      setSelectedDreamId(null);
    })
    .catch(error => console.error(error));
  };

  const handleCloudViewClick = () => {
    setIsCloudView(true);
    setLoading(true);

    fetch('http://localhost:8000/tagCloudView', {
      method: 'GET'
    })
    .then(response =>  response.json())
    .then(tagCountData => {
      console.log("tag cloud data from backend: ", tagCountData);
      setTagCloudData(tagCountData);
      setLoading(false);
    })
    .catch(error => console.error(error));
  };

  const handleTagClick = (tag) => {
    setLoading(true);
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
      setLoading(false);

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
  console.log("tagData: ", tagData);
  console.log("selectedDreamId: ", selectedDreamId);
  console.log("isError: ", isError);
  console.log("filteredDreams: ", filteredDreams);

  if (loading === true && isError === false) {
    console.log("==========LOADING===========");
    return (
      <Box
        sx={{
          height: "90vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <ColorRing
          visible={true}
          height="80"
          width="80"
          ariaLabel="color-ring-loading"
          wrapperStyle={{}}
          wrapperClass="color-ring-wrapper"
          colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']}
        />
      </Box>
    );
  } 

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
          width: "100%",
          backgroundColor: "#F0F4F8"
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