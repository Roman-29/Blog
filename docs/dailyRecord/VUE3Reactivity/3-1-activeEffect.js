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

    console.log("存储effect到" + key + "的depsMap");
    dep.add(activeEffect);
  } else {
    console.log("没有 activeEffect 忽略track");
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
    console.log("触发" + key + "的effect集");
    dep.forEach((effect) => {
      effect();
    });
  }
}

  

// 生成响应式对象
function reactive(target) {
  const handler = {
    get(target, key, receiver) {
      console.log("GET代理: " + key + "属性");
      let result = Reflect.get(target, key, receiver);
      console.log("存储" + key + "属性的响应式");
      track(target, key);
      return result;
    },
    set(target, key, value, receiver) {
      console.log("SET代理: " + key + "属性");
      let oldValue = target[key];
      let result = Reflect.set(target, key, value, receiver);
      console.log("新值" + value + ": 旧值" + oldValue);
      if (oldValue != value) {
        console.log("触发" + key + "属性的响应式");
        trigger(target, key);
      }
      return result;
    },
  };
  console.log("创建响应式对象");
  return new Proxy(target, handler);
}
  
 
let activeEffect = null;

function effectFun(eff) {
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

effectFun(() => {
  console.log("执行 total effect");
  total = product.price * product.quantity;
});
effectFun(() => {
  console.log("执行 salePrice effect");
  salePrice = product.price * 0.9;
});

console.log("total应该等于9:" + total);
console.log("salePrice应该等于4.5:" + salePrice);

product.quantity = 3;
console.log("total应该等于15:" + total);
console.log("salePrice应该等于4.5:" + salePrice);

product.price = 10;
console.log("total应该等于30:" + total);
console.log("salePrice应该等于9:" + salePrice);

 
