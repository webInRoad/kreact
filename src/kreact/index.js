import { TEXT } from "./const";
function createElement(type, config, ...children) {
  if (config) {
    delete config.__self;
    delete config.__source;
  }
  let props = {
    ...config,
    children: children.map((child) =>
      typeof child == "object" ? child : createTextNode(child)
    ),
  };
  return {
    type,
    props,
  };
}

//  将 child 统一成一种格式，方便后续的设置
function createTextNode(text) {
  return {
    type: TEXT,
    props: {
      children: [],
      nodeValue: text, // 设置文本元素的内容就是通过 nodeValue
    },
  };
}
export default {
  createElement,
};
