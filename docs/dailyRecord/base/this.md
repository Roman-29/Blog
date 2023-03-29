# this指向问题

this指向一直是容易错和容易忘的知识点，这次将他整理好方便日后参考复习。

## 概述

this的指向在函数定义的时候是确定不了的，只有函数执行的时候才能确定this到底指向谁，实际上this的最终指向的是那个调用它的对象。

## 直接调用的形式

```js
var a = 1
function test() {
  console.log(a);
}
test()

// 输出 1
```

this最终指向的是调用它的对象，这里的函数a实际是被Window对象所点出来的，相当于下面代码：

```js
var a = 1
function test() {
  console.log(a);
}
window.test()
```

## 名花有主调用形式

```js
var a = 1
function test () {
    console.log(this.a)
}
var obj = {
    a: 2,
    test
}
obj.test()

// 输出 2
```

一句话，谁去调用这个函数的，这个函数中的this就绑定到谁身上。

```js
var a = 1
function test () {
    console.log(this.a)
}
var obj = {
    a: 2,
    test
}
var obj1 = {
    a: 3,
    obj 
}
obj1.obj.test()

// 输出 2
```

即使是这种串串烧的形式，结果也是一样的，test()中的this只对直属上司（直接调用者obj）负责。

```js
var a = 1
function test () {
    console.log(this.a)
}
var obj = {
    a: 2,
    test
}
var testCopy = obj.test
testCopy()

// 输出 1
```

这种情况虽然经过了一波花里胡哨，但是最后的本质就是上面提到的第一种调用形式，this指向window

## call/apply/bind 形式

这种形式的调用，this完全由我们做主，再也不用像追女孩猜她们心思一样猜this指向。

```js
var a = 1
function test () {
    console.log(this.a)
}
var obj = {
    a: 2,
    test
}
var testCopy = obj.test
testCopy.call(obj)

// 输出 2
```

## new 形式

```js
var a = 1
function test (a) {
    this.a = a
}
var b = new test(2)
console.log(b.a)

// 输出 2
```

new符号通过构造函数来创建一个实例对象，this指向这个对象

## 箭头函数

```js
var a = 1
var test = () => {
    console.log(this.a)
}
var obj = {
    a: 2,
    test
}
obj.test()

// 输出 1
```

箭头函数中的this在函数定义的时候就已经确定，它this指向的是它的外层作用域this的指向。