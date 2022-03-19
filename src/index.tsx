import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

/*

   Okay, so, first steps.
   We want a payoff fast without too much boilerplate.

   Need to establish the concept of a Grid with Rows and Columns of Cells.
   Establish addressing scheme (e.g. A0, B1)
   Explore embedding.
   Establish addressing for embedding, rich support for Ref as a concept.

   Declare data schemas using io-ts or joi/yup?
   Declare a mapping of views against schemas.

   Render views into Grid, experiment with zoom levels and resizing cell views.

*/

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
