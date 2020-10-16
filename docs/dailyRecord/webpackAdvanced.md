# Webpack 进阶

## 打包文件分析（webpack4）

### 简单打包文件分析

源码目录结构如下

```
├── dist
│   ├── app.js
├── main.js
├── show.js
├── index.html
└── webpack.config.js
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
  <script src="./dist/app.js"></script>
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

```js
webpack.config.js

const path = require('path');
module.exports = {
  // JS 执行入口文件
  mode: "development",
  entry: './main.js',
  output: {
    // 把所有依赖的模块合并输出到一个 bundle.js 文件
    filename: 'app.js',
    // 输出文件都放到 dist 目录下
    path: path.resolve(__dirname, './dist'),
    publicPath: "./dist/",
    chunkFilename:'[name].chunk.js'
  }
};
```

通过webpack对以上代码进行打包。查看dist文件夹下的app.js(精简处理后如下)

```js
// webpackBootstrap启动函数
// modules 即为存放所有模块的对象，对象中的每一个属性都是一个函数
(function (modules) {
  // 安装过的模块都存放在这里面
  // 作用是把已经加载过的模块缓存在内存中，提升性能
  var installedModules = {};

  // 去模块对象中加载一个模块，moduleId 为要加载的模块
  function __webpack_require__(moduleId) {

    // 如果需要加载的模块已经被加载过，就直接从内存缓存中返回
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports;
    }
    // 如果缓存中不存在需要加载的模块，就新建一个模块，并把它存在缓存中
    var module = installedModules[moduleId] = {
      // 模块的名称
      i: moduleId,
      // 该模块是否已经加载完毕
      l: false,
      // 该模块的导出值
      exports: {}
    };

    // 从 modules 中获取名称为 moduleId 的模块对应的函数
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

  // Webpack 配置中的 publicPath，用于加载被分割出去的异步代码
  __webpack_require__.p = "./dist/";

  // 使用 __webpack_require__ 去加载 main.js模块，并且返回该模块导出的内容
  // main.js 对应的文件，也就是执行入口模块
  // __webpack_require__.s 的含义是启动模块对应的名称
  return __webpack_require__(__webpack_require__.s = "./main.js");
})
/************************************************************************/
({
  // 所有的模块都存放在了一个对象里，根据每个模块的路径来区分和定位模块
  "./main.js": (function (module, exports, __webpack_require__) {
    // 通过 CommonJS 规范导入 show 函数 
    const show = __webpack_require__( /*! ./show.js */ "./show.js");
    // 执行 show 函数
    show('Webpack');
  }),
  
  "./show.js": (function (module, exports) {
    // 操作 DOM 元素，把 content 显示到网页上
    function show(content) {
      window.document.getElementById('app').innerText = 'Hello,' + content;
    }
    // 通过 CommonJS 规范导出 show 函数
    module.exports = show;
  })
});
```

以上就是webpack的打包流程，主要的功能是把解析的模块变成一个对象，通过一个入口文件去递归加载，运行所有的模块 

### 懒加载打包文件分析

将show.js文件进行懒加载修改
```js
show.js
// 操作 DOM 元素，把 content 显示到网页上
function show(content) {
  window.document.getElementById('app').innerText = 'Hello,' + content;
  import( /* webpackChunkName: "sum" */ './vendor/sum').then(
    (exprot) => {
      const sum = exprot.default
      console.log("sum(1, 2) = ", sum(1, 2));
    }
  )
}

