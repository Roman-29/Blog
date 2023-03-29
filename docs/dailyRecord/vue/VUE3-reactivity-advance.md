# 二、响应式进阶(响应式 API)

GitHub: https://github.com/Roman-29/mini-vue

## readonly/shallow 功能

### 简介

在前面我们已经实现了 reactive 响应式对象, 原理是通过 proxy 代理目标对象, 实现响应式更新.

那么在实现别的类型的响应式对象的时候, 我们也一样可以使用 proxy 对目标对象做代理, 那么就可以重构 reactive 的代码

### 代码

修改 reactive.ts, 将 reactive/readonly/shallow 的逻辑全部抽离

```ts
import {
  mutableHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers,
  shallowReactiveHandlers,
} from "./baseHandler";

export function reactive(raw: any) {
  return createReactiveObject(raw, mutableHandlers);
}

export function readonly(raw: any) {
  return createReactiveObject(raw, readonlyHandlers);
}

export function shallowReactive(raw) {
  return createReactiveObject(raw, shallowReactiveHandlers);
}

export function shallowReadonly(raw) {
  return createReactiveObject(raw, shallowReadonlyHandlers);
}

// 只构建proxy代理, 具体代理逻辑抽离到baseHandler中
function createReactiveObject(target, baseHandles) {
  if (!isObject(target)) {
    console.warn(`target ${target} 必须是一个对象`);
    return target;
  }
  return new Proxy(target, baseHandles);
}
```

新建 baseHandles.ts, 专门负责编写 proxy 的处理逻辑

```ts
import { track, trigger } from "./effect";

function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key) {
    const res = Reflect.get(target, key);

    // readonly对象不需要收集依赖, 因为不会触发set
    if (!isReadonly) {
      track(target, key);
    }

    // 浅层代理
    if (shallow) {
      return res;
    }

    // 判断是否为object
    if (isObject(target[key])) {
      // 嵌套object也需要转换
      return isReadonly ? readonly(target[key]) : reactive(target[key]);
    }
    return res;
  };
}

const isObject = (value) => {
  return value !== null && typeof value === "object";
};

function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value);
    // 触发effect
    trigger(target, key);
    return res;
  };
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
const shallowReactiveGet = createGetter(false, true);

export const mutableHandlers = {
  get,
  set,
};

export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key) {
    console.warn(
      `key :"${String(key)}" set 失败，因为 target 是 readonly 类型`,
      target
    );
    return true;
  },
};

export const shallowReactiveHandlers = {
  get: shallowReactiveGet,
  set,
};

export const shallowReadonlyHandlers = {
  get: shallowReadonlyGet,
  set(target, key) {
    console.warn(
      `key :"${String(key)}" set 失败，因为 target 是 readonly 类型`,
      target
    );
    return true;
  },
};
```

可以看到, 在 proxy 上对 get/set 处理方式的不同, 就可以实现多中类型的代理对象.

## 响应式对象工具

### 简介

VUE3 提供了许多响应式对象工具, 让我们更好的判断处理响应式

### isReadonly/isreactive

在原有的 baseHandler 基础上, 做出修改:

```ts
import { ReactiveFlags } from "./reactive";

function createGetter(isReadonly = false) {
  return function get(target, key) {
    // 专门判断类型的key
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly;
    }
    const res = Reflect.get(target, key);

    if (!isReadonly) {
      track(target, key);
    }
    return res;
  };
}
```

在原有的 reactive 基础上, 新增内容:

```ts
export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
}

export function isReactive(value) {
  return !!(value && value[ReactiveFlags.IS_REACTIVE]);
}

export function isReadonly(value) {
  return !!(value && value[ReactiveFlags.IS_READONLY]);
}
```

### isProxy

在原有的 reactive 基础上, 新增内容:

```ts
export function isProxy(value) {
  return isReactive(value) || isReadonly(value);
}
```

### isRef/unRef

在原有的 ref 基础上, 新增内容:

```ts
class RefImpl {
  ...

  // 新增属性判断ref类型
  public __v_isRef = true;

  ...
}

export function isRef(ref) {
  return !!ref.__v_isRef;
}

export function unRef(ref) {
  // 如果是ref返回value, 否则直接返回
  return isRef(ref) ? ref.value : ref;
}
```

## proxyRefs 功能

### 简介

在 template 里, 我们使用 ref 对象是不再需要.value 获取值的, 这是因为我们在 ref 中有进一步的处理函数

### 代码

在原有的 ref 基础上, 增加函数:

```ts
export function proxyRefs(objectWithRef) {
  return new Proxy(objectWithRef, {
    get(target, key) {
      // 如果是ref返回value, 否则直接返回值
      return unRef(Reflect.get(target, key));
    },

    set(target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        // 替换ref的value值
        return (target[key].value = value);
      } else {
        return (target[key] = value);
      }
    },
  });
}
```

至于这个 proxyRefs 是怎么和 template 结合使用, 这个会在后面专门有章节说明
