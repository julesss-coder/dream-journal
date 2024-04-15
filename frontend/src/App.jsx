import React, { useEffect, useState } from 'react';
import Typography from '@mui/joy/Typography';
import Box from '@mui/joy/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import IconButton from '@mui/joy/IconButton';
import Drawer from '@mui/joy/Drawer';
import ModalClose from '@mui/joy/ModalClose';
import Menu from '@mui/icons-material/Menu';
import Input from '@mui/joy/Input';
import List from '@mui/joy/List';
import ListItemButton from '@mui/joy/ListItemButton';
import Search from '@mui/icons-material/Search';




function App() {
  const [dreams, setDreams] = useState(null);
  const [open, setOpen] = React.useState(false);

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
      variant="outlined" 
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
        // bgcolor: "lightgray",
      }}  
    >
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
      <Drawer 
        open={open} 
        onClose={() => setOpen(false)}
        color="primary"
        invertedColors
        size="sm"
        variant="soft"  
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            ml: 'auto',
            mt: 1,
            mr: 2,
          }}
        >
          <Typography
            component="label"
            htmlFor="close-icon"
            fontSize="sm"
            fontWeight="lg"
            sx={{ cursor: 'pointer' }}
          >
            Close
          </Typography>
          <ModalClose id="close-icon" sx={{ position: 'initial' }} />
        </Box>
        <Input
          size="sm"
          placeholder="Search"
          variant="plain"
          endDecorator={<Search />}
          slotProps={{
            input: {
              'aria-label': 'Search anything',
            },
          }}
          sx={{
            m: 3,
            borderRadius: 0,
            borderBottom: '2px solid',
            borderColor: 'neutral.outlinedBorder',
            '&:hover': {
              borderColor: 'neutral.outlinedHoverBorder',
            },
            '&::before': {
              border: '1px solid var(--Input-focusedHighlight)',
              transform: 'scaleX(0)',
              left: 0,
              right: 0,
              bottom: '-2px',
              top: 'unset',
              transition: 'transform .15s cubic-bezier(0.1,0.9,0.2,1)',
              borderRadius: 0,
            },
            '&:focus-within::before': {
              transform: 'scaleX(1)',
            },
          }}
        />
        <List
          size="lg"
          component="nav"
          sx={{
            flex: 'none',
            fontSize: 'xl',
            '& > div': { justifyContent: 'flex-start' },
          }}
        >
          {
            dreams && dreams.map(dream => (
              <ListItemButton>{dream.title}</ListItemButton>
            ))
          }
        </List>
      </Drawer>
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
