import React, { Component } from 'react';
import { Grid, Typography, Card, IconButton, LinearProgress} from '@material-ui/core';
import { PlayArrow, SkipNext, Pause } from '@material-ui/icons';

function MusicPLayer (song) {
    
    const song_progress = (song.progress / song.duration) * 100;

    let play_song = () => {
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json'}
        }
        fetch('/spotify/play_song', requestOptions);
    }

    let pause_song = () => {
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json'}
        }
        fetch('/spotify/pause_song', requestOptions);
    }

    let skip_song = () => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'}
        }
        fetch('/spotify/skip_song', requestOptions);
    }

    return (
        <Card>
            <Grid container alignItems="center">
                <Grid item align="center" xs={4}>
                    <img src={song.image_url} height="100px" width="100px"/>
                </Grid>
                <Grid item align="center" xs={8}>
                    <Typography component="h5" variant="h5">
                        {song.title}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                        {song.artist}
                    </Typography>
                    <div>
                        <IconButton onClick={() => {song.is_playing ? pause_song() : play_song()}}>
                            {song.is_playing ? <Pause /> : <PlayArrow />}
                        </IconButton>
                        <IconButton onClick={() => skip_song()}>
                            {song.votes} /{" "} {song.votes_to_skip}
                            <SkipNext />
                        </IconButton>
                    </div>
                </Grid>
            </Grid>
            <LinearProgress variant="determinate" value={song_progress} />
        </Card>
    )
}


export default MusicPLayer