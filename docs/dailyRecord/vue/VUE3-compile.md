<!--
 * @Author: luojw
 * @Date: 2022-08-22 16:59:48
 * @LastEditors: luojw
 * @LastEditTime: 2022-09-08 22:50:00
 * @Description:
-->

# 编译模块

在我们写组件的时候, 通常习惯使用 template 去编写组件而不是使用 render 函数, 所以我们需要将 template 编译成 render 函数

整个编译过程如图

## 解析插值

### 简介

插值是 VUE 在 template 中十分常见的写法, 通过插值可以放入一个变量在模板里, 这里我们先实现一个最简单的 template 插值解析, 将一个有插值的 template 字符串解析成 ast

```ts
import { NodeTypes } from "../src/ast";
import { baseParse } from "../src/parse";
describe("Parse", () => {
  describe("interpolation", () => {
    test("simple interpolation", () => {
      const ast = baseParse("{{ message }}");

      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: "message",
        },
      });
    });
  });
});
```

### 代码

新建一个 ast.ts 枚举抽象语法树节点的各种类型

```ts
export const enum NodeTypes {
  INTERPOLATION, // 插值
  SIMPLE_EXPRESSION, // 表达式
  ELEMENT, // 标签
  TEXT, // 文本
  ROOT,
}
```

新建一个 parse.ts 对 template 的插值进行解析, 核心是抓住 "{{" "}}" 这两个字眼, 做搜集匹配

```ts
import { NodeTypes } from "./ast";

export function baseParse(content: string) {
  // 创建一个解析对象
  const context = createParserContext(content);
  return createRoot(parseChildren(context));
}

function createParserContext(content: string) {
  return {
    source: content,
  };
}

function parseChildren(context) {
  const nodes = [];

  let node;
  if (context.source.startsWith("{{")) {
    // 解析插值
    node = parseInterpolation(context);
  }

  nodes.push(node);

  return nodes;
}

function parseInterpolation(context) {
  // {{ message }}

  const openDelimiter = "{{";
  const closeDelimiter = "}}";

  const closeIndex = context.source.indexOf(
    closeDelimiter,
    openDelimiter.length
  );

  //  message }}
  advanceBy(context, openDelimiter.length);

  const rawContentLength = closeIndex - openDelimiter.length;

  const rawContent = parseTextData(context, rawContentLength);
  // message
  const content = rawContent.trim();

  // context.source 全部解析完
  advanceBy(context, closeDelimiter.length);

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content,
    },
  };
}

function parseTextData(context, length) {
  const content = context.source.slice(0, length);

  advanceBy(context, length);
  return content;
}

// 推进内容
function advanceBy(context, length: number) {
  context.source = context.source.slice(length);
}

function createRoot(children) {
  return {
    children,
    type: NodeTypes.ROOT,
  };
}
```

## 解析 element 标签

### 简介

测试代码如下, 生成一个最简单标签的 ast

```ts
describe("element", () => {
  it("simple element div", () => {
    const ast = baseParse("<div></div>");

    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: "div",
    });
  });
});
```

### 代码

```ts
function parseChildren(context) {
  const nodes = [];

  let node;
  const s = context.source;
  if (s.startsWith("{{")) {
    // 解析插值
    node = parseInterpolation(context);
  } else if (s[0] === "<") {
    if (/[a-z]/i.test(s[1])) {
      node = parseElement(context);
    }
  }

  nodes.push(node);

  return nodes;
}

function parseElement(context) {
  const element = parseTag(context, TagType.Start);

  parseTag(context, TagType.End);

  return element;
}

function parseTag(context, type: TagType) {
  // <div></div>

  // 正则匹配 ['<div', 'div']
  const match = /^<\/?([a-z]*)/i.exec(context.source);
  const tag = match[1];

  // 推进模版
  advanceBy(context, match[0].length);
  advanceBy(context, 1);

  if (type === TagType.End) return;

  return {
    type: NodeTypes.ELEMENT,
    tag,
  };
}
```

## 解析文本

### 简介

测试代码如下, 生成一个最简单文本的 ast

