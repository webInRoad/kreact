import { TEXT, PLACEMENT, UPDATE, DELETION } from "./const";

let nextUniWork = null;
let wipRootFiber = null;

let currentRoot = null;

let deletions = null;
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
  deletions = [];
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
  }
  requestIdleCallback(workLoop);
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
  wipFiber = fiber;
  wipFiber.hooks = [];
  hookIndex = 0;
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
  }
  // 设置元素的属性
  updateNode(node, {}, props);
  return node;
}

function updateNode(node, prevVal, nextVal) {
  Object.keys(prevVal)
    .filter((k) => k !== "children")
    .forEach((k) => {
      if (k.slice(0, 2) === "on") {
        // 简单处理 on开头当做事件
        let eventName = k.slice(2).toLowerCase();
        node.removeEventListener(eventName, prevVal[k]);
      } else {
        // 简单处理，如果需要考虑的style的话，需要再做处理，清空对象
        if (!(k in nextVal)) {
          node[k] = "";
        }
      }
    });
  Object.keys(nextVal)
    .filter((p) => p !== "children")
    .forEach((p) => {
      if (p.slice(0, 2) === "on") {
        // 事件处理
        let eventName = p.slice(2).toLowerCase();
        node.addEventListener(eventName, nextVal[p]);
      } else {
        node[p] = nextVal[p];
      }
    });
}

// 给children构建fiber架构
function reconcileChildren(workInProgressFiber, children) {
  let oldFiber =
    workInProgressFiber.alternate && workInProgressFiber.alternate.child;
  let prevSibling;
  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    let newFiber = null;
    const sameType = child && oldFiber && child.type === oldFiber.type;
    console.info(child, "child");
    // todo 类型相同 复用
    if (sameType) {
      newFiber = {
        type: child.type,
        props: child.props,
        alternate: oldFiber,
        stateNode: oldFiber.stateNode,
        return: workInProgressFiber,
        effectTag: UPDATE,
      };
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
      oldFiber.effectTag = DELETION;
      deletions.push(oldFiber);
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
  deletions.forEach(commitWorker);
  commitWorker(wipRootFiber.child);
  currentRoot = wipRootFiber;
  wipRootFiber = null;
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
  } else if (fiber.effectTag == UPDATE && fiber.stateNode !== null) {
    updateNode(fiber.stateNode, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === DELETION && fiber.node !== null) {
    // 删除
    commitDeletions(fiber, parentNode);
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

// fiber是要删除的
function commitDeletions(fiber, parentNode) {
  if (fiber.stateNode) {
    parentNode.removeChild(fiber.stateNode);
  } else {
    commitDeletions(fiber.child, parentNode);
  }
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

// 当前正在工作中的fiber， work in progress
let wipFiber = null;
let hookIndex = null;
// 函数重新执行时，会触发 useState
export function useState(init) {
  // 判断是初始化还是更新，如果是更新则要获取上一次的 state ,并且如果有等待执行的 queue ,有的话就将 state 更改为 queue 最后一项的值
  const oldHook = wipFiber.alternate && wipFiber.alternate.hooks[hookIndex];
  const hook = { state: oldHook ? oldHook.state : init, queue: [] };
  const actions = oldHook ? oldHook.queue : [];
  actions.forEach((action) => (hook.state = action));
  // 点击时触发该函数,
  const setState = (action) => {
    // hook.state = action;
    hook.queue.push(action);
    wipRootFiber = {
      stateNode: currentRoot.stateNode,
      props: currentRoot.props,
      alternate: currentRoot,
    };
    deletions = []
    nextUniWork = wipRootFiber; // 有下一个任务要执行
  };
  // [状态值，改变状态值的函数]
  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state, setState];
}
export default { render };
