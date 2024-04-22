import React, { Fragment, useEffect, useState } from 'react';
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
import FormControl from '@mui/joy/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Chip from '@mui/joy/Chip';
import ChipDelete from '@mui/joy/ChipDelete';
import Dropdown from '@mui/joy/Dropdown';
import MenuButton from '@mui/joy/MenuButton';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import DeleteForever from '@mui/icons-material/DeleteForever';
import MenuItem from '@mui/joy/MenuItem';
import MoreVert from '@mui/icons-material/MoreVert';
import JoyUiMenu from '@mui/joy/Menu';
import TextField from '@mui/material/TextField';






function App() {
  const [dreams, setDreams] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [selectedDreamId, setSelectedDreamId] = useState(null);
  const [tagInput, setTagInput] = useState('');

  let timer;



  useEffect(() => {
    const fetchDreams = async () => {
      console.log("fetchDreams() runs");
      try {
        let response = await fetch('http://localhost:4000/dreams');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        let data = await response.json();
        console.log("data: ", data);
        setDreams(data);
      } catch (error) {
        console.error('A problem occurred when fetching the data: ', error);
      }
    };

    fetchDreams();
    // Should run 1) on first render, 2) when new dream added, 3) when dream deleted, 4) when dream edited
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
    console.log("handleDreamClick() runs, dreamId: ", dreamId, e);
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

  // const handleFormInput = setTimeout((dreamId, prop, e) => {
  //   console.log("handleFormInput() runs, dreamId: ", dreamId, prop, e);
  //   /*
  //     On every input, input is added to title

  //   */
  // }, 1000);
  // const handleFormInput = (dreamId, prop, e) => setTimeout(() => {
  //   console.log("handleFormInput() runs, dreamId: ", dreamId, prop, e);
  // }, 1000);

  const handleFormInput = (dreamId, prop, value) => {
    console.log("handleFormInput() runs, prop, value: ", prop, value);
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
  }




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
        // bgcolor: "lightgray",
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
            dreams.map(dream => (
              <ListItemButton
                key={dream.id}
                onClick={(e) => handleDreamClick(dream.id, e)}
              >
                {dream.title}
              </ListItemButton>
            ))
          }
        </List>
      </Drawer>

      {/* Dream editor */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          m: 2,
          // height: "98vh", 
          // width: "98vw"
          height: "100%"
        }}
      >
        {
          selectedDreamId !== null && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                // width: "10px"
                mb: 1,
              }}
            >
              <Dropdown
              >
                <MenuButton size="sm" sx={{ p: "6px" }}>
                  <MoreVert />
                </MenuButton>
                <JoyUiMenu placement='bottom-end'>
                  <MenuItem
                    variant="soft"
                    color="danger"
                    onClick={handleDeleteDream}
                  >
                    <ListItemDecorator sx={{ color: 'inherit' }}>
                      <DeleteForever />
                    </ListItemDecorator>
                    Delete dream
                  </MenuItem>
                </JoyUiMenu>
              </Dropdown>
            </Box>
          )
        }

        {
          selectedDreamId === null && <Typography>No dream selected.</Typography>
        }
        {/* 
        
          On change (with debounce): 
            Inhalt speichern im State
          Vor Rerender: 
            Überarbeiteten Traum in Datenbank speichern (in der Cleanup function)
        
        */}

        {
          selectedDreamId && (
            dreams.filter(dream => (
              dream.id === selectedDreamId
            )).map(dream => (
              <Box
                key={dream.id}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px"
                }}
              >
                <TextField
                  id="dream-title"
                  label="Dream title"
                  defaultValue={dream.title}
                  placeholder='Dream title'
                  multiline
                  fullWidth
                  onChange={(e) => {
                    clearTimeout(timer);
                    timer = setTimeout(() => {
                      // Passing in e.target.value instead of `e`, as `e` is nullified after `handleFormInput` is invoked. `setTimeout` then runs with nullified event object, so that `e.target.value` does not contain user input.
                      handleFormInput(dream.id, "title", e.target.value);
                    }, 1000);
                  }}
                />
                <TextField
                  id="date-created"
                  label="Created on:"
                  disabled
                  value={dream.dateCreated}
                />
                <TextField
                  id="last-edited"
                  label="Last edited on:"
                  disabled
                  value={dream.lastEdited}
                />
                <TextField
                  id="dream-description"
                  label="Dream description"
                  defaultValue={dream.description}
                  onChange={(e) => {
                    clearTimeout(timer);
                    timer = setTimeout(() => {
                      // Passing in e.target.value instead of `e`, as `e` is nullified after `handleFormInput` is invoked. `setTimeout` then runs with nullified event object, so that `e.target.value` does not contain user input.
                      handleFormInput(dream.id, "description", e.target.value);
                    }, 1000);
                  }}
                  multiline
                  fullWidth
                />
                <TextField
                  id="dream-thoughts"
                  label="Thoughts about my dream, interpretation etc."
                  defaultValue={dream.thoughts}
                  onChange={(e) => {
                    clearTimeout(timer);
                    timer = setTimeout(() => {
                      // Passing in e.target.value instead of `e`, as `e` is nullified after `handleFormInput` is invoked. `setTimeout` then runs with nullified event object, so that `e.target.value` does not contain user input.
                      handleFormInput(dream.id, "thoughts", e.target.value);
                    }, 1000);
                  }}
                  multiline
                  fullWidth
                />
                <TextField
                  id="dream-tags"
                  label="Dream tags"
                  defaultValue={dream.tags.join(", ")}
                  helperText="Use this format: tag, tagConsistingOfSeveralWords"
                  onChange={(e) => {
                    handleFormInput(dream.id, "tags", e.target.value);
                  }}
                  fullWidth
                  multiline
                />
              </Box>
            ))
          )
        }
      </Box>

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
