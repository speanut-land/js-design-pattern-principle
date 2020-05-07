class MyNode {
  chilren: MyNode[];
  name: string;
  constructor(name) {
    this.name = name;
  }
  add(child: MyNode) {
    this.chilren.push(child);
  }

  remove(child: MyNode) {
    this.chilren = this.chilren.filter(item => item !== child);
  }

  getChild(i) {
    return this.chilren[i];
  }

  hasChildren() {
    return this.chilren.length > 0;
  }
}

function traverse(indent, node) {
  for (let i = 0, len = node.children.length; i < len; i++) {
    traverse(indent, node.getChild(i));
  }
}
