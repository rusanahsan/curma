import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import 'bootstrap/dist/css/bootstrap.min.css';
import '@tomtom-international/web-sdk-plugin-searchbox/dist/SearchBox.css';

ReactDOM.render(
  <React.StrictMode>
      <App />
  </React.StrictMode>,
  document.getElementById('root')
);