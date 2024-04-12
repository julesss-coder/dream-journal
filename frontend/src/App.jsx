import React, { useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';

const theme = createTheme();


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
    <ThemeProvider theme={theme}>
      <Button variant="contained" color="primary">
        Hello World
      </Button>
      <button>Dreams</button>
      <button>Analyze</button>
      <div className="tagcloud">Tag cloud</div>
      <div className="dreams-list">
        {dreams && dreams.map(dream => {
          return (
            <div key={dream.id}>{dream.title}, {dream.createDate}</div>
          )
        })}
      </div>
    </ThemeProvider>
  );
}

export default App;
