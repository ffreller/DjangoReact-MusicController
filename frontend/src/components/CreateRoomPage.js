import React, { Component } from 'react';
import { TextField, Button, Grid, Typography, FormHelperText,
            FormControl, Radio, RadioGroup, FormControlLabel}
        from '@material-ui/core';
import { Link } from 'react-router-dom';
import {withRouter} from './withRouter';


class CreateRoomPage extends Component {
    defaultVotes = 2;

    constructor(props) {
        super(props);
        this.state = {
            guest_can_pause: true,
            votes_to_skip: this.defaultVotes
        };

        this.handleVotesChange = this.handleVotesChange.bind(this);
        this.handleGestCanPauseChange = this.handleGestCanPauseChange.bind(this);
        this.handleRoomButtonClicked = this.handleRoomButtonClicked.bind(this);
    }

    handleVotesChange(e) {
        this.setState({
            votes_to_skip: e.target.value
        });
    }

    handleGestCanPauseChange(e){
        this.setState({
            guest_can_pause: e.target.value === "true" ? true : false,
        });
    }

    handleRoomButtonClicked() {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json'},
            body: JSON.stringify({
                votes_to_skip: this.state.votes_to_skip,
                guest_can_pause: this.state.guest_can_pause,
                isHost: this.state.isHost
            }),
        };
        
        fetch('/api/create_room', requestOptions)
            .then((response) => response.json())
            .then((data) => this.props.navigate("/room/" + data.code));

    }

    render() {
        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <Typography component="h4" variant="h4">
                        Criar uma sala
                    </Typography>
                </Grid>
                <Grid item xs={12} align="center">
                    <FormControl component="fieldset">
                        <FormHelperText component={'span'}>
                            <div align='center'> Controle dos convidados </div>
                        </FormHelperText>
                        <RadioGroup row defaultValue="true" onChange={this.handleGestCanPauseChange}>
                            <FormControlLabel
                                value="true"
                                control={<Radio color="primary"/>}
                                label="Play/Pause"
                                labelPlacement="bottom"
                            />
                            <FormControlLabel
                                value="false"
                                control={<Radio color="secondary"/>}
                                label="Sem controle"
                                labelPlacement="bottom"
                            />
                        </RadioGroup>
                    </FormControl>
                </Grid>
                <Grid item xs={12} align="center">
                    <FormControl  component={'span'}>
                        <TextField
                            required={true}
                            type="number"
                            onChange={this.handleVotesChange}
                            defaultValue={this.defaultVotes}
                            inputProps={{
                                min: 1,
                                style: { textAlign: 'center' }
                            }}
                        />
                        <FormHelperText component={'span'} >
                            <div align='center'> Votos necess??rios para passar a m??sica</div>
                        </FormHelperText>
                    </FormControl>
                </Grid>
                <Grid item xs={12} align="center">
                    <Button color="primary" variant="contained" onClick={this.handleRoomButtonClicked}>
                        Criar uma sala
                    </Button>
                </Grid>
                <Grid item xs={12} align="center">
                    <Button color="secondary" variant="contained" to="/" component={Link}>
                        Voltar
                    </Button>
                </Grid>
            </Grid>
        );
    }
}

export default withRouter(CreateRoomPage);