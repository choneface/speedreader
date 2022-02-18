import React, { useEffect, useRef, useState } from 'react'
// import {Textarea} from '@primer/react'
// import '@primer/css/utilities/index.scss';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import "./SpeedReader.css"
import { Box } from '@mui/material';

export default function SpeedReader() {
    const [playing, setPlaying] = useState(false);
    const [text, setText] = useState("");
    const [word, setWord] = useState(" ");
    const [waitTime, setWaitTime] = useState(240);
    const [wpm, setWpm] = useState(250);
    const [index, setIndex] = useState(0);

    const handlePlayPause = (event) => {
        setPlaying(!playing);   
    }

    const handleSpeedChange = (event) => {
        let wps = wpm / 60;
        let freq_secs = 1 / wps;
        let ticks = freq_secs * 1000;
        setWaitTime(ticks)
    }

    useEffect(() => {
        let words = text.split(" ");
        console.log(playing);
        setTimeout(() => {
            
            setWord(words[index]);
            if(index < words.length-1 && playing){ //change state -> cause loop
                setIndex(index + 1);
            } else if (playing){ // we're done, reset index
                setPlaying(false);
                setIndex(0);
            }
        }, waitTime);
    });

    return (
        <div>
            <div className="display">
                <div>{word}</div>
            </div>
            
            <div class="anim-grow-x py-2 color-bg-success-emphasis"></div>

            <div className='p-12'>
                <div className="Box">
                    <div className="Box-header d-flex flex-items-center">
                        <h3 className="Box-title overflow-hidden flex-auto">
                        Control Panel
                        </h3>
                    </div>
                    <form>
                        <div className="Box-body">
                            <div className="form-group">
                                <div className="form-group-header">
                                    <label>Speed</label>
                                </div>
                                <div className="form-group-body">
                                    <input 
                                        className="form-control"
                                        type="number"
                                        defaultValue={wpm}
                                        onInput={(e) => setWpm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="form-group-header">
                                    <label>Text</label>
                                </div>
                                <div className="form-group-body">
                                    <textarea 
                                        className="form-control"
                                        type="text"
                                        type="text"
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="Box-footer text-right">
                            <button type="button" onClick={handleSpeedChange}>
                                Update Speed
                            </button>
                            <button className="btn btn-primary" type="button" onClick={handlePlayPause}>
                                Play/Pause
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

function LoopThruText(waitTime, setWord, input, i){
    
}