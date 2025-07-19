import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  Container,
  CssBaseline,
  LinearProgress,
  Stack,
  Typography,
  TextField,
} from "@mui/material";
import SectionedTextInput from "./components/SectionedTextInput";

/*─────────────────────────────────────────────────────────────────────────────
  SpeedReader v2  –  section‑aware with WPM control
  ---------------------------------------------------------------------------*/
export default function SpeedReader() {
  /* text & sections */
  const [sections, setSections] = useState<string[]>([""]);
  const [current, setCurrent] = useState(0); // section index
  const [completed, setCompleted] = useState<number[]>([]);

  /* reading */
  const [playing, setPlaying] = useState(false);
  const [wordIdx, setWordIdx] = useState(0);
  const [currentWord, setCurrentWord] = useState("");
  const [wpm, setWpm] = useState<string | number>(500);
  const effectiveWpm = typeof wpm === "number" && wpm > 0 ? wpm : 500;
  const wait = 60_000 / effectiveWpm;

  /* progress bar inside section */
  const [progress, setProgress] = useState(0);
  const [resetCounter, setResetCounter] = useState(0);

  /* words of current section */
  const words = useMemo(() => {
    // Helper to split hyphenated words as described
    function splitHyphenatedWord(word: string): string[] {
      if (!word.includes("-")) return [word];
      const parts = word.split("-");
      if (parts.length === 1) return [word];
      const result: string[] = [];
      for (let i = 0; i < parts.length; i++) {
        if (i === 0) {
          result.push(parts[i] + "-");
        } else if (i === parts.length - 1) {
          result.push("-" + parts[i]);
        } else {
          result.push("-" + parts[i] + "-");
        }
      }
      return result;
    }

    return (
      sections[current]
        ?.replaceAll(/[\r\n\t]+/g, " ")
        .split(" ")
        .filter(Boolean)
        .flatMap(splitHyphenatedWord) ?? []
    );
  }, [sections, current]);

  /* reading loop */
  useEffect(() => {
    if (!playing) return;
    if (!words.length) return;

    const timer = setTimeout(() => {
      setCurrentWord(words[wordIdx]);
      setProgress((wordIdx / (words.length - 1)) * 100);

      if (wordIdx <= words.length - 1) {
        setWordIdx((i) => i + 1);
      } else {
        // finished section
        setCompleted((prev) => [...prev, current]);
        setPlaying(false);
        setWordIdx(0);
        setProgress(0);
        setCurrentWord("");
        setCurrent((i) => Math.min(i + 1, sections.length - 1));
      }
    }, wait);
    return () => clearTimeout(timer);
  }, [playing, wordIdx, wait, words, current, sections.length]);

  /* handlers */
  const togglePlay = () => setPlaying((p) => !p);
  const handleWpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v === "") {
      setWpm("");
    } else {
      const num = Number(v);
      if (!Number.isNaN(num) && num > 0) setWpm(num);
    }
  };

  const clearEverything = () => {
    /* wipe local reader state */
    setCompleted([]);
    setCurrent(0);
    setWordIdx(0);
    setProgress(0);
    setCurrentWord("");
    setPlaying(false);

    /* wipe text */
    setSections([""]); // for the reader
    setResetCounter((k) => k + 1); // tells SectionedTextInput to reset itself
  };

  /* render */
  return (
    <Container maxWidth="md" className="py-10">
      <CssBaseline />

      <Typography variant="h2" align="center" sx={{ mt: 2 }}>
        {currentWord || "..."}
      </Typography>

      <LinearProgressWithLabel value={progress} />

      <Box sx={{ my: 3 }}>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            mb: 2,
          }}
        >
          {completed.length === sections.length - 1 && sections.length != 1 ? (
            <Button
              variant="contained"
              color="error"
              sx={{ textTransform: "none" }}
              onClick={() => {
                setCompleted([]);
                setCurrent(0);
                setWordIdx(0);
                setProgress(0);
                setCurrentWord("");
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
              sx={{ textTransform: "none" }}
            >
              {playing ? "Pause" : "Play"}
            </Button>
          )}
          <Button
            color="error"
            variant="contained"
            sx={{ textTransform: "none" }}
            onClick={clearEverything}
          >
            Clear content
          </Button>
        </Stack>
        <TextField
          label="Words per minute"
          type="number"
          fullWidth
          value={wpm}
          onChange={handleWpmChange}
        />
      </Box>

      <SectionedTextInput
        completed={completed}
        resetSignal={resetCounter}
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
