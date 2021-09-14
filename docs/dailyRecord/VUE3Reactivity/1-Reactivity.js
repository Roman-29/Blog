// 目标图 存储响应式对象
const targetMap = new WeakMap();

// 追踪响应式
function track(target, key) {
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

  console.log("存储effect到" + key + "的depsMap");
  dep.add(effect);
}

// 触发响应式
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  let dep = depsMap.get(key);
  if (dep) {
    console.log("触发" + key + "的effect集");
    dep.forEach((effect) => {
      effect();
    });
  }
}

let product = {
  price: 5,
  quantity: 2,
};
let total = 0;
let effect = () => {
  total = product.price * product.quantity;
};

track(product, "quantity");
effect();
console.log(total);

product.quantity = 3;
console.log(total);

trigger(product, "quantity");
console.log(total);
