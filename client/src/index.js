import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import store from './store'
import { Provider } from 'react-redux'
import reportWebVitals from './reportWebVitals';
import { Helmet } from 'react-helmet'

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Helmet>
        <meta charSet="utf-8" />
        <title>DWC v2</title>
        <link rel="icon" type="image/png" href="favicon.ico" sizes="16x16" />
      </Helmet>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
