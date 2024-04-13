import React, { useEffect, useState } from 'react';
import Typography from '@mui/joy/Typography';
import Box from '@mui/joy/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';


function App() {
  const [dreams, setDreams] = useState(null);

  useEffect(() => {
    const fetchDreams = async () => {
      try {
        let response = await fetch('http://localhost:4000/dreams');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let data = await response.json();
        setDreams(data);
      } catch (error) {
        console.error('A problem occurred when fetching the data: ', error);
      }
    };

    fetchDreams();
  }, []);

  console.log("dreams: ", dreams);

  return (
    <Box 
      component="main"
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
        bgcolor: "lightgray",
      }}  
    >
      <Typography>
        Test
      </Typography>
      <BottomNavigation
        showLabels
        sx={{
          position: "fixed",
          top: "auto", 
          bottom: 0,
          width: "100%"
        }}
      >
        <BottomNavigationAction label="Add dream" icon={<AddCircleOutlineIcon/>} />
        <BottomNavigationAction label="Analyze" icon={<BubbleChartIcon />} />
      </BottomNavigation>
    </Box>
    
  );
}

export default App;
