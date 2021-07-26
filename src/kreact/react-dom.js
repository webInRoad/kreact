import { TEXT, PLACEMENT } from "./const";

let nextUniWork = null;
let wipRootFiber = null;

/**
 *
 * Fiber {
 * child
 * sibling
 * return
 * stateNode Fiber 对应的真实 DOM 节点
 * alternate 指向该 Fiber 在另一次更新时对应的 Fiber
 * }
 */
function render(vnode, container) {
  // 将虚拟 DOM 转成真实 DOM
  // const node = createNode(vnode);
  // container.appendChild(node);
  wipRootFiber = {
    stateNode: container,
    props: {
      children: [vnode],
    },
    alternate: null,
  };
  nextUniWork = wipRootFiber;
}

function workLoop(deadLine) {
  // 查找下一个任务，并且当前帧没有结束
  if (nextUniWork && deadLine.timeRemaining() > 1) {
    // 当前有任务
    nextUniWork = performUnitOfWork(nextUniWork);
  }
  // 所有任务执行完成
  if (!nextUniWork && wipRootFiber) {
    commitRoot();
  } else {
    requestIdleCallback(workLoop);
  }
}
requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
  // 1. 执行当前任务
  const { type } = fiber;
  if (typeof type === "function") {
    type.isReactComponent
      ? updateClassComponent(fiber)
      : updateFunctionComponent(fiber);
  } else {
    // 原生标签
    updateHostComponent(fiber);
  }
  // 返回下一元素
  // 2. 返回下一个任务
  // 找到下一个任务 得有原则
  // 原则就是：先找子元素
  if (fiber.child) {
    return fiber.child;
  }
  // 原则2： 如没有子元素，寻找兄弟元素
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.return;
  }
}
function updateFunctionComponent(fiber) {
  const { type, props } = fiber;
  const children = [type(props)];
  reconcileChildren(fiber, children);
}
function updateClassComponent(fiber) {
  const { type, props } = fiber;
  const children = [new type(props).render()];
  reconcileChildren(fiber, children);
}
function updateHostComponent(fiber) {
  if (!fiber.stateNode) {
    fiber.stateNode = createNode(fiber);
  }
  const { children } = fiber.props;
  reconcileChildren(fiber, children);
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
  }
  // 递归设置子元素
  // reconcileChildren(props.children, node);
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

// 串起整个 fiber 树
function reconcileChildren(workInProgressFiber, children) {
  let oldFiber = workInProgressFiber.base && workInProgressFiber.base.child;
  let prevSibling;
  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    let newFiber = null;
    const sameType = child && oldFiber && child.type === oldFiber.type;
    // todo 类型相同 复用
    if (sameType) {
    }
    // 类型不同 child存在  新增插入
    if (!sameType && child) {
      newFiber = {
        type: child.type,
        props: child.props,
        alternate: null,
        stateNode: null,
        return: workInProgressFiber,
        effectTag: PLACEMENT,
      };
    }
    // 类型不一样，而且没有对应 child, 那么就要将原先的 oldFiber 删除
    // todo 删除
    if (!sameType && oldFiber) {
    }
    if (oldFiber) {
      // 逐个比较
      oldFiber = oldFiber.sibling;
    }
    if (i == 0) {
      workInProgressFiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
  }
}

function commitRoot() {
  commitWorker(wipRootFiber.child);
}

function commitWorker(fiber) {
  if (!fiber) {
    return;
  }
  // parentNodeFiber 指的是当前fiber的有node节点的父fiber或者祖先
  let parentNodeFiber = fiber.return;
  while (!parentNodeFiber.stateNode) {
    parentNodeFiber = parentNodeFiber.return;
  }
  // parentNode是指父node（当前fiber的父fiber可能没有node吗?存在，比如 <> ,所以要有上面的 while 找到上面有 node 的fiber）
  const parentNode = parentNodeFiber.stateNode;
  if (fiber.effectTag == PLACEMENT && fiber.stateNode !== null) {
    parentNode.appendChild(fiber.stateNode);
  }
  commitWorker(fiber.child); // 先子元素
  commitWorker(fiber.sibling); // 后兄弟元素
}
// function reconcileChildren(childs, node) {
//   childs.forEach((child) => {
//     if (Array.isArray(child)) {
//       child.forEach((item) => render(item, node));
//     } else {
//       render(child, node);
//     }
//   });
// }

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