```ts
describe("text", () => {
  it("simple text", () => {
    const ast = baseParse("some text");

    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.TEXT,
      content: "some text",
    });
  });
});
```

### 代码

当解析节点发现既不是插值又不说 element 标签的时候, 我们就可以把节点当成文本处理

```ts
function parseChildren(context) {
  const nodes = [];

  let node;
  const s = context.source;
  if (s.startsWith("{{")) {
    // 解析插值
    node = parseInterpolation(context);
  } else if (s[0] === "<") {
    if (/[a-z]/i.test(s[1])) {
      node = parseElement(context);
    }
  }

  if (!node) {
    // 上面判断都不符合, 将作为text处理
    node = parseText(context);
  }

  nodes.push(node);

  return nodes;
}

function parseText(context) {
  // 1. 获取content
  const content = parseTextData(context, context.source.length);

  return {
    type: NodeTypes.TEXT,
    content,
  };
}
```

## 完整的 template 解析

### 简介

有了上面的基础, 现在我们可以整合实现一个完整的 template 解析 ast 逻辑

```ts
test("hello world", () => {
  const ast = baseParse("<div>hi,{{message}}</div>");
  expect(ast.children[0]).toStrictEqual({
    type: NodeTypes.ELEMENT,
    tag: "div",
    children: [
      {
        type: NodeTypes.TEXT,
        content: "hi,",
      },
      {
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: "message",
        },
      },
    ],
  });
});

test("should throw error when lack end tag", () => {
  expect(() => {
    baseParse("<div><span></div>");
  }).toThrow(`缺少结束标签:span`);
});
```

### 代码

```ts
export function baseParse(content: string) {
  const context = createParserContext(content);
  return createRoot(parseChildren(context, []));
}

function parseChildren(context, ancestors) {
  const nodes: any = [];

  let node;
  while (!isEnd(context, ancestors)) {
    // 如果context还有值 继续解析
    const s = context.source;
    if (s.startsWith("{{")) {
      // 解析插值
      node = parseInterpolation(context);
    } else if (s[0] === "<") {
      if (/[a-z]/i.test(s[1])) {
        node = parseElement(context, ancestors);
      }
    }

    if (!node) {
      // 上面判断都不符合, 将作为text处理
      node = parseText(context);
    }

    nodes.push(node);
  }

  return nodes;
}

function isEnd(context, ancestors) {
  const s = context.source;
  if (s.startsWith("</")) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const tag = ancestors[i].tag;
      if (startsWithEndTagOpen(s, tag)) {
        return true;
      }
    }
  }
  return !s;
}

function startsWithEndTagOpen(source, tag) {
  // 匹配判断标签是否闭合
  return (
    source.startsWith("</") &&
    source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
  );
}

function parseElement(context, ancestors) {
  const element = parseTag(context, TagType.Start);
  // 将标签存入栈中
  ancestors.push(element);

  // 继续解析标签下的内容
  element.children = parseChildren(context, ancestors);

  // 标签内容解析完成, 标签出栈
  ancestors.pop();

  if (startsWithEndTagOpen(context.source, element.tag)) {
    // 推进source
    parseTag(context, TagType.End);
  } else {
    throw new Error(`缺少结束标签:${element.tag}`);
  }

  return element;
}

function parseText(context) {
  // 截取text部分
  let endIndex = context.source.length;
  let endTokens = ["<", "{{"];

  for (let i = 0; i < endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i]);
    if (index !== -1 && endIndex > index) {
      endIndex = index;
    }
  }

  //  获取content
  const content = parseTextData(context, endIndex);

  return {
    type: NodeTypes.TEXT,
    content,
  };
}
```

## 实现 transform 功能

### 简介

对前面通过 template 生成的 ast 树进行修改, 例如需要对 TEXT 节点的内容进行修改

测试代码如下:

```ts
import { NodeTypes } from "../src/ast";
import { baseParse } from "../src/parse";
import { transform } from "../src/transform";

describe("transform", () => {
  it("happy path", () => {
    const ast = baseParse("<div>hi,{{message}}</div>");

    const plugin = (node) => {
      if (node.type === NodeTypes.TEXT) {
        node.content = node.content + " mini-vue";
      }
    };

    transform(ast, {
      nodeTransforms: [plugin],
    });

    const nodeText = ast.children[0].children[0];
    expect(nodeText.content).toBe("hi, mini-vue");
  });
});
```

