import React, { Component } from 'react';
import { Grid, Typography, Card, IconButton, LinearProgress} from '@material-ui/core';
import { PlayArrow, SkipNext, Pause } from '@material-ui/icons';

function MusicPLayer (song) {
    
    const song_progress = (song.progress / song.duration) * 100;

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
                        <IconButton>
                            {song.is_playing ? <Pause /> : <PlayArrow />}
                        </IconButton>
                        <IconButton>
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