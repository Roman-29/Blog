# webpack

在ES6之前,我们要想进行模块化开发,就必须借助于其他的
工具，让我们可以进行模块化开发。

并且在通过模块化开发完成了项目后,还需要处理模块间的各
种依赖,并且将其进行整合打包。

而webpack其中一个核心就是让我们可能进行模块化开发，并
且会帮助我们处理模块间的依赖关系。

而且不仅仅是JavaScript文件,我们的CSS、图片、json文件
等等在webpack中都可以被当做模块来使用。

这就是webpack中模块化的概念。

**webpack，node，npm的关系图**

![image](../.vuepress/public/images/Engineering/Modular/webpack&node&npm.png)

**核心概念**

* Entry：入口，Webpack 执行构建的第一步将从 Entry 开始，可抽象成输入。
* Module：模块，在 Webpack 里一切皆模块，一个模块对应着一个文件。Webpack 会从配置的 Entry 开始递归找出所有依赖的模块。
* Chunk：代码块，一个 Chunk 由多个模块组合而成，用于代码合并与分割。
* Loader：模块转换器，用于把模块原内容按照需求转换成新内容。
* Plugin：扩展插件，在 Webpack 构建流程中的特定时机注入扩展逻辑来改变构建结果或做你想要的事情。
* Output：输出结果，在 Webpack 经过一系列处理并得出最终想要的代码后输出结果。

Webpack 启动后会从 Entry 里配置的 Module 开始递归解析 Entry 依赖的所有 Module。 每找到一个 Module， 就会根据配置的 Loader 去找出对应的转换规则，对 Module 进行转换后，再解析出当前 Module 依赖的 Module。 这些模块会以 Entry 为单位进行分组，一个 Entry 和其所有依赖的 Module 被分到一个组也就是一个 Chunk。最后 Webpack 会把所有 Chunk 转换成文件输出。 在整个流程中 Webpack 会在恰当的时机执行 Plugin 里定义的逻辑。

## 入门

### 安装与使用

webpack全局安装与本地安装

```
全局安装：
npm install webpack -g
```

全局安装的弊端：当clone一个项目并且希望打包测试的时候，如果该项目用的webpack版本与之前全局安装的版本不一致，有可能打包失败，这时就需要使用本地安装的webpack进行打包。

```
在本地安装特定版本号
--save-dev 表示开发时依赖

cd 对应目录
npm install webpack@3.6.0 --save-dev
```

本地安装完后`package.json`文件会多出一个`devDependencies`
```
"devDependencies": {
  "webpack": "^3.6.0"
}
```

这时再执行脚本，会优先使用本地安装的webpack进行打包

在根目录下创建一个`webpack.config.js`文件

```js
webpack.config.js

// 动态获取路径（使用node包里的path工具）
const path = require("path");

// 必须使用CommonJs规范
module.exports = {
  entry: {
    // 入口js文件
    app: "./app.js"
  },
  output: {
    // 打包文件的输出目录,必须是绝对路径否则报错
    // __dirname是node自带的全局变量（当前文件的路径）
    path: path.resolve(__dirname, "dist"),
    // 打包文件的名称
    // filename: "build.js",

    // 这种命名格式为原名称+hash八位随机值.js
    // 可以知道打包文件的源文件名称并且保证文件名不重复
    filename: "[name].[hash:8].js",
    // 当涉及到url的都会拼接dist/
    publicPath:"./dist/"
  }
};
```

此时目录结构如下
```
|-src
  |-index.html
  |-main.js
  |-show.js
  |-package.json
  |-webpack.config.js
```

```html
index.html
<html>
<head>
  <meta charset="UTF-8">
</head>
<body>
  <div id="app"></div>
  <!--导入 webpack 输出的 JS 文件-->
  <script src="./dist/bundle.js"></script>
</body>
</html>
```
```js
main.js
// 通过 CommonJS 规范导入 show 函数
const show = require('./show.js');
// 执行 show 函数
show('Webpack');
```
```js
show.js
// 操作 DOM 元素，把 content 显示到网页上
function show(content) {
  window.document.getElementById('app').innerText = 'Hello,' + content;
}

// 通过 CommonJS 规范导出 show 函数
module.exports = show;
```

同时在终端输入`npm init`生成的npm包管理文件`package.json`增加一个脚本

```js
package.json

{
  "scripts": {
    // 添加脚本
    "build": "webpack"
  }
}
```

最后在终端运行`npm run build`将文件打包到dist文件下
并且在index.html中将打包文件引用即可

### 使用 Loader

loader是webpack中非常核心的概念。在开发中不仅仅有基本的js代码处理,也需要加载css、图片,也包括一些高级的将ES6转成
ES5代码,将TypeScript转成ES5代码,将scss、less转成css ,将.vue文件转成js文件等等。

对于webpack本身的能力来说,对于这些转化是不支持的。需要给webpack扩展对应的loader。

loader使用过程:
步骤一: 通过npm安装需要使用的loader
步骤二:在webpack.config.js中的modules关键字下进行配置
大部分loader我们都可以在webpack的官网中找到，并且学习对应的用法。
网站地址：https://www.webpackjs.com/loaders/

例如现在希望将CSS样式也进行打包

目录结构如下
```
|-src
  |-css
    |-normal.css
  |-js
    |-utils.js
  |-main.js
```

```css
normal.css

body{
  background-color: red;
}
```

```js
utils.js

function add(a,b){
  return a+b;
}

function mul(a,b){
  return a*b;
}

module.exports={
  add,mul
}
```

```js
main.js

const {add,mul} = require("./js/utils.js")

console.log(add(3,4));
console.log(mul(3,4));

// 引入css文件
require("./css/normal.css")

document.writeln("<h2>罗健文</h2>")
```

要支持非 JavaScript 类型的文件，需要使用 Webpack 的 Loader 机制。安装好对应的loader（可以看webpack官网，查找需要的loader）后，Webpack的配置修改使用如下：

```js
const path = require('path');

module.exports = {
  // JavaScript 执行入口文件
  entry: './main.js',
  output: {
    // 把所有依赖的模块合并输出到一个 bundle.js 文件
    filename: 'bundle.js',
    // 输出文件都放到 dist 目录下
    path: path.resolve(__dirname, './dist'),
  },
  module: {
    rules: [
      {
        // 用正则去匹配要用该 loader 转换的 CSS 文件
        test: /\.css$/,
        // 先使用 css-loader 读取 CSS 文件，再交给 style-loader 把 CSS 内容注入到 JavaScript 里
        use: ['style-loader', 'css-loader?minimize'],
      }
    ]
  }
};
```

重新执行构建时，会发现 bundle.js 文件被更新了，里面注入了在 main.css 中写的 CSS，而不是会额外生成一个 CSS 文件。
这其实都是 style-loader 的功劳，它的工作原理大概是把 CSS 内容用 JavaScript 里的字符串存储起来，在网页执行 JavaScript 时通过 DOM 操作动态地往 HTML head 标签里插入 HTML style 标签。

**注意**

1. use 属性的值需要是一个由 Loader 名称组成的数组，Loader 的执行顺序是由后到前的
2.  每一个 Loader 都可以通过 URL querystring 的方式传入参数，例如 css-loader?minimize 中的 minimize 告诉 css-loader 要开启 CSS 压缩。

给 Loader 传入属性的方式除了有 querystring 外，还可以通过 Object 传入

```js
use: [
  'style-loader', 
  {
    loader:'css-loader',
    options:{
      minimize:true,
    }
  }
]
```

### 使用 Plugin

Plugin 是用来扩展 Webpack 功能的，通过在构建流程里注入钩子实现，它给 Webpack 带来了很大的灵活性。

在上一节中通过 Loader 加载了 CSS 文件，本节将通过 Plugin 把注入到 bundle.js 文件里的 CSS 提取到单独的文件中。

安装插件
```
npm i -D extract-text-webpack-plugin
```

webpack配置修改如下：
```js
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  ...
  module: {
    rules: [
      {
        // 用正则去匹配要用该 loader 转换的 CSS 文件
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          // 转换 .css 文件需要使用的 Loader
          use: ['css-loader'],
        }),
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin({
      // 从 .js 文件中提取出来的 .css 文件的名称
      filename: `[name]_[contenthash:8].css`,
    }),
  ]
};
```

从以上代码可以看出， Webpack 是通过 plugins 属性来配置需要使用的插件列表的。 plugins 属性是一个数组，里面的每一项都是插件的一个实例，在实例化一个组件时可以通过构造函数传入这个组件支持的配置属性。


### 使用 DevServer

为了让webpack可以提供 HTTP 服务，可以安装官方提供的开发工具 DevServer 

安装插件
```
npm i -D webpack-dev-server
```

webpack配置增加内容如下：
```js
const webpack = require("webpack");

module.exports = {
  devServer: {
    port: 8099, // 本地服务器端口号
    hot: true, // 模块热替换 默认是否
    overlay: true, // 如果代码出错，会在浏览器页面弹出“浮动层”。类似于 vue-cli 等脚手架
    historyApiFallback: {
      // HTML5 history模式
      rewrites: [{
        from: /.*/,
        to: "/index.html"
      }]
    }
  },
  plugins: [
    // 模块热替换需要用到
    new webpack.HotModuleReplacementPlugin()
  ]
};
```

DevServer 启动后会一直驻留在后台保持运行，访问这个网址就能获取项目根目录下的 index.html。 
DevServer 会把 Webpack 构建出的文件保存在内存中，在要访问输出的文件时，必须通过 HTTP 服务访问。 由于 DevServer 不会理会 webpack.config.js 里配置的 output.path 属性，所以要获取 bundle.js 的正确 URL 是 `http://localhost:port/bundle.js`

#### 实时预览

每次修改文件保存后浏览器会自动刷新,运行出修改后的效果。

如果尝试修改 index.html 文件并保存，你会发现这并不会触发以上机制，导致这个问题的原因是 Webpack 在启动时会以配置里的 entry 为入口去递归解析出 entry 所依赖的文件，只有 entry 本身和依赖的文件才会被 Webpack 添加到监听列表里。 而 index.html 文件是脱离了 JavaScript 模块化系统的，所以 Webpack 不知道它的存在。

