
import { render } from 'react-dom';
import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import HomePage from './HomePage';
import RoomJoinPage from './RoomJoinPage';
import CreateRoomPage from './CreateRoomPage';
import Room from './Room';
import { Navigate } from 'react-router-dom';


export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roomCode: null
        };
    }

    render() {
        return (
            <div>
                <Router>
                    <Routes>
                        <Route
                            exact
                            path="/"
                            element={
                                <div className="center"><HomePage /></div>
                            }
                        />
                        <Route exact path="/join" element={<div className="center"><RoomJoinPage /></div>} />
                        <Route exact path="/create" element={<div className="center"><CreateRoomPage /></div>} />
                        <Route path="/room/:roomCode" element={<div className="center"><Room /></div>} />
                    </Routes>
                </Router>
            </div>
        );
    }
}

const appDiv = document.getElementById('app');
render(<App />, appDiv);