### 代码

新建 transform.ts

```ts
export function transform(root, options = {}) {
  const context = createTransformContext(root, options);

  traverseNode(root, context);
  createRootCodegen(root);
}

function createTransformContext(root: any, options: any) {
  // 搜集 ast 树 和 nodeTransforms
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
  };

  return context;
}

// 深度优先, 遍历 ast 树
function traverseNode(node, context) {
  const nodeTransforms = context.nodeTransforms;
  for (let i = 0; i < nodeTransforms.length; i++) {
    const transform = nodeTransforms[i];
    // 执行 transform
    transform(node);
  }

  traverseChildren(node, context);
}

function traverseChildren(node: any, context: any) {
  const children = node.children;

  if (children) {
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      traverseNode(node, context);
    }
  }
}
```

## 生成 render (字符串)

### 简介

将 ast 转换成 render 函数, 生成一个渲染字符串的 render

生成的 render 函数长什么样子可以参考下面这个网站

https://vue-next-template-explorer.netlify.app/

```ts
import { generate } from "../src/codegen";
import { baseParse } from "../src/parse";
import { transform } from "../src/transform";

describe("codegen", () => {
  it("string", () => {
    const ast = baseParse("hi");
    transform(ast);
    const { code } = generate(ast);
    // `"return function render(_ctx, _cache){return 'hi'}"`;
    expect(code).toMatchSnapshot();
  });
});
```

### 代码

修改 transform.ts

```ts
export function transform(root, options = {}) {
  const context = createTransformContext(root, options);

  traverseNode(root, context);
  createRootCodegen(root);
}

function createRootCodegen(root: any) {
  // 转换render函数的根节点
  root.codegenNode = root.children[0];
}
```

新建 codegen.ts 对 render 函数进行构建