// 通过 CommonJS 规范导出 show 函数
module.exports = show;
```

打包后发现有两个js文件,app.js和sum.chunk.js

先分析app.js

```js
app.js
// webpackBootstrap启动函数
// modules 即为存放所有模块的对象，对象中的每一个属性都是一个函数
(function (modules) {
  function webpackJsonpCallback(data) {
    // 异步加载的文件中存放的需要安装的模块对应的 Chunk ID
    var chunkIds = data[0];
    // 异步加载的文件中存放的需要安装的模块列表
    var moreModules = data[1];

    // 把 moreModules 添加到 modules 对象中
    // 把所有 chunkIds 对应的模块都标记成已经加载成功
    var moduleId, chunkId, i = 0,
      resolves = [];
    for (; i < chunkIds.length; i++) {
      chunkId = chunkIds[i];
      if (Object.prototype.hasOwnProperty.call(installedChunks, chunkId) && installedChunks[chunkId]) {
        resolves.push(installedChunks[chunkId][0]);
      }
      installedChunks[chunkId] = 0;
    }
    for (moduleId in moreModules) {
      if (Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
        modules[moduleId] = moreModules[moduleId];
      }
    }
    if (parentJsonpFunction) parentJsonpFunction(data);

    while (resolves.length) {
      resolves.shift()();
    }
  };

  // 安装过的模块都存放在这里面
  // 作用是把已经加载过的模块缓存在内存中，提升性能
  var installedModules = {};

  // 存储每个 Chunk 的加载状态；
  // 键为 Chunk 的 ID，值的意思如下：
  // undefined = 模块未加载, 
  // null = chunk preloaded/prefetched
  // Promise = 模块正在加载
  // 0 = 模块已经加载成功
  var installedChunks = {
    "main": 0
  };

  // script 标签路径
  function jsonpScriptSrc(chunkId) {
    return __webpack_require__.p + "" + ({
      "sum": "sum"
    } [chunkId] || chunkId) + ".chunk.js"
  }

  // 加载一个模块
  function __webpack_require__(moduleId) {

    // 如果需要加载的模块已经被加载过，就直接从内存缓存中返回
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports;
    }
    // 如果缓存中不存在需要加载的模块，就新建一个模块，并把它存在缓存中
    var module = installedModules[moduleId] = {
      // 模块的名称
      i: moduleId,
      // 该模块是否已经加载完毕
      l: false,
      // 该模块的导出值
      exports: {}
    };

    // 从 modules 中获取名称为 moduleId 的模块对应的函数
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
    var promises = [];

    // JSONP chunk loading for javascript

    // 从上面定义的 installedChunks 中获取 chunkId 对应的 Chunk 的加载状态
    var installedChunkData = installedChunks[chunkId];
    if (installedChunkData !== 0) { // 如果加载状态为0表示该 Chunk 已经加载成功了

      // installedChunkData 不为空且不为0表示该 Chunk 正在网络加载中
      if (installedChunkData) {
        // 返回存放在 installedChunkData 数组中的 Promise 对象
        promises.push(installedChunkData[2]);
      } else {
        // installedChunkData 为空，表示该 Chunk 还没有加载过，去加载该 Chunk 对应的文件
        var promise = new Promise(function (resolve, reject) {
          installedChunkData = installedChunks[chunkId] = [resolve, reject];
        });

        promises.push(installedChunkData[2] = promise);

        // 通过 DOM 操作，往 HTML head 中插入一个 script 标签去异步加载 Chunk 对应的 JavaScript 文件
        var script = document.createElement('script');
        var onScriptComplete;

        script.charset = 'utf-8';
        script.timeout = 120;
        if (__webpack_require__.nc) {
          script.setAttribute("nonce", __webpack_require__.nc);
        }
        script.src = jsonpScriptSrc(chunkId);

        // create error before stack unwound to get useful stacktrace later
        var error = new Error();
        // 在 script 加载和执行完成时回调
        onScriptComplete = function (event) {
          // 防止内存泄露
          script.onerror = script.onload = null;
          clearTimeout(timeout);
          // 去检查 chunkId 对应的 Chunk 是否安装成功，安装成功时才会存在于 installedChunks 中
          var chunk = installedChunks[chunkId];
          if (chunk !== 0) {
            if (chunk) {
              var errorType = event && (event.type === 'load' ? 'missing' : event.type);
              var realSrc = event && event.target && event.target.src;
              error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
              error.name = 'ChunkLoadError';
              error.type = errorType;
              error.request = realSrc;
              chunk[1](error);
            }
            installedChunks[chunkId] = undefined;
          }
        };
        // 设置异步加载的最长超时时间
        var timeout = setTimeout(function () {
          onScriptComplete({
            type: 'timeout',
            target: script
          });
        }, 120000);
        script.onerror = script.onload = onScriptComplete;
        document.head.appendChild(script);
      }
    }
    return Promise.all(promises);
  };

  // 传入模块对象
  __webpack_require__.m = modules;

  // 传入模块缓存
  __webpack_require__.c = installedModules;

  // __webpack_public_path__
  __webpack_require__.p = "./dist/";

  // define __esModule on exports
  __webpack_require__.r = function (exports) {
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      Object.defineProperty(exports, Symbol.toStringTag, {
        value: 'Module'
      });
    }
    Object.defineProperty(exports, '__esModule', {
      value: true
    });
  };

  /***
   * webpackJsonp 用于从异步加载的文件中安装模块。
   * 把 webpackJsonp 挂载到全局是为了方便在其它文件中调用。
   */
  var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
  var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
  jsonpArray.push = webpackJsonpCallback;
  jsonpArray = jsonpArray.slice();
  for (var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
  var parentJsonpFunction = oldJsonpFunction;


  // 使用 __webpack_require__ 去加载 main.js模块，并且返回该模块导出的内容
  // main.js 对应的文件，也就是执行入口模块
  // __webpack_require__.s 的含义是启动模块对应的 名称
  return __webpack_require__(__webpack_require__.s = "./main.js");
})
/************************************************************************/
({

  /***/
  "./main.js": (function (module, exports, __webpack_require__) {
    // 通过 CommonJS 规范导入 show 函数
    const show = __webpack_require__( /*! ./show.js */ "./show.js");
    // 执行 show 函数
    show('Webpack');
  }),

  "./show.js": (function (module, exports, __webpack_require__) {
    // 操作 DOM 元素，把 content 显示到网页上
    function show(content) {
      window.document.getElementById('app').innerText = 'Hello,' + content;

      __webpack_require__.e( /*! import() | sum */ "sum").then(
        __webpack_require__.bind(null, /*! ./vendor/sum */ "./vendor/sum.js")
      ).then(
        (exprot) => {
          const sum = exprot.default
          console.log("sum(1, 2) = ", sum(1, 2));
        }
      )
    }
    // 通过 CommonJS 规范导出 show 函数
    module.exports = show;
  })
});
```

```js
sum.chunk.js
(window["webpackJsonp"] = window["webpackJsonp"] || []).push([
  ["sum"],
  {
    "./vendor/sum.js": (function (module, __webpack_exports__, __webpack_require__) {
      "use strict";
      __webpack_require__.r(__webpack_exports__);
      __webpack_exports__["default"] = (function (a, b) {
        return a + b;
      });
    })
  }
]);
```

## tapable

webpack本质上是一种事件流的机制，他的工作流程就是将各个插件串联，而实现这些的核心部分就是tapable。


