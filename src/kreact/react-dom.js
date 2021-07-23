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
  } else if (typeof type === "function") {
    node = type.isReactComponent
      ? createClassComponent(type, props)
      : createFunctionComponent(type, props);
  } else if (type === undefined) {
    node = document.createDocumentFragment();
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
      if (p.slice(0, 2) === "on") {
        // 事件处理
        let eventName = p.slice(2).toLowerCase();
        node.addEventListener(eventName, props[p]);
      } else {
        node[p] = props[p];
      }
    });
}

function reconcileChildren(childs, node) {
  childs.forEach((child) => {
    if (Array.isArray(child)) {
      child.forEach((item) => render(item, node));
    } else {
      render(child, node);
    }
  });
}

function createFunctionComponent(type, props) {
  const vnode = type(props);
  return createNode(vnode);
}

function createClassComponent(type, props) {
  const el = new type(props);
  const vnode = el.render();
  return createNode(vnode);
}
export default { render };
