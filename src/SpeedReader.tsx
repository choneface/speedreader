import React, { useEffect, useState } from "react";
import { Box, Button, Container, CssBaseline, LinearProgress, Stack, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import SectionedTextInput from "./components/SectionedTextInput";

/*
 ──────────────────────────────────────────────────────────────────────────────
  MVP Speed‑Reader component
  ---------------------------------------------------------------------------
  Works out‑of‑the‑box in a Vite + React‑TS + MUI 5 + Tailwind project.
  Copy this file into `src/` and import <SpeedReader /> in App.tsx.
*/
export default function SpeedReader() {
  // ─────────────── state
  const [playing, setPlaying] = useState(false);
  const [text, setText] = useState("");
  const [currentWord, setCurrentWord] = useState(" ");
  const [wpm, setWpm] = useState(250);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // waitTime derived from wpm → ms per word
  const waitTimeMs = 60_000 / wpm;

  /* ─────────────────────────────────────────  Reader loop  */
  useEffect(() => {
    if (!playing) return; // pause gate

    const words = text.replaceAll(/[\r\n\t]+/g, " ").split(" ").filter(Boolean);
    if (!words.length) return;

    const timer = setTimeout(() => {
      setCurrentWord(words[index]);
      setProgress((index / (words.length - 1)) * 100);

      if (index < words.length - 1) {
        setIndex(i => i + 1);
      } else {
        setPlaying(false);
        setIndex(0);
      }
    }, waitTimeMs);

    return () => clearTimeout(timer);
  }, [index, playing, waitTimeMs, text]);

  /* ─────────────────────────────────────────  Handlers  */
  const handleTogglePlay = () => setPlaying(p => !p);

  const handleWpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    if (!Number.isNaN(v) && v > 0) setWpm(v);
  };

  /* ─────────────────────────────────────────  UI  */
  return (
    <Container maxWidth="sm" className="py-10">
      <CssBaseline />

      {/* Display word */}
      <Typography variant="h1" align="center" sx={{ mb: 2, fontSize: "4rem" }}>
        {currentWord}
      </Typography>

      {/* Progress bar */}
      <LinearProgressWithLabel value={progress} />

      {/* Controls */}
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ my: 3 }}>
        <Button variant="contained" onClick={handleTogglePlay}>
          {playing ? "Pause" : "Play"}
        </Button>
      </Stack>

      {/* Inputs */}
      <Grid container spacing={2}>
          <TextField
            label="Words per minute"
            type="number"
            value={wpm}
            onChange={handleWpmChange}
            fullWidth
          />
          <SectionedTextInput
            onSectionsChange={sections => setText(sections.join(' '))}
          />
      </Grid>
    </Container>
  );
}

/* Helper component to show progress bar with % label */
interface LPProps {
  value: number; // 0‑100
}

function LinearProgressWithLabel({ value }: LPProps) {
  return (
    <Box display="flex" alignItems="center" gap={1} mb={2}>
      <Box flexGrow={1}>
        <LinearProgress variant="determinate" value={value} />
      </Box>
      <Typography variant="body2" color="text.secondary">{`${Math.round(value)}%`}</Typography>
    </Box>
  );
}
