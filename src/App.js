import React, { Component } from 'react';
import './App.css';
import Candlestick from './candlestick'

// TODO render price graph
class App extends Component {
  render() {
    return (
      <div className="App">
        <div style={{margin: 10}}>
          <Candlestick />
        </div>

      </div>
    );
  }
}

export default App;
