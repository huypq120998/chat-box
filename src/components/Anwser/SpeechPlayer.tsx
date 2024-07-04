import React, { useState, useEffect, useRef, useMemo } from "react";
import { IconButton } from "@fluentui/react";
import axios from "axios";
import { FaSpinner } from 'react-icons/fa';
import styles from "./Answer.module.css";
import { IconContext } from "react-icons";

const TTS_SERVER = 'https://viettelgroup.ai/voice/api/tts/trolyaoluat/v1/rest/syn';
const SPEED = 1;
const VOICE_MODEL = 'hn-phuongtrang';

interface Props {
  text: string;
  isPlayVoive?: any;
  indexAnswer?: any
}
const SpeechPlayer = ({ text, isPlayVoive, indexAnswer } : Props) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isStart, setIsStart] = useState(false);

  const audioRef:any = useRef()
  const [source, setSource] = useState("");

  useEffect(() => {
    setIsStart(false)
    setIsPlaying(false)
    setIsLoading(false)
    setSource('')
    if(audioRef?.current) {
      audioRef.current.pause();
      audioRef.current.load();
      audioRef.current.play();
    }
    if(isPlayVoive.config && isPlayVoive.status) {
      handleStart()
    }
    return () => {
    };
  }, [text]);

  const Source = () => <source src={source} type="audio/wav" />;

  const getAudio = async () => {
    setIsLoading(true)
    try {
      const voice = VOICE_MODEL;
      const speed = SPEED;

      const res = await axios.post(
        TTS_SERVER,
        {
          text,
          voice,
          speed,
          id: '1',
          without_filter: false,
          tts_return_option: 2,
        },
        {
          responseType: 'arraybuffer',
          headers: {
            token:
              'hPu-fGap6sdW7mo9EqPoV8kGCe-e9DgIaOLrCVDzmqBHW8LxhPMpyssUDW4fxSDM',
          },
        }
      )

      const blob = new Blob([res.data], {
        type: 'audio/wav',
      })
      const url = URL.createObjectURL(blob)

      setSource(url)
    } catch (e) {
      console.log(e)
    } finally {
      setIsLoading(false)
    }
  };

  const _handlePlay = () => {
    setIsPlaying(true)
    if(!isStart) {
      handleStart()
    } else {
      audioRef?.current?.play()
    }
  };

  const handleStart = async () => {
    setIsStart(true)
    await getAudio();
    audioRef?.current?.pause()
    audioRef?.current?.load()
    audioRef?.current?.play()
  }

  const _handlePause = () => {
    setIsPlaying(false)
    audioRef?.current?.pause()
  };
  

  return (
    <>
      {isStart &&
        <audio 
          onEnded={_handlePause}
          onPlay={_handlePlay}
          onPause={_handlePause}
          style={{display: 'hidden'}}
          ref={audioRef}>
            <Source />
        </audio>
      }
      
      <>
      {!isLoading ?<>
        { !isPlaying ?
        <IconButton
        style={{ color: "black" }}
        iconProps={{ iconName: "Volume2" }}
        title="Play voice"
        ariaLabel="Play voice"
        onClick={_handlePlay} />
          :
        <IconButton
        style={{ color: "black" }}
        iconProps={{ iconName: "CirclePause" }}
        title="Pause voice"
        ariaLabel="Pause voice"
        onClick={_handlePause} />
        }
      </>
      :
      <IconContext.Provider value={{ className: styles.spinner, style: {marginBottom: 6, marginLeft: 6} }}>
        <>
         <FaSpinner />
        </>
      </IconContext.Provider>
      }
      </>
    </>
  );
};

export default SpeechPlayer;