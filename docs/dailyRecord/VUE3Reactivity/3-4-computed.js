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

// VUE3实现方式, 定义一个基本类型的响应式数据
function ref(raw) {
  const r = {
    get value() {
      track(r, "value");
      return raw;
    },
    set value(newValue) {
      if (newValue != raw) {
        raw = newValue;
        trigger(r, "value");
      }
    },
  };
  return r;
}

let activeEffect = null;
function watchEffect(eff) {
  activeEffect = eff;
  activeEffect();
  activeEffect = null;
}

function computed(getter) {
  let result = ref();
  watchEffect(() => {
    result.value = getter();
  });
  return result;
}

let product = reactive({
  price: 5,
  quantity: 2,
});
let salePrice = computed(() => {
  console.log("computed salePrice");
  return product.price * 0.9;
});
let total = computed(() => {
  console.log("computed total");
  return salePrice.value * product.quantity;
});

console.log("total应该等于9:" + total.value);
console.log("salePrice应该等于4.5:" + salePrice.value);

product.quantity = 3;
console.log("total应该等于13.5:" + total.value);
console.log("salePrice应该等于4.5:" + salePrice.value);

product.price = 10;
console.log("total应该等于27:" + total.value);
console.log("salePrice应该等于9:" + salePrice.value);