#### 模块热替换

除了通过重新刷新整个网页来实现实时预览，DevServer 还有一种被称作模块热替换的刷新技术。 模块热替换能做到在不重新加载整个网页的情况下，通过将被更新过的模块替换老的模块，再重新执行一次来实现实时预览。 模块热替换相对于默认的刷新机制能提供更快的响应和更好的开发体验。

#### 支持 Source Map

在浏览器中运行的 JavaScript 代码都是编译器输出的代码，这些代码的可读性很差。
Webpack 支持生成 Source Map，只需在启动时带上 --devtool source-map 参数。或者在webpack.config.js设置devtool为source-map，就可在 Sources 栏中看到可调试的源代码了。


## 配置

### Entry

#### context

Webpack 在寻找相对路径的文件时会以 `context` 为根目录，`context` 默认为执行启动 Webpack 时所在的当前工作目录。 如果想改变 `context` 的默认配置，则可以在配置文件里这样设置它：

```js
module.exports = {
  context: path.resolve(__dirname, 'app')
}
```

注意， context 必须是一个绝对路径的字符串。

#### Entry 类型

类型|例子|含义
-|-|-
string|'./app/entry'|入口模块的文件路径，可以是相对路径。
array|['./app/entry1', './app/entry2']|入口模块的文件路径，可以是相对路径。
object|{ a: './app/entry-a', b: ['./app/entry-b1', './app/entry-b2']}|配置多个入口，每个入口生成一个 Chunk

#### 配置动态 Entry

Entry的配置有时会受到到其他因素的影响导致不能写成静态的值。解决方法是把 Entry 设置成一个函数去动态返回上面所说的配置

代码如下：
```js
// 同步函数
entry: () => {
  return {
    a:'./pages/a',
    b:'./pages/b',
  }
};
// 异步函数
entry: () => {
  return new Promise((resolve)=>{
    resolve({
       a:'./pages/a',
       b:'./pages/b',
    });
  });
};
```

### Output

#### filename

配置输出文件的名称。

#### path

输出文件存放在本地的目录，必须是 string 类型的绝对路径。

#### publicPath

在复杂的项目里可能会有一些构建出的资源需要异步加载，加载这些异步资源需要对应的 URL 地址。

publicPath并不会对生成文件的路径造成影响，主要是对页面里面引入的资源的路径做对应的补全，常见的就是css文件里面引入的图片

#### crossOriginLoading

Webpack 输出的部分代码块可能需要异步加载，而异步加载是通过 JSONP 方式实现的。 
JSONP 的原理是动态地向 HTML 中插入一个`<script src="url"></script>`标签去加载异步资源。 output.crossOriginLoading 则是用于配置这个异步插入的标签的 crossorigin 值。

script 标签的 crossorigin 属性可以取以下值：

* anonymous(默认) 在加载此脚本资源时不会带上用户的 Cookies；
* use-credentials 在加载此脚本资源时会带上用户的 Cookies。

通常用设置 crossorigin 来获取异步加载的脚本执行时的详细错误信息。

### Module

module 配置如何处理模块。

#### 配置 Loader

`rules`配置模块的读取和解析规则，通常用来配置`Loader`。其类型是一个数组，数组里每一项都描述了如何去处理部分文件。 

下面来通过一个例子来说明具体使用方法：

```js
module: {
  rules: [
    {
      // 命中 JavaScript 文件
      test: /\.js$/,
      // 用 babel-loader 转换 JavaScript 文件
      // ?cacheDirectory 表示传给 babel-loader 的参数，用于缓存 babel 编译结果加快重新编译速度
      use: [
        {
          loader:'babel-loader',
          options:{
            cacheDirectory:true,
          },
          // enforce:'post' 的含义是把该 Loader 的执行顺序放到最后
          // enforce 的值还可以是 pre，代表把 Loader 的执行顺序放到最前面
          enforce:'post'
        }
      ],
      // 只命中src目录里的js文件，加快 Webpack 搜索速度
      include: path.resolve(__dirname, 'src')
    },
    {
      // 命中 SCSS 文件
      test: /\.scss$/,
      // 使用一组 Loader 去处理 SCSS 文件。
      // 处理顺序为从后到前，即先交给 sass-loader 处理，再把结果交给 css-loader 最后再给 style-loader。
      use: ['style-loader', 'css-loader', 'sass-loader'],
      // 排除 node_modules 目录下的文件
      exclude: path.resolve(__dirname, 'node_modules'),
    },
    {
      // 对非文本文件采用 file-loader 加载
      test: /\.(gif|png|jpe?g|eot|woff|ttf|svg|pdf)$/,
      use: ['file-loader'],
    },
  ]
}
```

上面的例子中 `test` `include` `exclude` 这三个命中文件的配置项只传入了一个字符串或正则，其实它们还都支持数组类型，使用如下：

```js
{
  test:[
    /\.jsx?$/,
    /\.tsx?$/
  ],
  include:[
    path.resolve(__dirname, 'src'),
    path.resolve(__dirname, 'tests'),
  ],
  exclude:[
    path.resolve(__dirname, 'node_modules'),
    path.resolve(__dirname, 'bower_modules'),
  ]
}
```

### Resolve

Webpack 在启动后会从配置的入口模块出发找出所有依赖的模块，Resolve 配置 Webpack 如何寻找模块所对应的文件。 Webpack 内置 JavaScript 模块化语法解析功能，默认会采用模块化标准里约定好的规则去寻找，但你也可以根据自己的需要修改默认的规则。

#### alias

resolve.alias 配置项通过别名来把原导入路径映射成一个新的导入路径。例如使用以下配置:

```js
// Webpack alias 配置
resolve:{
  alias:{
    components: './src/components/'
  }
}
```

当你通过 `import Button from 'components/button'`导入时，实际上被 alias 等价替换成了 `import Button from './src/components/button'`。 

#### extensions

在导入语句没带文件后缀时，Webpack 会自动带上后缀后去尝试访问文件是否存在。 resolve.extensions 用于配置在尝试过程中用到的后缀列表，默认是：

```
extensions: ['.js', '.json']
```

也就是说当遇到 `require('./data')` 这样的导入语句时，Webpack 会先去寻找 `./data.js` 文件，如果该文件不存在就去寻找 `./data.json` 文件， 如果还是找不到就报错。

#### modules

`resolve.modules`配置 Webpack 去哪些目录下寻找第三方模块，默认是只会去 node_modules 目录下寻找。 有时项目里会有一些模块会大量被其它模块依赖和导入，由于其它模块的位置分布不定，针对不同的文件都要去计算被导入模块文件的相对路径，就像这样 import '../../../components/button' 这时你可以利用 modules 配置项优化，假如那些被大量导入的模块都在 ./src/components 目录下，把 modules 配置成

```js
modules:['./src/components','node_modules']
```

就可以简单通过 import 'button' 导入`./src/components`路径下的`button`。

### Plugin

Plugin 用于扩展 Webpack 功能，各种各样的 Plugin 几乎让 Webpack 可以做任何构建相关的事情。

#### 配置 Plugin

Plugin 的配置很简单，`plugins` 配置项接受一个数组，数组里每一项都是一个要使用的 Plugin 的实例，Plugin 需要的参数通过构造函数传入。

```js
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');

module.exports = {
  plugins: [
    // 所有页面都会用到的公共代码提取到 common 代码块中
    new CommonsChunkPlugin({
      name: 'common',
      chunks: ['a', 'b']
    }),
  ]
};
```

使用 Plugin 的难点在于掌握 Plugin 本身提供的配置项，而不是如何在 Webpack 中接入 Plugin。

### devServer

只有在通过 DevServer 去启动 Webpack 时配置文件里 devServer 才会生效，因为这些参数所对应的功能都是 DevServer 提供的，Webpack 本身并不认识 devServer 配置项。

#### hot

`devServer.hot` 配置是否启用模块热替换功能。 DevServer 默认的行为是在发现源代码被更新后会通过自动刷新整个页面来做到实时预览，开启模块热替换功能后将在不刷新整个页面的情况下通过用新模块替换老模块来做到实时预览。

#### historyApiFallback

用于方便的开发使用了 HTML5 History API 的单页应用。 这类单页应用要求服务器在针对任何命中的路由时都返回一个对应的 HTML 文件，例如在访问 http://localhost/user 和 http://localhost/home 时都返回 index.html 文件， 浏览器端的 JavaScript 代码会从 URL 里解析出当前页面的状态，显示出对应的界面。

配置 historyApiFallback 最简单的做法是：

```js
historyApiFallback: true
```

这会导致任何请求都会返回 index.html 文件，这只能用于只有一个 HTML 文件的应用。

如果应用由多个单页应用组成，这就需要 `DevServer` 根据不同的请求来返回不同的 HTML 文件，配置如下：

```js
historyApiFallback: {
  // 使用正则匹配命中路由
  rewrites: [
    // /user 开头的都返回 user.html
    { from: /^\/user/, to: '/user.html' },
    { from: /^\/game/, to: '/game.html' },
    // 其它的都返回 index.html
    { from: /./, to: '/index.html' },
  ]
}
```

#### host

用于配置 DevServer 服务监听的地址。 例如你想要局域网中的其它设备访问你本地的服务，可以在启动 DevServer 时带上 `--host 0.0.0.0`。 host 的默认值是 `127.0.0.1` 即只有本地可以访问 DevServer 的 HTTP 服务。

#### port

配置 DevServer 服务监听的端口，默认使用 8080 端口。

### 多种配置类型

除了通过导出一个 Object 来描述 Webpack 所需的配置外，还有其它更灵活的方式，以简化不同场景的配置。

#### 导出一个 Function

在大多数时候需要从同一份源代码中构建出多份代码，例如一份用于开发时，一份用于发布到线上。

如果采用导出一个 Object 来描述 Webpack 所需的配置的方法，需要写两个文件。 一个用于开发环境，一个用于线上环境。再在启动时通过 webpack --config webpack.config.js 指定使用哪个配置文件。

采用导出一个 Function 的方式，能通过 JavaScript 灵活的控制配置，做到只用写一个配置文件就能完成以上要求。

