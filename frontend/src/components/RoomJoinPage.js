import React, { Component } from 'react';
import { TextField, Button, Grid, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import {withRouter} from './withRouter';


class RoomJoinPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roomCode: "",
            error: false,
        }

        this.handleTextFieldChange = this.handleTextFieldChange.bind(this);
        this.roomButtonClicked = this.roomButtonClicked.bind(this);
    }

    handleTextFieldChange(e){
        this.setState({
            roomCode: e.target.value,
        });
    }

    roomButtonClicked() {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json'},
            body: JSON.stringify({
                code: this.state.roomCode,
            }),
        };
        fetch('/api/join_room', requestOptions).then((response) => {
            if (response.ok) {
                this.props.navigate("/room/" + this.state.roomCode)
            } else {
                this.setState({
                    error: true,
                });
            }
        }).catch((error) =>{
            console.log(error);
        });
            
    }

    render() {
        return(
            <Grid container spacing={1} alignItems="center">
                <Grid item xs={12} align="center">
                    <Typography component="h4" variant="h4">
                        Entrar numa sala
                    </Typography>
                </Grid>
                <Grid item xs={12} align="center">
                    <TextField
                        error={this.state.error}
                        label="Código"
                        placeholder="Digite o código da sala"
                        value={this.state.roomCode}
                        helperText={this.state.error.toString()}
                        variant="outlined"
                        onChange = {this.handleTextFieldChange}
                    />
                </Grid>
                <Grid item xs={12} align="center">
                    <Button variant="contained" color="primary" onClick={this.roomButtonClicked}>
                        Entrar na sala
                    </Button>
                </Grid>
                <Grid item xs={12} align="center">
                    <Button variant="contained" color="secondary" to="/" component={Link}>
                        Voltar
                    </Button>
                </Grid>         
            </Grid>
        );
    }
}

export default withRouter(RoomJoinPage)