```ts
export function generate(ast) {
  const context = createCodegenContext();
  const { push } = context;
  push("return ");

  // 固定内容
  const functionName = "render";
  const args = ["_ctx", "_cache"];
  const signature = args.join(", ");

  push(`function ${functionName}(${signature}){`);
  push("return ");
  genNode(ast.codegenNode, context);
  push("}");

  return {
    code: context.code,
  };
}

function createCodegenContext() {
  const context = {
    code: "",
    push(source) {
      context.code += source;
    },
  };

  return context;
}

function genNode(node, context) {
  const { push } = context;
  push(`'${node.content}'`);
}
```

## 生成 render (插值)

### 简介

ast 生成一个渲染插值的 render 函数, 并添加 transformExpression 对插值类型的 ast 修改

```ts
export function transformExpression(node) {
  if (node.type === NodeTypes.INTERPOLATION) {
    node.content = processExpression(node.content);
  }
}

function processExpression(node: any) {
  // 在所有插值前增加 _ctx 表示变量值是从组建对象来获取的
  node.content = `_ctx.${node.content}`;
  return node;
}
```

```ts
it("interpolation", () => {
  const ast = baseParse("{{message}}");
  transform(ast, {
    nodeTransforms: [transformExpression],
  });
  const { code } = generate(ast);
  expect(code).toMatchSnapshot();
  /*
    "const { toDisplayString:_toDisplayString } = Vue;
    return function render(_ctx, _cache){return _toDisplayString(_ctx.message)"
    */
});
```

### 代码

新建 runtimeHelpers.ts , 定义基本常量, 并修改 transform.ts

runtimeHelpers.ts

```ts
export const TO_DISPLAY_STRING = Symbol("toDisplayString");

export const helperMapName = {
  [TO_DISPLAY_STRING]: "toDisplayString",
};
```

transform.ts

```ts
import { NodeTypes } from "./ast";
import { TO_DISPLAY_STRING } from "./runtimeHelpers";

export function transform(root, options = {}) {
  const context = createTransformContext(root, options);

  traverseNode(root, context);
  createRootCodegen(root);

  // 获取全部需要import的常量
  root.helpers = [...context.helpers.keys()];
}

function createRootCodegen(root: any) {
  root.codegenNode = root.children[0];
}

function createTransformContext(root: any, options: any) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
    helpers: new Map(),
    helper(key) {
      context.helpers.set(key, 1);
    },
  };

  return context;
}

function traverseNode(node, context) {
  const nodeTransforms = context.nodeTransforms;
  for (let i = 0; i < nodeTransforms.length; i++) {
    const transform = nodeTransforms[i];
    transform(node);
  }

  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      // 处理插值, 需要添加引入
      context.helper(TO_DISPLAY_STRING);
      break;
    case NodeTypes.ROOT:
    case NodeTypes.ELEMENT:
      traverseChildren(node, context);
      break;

    default:
      break;
  }
}

function traverseChildren(node: any, context: any) {
  const children = node.children;

  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    traverseNode(node, context);
  }
}
```

修改 codegen.ts, 

```ts
import { NodeTypes } from "./ast";
import { helperMapName, TO_DISPLAY_STRING } from "./runtimeHelpers";

export function generate(ast) {
  const context = createCodegenContext();
  const { push } = context;

  genFunctionPreamble(ast, context);

  const functionName = "render";
  const args = ["_ctx", "_cache"];
  const signature = args.join(", ");

  push(`function ${functionName}(${signature}){`);
  push("return ");
  genNode(ast.codegenNode, context);
  push("}");

  return {
    code: context.code,
  };
}

function createCodegenContext() {
  const context = {
    code: "",
    push(source) {
      context.code += source;
    },
    helper(key) {
      return `_${helperMapName[key]}`;
    },
  };

  return context;
}

function genFunctionPreamble(ast, context) {
  // 引入函数
  const { push } = context;
  const VueBinging = "Vue";
  const aliasHelper = (s) => `${helperMapName[s]}:_${helperMapName[s]}`;
  if (ast.helpers.length > 0) {
    push(
      `const { ${ast.helpers.map(aliasHelper).join(", ")} } = ${VueBinging};\n`
    );
  }

  push("return ");
}

function genNode(node, context) {
  // 根据 ast 节点的不同类型, 编写 render
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context);
      break;
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context);
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context);
      break;
    default:
      break;
  }
}

function genText(node: any, context: any) {
  const { push } = context;
  push(`'${node.content}'`);
}

function genInterpolation(node: any, context: any) {
  const { push, helper } = context;
  push(`${helper(TO_DISPLAY_STRING)}(`);
  genNode(node.content, context);
  push(")");
}

function genExpression(node: any, context: any) {
  const { push } = context;
  push(`${node.content}`);
}
```

## 生成完整 render

### 简介

增加两个 transform 的处理函数 transformElement, transformText 完成基本的 render 函数生成逻辑

```js
it("element", () => {
  const ast = baseParse("<div>hi,{{message}}</div>");
  transform(ast, {
    nodeTransforms: [transformExpression, transformElement, transformText],
  });
  const { code } = generate(ast);
  expect(code).toMatchSnapshot();
});
```

```ts
export function transformElement(node, context) {
  if (node.type === NodeTypes.ELEMENT) {
    return () => {
      // tag
      const vnodeTag = `'${node.tag}'`;

      // props
      let vnodeProps;

      // children
      const children = node.children;
      let vnodeChildren = children[0];

      node.codegenNode = createVNodeCall(
        context,
        vnodeTag,
        vnodeProps,
        vnodeChildren
      );
    };
  }
}

function createVNodeCall(context, tag, props, children) {
  context.helper(CREATE_ELEMENT_VNODE);

  return {
    type: NodeTypes.ELEMENT,
    tag,
    props,
    children,
  };
}
```

### 代码

修改 transform.ts 

```ts
function createRootCodegen(root: any) {
  const child = root.children[0];
  if (child.type === NodeTypes.ELEMENT) {
    root.codegenNode = child.codegenNode;
  } else {
    root.codegenNode = root.children[0];
  }
}
```