导出一个 Function 的使用方式如下：

```js
const path = require('path');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');

module.exports = function (env = {}, argv) {
  const plugins = [];

  const isProduction = env['production'];

  // 在生成环境才压缩
  if (isProduction) {
    plugins.push(
      // 压缩输出的 JS 代码
      new UglifyJsPlugin()
    )
  }

  return {
    plugins: plugins,
    // 在生成环境不输出 Source Map
    devtool: isProduction ? undefined : 'source-map',
  };
}
```

在运行 Webpack 时，会给这个函数传入2个参数，分别是：

1. env：当前运行时的 Webpack 专属环境变量，env 是一个 Object。读取时直接访问 Object 的属性，设置它需要在启动 Webpack 时带上参数。例如启动命令是 webpack --env.production --env.bao=foo时，则 env 的值是 {"production":"true","bao":"foo"}。
2. argv：代表在启动 Webpack 时所有通过命令行传入的参数，例如 --config、--env、--devtool，可以通过 webpack -h 列出所有 Webpack 支持的命令行参数。

就以上配置文件而言，在开发时执行命令 webpack 构建出方便调试的代码，在需要构建出发布到线上的代码时执行 webpack --env.production 构建出压缩的代码。

#### 导出一个返回 Promise 的函数

在有些情况下你不能以同步的方式返回一个描述配置的 Object，Webpack 还支持导出一个返回 Promise 的函数，使用如下：

```js
module.exports = function(env = {}, argv) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        // ...
      })
    }, 5000)
  })
}
```

## 实战

### 使用 ES6 语言

通常我们需要把采用 ES6 编写的代码转换成目前已经支持良好的 ES5 代码，这包含2件事：

1. 把新的 ES6 语法用 ES5 实现，例如 ES6 的 class 语法用 ES5 的 prototype 实现。
2. 给新的 API 注入 polyfill ，例如项目使用 fetch API 时，只有注入对应的 polyfill 后，才能在低版本浏览器中正常运行。

#### Babel

Babel 是一个 JavaScript 编译器，能将 ES6 代码转为 ES5 代码，babel相关的技术生态：

* babel-loader: 负责 es6 语法转化
* babel-preset-env: 包含 es6、7 等版本的语法转化规则
* babel-polyfill: es6 内置方法和函数转化垫片
* babel-plugin-transform-runtime: 避免 polyfill 污染全局变量

#### 安装与使用

```
安装loader：
npm install babel-loader@8.0.0-beta.0 @babel/core @babel/preset-env webpack
或者
npm install babel-loader babel-core babel-preset-env webpack
```

在 webpack 配置对象中，需要添加 babel-loader 到 module 的规则列表中

```js
module: {
  rules: [
    {
      // 正则匹配.js结尾的文件
      test: /\.js$/,
      // 排除不需要转换的js文件
      exclude: /(node_modules|bower_components)/,
      // 
      use: {
            loader: "babel-loader" // 转化需要的loader
            // options选项配置在: .babelrc
            // options: {
            //   ...
            // }
        }
    }
  ]
}
```

同时在根目录增加一个`.babelrc`文件

```js
{
  "presets": [
    [
      "env",
      {
        "targets": {
          "browsers": ["last 2 versions"]
        }
      }
    ]
  ]
}
```

#### babel插件

由于babel默认只转换新的JavaScript语法，但对于一些新的API是不进行转化的（比如内建的Promise、WeakMap，静态方法如Array.from或者Object.assign），那么为了能够转化这些东西，我们就需要使用babel的插件

**`babel-polyfill`**

**特点**
1. 会将需要转化的API进行直接转化，这就导致用到这些API的地方会存在大量的重复代码
2. 是直接在全局作用域里进行垫片，所以会污染全局作用域
3. 是为开发应用准备的

```
安装：
npm install babel-polyfill -save

使用：
直接在main.js顶部使用: import "@babel/polyfill"
```

**`babel-runtime-transform`**

**特点**

1. 需要用到的垫片，会使用引用的方式引入，而不是直接替换，避免了垫片代码的重复
2. 由于使用引用的方式引入，所以不会直接污染全局作用域。
3. `babel-plugin-transform-runtime`不能单独作用，因为有一些静态方法，如`"foobar".includes("foo")`仍然需要引入`babel-polyfill`才能使用
4. 是为开发框架准备的

```
安装：
npm install babel-plugin-transform-runtime -save-dev
npm install babel-runtime -save

使用：
在.babelrc文件的plugins中添加：
"plugins": ["transform-runtime"]
```

### 为单页应用生成 HTML

在实际项目中，一个页面常常有很多资源要加载。接下来举一个实战中的例子，要求如下：

1. 项目采用 ES6 语言加 React 框架。
2. 给页面加入 Google Analytics，这部分代码需要内嵌进 HEAD 标签里去。
3. 给页面加入 Disqus 用户评论，这部分代码需要异步加载以提升首屏加载速度。
4. 压缩和分离 JavaScript 和 CSS 代码，提升加载速度。

推荐一个用于方便的解决以上问题的 Webpack 插件 web-webpack-plugin，首先，修改 Webpack 配置为如下：

```js
const path = require('path');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const { WebPlugin } = require('web-webpack-plugin');

module.exports = {
  entry: {
    app: './main.js'// app 的 JavaScript 执行入口文件
  },
  output: {
    filename: '[name]_[chunkhash:8].js',// 给输出的文件名称加上 Hash 值
    path: path.resolve(__dirname, './dist'),
  },
  module: {
    ...
  },
  plugins: [
    // 使用本文的主角 WebPlugin，一个 WebPlugin 对应一个 HTML 文件
    new WebPlugin({
      template: './template.html', // HTML 模版文件所在的文件路径
      filename: 'index.html' // 输出的 HTML 的文件名称
    }),
    new DefinePlugin({
      // 定义 NODE_ENV 环境变量为 production，以去除源码中只有开发时才需要的部分
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    // 压缩输出的 JavaScript 代码
    new UglifyJsPlugin({
      // 最紧凑的输出
      beautify: false,
      // 删除所有的注释
      comments: false,
      compress: {
        // 在UglifyJs删除没有用到的代码时不输出警告
        warnings: false,
        // 删除所有的 `console` 语句，可以兼容ie浏览器
        drop_console: true,
        // 内嵌定义了但是只用到一次的变量
        collapse_vars: true,
        // 提取出出现多次但是没有定义成变量去引用的静态值
        reduce_vars: true,
      }
    }),
    ...
  ],
};
```

可以看到WebPlugin指定了一个template文件，为HTML 模版文件，内容如下：

```html
<html>
<head>
  <meta charset="UTF-8">
  <!--注入 Chunk app 中的 CSS-->
  <link rel="stylesheet" href="app?_inline">
  <!--注入 google_analytics 中的 JS 代码-->
  <script src="./google_analytics.js?_inline"></script>
  <!--异步加载 Disqus 评论-->
  <script src="https://dive-into-webpack.disqus.com/embed.js" async></script>
</head>
<body>
  <div id="app"></div>
  <!--导入 Chunk app 中的 JS-->
  <script src="app"></script>
  <!--Disqus 评论容器-->
  <div id="disqus_thread"></div>
</body>
</html>
```

该文件描述了哪些资源需要被以何种方式加入到输出的 HTML 文件中。

以 `<link rel="stylesheet" href="app?_inline"> `为例，按照正常引入 CSS 文件一样的语法来引入 Webpack 生产的代码。 `href` 属性中的 `app?_inline` 可以分为两部分，前面的 `app` 表示 CSS 代码来自名叫 `app` 的 Chunk 中，后面的 `_inline` 表示这些代码需要被内嵌到这个标签所在的位置。

也就是说资源链接 URL 字符串里问号前面的部分表示资源内容来自哪里，后面的 querystring 表示这些资源注入的方式。

除了 _inline 表示内嵌外，还支持以下属性：

* _dist 只有在生产环境下才引入该资源
* _dev 只有在开发环境下才引入该资源
* _ie 只有IE浏览器才需要引入的资源，通过` [if IE]>resource<![endif] `注释实现
这些属性之间可以搭配使用，互不冲突。例如` app?_inline&_dist `表示只在生产环境下才引入该资源，并且需要内嵌到 HTML 里去。

### 管理多个单页应用

虽然上一节已经解决了自动化生成 HTML 的痛点，但是手动去管理多个单页应用的生成也是一件麻烦的事情。 来继续改造上一节的例子，要求如下：

* 项目目前共有2个单页应用组成，一个是主页 index.html，一个是用户登入页 login.html；
* 多个单页应用之间会有公共的代码部分，需要把这些公共的部分抽离出来，放到单独的文件中去以防止重复加载。例如多个页面都使用一套 CSS 样式，都采用了 React 框架，这些公共的部分需要抽离到单独的文件中；
* 随着业务的发展后面可能会不断的加入新的单页应用，但是每次新加入单页应用不能去改动构建相关的代码。

#### 解决方案

上一节中的 `web-webpack-plugin` 插件也内置了解决这个问题的方法，上一节中只使用了它的 `WebPlugin`， 这节将使用它的 `AutoWebPlugin` 来解决以上问题，使用方法非常简单，下面来教你具体如何使用。

项目源码目录结构如下：

```
├── pages
│   ├── index
│   │   ├── index.css // 该页面单独需要的 CSS 样式
│   │   └── index.js // 该页面的入口文件
│   └── login
│       ├── index.css
│       └── index.js
├── common.css // 所有页面都需要的公共 CSS 样式
├── google_analytics.js
├── template.html
└── webpack.config.js
```

从目录结构中可以看成出下几点要求：

* 所有单页应用的代码都需要放到一个目录下，例如都放在 pages 目录下；
* 一个单页应用一个单独的文件夹，例如最后生成的 index.html 相关的代码都在 index 目录下，login.html 同理；
* 每个单页应用的目录下都有一个 index.js 文件作为入口执行文件。

>虽然 AutoWebPlugin 强制性的规定了项目部分的目录结构，但从实战经验来看这是一种优雅的目录规范，合理的拆分了代码，又能让新人快速的看懂项目结构，也方便日后的维护。

Webpack 配置文件修改如下：

