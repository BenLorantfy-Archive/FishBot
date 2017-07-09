/*
 *
 * StreamFeed
 *
 */

import React, { PropTypes } from 'react';
import JSmpeg from 'jsmpeg';

export class StreamFeed extends React.Component { // eslint-disable-line react/prefer-stateless-function
    componentDidMount() {
        var player = new JSmpeg.Player("wss://benlorantfy.com/fishbot/stream", {
            canvas: this.canvas
        });
    }

    render() {
        return (
            <div style={this.props.style}>
                <canvas width="640" height="360" ref={(canvas) => { this.canvas = canvas; }} />
            </div>
        );
    }
}


export default StreamFeed;
