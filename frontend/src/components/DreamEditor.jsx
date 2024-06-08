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
  tagData,
  handleFormInput,
  handleTagInput,
  isError,
  errorMessage
}) {
  let timer;
  
  const getCurrentTags = () => {
    const currentTags = [];
  
    if (tagData) {
      for (const entry of tagData) {
        if (entry.dream_id === selectedDreamId) {
          currentTags.push(entry.tag_text);
        }
      }
    }
    return currentTags;
  };

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
      { isError === true && (
        <p>{errorMessage}</p>
      )}

      {
        selectedDreamId === null && isError === false && <Typography>No dream selected.</Typography>
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
        selectedDreamId !== null && (
          dreams.filter(dream => (
            dream.dream_id === selectedDreamId
          )).map(dream => (
            <Box
              key={dream.dream_id}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
              }}
              // IDEA for later: The `onChange` event DOES bubble, so instead of debouncing `onFormInput` by just 100ms in the onChange handler, I could register changes in the form in this onChange handler for all form fields, and debounce it by 1000ms, and call it also when user leaves page (within useEffect cleanup function). 
              // onChange={(e) => console.log("onChange handler in form Box runs", e.bubbles, e.target.id, e.target.value)}
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
                    handleFormInput(dream.dream_id, "title", e.target.value);
                  }, 300);
                }}
              />
              <TextField
                id="date-created"
                label="Created on:"
                disabled
                value={new Date(dream.date_created).toUTCString()}
              />
              <TextField
                id="last-edited"
                label="Last edited on:"
                disabled
                value={new Date(dream.last_edited).toUTCString()}
              />
              <TextField
                id="dream-description"
                label="Dream description"
                defaultValue={dream.description}
                onChange={(e) => {
                  clearTimeout(timer);
                  timer = setTimeout(() => {
                    // Passing in e.target.value instead of `e`, as `e` is nullified after `handleFormInput` is invoked. `setTimeout` then runs with nullified event object, so that `e.target.value` does not contain user input.
                    handleFormInput(dream.dream_id, "description", e.target.value);
                  }, 300);
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
                    handleFormInput(dream.dream_id, "thoughts", e.target.value);
                  }, 300);
                }}
                multiline
                fullWidth
              />
              {/* Tags are not part of the data from `dreamlog` table. Fix this once data from `tags` and `dreams_tags` is sent to client and is combined with dreams data. */}
              <TextField
                id="dream-tags"
                label="Dream tags"
                defaultValue={getCurrentTags().join(", ")}
                helperText="Separate tags with comma."
                onKeyUp={(e) => {
                  // Can I use the same timer as for the calls to `handleFormInput()`? I assume so, as the user can't trigger tag input and input in the other fields at the same time. 
                  clearTimeout(timer);
                  timer = setTimeout(() => {
                    handleTagInput(dream.dream_id, e.target.value);
                  }, 300);
                }}
                fullWidth
                multiline
                sx={{
                  paddingBottom: "80px"
                }}
              />
            </Box>
          ))
        )
      }
    </Box>
  )
}

export default DreamEditor;