import React from "./kreact";
import Component from "./kreact/Component";
import ReactDOM from "./kreact/react-dom";
import "./index.css";

class ClassComponent extends Component {
  render() {
    return <div>{this.props.name}</div>;
  }
}

const FunctionComponent = function ({ name }) {
  return (
    <div className="border">
      {name}
      <button onClick={() => console.log("omg")}>btn</button>
    </div>
  );
};
const jsx = (
  <div className="border">
    <p>
      手写React<span>111</span>
    </p>
    <span>2323</span>
    <ClassComponent name="class组件" />
    <FunctionComponent name="函数组件" />
    <>
      <h1>文本1</h1>
      <h2>文本2</h2>
    </>
    {/* <ClassComponent name="class组件" />
    <FunctionComponent name="函数组件" />
    
    {[1, 2, 3].map((num) => (
      <div>{num}</div>
    ))} */}
  </div>
);
ReactDOM.render(jsx, document.getElementById("root"));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

// vnode  虚拟dom节点
// node 真实dom节点
// !节点类型
// 文本节点
// HTML标签节点
// function组件
// class组件
// fragment
// 数组
