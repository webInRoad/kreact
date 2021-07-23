import { TEXT } from "./const";
function render(vnode, container) {
  // 将虚拟 DOM 转成真实 DOM
  const node = createNode(vnode);
  container.appendChild(node);
}

function createNode(vnode) {
  const { type, props } = vnode;
  let node = null;
  if (type === TEXT) {
    node = document.createTextNode("");
  } else if (typeof type === "string") {
    node = document.createElement(type);
  }
  // 递归设置子元素
  reconcileChildren(props.children, node);
  // 设置元素的属性
  updateNode(node, props);
  return node;
}

function updateNode(node, props) {
  Object.keys(props)
    .filter((p) => p !== "children")
    .forEach((p) => {
      node[p] = props[p];
    });
}

function reconcileChildren(childs, node) {
  childs.forEach((child) => {
    render(child, node);
  });
}
export default { render };
