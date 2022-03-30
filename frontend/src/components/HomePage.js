import React, { Component } from 'react';
import RoomJoinPage from './RoomJoinPage';
import CreateRoomPage from './CreateRoomPage';
import { BrowserRouter as Router, Route, Routes, Link, Redirect, } from 'react-router-dom';

export default class HomePage extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        // return (<h1>This is the home page</h1>);
        return (
            <div>
                <Router>
                    <Routes>
                        <Route exact path="/" element={<h1>This is the home page</h1> } />
                        {/* <Route exact path="/">
                            element=<h1>This is the home page!!!!</h1>
                        </Route> */}
                        <Route exact path="/join" element={<RoomJoinPage />} />
                        <Route exact path="/create" element={CreateRoomPage} />
                    </Routes>
                </Router>
            </div>
        );
    }
}