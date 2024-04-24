import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import MenuButton from '@mui/joy/MenuButton';
import Dropdown from '@mui/joy/Dropdown';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import DeleteForever from '@mui/icons-material/DeleteForever';
import MenuItem from '@mui/joy/MenuItem';
import MoreVert from '@mui/icons-material/MoreVert';
import JoyUiMenu from '@mui/joy/Menu';
import TextField from '@mui/material/TextField';

function DreamEditor({
  selectedDreamId,
  handleDeleteDream,
  dreams,
  handleFormInput
}) {
  let timer;

  return (
    // Outer container
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        m: 2,
        height: "100%"
      }}
    >
      {/* Dream container */}
      {
        selectedDreamId === null && <Typography>No dream selected.</Typography>
      }

      {/* "Delete dream" menu */}
      {
        selectedDreamId !== null && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
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

      {/* Dream editor */}
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
              // IDEA for later: The `onChange` event DOES bubble, so instead of debouncing `onFormInput` by just 100ms in the onChange handler, I could register changes in the form in this onChange handler for all form fields, and debounce it by 1000ms, and call it also when user leaves page (within useEffect cleanup function). 
              onChange={(e) => console.log("onChange handler in form Box runs", e.bubbles, e.target.id, e.target.value)}
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
                  }, 100);
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
                  }, 100);
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
                  }, 100);
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
                  clearTimeout(timer);
                  timer = setTimeout(() => {
                    handleFormInput(dream.id, "tags", e.target.value);
                  }, 100);
                }}
                fullWidth
                multiline
              />
            </Box>
          ))
        )
      }
    </Box>
  )
}

export default DreamEditor;