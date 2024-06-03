import React, { useState } from 'react';
import Typography from '@mui/joy/Typography';
import Drawer from '@mui/joy/Drawer';
import ModalClose from '@mui/joy/ModalClose';
import Input from '@mui/joy/Input';
import List from '@mui/joy/List';
import ListItemButton from '@mui/joy/ListItemButton';
import Search from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import Box from '@mui/joy/Box';
import Clear from '@mui/icons-material/Clear';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import '../App.css';


function Sider({ 
  open,
  setOpen,
  dreams,
  handleDreamClick,
  currentTag,
  handleClearTagFilter
}) {
  const [searchTerm, setSearchTerm] = useState("");

  return (
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
        value={searchTerm}
        startDecorator={<Search fontSize="small" />}
        endDecorator={
            <ClearIcon 
              fontSize="small" 
              onClick={() => setSearchTerm("")}
            />   
        }
        onChange={(e) => setSearchTerm(e.target.value.trim().toLowerCase())}
        slotProps={{
          input: {
            'aria-label': 'Search anything',
          },
        }}
        sx={{
          px: "6px",
          py: "16px",
          m: "16px",
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
      { 
      currentTag && (
        <Box
          sx={{
            px: "6px",
            py: "16px",
            mx: "16px"
          }}
        >
          <Typography level="body-sm">Dreams filtered by tag "{currentTag}":</Typography>
          <Typography 
            startDecorator={<CancelOutlinedIcon/>} 
            level="body-sm"
            onClick={handleClearTagFilter}
          >Clear tag</Typography>
        </Box>
      ) 
      }
      <List
        size="lg"
        component="nav"
        sx={{
          flex: 'none',
          fontSize: 'lg',
          '& > div': { justifyContent: 'flex-start' },
          m:"16px",
        }}
        >
          {/* Should general search go through tags, too? */}
        {
          searchTerm.length > 0 && (
            dreams.filter(dream => {
              return (
                dream.title?.toLowerCase().includes(searchTerm) ||
                dream.description?.toLowerCase().includes(searchTerm) ||
                dream.thoughts?.toLowerCase().includes(searchTerm) 
                // ||
                // dream.tags.some(tag => tag.toLowerCase().includes(searchTerm))
              );
            }).map(dream => (
              <ListItemButton
                key={dream.dream_id}
                onClick={() => handleDreamClick(dream.dream_id)}
              >
                {
                  dream.title.length > 19 
                    ? dream.title.slice(0, 19) + '...'
                    : dream.title  
                }
              </ListItemButton>
            ))
          )
        }


        {
          searchTerm.length === 0 && (
            dreams.map(dream => (
              <ListItemButton
                key={dream.dream_id}
                onClick={(e) => handleDreamClick(dream.dream_id, e)}
              >
                {
                  dream.title.length > 19 
                    ? dream.title.slice(0, 19) + '...'
                    : dream.title  
                }
              </ListItemButton>
            ))
          )
        }
      </List>
    </Drawer>
  )
}

export default Sider;