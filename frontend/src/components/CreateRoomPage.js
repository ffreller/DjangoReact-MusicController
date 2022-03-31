import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
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
        fetch('/api/create-room', requestOptions)
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
                            <div align='center'> Votos necessários para passar a música</div>
                        </FormHelperText>
                    </FormControl>
                </Grid>
                <Grid item xs={12} align="center">
                    <Button color="primary" variant="contained" onClick={this.handleRoomButtonClicked}>
                        Criar um quarto
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