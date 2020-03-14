# 前端模块化的发展

## 什么是模块化

* 将一个复杂的程序依据一定的规则(规范)封装成几个块(文件), 并进行组合在一起
* 块的内部数据与实现是私有的, 只是向外部暴露一些接口(方法)与外部其它模块通信

## 为什么要有模块化

在网页开发的早期, js制作作为一种脚本语言，做一些简单的表单验证或动画实现等,那个时候代码还是很少的。
那个时候的代码是怎么写的呢?
直接将代码写在`<script>`标签中即可

随着ajax异步请求的出现,慢慢形成了前后端的分离:
客户端需要完成的事情越来越多,代码量也是与日俱增。
为了应对代码量的剧增,我们通常会将代码组织在多个js文件中,进行维护。

但是这种维护方式,依然不能避免一些灾难性的问题。
比如全局变量同名问题:

```js
// 我在a.js中，定义了一个变量name
var name = "luojw"

// 同事在b.js中，也定义了一个变量name
var name = "roman"

// 在main.js中输出name
console.log(name)
// 这个时候输出的结果就要根据a.js和b.js谁后被引用了
```

这种代码的编写方式对js文件的依赖顺序几乎是强制性的

但是当js文件过多,比如有几十个的时候,弄清楚它们的顺序是一件十分困难的的事情。
而且即使弄清楚顺序了,也不能避免上面出现的这种尴尬问题的发生。

## 匿名函数的解决方案

我们可以使用匿名函数来解决上面的全局变量污染的问题

并且使用模块作为出口，代码如下：

```js
// 在a.js中
var moduleA = (function () {
    // 导出对象
    var obj = {}

    var name = "ljw"
    obj.name = name
    return obj
})();
```

在匿名函数内部,定义一个对象。
给对象添加各种需要暴露到外面的属性和方法
最后将这个对象返回,并且在外面使用了一个全局变量MoudleA接受。

接下来就是如何使用模块了，代码如下：

```js
// 在main.js中
console.log(moduleA.name)
```

这就是模块最基础的封装。
现在我们认识了到了为什么需要模块以及模块的原始雏形

幸运的是，前端模块化开发已经有了很多既有的规范以及对应的实现方案，常见的有：CommosJS，AMD，CMD，ES6的modules


## CommonJS

CommonJS是NodeJS环境的模块规范，需要在NodeJS环境下才能使用

**基本语法**

```js
// 导出语法
module.exports = {
    flag: true,
    test(a, b) {
    return a + b
    }，
    demo(a, b) {
        return a * b
    }
}

// 导入语法
// CommonJS模块
let { test, demo, flag } = require('moduleA');
//等同于
1et mA = require('moduleA');
let test = mA.test;
let demo = mA.demo;
let flag = mA.flag;
```

**特点**

* 适用于服务端编程,如Node.js
* 模块可以多次加载，但只会在第一次加载时运行一次，然后运行结果就被缓存了，以后再加载就直接读取缓存结果；要想让模块再次运行，必须清除缓存
* 同步的模块加载方式不适合在浏览器环境中，同步意味着阻塞加载，浏览器资源是异步加载的
* 不能非阻塞的并行加载多个模
* 模块输出的是一个值的拷贝

## AMD

CommonJS规范加载模块是同步的，也就是说，只有加载完成，才能执行后面的操作。AMD规范则是非同步加载模块，所有依赖这个模块的语句，都定义在一个回调函数中。
由于Node.js主要用于服务器编程，模块文件一般都已经存在于本地硬盘，所以加载起来比较快，不用考虑非同步加载的方式，所以CommonJS规范比较适用。
但是，如果是浏览器环境，要从服务器端加载模块，这时就必须采用非同步模式，因此浏览器端一般采用AMD规范。

**基本语法**

```js
//定义没有依赖的模块
define(function(){
    return module
})

//定义有依赖的模块
define(['module1', 'module2'], function(m1, m2){
    return module
})

//引入使用模块
require(['module1', 'module2'], function(m1, m2){
    ...
})
```

**特点**

* 适用于浏览器环境
* 定义清晰，不会污染全局变量，能清楚地显式依赖关系
* 允许异步加载模块，也可以根据需要动态加载模块
* 提前加载,推崇依赖前置

## CMD

CMD规范专门用于浏览器端，模块的加载是异步的，模块使用时才会加载执行。CMD规范整合了CommonJS和AMD规范的特点。在 Sea.js 中，所有 JavaScript 模块都遵循 CMD模块定义规范。

**基本语法**

```js
//定义没有依赖的模块
define(function(require, exports, module){
    exports.xxx = value
    module.exports = value
})

//定义有依赖的模块
define(function(require, exports, module){
    //引入依赖模块(同步)
    var module2 = require('./module2')
    //引入依赖模块(异步)
    require.async('./module3', function (m3) {
    })
    //暴露模块
    exports.xxx = value
})

//引入使用模块
define(function (require) {
    var m1 = require('./module1')
})
```

**特点**

* 对于依赖的模块，CMD 是延迟执行。
* AMD 推崇依赖前置，CMD 推崇依赖就近。
* 模块的加载逻辑偏重

## UMD

规范类似于兼容 CommonJS 和 AMD 的语法糖，是模块定义的跨平台解决方案。

## ES6模块化

ES6 模块的设计思想是尽量的静态化，使得编译时就能确定模块的依赖关系，以及输入和输出的变量。CommonJS 和 AMD 模块，都只能在运行时确定这些东西。比如，CommonJS 模块就是对象，输入时必须查找对象属性。

**基本语法**

```js
/** 定义模块 math.js **/
var basicNum = 0;
var add = function (a, b) {
    return a + b;
};
export { basicNum, add };

/** 引用模块 **/
import { basicNum, add } from './math';
function test(ele) {
    ele.textContent = add(99 + basicNum);
}
```

**特点**

* 模块输出的是值的引用
* 模块是编译时输出接口

## 参考资料
https://segmentfault.com/a/1190000017466120
