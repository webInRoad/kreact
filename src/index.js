import React from "./kreact";
import ReactDOM from "./kreact/react-dom";
import "./index.css";

const jsx = (
  <div className="border">
    <p>手写React</p>
  </div>
);
ReactDOM.render(jsx, document.getElementById("root"));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
