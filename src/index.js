import React from "./kreact";
import Component from "./kreact/Component";
import ReactDOM,{useState} from "./kreact/react-dom";
import "./index.css";

class ClassComponent extends Component {
  render() {
    return <div>{this.props.name}</div>;
  }
}

const FunctionComponent = function ({ name }) {
  console.info(111)
  const [count,setCount] = useState(0)
  console.info(333)
  return (
    <div className="border">
      {count}
      <button onClick={() => {setCount(count+1);setCount(count+2);}}>btn</button>
      {
        count % 2 ? <span>2</span> : null
      }
    </div>
  );
};
const jsx = (
    <FunctionComponent name="函数组件" />
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