```js
const { AutoWebPlugin } = require('web-webpack-plugin');

// 使用本文的主角 AutoWebPlugin，自动寻找 pages 目录下的所有目录，把每一个目录看成一个单页应用
const autoWebPlugin = new AutoWebPlugin('pages', {
  template: './template.html', // HTML 模版文件所在的文件路径
  postEntrys: ['./common.css'],// 所有页面都依赖这份通用的 CSS 样式文件
  // 提取出所有页面公共的代码
  commonsChunk: {
    name: 'common',// 提取出公共代码 Chunk 的名称
  },
});

module.exports = {
  // AutoWebPlugin 会为寻找到的所有单页应用，生成对应的入口配置，
  // autoWebPlugin.entry 方法可以获取到所有由 autoWebPlugin 生成的入口配置
  entry: autoWebPlugin.entry({
    // 这里可以加入你额外需要的 Chunk 入口
  }),
  plugins: [
    autoWebPlugin,
  ],
};
```

`AutoWebPlugin` 会找出 `pages` 目录下的2个文件夹 `index` 和 `login`，把这两个文件夹看成两个单页应用。 并且分别为每个单页应用生成一个 `Chunk` 配置和 `WebPlugin` 配置。 每个单页应用的 `Chunk` 名称就等于文件夹的名称，也就是说 `autoWebPlugin.entry()` 方法返回的内容其实是：

```js
{
  "index":["./pages/index/index.js","./common.css"],
  "login":["./pages/login/index.js","./common.css"]
}
```

## 优化

### 区分环境

#### 为什么需要区分环境

在开发网页的时候，一般都会有多套运行环境，例如：

* 在开发过程中方便开发调试的环境。
* 发布到线上给用户使用的运行环境。

#### 如何区分环境

具体区分方法很简单，在源码中通过如下方式：

```js
if (process.env.NODE_ENV === 'production') {
  console.log('你正在线上环境');
} else {
  console.log('你正在使用开发环境');
}
```

其大概原理是借助于环境变量的值去判断执行哪个分支。

