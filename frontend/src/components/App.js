import { Home } from '@material-ui/icons';
import { render } from 'react-dom';
import React, { Component } from 'react';
import HomePage from './HomePage';

export default class App extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <div className="center">
                <HomePage />
            </div>         
        );
    }
}

const appDiv = document.getElementById('app');
render(<App />, appDiv);