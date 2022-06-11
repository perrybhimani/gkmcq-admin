import React from 'react';
import ReactAudioPlayer from 'react-audio-player';

function AudioPlayer(props) {
  return <ReactAudioPlayer style={{ width: '100%' }} src={props.audioUrl} controls />;
}

export default AudioPlayer;
