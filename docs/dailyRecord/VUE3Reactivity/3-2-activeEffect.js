// 目标图 存储响应式对象
const targetMap = new WeakMap();

// 追踪响应式
function track(target, key) {
  if (activeEffect) {
    // 依赖图 存储响应式对象的属性
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()));
    }

    // dep是effect集
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, (dep = new Set()));
    }

    dep.add(activeEffect);
  }
}

// 触发响应式
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  let dep = depsMap.get(key);
  if (dep) {
    dep.forEach((effect) => {
      effect();
    });
  }
}

// 生成响应式对象
function reactive(target) {
  const handler = {
    get(target, key, receiver) {
      let result = Reflect.get(target, key, receiver);

      track(target, key);
      return result;
    },
    set(target, key, value, receiver) {
      let oldValue = target[key];
      let result = Reflect.set(target, key, value, receiver);

      if (oldValue != value) {
        trigger(target, key);
      }
      return result;
    },
  };
  return new Proxy(target, handler);
}

let activeEffect = null;

function watchEffect(eff) {
  activeEffect = eff;
  activeEffect();
  activeEffect = null;
}

let product = reactive({
  price: 5,
  quantity: 2,
});
let salePrice = 0;
let total = 0;

watchEffect(() => {
  console.log("执行 total effect");
  // 非响应式对象, total值失真
  console.log("salePrice是非响应式对象, total值失真");
  total = salePrice * product.quantity;
});
watchEffect(() => {
  console.log("执行 salePrice effect");
  salePrice = product.price * 0.9;
});

console.log("total应该等于9:" + total);
console.log("salePrice应该等于4.5:" + salePrice);

product.quantity = 3;
console.log("total应该等于13.5:" + total);
console.log("salePrice应该等于4.5:" + salePrice);

product.price = 10;
console.log("total应该等于27:" + total);
console.log("salePrice应该等于9:" + salePrice);
