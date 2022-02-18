import React, { useEffect, useState } from 'react'
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress'

export default function SpeedReader() {
    const [playing, setPlaying] = useState(false);
    const [text, setText] = useState("");
    const [word, setWord] = useState(" ");
    const [waitTime, setWaitTime] = useState(240);
    const [wpm, setWpm] = useState(250);
    const [index, setIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    const handlePlayPause = (event) => {
        setPlaying(!playing);   
    }

    const handleSpeedChange = (event) => {
        let wps = wpm / 60;
        let freq_secs = 1 / wps;
        let ticks = freq_secs * 1000;
        setWaitTime(ticks)
    }
    const updateProgress = (words) => {
        if(index !== 0){
            console.log(index/words.length);
            setProgress((index/(words.length-1)) * 100);
        }
    }
    const updateIndex = (words) => {
        if(index < words.length-1 && playing){ //change state -> cause loop
            setIndex(index + 1);
        } else if (playing){ // we're done, reset index
            setPlaying(false);
            setIndex(0);
        }
    }

    useEffect(() => {
        let words = text.replaceAll(/[\r\n\t]/g, " ").split(" ");
        console.log(playing);
        setTimeout(() => {
            updateProgress(words);
            setWord(words[index]);
            updateIndex(words);
        }, waitTime);
    });

    const theme = createTheme();
    return (
        <ThemeProvider theme={theme}>
          <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
              sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                autocomplete: "off",
              }}
            >
                {/* Display  */}
              <Typography component="h1" variant="h1">
                  {word}
              </Typography>

              <Box width="100%">
              <LinearProgressWithLabel variant="determinate" value={progress} />
              </Box>
              
                {/*Control Buttons*/}
              <Stack
                sx={{ pt: 4 }}
                direction="row"
                spacing={2}
                justifyContent="center"
              >
                <Button variant="contained" type="button"
                    onClick={handlePlayPause}
                >
                    Play/Pause
                </Button>
                <Button variant="outlined" type="button"
                    onClick={handleSpeedChange}
                >
                    Set Speed
                </Button>
              </Stack>
              
              {/* Inputs */}
              <Box component="form" sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="wpm"
                      fullWidth
                      id="wpm"
                      label="Words Per Minute"
                      
                      value={wpm}
                      onChange={(e) => setWpm(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      autoFocus
                      id="text"
                      multiline
                      label="Your Text"
                      name="text"
                      rows={20}
                      value={text}
                      onInput={(e) => setText(e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Container>
        </ThemeProvider>
      );
}

function LinearProgressWithLabel(props) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress variant="determinate" {...props} />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography variant="body2" color="text.secondary">{`${Math.round(
            props.value,
          )}%`}</Typography>
        </Box>
      </Box>
    );
  }