import React, { useEffect, useRef, useState } from 'react'

export default function Input() {
    // play = 1, pause = 0
    const [playing, setPlaying] = useState(false);
    const [text, setText] = useState("a b c d e f g h i j k l m n o p");
    const [word, setWord] = useState("");
    const [waitTime, setWaitTime] = useState(240);
    const [wpm, setWpm] = useState(250);

    const handlePlayPause = (event) => {
        if(playing){
            loopThruText();
        } else {
            loopThruText(text, 0);
        }
    }

    const loopThruText = (input, i) => {
        let words = input.split(" ");
        console.log(playing);
        setTimeout(() => {
            setWord(words[i]);
            if(i < words.length)
                loopThruText(input, i+1);
        }, waitTime);
    }

    const handleSpeedChange = (event) => {
        let wps = wpm / 60;
        let freq_secs = 1 / wps;
        let ticks = freq_secs * 1000;
        setWaitTime(ticks)
    }

    return (
        <div>
            <div className="display">
                <div>{word}</div>
            </div>

            <div className="speed">
                <button onClick={handleSpeedChange}>set time</button>
                <input
                    type="number"
                    defaultValue={wpm}
                    onInput={(e) => setWpm(e.target.value)}
                />
            </div>

            <div className="input">
                <button onClick={handlePlayPause}>playPause</button>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
            </div>
        </div>
    )
}