当你的代码中出现了使用 [process](https://nodejs.org/api/process.html) 模块的语句时，Webpack 就自动打包进 process 模块的代码以支持非 Node.js 的运行环境。 当你的代码中没有使用 process 时就不会打包进 process 模块的代码。这个注入的 process 模块作用是为了模拟 Node.js 中的 process，以支持上面使用的 `process.env.NODE_ENV === 'production'` 语句。

在构建线上环境代码时，需要给当前运行环境设置环境变量 `NODE_ENV = 'production'`，Webpack 相关配置如下：

```js
const DefinePlugin = require('webpack/lib/DefinePlugin');

module.exports = {
  plugins: [
    new DefinePlugin({
      // 定义 NODE_ENV 环境变量为 production
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
  ],
};
```

### 提取公共代码

#### 为什么需要提取公共代码

大型网站通常会由多个页面组成，每个页面都是一个独立的单页应用。 但由于所有页面都采用同样的技术栈，以及使用同一套样式代码，这导致这些页面之间有很多相同的代码。

如果每个页面的代码都把这些公共的部分包含进去，会造成以下问题：

* 相同的资源被重复的加载，浪费用户的流量和服务器的成本；
* 每个页面需要加载的资源太大，导致网页首屏加载缓慢，影响用户体验。

如果把多个页面公共的代码抽离成单独的文件，就能优化以上问题。 原因是假如用户访问了网站的其中一个网页，那么访问这个网站下的其它网页的概率将非常大。 在用户第一次访问后，这些页面公共代码的文件已经被浏览器缓存起来，在用户切换到其它页面时，存放公共代码的文件就不会再重新加载，而是直接从缓存中获取。 这样做后有如下好处：

* 减少网络传输流量，降低服务器成本；
* 虽然用户第一次打开网站的速度得不到优化，但之后访问其它页面的速度将大大提升。

#### 如何提取公共代码

你已经知道了提取公共代码会有什么好处，但是在实战中具体要怎么做，以达到效果最优呢？ 通常你可以采用以下原则去为你的网站提取公共代码：

* 根据你网站所使用的技术栈，找出网站所有页面都需要用到的基础库，以采用 React 技术栈的网站为例，所有页面都会依赖 react、react-dom 等库，把它们提取到一个单独的文件。 一般把这个文件叫做 base.js，因为它包含所有网页的基础运行环境；
* 在剔除了各个页面中被 base.js 包含的部分代码外，再找出所有页面都依赖的公共部分的代码提取出来放到 common.js 中去。
* 再为每个网页都生成一个单独的文件，这个文件中不再包含 base.js 和 common.js 中包含的部分，而只包含各个页面单独需要的部分代码。

Webpack 内置了专门用于提取多个 Chunk 中公共部分的插件 CommonsChunkPlugin，CommonsChunkPlugin 大致使用方法如下：

```js
const path = require('path');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const {AutoWebPlugin} = require('web-webpack-plugin');

// AutoWebPlugin自动寻找 pages 目录下的所有目录，把每一个目录看成一个单页应用
const autoWebPlugin = new AutoWebPlugin('pages', {
  template: './template.html', // HTML 模版文件所在的文件路径
  // 提取出所有页面公共的代码
  commonsChunk: {
    name: 'common',// 提取出公共代码 Chunk 的名称
  },
});

module.exports = {
  // AutoWebPlugin 会找为寻找到的所有单页应用，生成对应的入口配置，
  // autoWebPlugin.entry 方法可以获取到生成入口配置
  entry: autoWebPlugin.entry({
    // 这里可以加入你额外需要的 Chunk 入口
    base: './base.js'
  }),
  output: {
    filename: '[name]_[chunkhash:8].js',// 给输出的文件名称加上 hash 值
    path: path.resolve(__dirname, './dist'),
  },
  module: {
    ...
  },
  plugins: [
    autoWebPlugin,
    // 为了从 common 中提取出 base 也包含的部分
    new CommonsChunkPlugin({
      // 从 common 和 base 两个现成的 Chunk 中提取公共的部分
      chunks: ['common', 'base'],
      // 把公共的部分放到 base 中
      name: 'base'
    })
    ...
  ],
};
```

### 分割代码按需加载

#### 为什么需要按需加载

随着互联网的发展，一个网页需要承载的功能越来越多。 对于采用单页应用作为前端架构的网站来说，会面临着一个网页需要加载的代码量很大的问题，因为许多功能都集中的做到了一个 HTML 里。 这会导致网页加载缓慢、交互卡顿，用户体验将非常糟糕。

导致这个问题的根本原因在于一次性的加载所有功能对应的代码，但其实用户每一阶段只可能使用其中一部分功能。 所以解决以上问题的方法就是用户当前需要用什么功能就只加载这个功能对应的代码，也就是所谓的按需加载。

#### 如何使用按需加载

在给单页应用做按需加载优化时，一般采用以下原则：

* 把整个网站划分成一个个小功能，再按照每个功能的相关程度把它们分成几类。
* 把每一类合并为一个 Chunk，按需加载对应的 Chunk。
* 对于用户首次打开你的网站时需要看到的画面所对应的功能，不要对它们做按需加载，而是放到执行入口所在的 Chunk 中，以降低用户能感知的网页加载时间。
* 对于个别依赖大量代码的功能点，例如依赖 Chart.js 去画图表、依赖 flv.js 去播放视频的功能点，可再对其进行按需加载。

被分割出去的代码的加载需要一定的时机去触发，也就是当用户操作到了或者即将操作到对应的功能时再去加载对应的代码。 被分割出去的代码的加载时机需要开发者自己去根据网页的需求去衡量和确定。

由于被分割出去进行按需加载的代码在加载的过程中也需要耗时，你可以预言用户接下来可能会进行的操作，并提前加载好对应的代码，从而让用户感知不到网络加载时间。

#### 用 Webpack 实现按需加载

Webpack 内置了强大的分割代码的功能去实现按需加载，实现起来非常简单。

举个例子，现在需要做这样一个进行了按需加载优化的网页：

* 网页首次加载时只加载 main.js 文件，网页会展示一个按钮，main.js 文件中只包含监听按钮事件和加载按需加载的代码。
* 当按钮被点击时才去加载被分割出去的 show.js 文件，加载成功后再执行 show.js 里的函数。

其中文件内容如下：

```js
main.js 
window.document.getElementById('btn').addEventListener('click', function () {
  // 当按钮被点击后才去加载 show.js 文件，文件加载成功后执行文件导出的函数
  import(/* webpackChunkName: "show" */ './show').then((show) => {
    show('Webpack');
  })
});
```

```js
show.js
module.exports = function (content) {
  window.alert('Hello ' + content);
};
```

代码中最关键的一句是` import(/* webpackChunkName: "show" */ './show')`，Webpack 内置了对 `import(*)` 语句的支持，当 Webpack 遇到了类似的语句时会这样处理：

* 以 ./show.js 为入口新生成一个 Chunk；
* 当代码执行到 import 所在语句时才会去加载由 Chunk 对应生成的文件。
* import 返回一个 Promise，当文件加载成功时可以在 Promise 的 then 方法中获取到 show.js 导出的内容。

为了正确的输出在 /* webpackChunkName: "show" */ 中配置的 ChunkName，还需要配置下 Webpack，配置如下：

```js
module.exports = {
  // JS 执行入口文件
  entry: {
    main: './main.js',
  },
  output: {
    // 为从 entry 中配置生成的 Chunk 配置输出文件的名称
    filename: '[name].js',
    // 为动态加载的 Chunk 配置输出文件的名称
    chunkFilename: '[name].js',
  }
};
```

其中最关键的一行是` chunkFilename: '[name].js'`,，它专门指定动态生成的 `Chunk` 在输出时的文件名称。 如果没有这行，分割出的代码的文件名称将会是 `[id].js`。

## 原理

### 工作原理概括

#### 基本概念

在了解 Webpack 原理前，需要掌握以下几个核心概念，以方便后面的理解：

* Entry：入口，Webpack 执行构建的第一步将从 Entry 开始，可抽象成输入。
* Module：模块，在 Webpack 里一切皆模块，一个模块对应着一个文件。Webpack 会从配置的 Entry 开始递归找出所有依赖的模块。
* Chunk：代码块，一个 Chunk 由多个模块组合而成，用于代码合并与分割。
* Loader：模块转换器，用于把模块原内容按照需求转换成新内容。
* Plugin：扩展插件，在 Webpack 构建流程中的特定时机会广播出对应的事件，插件可以监听这些事件的发生，在特定时机做对应的事情。

#### 流程概括

Webpack 的运行流程是一个串行的过程，从启动到结束会依次执行以下流程：

1. 初始化参数：从配置文件和 Shell 语句中读取与合并参数，得出最终的参数；
2. 开始编译：用上一步得到的参数初始化 Compiler 对象，加载所有配置的插件，执行对象的 run 方法开始执行编译；
3. 确定入口：根据配置中的 entry 找出所有的入口文件；
4. 编译模块：从入口文件出发，调用所有配置的 Loader 对模块进行翻译，再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理；
5. 完成模块编译：在经过第4步使用 Loader 翻译完所有模块后，得到了每个模块被翻译后的最终内容以及它们之间的依赖关系；
6. 输出资源：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 Chunk，再把每个 Chunk 转换成一个单独的文件加入到输出列表，这步是可以修改输出内容的最后机会；
7. 输出完成：在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统。

在以上过程中，Webpack 会在特定的时间点广播出特定的事件，插件在监听到感兴趣的事件后会执行特定的逻辑，并且插件可以调用 Webpack 提供的 API 改变 Webpack 的运行结果。

#### 流程细节

Webpack 的构建流程可以分为以下三大阶段：

1. 初始化：启动构建，读取与合并配置参数，加载 Plugin，实例化 Compiler。
2. 编译：从 Entry 发出，针对每个 Module 串行调用对应的 Loader 去翻译文件内容，再找到该 Module 依赖的 Module，递归地进行编译处理。
3. 输出：对编译后的 Module 组合成 Chunk，把 Chunk 转换成文件，输出到文件系统。
如果只执行一次构建，以上阶段将会按照顺序各执行一次。但在开启监听模式下，流程将变为如下：

在每个大阶段中又会发生很多事件，Webpack 会把这些事件广播出来供给 `Plugin` 使用

#### 初始化阶段

事件名|解释
-|-
初始化参数|从配置文件和 Shell 语句中读取与合并参数，得出最终的参数。 这个过程中还会执行配置文件中的插件实例化语句 new Plugin()。
实例化 Compiler|用上一步得到的参数初始化 Compiler 实例，Compiler 负责文件监听和启动编译。Compiler 实例中包含了完整的 Webpack 配置，全局只有一个 Compiler 实例。
加载插件|依次调用插件的 apply 方法，让插件可以监听后续的所有事件节点。同时给插件传入 compiler 实例的引用，以方便插件通过 compiler 调用 Webpack 提供的 API。
environment|开始应用 Node.js 风格的文件系统到 compiler 对象，以方便后续的文件寻找和读取。
entry-option|读取配置的 Entrys，为每个 Entry 实例化一个对应的 EntryPlugin，为后面该 Entry 的递归解析工作做准备。
after-plugins|调用完所有内置的和配置的插件的 apply 方法。
after-resolvers|根据配置初始化完 resolver，resolver 负责在文件系统中寻找指定路径的文件。

#### 编译阶段

事件名|解释
-|-
run|启动一次新的编译。
watch-run	和 run|类似，区别在于它是在监听模式下启动的编译，在这个事件中可以获取到是哪些文件发生了变化导致重新启动一次新的编译。
compile|该事件是为了告诉插件一次新的编译将要启动，同时会给插件带上 compiler 对象。
compilation|当 Webpack 以开发模式运行时，每当检测到文件变化，一次新的 Compilation 将被创建。一个 Compilation 对象包含了当前的模块资源、编译生成资源、变化的文件等。Compilation|对象也提供了很多事件回调供插件做扩展。
make|一个新的 Compilation 创建完毕，即将从 Entry 开始读取文件，根据文件类型和配置的 Loader 对文件进行编译，编译完后再找出该文件依赖的文件，递归的编译和解析。
after-compile|一次 Compilation 执行完成。
invalid|当遇到文件不存在、文件编译错误等异常时会触发该事件，该事件不会导致 Webpack 退出。

在编译阶段中，最重要的要数 compilation 事件了，因为在 compilation 阶段调用了 Loader 完成了每个模块的转换操作，在 compilation 阶段又包括很多小的事件，它们分别是：

事件名|解释
-|-
build-module|使用对应的 Loader 去转换一个模块。
normal-module-loader|在用 Loader 对一个模块转换完后，使用 acorn 解析转换后的内容，输出对应的抽象语法树（AST），以方便 Webpack 后面对代码的分析。
program|从配置的入口模块开始，分析其 AST，当遇到 require|等导入其它模块语句时，便将其加入到依赖的模块列表，同时对新找出的依赖模块递归分析，最终搞清所有模块的依赖关系。
seal|所有模块及其依赖的模块都通过 Loader 转换完成后，根据依赖关系开始生成 Chunk。

#### 输出阶段

事件名|解释
-|-
should-emit|所有需要输出的文件已经生成好，询问插件哪些文件需要输出，哪些不需要。
emit|确定好要输出哪些文件后，执行文件输出，可以在这里获取和修改输出内容。
after-emit|文件输出完毕。
done|成功完成一次完成的编译和输出流程。
failed|如果在编译和输出流程中遇到异常导致 Webpack 退出时，就会直接跳转到本步骤，插件可以在本事件中获取到具体的错误原因。

在输出阶段已经得到了各个模块经过转换后的结果和其依赖关系，并且把相关模块组合在一起形成一个个 Chunk。 在输出阶段会根据 Chunk 的类型，使用对应的模版生成最终要输出的文件内容。

### 输出文件分析

#### 基本内容分析

以入门篇的《安装与使用》中打包的bundle.js文件为例

```js
// webpackBootstrap启动函数
// modules 即为存放所有模块的数组，数组中的每一个元素都是一个函数
(function (modules) {
  // 安装过的模块都存放在这里面
  // 作用是把已经加载过的模块缓存在内存中，提升性能
  var installedModules = {};

  // 去数组中加载一个模块，moduleId 为要加载模块在数组中的 index
  function __webpack_require__(moduleId) {

    // 如果需要加载的模块已经被加载过，就直接从内存缓存中返回
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports;
    }
    // 如果缓存中不存在需要加载的模块，就新建一个模块，并把它存在缓存中
    var module = installedModules[moduleId] = {
      // 模块在数组中的 index
      i: moduleId,
      // 该模块是否已经加载完毕
      l: false,
      // 该模块的导出值
      exports: {}
    };

    // 从 modules 中获取 index 为 moduleId 的模块对应的函数
    // 再调用这个函数，同时把函数需要的参数传入
    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

    // 把这个模块标记为已加载
    module.l = true;

    // 返回这个模块的导出值
    return module.exports;
  }


  // 传入模块对象
  __webpack_require__.m = modules;

  // 传入模块缓存
  __webpack_require__.c = installedModules;

  // define getter function for harmony exports
  __webpack_require__.d = function (exports, name, getter) {
    if (!__webpack_require__.o(exports, name)) {
      Object.defineProperty(exports, name, {
        configurable: false,
        enumerable: true,
        get: getter
      });
    }
  };

  // getDefaultExport function for compatibility with non-harmony modules
  __webpack_require__.n = function (module) {
    var getter = module && module.__esModule ?
      function getDefault() {
        return module['default'];
      } :
      function getModuleExports() {
        return module;
      };
    __webpack_require__.d(getter, 'a', getter);
    return getter;
  };

  // Object.prototype.hasOwnProperty.call
  __webpack_require__.o = function (object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  };

  // Webpack 配置中的 publicPath，用于加载被分割出去的异步代码
  __webpack_require__.p = "";

  // 使用 __webpack_require__ 去加载 index 为 0 的模块，并且返回该模块导出的内容
  // index 为 0 的模块就是 main.js 对应的文件，也就是执行入口模块
  // __webpack_require__.s 的含义是启动模块对应的 index
  return __webpack_require__(__webpack_require__.s = 0);
})
/************************************************************************/
([

  // 所有的模块都存放在了一个数组里，根据每个模块在数组的 index 来区分和定位模块
  /* 0 */
  (function (module, exports, __webpack_require__) {

    // 通过 __webpack_require__ 规范导入 show 函数，show.js 对应的模块 index 为 1
    const show = __webpack_require__(1);
    // 执行 show 函数
    show('Webpack');
  }),
  /* 1 */
  (function (module, exports) {
    // 操作 DOM 元素，把 content 显示到网页上
    function show(content) {
      window.document.getElementById('app').innerText = 'Hello,' + content;
    }
    // 通过 CommonJS 规范导出 show 函数
    module.exports = show;
  })
]);
```

以上看上去复杂的代码其实是一个立即执行函数，可以简写为如下：

```js
(function(modules) {

  // 模拟 require 语句
  function __webpack_require__() {
  }

  // 执行存放所有模块数组中的第0个模块
  __webpack_require__(0);

})([/*存放所有模块的数组*/])
```

`bundle.js` 能直接运行在浏览器中的原因在于输出的文件中通过 `__webpack_require__` 函数定义了一个可以在浏览器中执行的加载函数来模拟 Node.js 中的 require 语句。

原来一个个独立的模块文件被合并到了一个单独的 bundle.js 的原因在于浏览器不能像 Node.js 那样快速地去本地加载一个个模块文件，而必须通过网络请求去加载还未得到的文件。 如果模块数量很多，加载时间会很长，因此把所有模块都存放在了数组中，执行一次网络加载。

Webpack 做了缓存优化： 执行加载过的模块不会再执行第二次，执行结果会缓存在内存中，当某个模块第二次被访问时会直接去内存中读取被缓存的返回值。


#### 分割代码时的输出

在采用了按需加载的优化方法时，Webpack 的输出文件会发生变化。

例如把源码中的 main.js 修改为如下：

```js
// 异步加载 show.js
import('./show').then((show) => {
  // 执行 show 函数
  show('Webpack');
});
```

重新构建后会输出两个文件，分别是执行入口文件 bundle.js 和 异步加载文件 0.bundle.js。

其中 0.bundle.js 内容如下：

```js
webpackJsonp([0], {
  3: (function (module, exports, __webpack_require__) {
    var __WEBPACK_AMD_DEFINE_RESULT__;
    !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
        return function (a, b) {
          return a * b;
        };
      }.call(exports, __webpack_require__, exports, module),
      __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  })
});
```

`bundle.js` 内容如下：

```js
// webpackBootstrap启动函数
// modules 即为存放所有模块的数组，数组中的每一个元素都是一个函数
(function (modules) {
  /***
   * webpackJsonp 用于从异步加载的文件中安装模块。
   * 把 webpackJsonp 挂载到全局是为了方便在其它文件中调用。
   *
   * @param chunkIds 异步加载的文件中存放的需要安装的模块对应的 Chunk ID
   * @param moreModules 异步加载的文件中存放的需要安装的模块列表
   * @param executeModules 在异步加载的文件中存放的需要安装的模块都安装成功后，需要执行的模块对应的 index
   */
  var parentJsonpFunction = window["webpackJsonp"];
  window["webpackJsonp"] = function webpackJsonpCallback(chunkIds, moreModules, executeModules) {
    // 把 moreModules 添加到 modules 对象中
    // 把所有 chunkIds 对应的模块都标记成已经加载成功 
    var moduleId, chunkId, i = 0,
      resolves = [],
      result;
    for (; i < chunkIds.length; i++) {
      chunkId = chunkIds[i];
      if (installedChunks[chunkId]) {
        resolves.push(installedChunks[chunkId][0]);
      }
      installedChunks[chunkId] = 0;
    }
    for (moduleId in moreModules) {
      if (Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
        modules[moduleId] = moreModules[moduleId];
      }
    }
    if (parentJsonpFunction) parentJsonpFunction(chunkIds, moreModules, executeModules);
    while (resolves.length) {
      resolves.shift()();
    }

  };

  // 缓存已经安装的模块
  var installedModules = {};

  // 存储每个 Chunk 的加载状态；
  // 键为 Chunk 的 ID，值为0代表已经加载成功
  var installedChunks = {
    1: 0
  };

  // 去数组中加载一个模块，moduleId 为要加载模块在数组中的 index
  function __webpack_require__(moduleId) {

    // 如果需要加载的模块已经被加载过，就直接从内存缓存中返回
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports;
    }
    // 如果缓存中不存在需要加载的模块，就新建一个模块，并把它存在缓存中
    var module = installedModules[moduleId] = {
      // 模块在数组中的 index
      i: moduleId,
      // 该模块是否已经加载完毕
      l: false,
      // 该模块的导出值
      exports: {}
    };

    // 从 modules 中获取 index 为 moduleId 的模块对应的函数
    // 再调用这个函数，同时把函数需要的参数传入
    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

    // 把这个模块标记为已加载
    module.l = true;

    // 返回这个模块的导出值
    return module.exports;
  }

  /**
   * 用于加载被分割出去的，需要异步加载的 Chunk 对应的文件
   * @param chunkId 需要异步加载的 Chunk 对应的 ID
   * @returns {Promise}
   */
  __webpack_require__.e = function requireEnsure(chunkId) {
    // 从上面定义的 installedChunks 中获取 chunkId 对应的 Chunk 的加载状态
    var installedChunkData = installedChunks[chunkId];
    // 如果加载状态为0表示该 Chunk 已经加载成功了，直接返回 resolve Promise
    if (installedChunkData === 0) {
      return new Promise(function (resolve) {
        resolve();
      });
    }

    // installedChunkData 不为空且不为0表示该 Chunk 正在网络加载中
    if (installedChunkData) {
      // 返回存放在 installedChunkData 数组中的 Promise 对象
      return installedChunkData[2];
    }

    // installedChunkData 为空，表示该 Chunk 还没有加载过，去加载该 Chunk 对应的文件
    var promise = new Promise(function (resolve, reject) {
      installedChunkData = installedChunks[chunkId] = [resolve, reject];
    });
    installedChunkData[2] = promise;

    // 通过 DOM 操作，往 HTML head 中插入一个 script 标签去异步加载 Chunk 对应的 JavaScript 文件
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.charset = 'utf-8';
    script.async = true;
    script.timeout = 120000;

    if (__webpack_require__.nc) {
      script.setAttribute("nonce", __webpack_require__.nc);
    }

    // 文件的路径为配置的 publicPath、chunkId 拼接而成
    script.src = __webpack_require__.p + "" + chunkId + ".bundle.js";
    // 设置异步加载的最长超时时间
    var timeout = setTimeout(onScriptComplete, 120000);
    script.onerror = script.onload = onScriptComplete;
    // 在 script 加载和执行完成时回调
    function onScriptComplete() {
      // 防止内存泄露
      script.onerror = script.onload = null;
      clearTimeout(timeout);
      // 去检查 chunkId 对应的 Chunk 是否安装成功，安装成功时才会存在于 installedChunks 中
      var chunk = installedChunks[chunkId];
      if (chunk !== 0) {
        if (chunk) {
          chunk[1](new Error('Loading chunk ' + chunkId + ' failed.'));
        }
        installedChunks[chunkId] = undefined;
      }
    };
    head.appendChild(script);

    return promise;
  };

  // expose the modules object (__webpack_modules__)
  __webpack_require__.m = modules;

  // expose the module cache
  __webpack_require__.c = installedModules;

  // define getter function for harmony exports
  __webpack_require__.d = function (exports, name, getter) {
    if (!__webpack_require__.o(exports, name)) {
      Object.defineProperty(exports, name, {
        configurable: false,
        enumerable: true,
        get: getter
      });
    }
  };

  // getDefaultExport function for compatibility with non-harmony modules
  __webpack_require__.n = function (module) {
    var getter = module && module.__esModule ?
      function getDefault() {
        return module['default'];
      } :
      function getModuleExports() {
        return module;
      };
    __webpack_require__.d(getter, 'a', getter);
    return getter;
  };

  // Object.prototype.hasOwnProperty.call
  __webpack_require__.o = function (object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  };

  // Webpack 配置中的 publicPath，用于加载被分割出去的异步代码
  __webpack_require__.p = "./dist/";

  // on error function for async loading
  __webpack_require__.oe = function (err) {
    console.error(err);
    throw err;
  };

  // 使用 __webpack_require__ 去加载 index 为 0 的模块，并且返回该模块导出的内容
  // index 为 0 的模块就是 main.js 对应的文件，也就是执行入口模块
  // __webpack_require__.s 的含义是启动模块对应的 index
  return __webpack_require__(__webpack_require__.s = 0);
})
/************************************************************************/
([
  // 所有的模块都存放在了一个数组里，根据每个模块在数组的 index 来区分和定位模块
  /* 0 */
  /***/
  (function (module, __webpack_exports__, __webpack_require__) {

    "use strict";
    Object.defineProperty(__webpack_exports__, "__esModule", {
      value: true
    });
    /* harmony import */
    var __WEBPACK_IMPORTED_MODULE_0__vendor_sum__ = __webpack_require__(1);
    /**
     * webpack支持ES6、CommonJs和AMD规范
     */

    // ES6

    console.log("sum(1, 2) = ", Object(__WEBPACK_IMPORTED_MODULE_0__vendor_sum__["a" /* default */ ])(1, 2));

    // CommonJs
    var minus = __webpack_require__(2);
    console.log("minus(1, 2) = ", minus(1, 2));

    // AMD
    __webpack_require__.e /* require */(0).then(function () {
      var __WEBPACK_AMD_REQUIRE_ARRAY__ = [__webpack_require__(3)];
      (function (multi) {
        console.log("multi(1, 2) = ", multi(1, 2));
      }.apply(null, __WEBPACK_AMD_REQUIRE_ARRAY__));
    }).catch(__webpack_require__.oe);
    /***/
  }),
  /* 1 */
  /***/
  (function (module, __webpack_exports__, __webpack_require__) {
    "use strict";
    /* harmony default export */
    __webpack_exports__["a"] = (function (a, b) {
      return a + b;
    });
    /***/
  }),
  /* 2 */
  /***/
  (function (module, exports) {
    module.exports = function (a, b) {
      return a - b;
    };
    /***/
  })
]);
```

这里的 `bundle.js` 和上面所讲的 `bundle.js` 非常相似，区别在于：

* 多了一个 `__webpack_require__.e` 用于加载被分割出去的，需要异步加载的 Chunk 对应的文件
* 多了一个 `webpackJsonp` 函数用于从异步加载的文件中安装模块。

在使用了 `CommonsChunkPlugin` 去提取公共代码时输出的文件和使用了异步加载时输出的文件是一样的，都会有 `__webpack_require__.e` 和 `webpackJsonp` 。原因在于提取公共代码和异步加载本质上都是代码分割。

### 关于 Loader

Loader 就像是一个翻译员，能把源文件经过转化后输出新的结果，并且一个文件还可以链式的经过多个翻译员翻译。

以处理 SCSS 文件为例：

1. SCSS 源代码会先交给 sass-loader 把 SCSS 转换成 CSS；
2. 把 sass-loader 输出的 CSS 交给 css-loader 处理，找出 CSS 中依赖的资源、压缩 CSS 等；
3. 把 css-loader 输出的 CSS 交给 style-loader 处理，转换成通过脚本加载的 JavaScript 代码；

#### Loader 的职责

由上面的例子可以看出：一个 Loader 的职责是单一的，只需要完成一种转换。 如果一个源文件需要经历多步转换才能正常使用，就通过多个 Loader 去转换。 在调用多个 Loader 去转换一个文件时，每个 Loader 会链式的顺序执行， 第一个 Loader 将会拿到需处理的原内容，上一个 Loader 处理后的结果会传给下一个接着处理，最后的 Loader 将处理后的最终结果返回给 Webpack。

所以，在你开发一个 Loader 时，请保持其职责的单一性，你只需关心输入和输出。

#### Loader 基础

由于 Webpack 是运行在 Node.js 之上的，一个 Loader 其实就是一个 Node.js 模块，这个模块需要导出一个函数。 这个导出的函数的工作就是获得处理前的原内容，对原内容执行处理后，返回处理后的内容。

一个最简单的 Loader 的源码如下：

```js
module.exports = function(source) {
  // source 为 compiler 传递给 Loader 的一个文件的原内容
  // 该函数需要返回处理后的内容，这里简单起见，直接把原内容返回了，相当于该 Loader 没有做任何转换
  return source;
};
```

由于 Loader 运行在 Node.js 中，你可以调用任何 Node.js 自带的 API，或者安装第三方模块进行调用：

```js
const sass = require('node-sass');
module.exports = function(source) {
  return sass(source);
};
```

#### 获得 Loader 的 options

在处理 SCSS 文件的 Webpack 配置中，给 css-loader 传了 options 参数，以控制 css-loader。

```js
{
  loader:'css-loader',
  // 给 css-loader 传入配置项
  options:{
    minimize:true, 
  }
}
```

如何在自己编写的 Loader 中获取到用户传入的 options 呢？需要这样做：

```js
const loaderUtils = require('loader-utils');
module.exports = function(source) {
  // 获取到用户给当前 Loader 传入的 options
  const options = loaderUtils.getOptions(this);
  return source;
};
```

#### 返回其它结果

上面的 Loader 都只是返回了原内容转换后的内容，但有些场景下还需要返回除了内容之外的东西。

例如以用 babel-loader 转换 ES6 代码为例，它还需要输出转换后的 ES5 代码对应的 Source Map，以方便调试源码。 为了把 Source Map 也一起随着 ES5 代码返回给 Webpack，可以这样写：

```js
module.exports = function(source) {
  // 通过 this.callback 告诉 Webpack 返回的结果
  this.callback(null, source, sourceMaps);
  // 当你使用 this.callback 返回内容时，该 Loader 必须返回 undefined，
  // 以让 Webpack 知道该 Loader 返回的结果在 this.callback 中，而不是 return 中 
  return;
};
```

其中的 this.callback 是 Webpack 给 Loader 注入的 API，以方便 Loader 和 Webpack 之间通信。 this.callback 的详细使用方法如下：

```js
this.callback(
    // 当无法转换原内容时，给 Webpack 返回一个 Error
    err: Error | null,
    // 原内容转换后的内容
    content: string | Buffer,
    // 用于把转换后的内容得出原内容的 Source Map，方便调试
    sourceMap?: SourceMap,
    // 如果本次转换为原内容生成了 AST 语法树，可以把这个 AST 返回，
    // 以方便之后需要 AST 的 Loader 复用该 AST，以避免重复生成 AST，提升性能
    abstractSyntaxTree?: AST
);
```

>Source Map 的生成很耗时，通常在开发环境下才会生成 Source Map，其它环境下不用生成，以加速构建。 为此 Webpack 为 Loader 提供了 this.sourceMap API 去告诉 Loader 当前构建环境下用户是否需要 Source Map。 如果你编写的 Loader 会生成 Source Map，请考虑到这点。

#### 同步与异步

Loader 有同步和异步之分，上面介绍的 Loader 都是同步的 Loader，因为它们的转换流程都是同步的，转换完成后再返回结果。 但在有些场景下转换的步骤只能是异步完成的，例如你需要通过网络请求才能得出结果，如果采用同步的方式网络请求就会阻塞整个构建，导致构建非常缓慢。

在转换步骤是异步时，可以这样：

```js
module.exports = function(source) {
    // 告诉 Webpack 本次转换是异步的，Loader 会在 callback 中回调结果
    var callback = this.async();
    someAsyncOperation(source, function(err, result, sourceMaps, ast) {
        // 通过 callback 返回异步执行后的结果
        callback(err, result, sourceMaps, ast);
    });
};
```

#### 处理二进制数据

在默认的情况下，Webpack 传给 Loader 的原内容都是 UTF-8 格式编码的字符串。 但有些场景下 Loader 不是处理文本文件，而是处理二进制文件，例如 file-loader，就需要 Webpack 给 Loader 传入二进制格式的数据。 为此需要这样编写 Loader：

```js
module.exports = function(source) {
    // 在 exports.raw === true 时，Webpack 传给 Loader 的 source 是 Buffer 类型的
    source instanceof Buffer === true;
    // Loader 返回的类型也可以是 Buffer 类型的
    // 在 exports.raw !== true 时，Loader 也可以返回 Buffer 类型的结果
    return source;
};
// 通过 exports.raw 属性告诉 Webpack 该 Loader 是否需要二进制数据 
module.exports.raw = true;
```

以上代码中最关键的代码是最后一行 module.exports.raw = true;，没有该行 Loader 只能拿到字符串。

#### 缓存加速

在有些情况下，有些转换操作需要大量计算非常耗时，如果每次构建都重新执行重复的转换操作，构建将会变得非常缓慢。 为此，Webpack 会默认缓存所有 Loader 的处理结果，也就是说在需要被处理的文件或者其依赖的文件没有发生变化时， 是不会重新调用对应的 Loader 去执行转换操作的。

如果你想让 Webpack 不缓存该 Loader 的处理结果，可以这样：

```js
module.exports = function(source) {
  // 关闭该 Loader 的缓存功能
  this.cacheable(false);
  return source;
};
```

#### 其它 Loader API

其它没有提到的 API 可以去 [Webpack](https://webpack.js.org/api/loaders) 官网 查看。

#### 加载本地 Loader

在开发 Loader 的过程中，为了测试编写的 Loader 是否能正常工作，需要把它配置到 Webpack 中后，才可能会调用该 Loader。 在前面的章节中，使用的 Loader 都是通过 Npm 安装的，要使用 Loader 时会直接使用 Loader 的名称。

如果还采取以上的方法去使用本地开发的 Loader 将会很麻烦，因为你需要确保编写的 Loader 的源码是在 node_modules 目录下。 为此你需要先把编写的 Loader 发布到 Npm 仓库后再安装到本地项目使用。

解决以上问题的便捷方法有两种，分别如下：

##### Npm link

Npm link 专门用于开发和调试本地 Npm 模块，能做到在不发布模块的情况下，把本地的一个正在开发的模块的源码链接到项目的 node_modules 目录下，让项目可以直接使用本地的 Npm 模块。 

完成 Npm link 的步骤如下：

1. 确保正在开发的本地 Npm 模块（也就是正在开发的 Loader）的 package.json 已经正确配置好；
2. 在本地 Npm 模块根目录下执行 npm link，把本地模块注册到全局；
3. 在项目根目录下执行 npm link loader-name，把第2步注册到全局的本地 Npm 模块链接到项目的 node_moduels 下，其中的 loader-name 是指在第1步中的 package.json 文件中配置的模块名称。

链接好 Loader 到项目后你就可以像使用一个真正的 Npm 模块一样使用本地的 Loader 了。

##### ResolveLoader

`Webpack`默认情况下只会去 `node_modules` 目录下寻找，为了让 `Webpack` 加载放在本地项目中的 `Loader` 需要修改 `resolveLoader.modules`。

假如本地的 `Loader` 在项目目录中的 `./loaders/loader-name` 中，则需要如下配置：

```js
module.exports = {
  resolveLoader:{
    // 去哪些目录下寻找 Loader，有先后顺序之分
    modules: ['node_modules','./loaders/'],
  }
}
```

加上以上配置后， Webpack 会先去 `node_modules` 项目下寻找 `Loader`，如果找不到，会再去` ./loaders/` 目录下寻找。

### 编写 Loader

上面讲了许多理论，接下来从实际出发，来编写一个解决实际问题的 Loader。

该 Loader 名叫 comment-require-loader，作用是把 JavaScript 代码中的注释语法

```js
// @require '../style/index.css'
```

转化成

```js
require('../style/index.css');
```

该 Loader 的使用场景是去正确加载针对 Fis3 编写的 JavaScript，这些 JavaScript 中存在通过注释的方式加载依赖的 CSS 文件。

该 Loader 的使用方法如下：

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['comment-require-loader'],
        // 针对采用了 fis3 CSS 导入语法的 JavaScript 文件通过 comment-require-loader 去转换 
        include: [path.resolve(__dirname, 'node_modules/imui')]
      }
    ]
  }
};
```

该 Loader 的实现非常简单，完整代码如下：
```js
function replace(source) {
    // 使用正则把 // @require '../style/index.css' 转换成 require('../style/index.css');  
    return source.replace(/(\/\/ *@require) +(('|").+('|")).*/, 'require($2);');
}

module.exports = function (content) {
    return replace(content);
};
```

### 关于 Plugin

Webpack 通过 Plugin 机制让其更加灵活，以适应各种应用场景。 在 Webpack 运行的生命周期中会广播出许多事件，Plugin 可以监听这些事件，在合适的时机通过 Webpack 提供的 API 改变输出结果。

一个最基础的 Plugin 的代码是这样的：

```js
class BasicPlugin{
  // 在构造函数中获取用户给该插件传入的配置
  constructor(options){
  }

  // Webpack 会调用 BasicPlugin 实例的 apply 方法给插件实例传入 compiler 对象
  apply(compiler){
    compiler.plugin('compilation',function(compilation) {
    })
  }
}

// 导出 Plugin
module.exports = BasicPlugin;
```

在使用这个 Plugin 时，相关配置代码如下：

```js
const BasicPlugin = require('./BasicPlugin.js');
module.export = {
  plugins:[
    new BasicPlugin(options),
  ]
}
```

Webpack 启动后，在读取配置的过程中会先执行 `new BasicPlugin(options) `初始化一个 BasicPlugin 获得其实例。 在初始化 compiler 对象后，再调用 `basicPlugin.apply(compiler) `给插件实例传入 compiler 对象。 插件实例在获取到 compiler 对象后，就可以通过 `compiler.plugin(事件名称, 回调函数) `监听到 Webpack 广播出来的事件。 并且可以通过 compiler 对象去操作 Webpack。

通过以上最简单的 Plugin 相信你大概明白了 Plugin 的工作原理，但实际开发中还有很多细节需要注意，下面来详细介绍。

#### Compiler 和 Compilation

在开发 Plugin 时最常用的两个对象就是 Compiler 和 Compilation，它们是 Plugin 和 Webpack 之间的桥梁。 Compiler 和 Compilation 的含义如下：

* Compiler 对象包含了 Webpack 环境所有的的配置信息，包含 options，loaders，plugins 这些信息，这个对象在 Webpack 启动时候被实例化，它是全局唯一的，可以简单地把它理解为 Webpack 实例；
* Compilation 对象包含了当前的模块资源、编译生成资源、变化的文件等。当 Webpack 以开发模式运行时，每当检测到一个文件变化，一次新的 Compilation 将被创建。Compilation 对象也提供了很多事件回调供插件做扩展。通过 Compilation 也能读取到 Compiler 对象。

Compiler 和 Compilation 的区别在于：Compiler 代表了整个 Webpack 从启动到关闭的生命周期，而 Compilation 只是代表了一次新的编译。

#### 事件流

Webpack 就像一条生产线，要经过一系列处理流程后才能将源文件转换成输出结果。 这条生产线上的每个处理流程的职责都是单一的，多个流程之间有存在依赖关系，只有完成当前处理后才能交给下一个流程去处理。 插件就像是一个插入到生产线中的一个功能，在特定的时机对生产线上的资源做处理。

Webpack 通过 Tapable 来组织这条复杂的生产线。 Webpack 在运行过程中会广播事件，插件只需要监听它所关心的事件，就能加入到这条生产线中，去改变生产线的运作。 Webpack 的事件流机制保证了插件的有序性，使得整个系统扩展性很好。

Webpack 的事件流机制应用了观察者模式，和 Node.js 中的 EventEmitter 非常相似。 Compiler 和 Compilation 都继承自 Tapable，可以直接在 Compiler 和 Compilation 对象上广播和监听事件，方法如下：

```js
/**
* 广播出事件
* event-name 为事件名称，注意不要和现有的事件重名
* params 为附带的参数
*/
compiler.apply('event-name',params);

/**
* 监听名称为 event-name 的事件，当 event-name 事件发生时，函数就会被执行。
* 同时函数中的 params 参数为广播事件时附带的参数。
*/
compiler.plugin('event-name',function(params) {

});
```

同理，compilation.apply 和 compilation.plugin 使用方法和上面一致。

在开发插件时，还需要注意以下两点：

* 只要能拿到 Compiler 或 Compilation 对象，就能广播出新的事件，所以在新开发的插件中也能广播出事件，给其它插件监听使用。
* 传给每个插件的 Compiler 和 Compilation 对象都是同一个引用。也就是说在一个插件中修改了 Compiler 或 Compilation 对象上的属性，会影响到后面的插件。
* 有些事件是异步的，这些异步的事件会附带两个参数，第二个参数为回调函数，在插件处理完任务时需要调用回调函数通知 Webpack，才会进入下一处理流程。例如：

```js
  compiler.plugin('emit',function(compilation, callback) {
    // 支持处理逻辑

    // 处理完毕后执行 callback 以通知 Webpack 
    // 如果不执行 callback，运行流程将会一直卡在这不往下执行 
    callback();
  });
```

#### 读取输出资源、代码块、模块及其依赖

有些插件可能需要读取 Webpack 的处理结果，例如输出资源、代码块、模块及其依赖，以便做下一步处理。

在 emit 事件发生时，代表源文件的转换和组装已经完成，在这里可以读取到最终将输出的资源、代码块、模块及其依赖，并且可以修改输出资源的内容。 插件代码如下：

```js
class Plugin {
  apply(compiler) {
    compiler.plugin('emit', function (compilation, callback) {
      // compilation.chunks 存放所有代码块，是一个数组
      compilation.chunks.forEach(function (chunk) {
        // chunk 代表一个代码块
        // 代码块由多个模块组成，通过 chunk.forEachModule 能读取组成代码块的每个模块
        chunk.forEachModule(function (module) {
          // module 代表一个模块
          // module.fileDependencies 存放当前模块的所有依赖的文件路径，是一个数组
          module.fileDependencies.forEach(function (filepath) {
          });
        });

        // Webpack 会根据 Chunk 去生成输出的文件资源，每个 Chunk 都对应一个及其以上的输出文件
        // 例如在 Chunk 中包含了 CSS 模块并且使用了 ExtractTextPlugin 时，
        // 该 Chunk 就会生成 .js 和 .css 两个文件
        chunk.files.forEach(function (filename) {
          // compilation.assets 存放当前所有即将输出的资源
          // 调用一个输出资源的 source() 方法能获取到输出资源的内容
          let source = compilation.assets[filename].source();
        });
      });

      // 这是一个异步事件，要记得调用 callback 通知 Webpack 本次事件监听处理结束。
      // 如果忘记了调用 callback，Webpack 将一直卡在这里而不会往后执行。
      callback();
    })
  }
}
```

#### 监听文件变化

Webpack 会从配置的入口模块出发，依次找出所有的依赖模块，当入口模块或者其依赖的模块发生变化时， 就会触发一次新的 Compilation。

在开发插件时经常需要知道是哪个文件发生变化导致了新的 Compilation，为此可以使用如下代码：

```js
// 当依赖的文件发生变化时会触发 watch-run 事件
compiler.plugin('watch-run', (watching, callback) => {
    // 获取发生变化的文件列表
    const changedFiles = watching.compiler.watchFileSystem.watcher.mtimes;
    // changedFiles 格式为键值对，键为发生变化的文件路径。
    if (changedFiles[filePath] !== undefined) {
      // filePath 对应的文件发生了变化
    }
    callback();
});
```

默认情况下 Webpack 只会监视入口和其依赖的模块是否发生变化，由于 JavaScript 文件不会去导入 HTML 文件，Webpack 就不会监听 HTML 文件的变化，编辑 HTML 文件时就不会重新触发新的 Compilation。 为了监听 HTML 文件的变化，我们需要把 HTML 文件加入到依赖列表中，为此可以使用如下代码：

```js
compiler.plugin('after-compile', (compilation, callback) => {
  // 把 HTML 文件添加到文件依赖列表，好让 Webpack 去监听 HTML 模块文件，在 HTML 模版文件发生变化时重新启动一次编译
    compilation.fileDependencies.push(filePath);
    callback();
});
```

#### 修改输出资源

有些场景下插件需要修改、增加、删除输出的资源，要做到这点需要监听 emit 事件，因为发生 emit 事件时所有模块的转换和代码块对应的文件已经生成好， 需要输出的资源即将输出，因此 emit 事件是修改 Webpack 输出资源的最后时机。

所有需要输出的资源会存放在 `compilation.assets` 中，`compilation.assets` 是一个键值对，键为需要输出的文件名称，值为文件对应的内容。

设置 `compilation.assets` 的代码如下：

```js
compiler.plugin('emit', (compilation, callback) => {
  // 设置名称为 fileName 的输出资源
  compilation.assets[fileName] = {
    // 返回文件内容
    source: () => {
      // fileContent 既可以是代表文本文件的字符串，也可以是代表二进制文件的 Buffer
      return fileContent;
    },
    // 返回文件大小
    size: () => {
      return Buffer.byteLength(fileContent, 'utf8');
    }
  };
  callback();
});
```

读取 `compilation.assets` 的代码如下：

```js
compiler.plugin('emit', (compilation, callback) => {
  // 读取名称为 fileName 的输出资源
  const asset = compilation.assets[fileName];
  // 获取输出资源的内容
  asset.source();
  // 获取输出资源的文件大小
  asset.size();
  callback();
});
```

#### 判断 Webpack 使用了哪些插件

在开发一个插件时可能需要根据当前配置是否使用了其它某个插件而做下一步决定，因此需要读取 Webpack 当前的插件配置情况。 以判断当前是否使用了 ExtractTextPlugin 为例，可以使用如下代码：

```js
// 判断当前配置使用使用了 ExtractTextPlugin，
// compiler 参数即为 Webpack 在 apply(compiler) 中传入的参数
function hasExtractTextPlugin(compiler) {
  // 当前配置所有使用的插件列表
  const plugins = compiler.options.plugins;
  // 去 plugins 中寻找有没有 ExtractTextPlugin 的实例
  return plugins.find(plugin=>plugin.__proto__.constructor === ExtractTextPlugin) != null;
}
```

### 编写 Plugin

该插件的名称取名叫 EndWebpackPlugin，作用是在 Webpack 即将退出时再附加一些额外的操作，例如在 Webpack 成功编译和输出了文件后执行发布操作把输出的文件上传到服务器。 同时该插件还能区分 Webpack 构建是否执行成功。使用该插件时方法如下：

```js
module.exports = {
  plugins:[
    // 在初始化 EndWebpackPlugin 时传入了两个参数，分别是在成功时的回调函数和失败时的回调函数；
    new EndWebpackPlugin(() => {
      // Webpack 构建成功，并且文件输出了后会执行到这里，在这里可以做发布文件操作
    }, (err) => {
      // Webpack 构建失败，err 是导致错误的原因
      console.error(err);        
    })
  ]
}
```

要实现该插件，需要借助两个事件：

* done：在成功构建并且输出了文件后，Webpack 即将退出时发生；
* failed：在构建出现异常导致构建失败，Webpack 即将退出时发生；

实现该插件完整代码如下：
```js
class EndWebpackPlugin {

  constructor(doneCallback, failCallback) {
    // 存下在构造函数中传入的回调函数
    this.doneCallback = doneCallback;
    this.failCallback = failCallback;
  }

  apply(compiler) {
    compiler.plugin('done', (stats) => {
        // 在 done 事件中回调 doneCallback
        this.doneCallback(stats);
    });
    compiler.plugin('failed', (err) => {
        // 在 failed 事件中回调 failCallback
        this.failCallback(err);
    });
  }
}
// 导出插件 
module.exports = EndWebpackPlugin;
```

从开发这个插件可以看出，找到合适的事件点去完成功能在开发插件时显得尤为重要。 在原理篇的《工作原理概括》 中详细介绍过 Webpack 在运行过程中广播出常用事件，可以从中找到需要的事件。

## 参考资料

 [《深入浅出Webpack》](https://github.com/gwuhaolin/dive-into-webpack/)
