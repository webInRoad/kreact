// function Component(props) {
//   this.props = props;
// }
// Component.prototype.isReactComponent = {};

class Component {
  static isReactComponent = {}; // 用来标识是类组件还是函数组件
  constructor(props) {
    this.props = props;
  }
}
export default Component;
