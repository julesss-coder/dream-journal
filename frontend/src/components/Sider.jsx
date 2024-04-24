import Typography from '@mui/joy/Typography';
import Drawer from '@mui/joy/Drawer';
import ModalClose from '@mui/joy/ModalClose';
import Input from '@mui/joy/Input';
import List from '@mui/joy/List';
import ListItemButton from '@mui/joy/ListItemButton';
import Search from '@mui/icons-material/Search';
import Box from '@mui/joy/Box';

function Sider({ 
  open,
  setOpen,
  dreams,
  handleDreamClick 
}) {
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
  )
}

export default Sider;