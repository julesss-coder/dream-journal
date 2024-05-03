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

  useEffect(() => {
    const fetchDreams = async () => {
      try {
        // let response = await fetch('http://localhost:4000/dreams');
        let response = await fetch('http://localhost:8000');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        let data = await response.json();
        setDreams(data);
      } catch (error) {
        console.error('A problem occurred when fetching the data: ', error);
      }
    };

    // Once this is a fullstack project, this should run 1) on first render only. On every change to a dream, I will update both the local state and the database, so they should have the same data. 
    // It should also run 2) when an error is thrown, to make sure that the local state and the database have the same data, 3) on a page refresh, 3) periodically, in case this app ever support real-time updates (for example, if multiple users can update the same dream at the same time).
    fetchDreams();
  }, []);

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

  const handleAddDream = () => {
    let newDreamId = getLastDreamId() + 1;

    let newDream = {
      "id": newDreamId,
      "userId": 1, // TODO Change depending on user logged in
      "title": "test",
      "description": "",
      "tags": [], 
      "dateCreated": new Date(Date.now()).toUTCString(),
      "lastEdited": null,
    };

    setDreams(prevDreams => [...prevDreams, newDream]);
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
    setDreams(prevDreams => {
      return prevDreams.filter(dream => {
        return selectedDreamId !== dream.id;
      });
    });
    setSelectedDreamId(null);
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