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

  useEffect(() => {
    const fetchDreams = async () => {
      try {
        // let response = await fetch('http://localhost:4000/dreams');
        let response = await fetch('http://localhost:8000');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        let data = await response.json();

        /*
        Here we get data from tables `dreamlog`, `tags` and `dreams_tags`. 
        Combine these before setting dreams.



        */
        console.log("data from backend: ", data);
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
        if (dream.id > lastDreamId) {
          lastDreamId = dream.id;
        }
      });
    }

    return lastDreamId;
  };

  const handleDreamClick = (dreamId, e) => {
    setSelectedDreamId(dreamId);
    setOpen(false);
  };
  
  // TODO: Why does this return 0 as the `newDreamId` the first time it is called?
  const handleAddDream = () => {
    let newDreamId = getLastDreamId() + 1;

    let newDream = {
      "id": newDreamId,
      "userId": 1, // TODO Change depending on user logged in
      "title": "test",
      "description": "",
      "thoughts": "No thoughts just yet.",
      "dateCreated": new Date(Date.now()).toUTCString(),
      "lastEdited": null,
    };

    fetch('http://localhost:8000', {
      method: 'POST', 
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(newDream),
    })
    .then(response => console.log("response: ", response));

    setDreams(prevDreams => [...prevDreams, newDream]);
    setDreamsUpdated(true);
    setSelectedDreamId(newDreamId);
  };

  const handleFormInput = (dreamId, prop, value) => {
    if (prop === "tags") {
      setDreams(prevDreams => {
        return prevDreams.map(dream => {
          if (dream.id === dreamId) {
            return {
              ...dream,
              [prop]: value.split(", ").map(tag => tag.trim()).filter(tag => tag !== ""),
              lastEdited: new Date(Date.now()).toUTCString()
            };
          } else {
            return dream;
          }
        });
      });
    } else {
      fetch('http://localhost:8000', {
        method: 'PUT', 
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({dreamId, prop, value})
      });


      setDreams(prevDreams => {
        return prevDreams.map(dream => {
          if (dream.id === dreamId) {
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
    }
  };

  const handleDeleteDream = () => {
    fetch('http://localhost:8000', {
      method: 'DELETE', 
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({dreamId: selectedDreamId})
    });

    // Update dreams
    // Setting `dreams` in the local state triggers effect that fetches dreams from database, so it is not necessary. => How to solve this?
    setDreams(prevDreams => {
      return prevDreams.filter(dream => {
        return selectedDreamId !== dream.id;
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
        handleFormInput={handleFormInput}
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