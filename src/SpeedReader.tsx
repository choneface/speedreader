import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  CssBaseline,
  LinearProgress,
  Stack,
  Typography,
  TextField,
  Grid,
} from '@mui/material';
import SectionedTextInput from './components/SectionedTextInput';

/*─────────────────────────────────────────────────────────────────────────────
  SpeedReader v2  –  section‑aware with WPM control
  ---------------------------------------------------------------------------*/
export default function SpeedReader() {
  /* text & sections */
  const [sections, setSections] = useState<string[]>(['']);
  const [current, setCurrent] = useState(0);          // section index
  const [completed, setCompleted] = useState<number[]>([]);

  /* reading */
  const [playing, setPlaying] = useState(false);
  const [wordIdx, setWordIdx] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [wpm, setWpm] = useState(250);
  const wait = 60_000 / wpm;

  /* progress bar inside section */
  const [progress, setProgress] = useState(0);

  /* words of current section */
  const words =
    sections[current]
      ?.replaceAll(/[\r\n\t]+/g, ' ')
      .split(' ')
      .filter(Boolean) ?? [];

  /* reading loop */
  useEffect(() => {
    if (!playing) return;
    if (!words.length) return;

    const timer = setTimeout(() => {
      setCurrentWord(words[wordIdx]);
      setProgress((wordIdx / (words.length - 1)) * 100);

      if (wordIdx < words.length - 1) {
        setWordIdx(i => i + 1);
      } else {
        // finished section
        setCompleted(prev => [...prev, current]);
        setPlaying(false);
        setWordIdx(0);
        setProgress(0);
        setCurrentWord('');
        setCurrent(i => Math.min(i + 1, sections.length - 1));
      }
    }, wait);
    return () => clearTimeout(timer);
  }, [playing, wordIdx, wait, words, current, sections.length]);

  /* handlers */
  const togglePlay = () => setPlaying(p => !p);
  const handleWpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    if (!Number.isNaN(v) && v > 0) setWpm(v);
  };

  /* render */
  return (
    <Container maxWidth="md" className="py-10">
      <CssBaseline />

      <Typography variant="h2" align="center" sx={{ mt: 2 }}>
        {currentWord || ' '}
      </Typography>

      <LinearProgressWithLabel value={progress} />

      <Grid container spacing={2} sx={{ my: 3 }}>
      <Stack direction="row" spacing={2} justifyContent="center" height="100%" alignItems="center">
  {completed.length === sections.length ? (
    <Button
      variant="contained"
      color="error"
      onClick={() => {
        setCompleted([]);
        setCurrent(0);
        setWordIdx(0);
        setProgress(0);
        setCurrentWord('');
        setPlaying(false);
      }}
    >
      Reset
    </Button>
  ) : (
    <Button
      variant="contained"
      onClick={togglePlay}
      disabled={false}
    >
      {playing ? 'Pause' : 'Play'}
    </Button>
  )}
</Stack>
          <TextField
            label="Words per minute"
            type="number"
            fullWidth
            value={wpm}
            onChange={handleWpmChange}
          />
      </Grid>

      <SectionedTextInput
        completed={completed}
        onSectionsChange={setSections}
      />
    </Container>
  );
}

/* progress helper */
function LinearProgressWithLabel({ value }: { value: number }) {
  return (
    <Box display="flex" alignItems="center" gap={1} my={2}>
      <Box flexGrow={1}>
        <LinearProgress variant="determinate" value={value} />
      </Box>
      <Typography variant="body2" color="text.secondary">
        {`${Math.round(value)}%`}
      </Typography>
    </Box>
  );
}
