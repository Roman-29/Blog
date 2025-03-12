# 单元测试入门

## 测试四部曲

- 准备数据

- 调用测试功能(函数)

- 验证功能输出

- 拆卸(避免影响后续测试)

第一个测试案例:

```ts
import { test, expect } from "vitest";
import { reset, useTodoStore } from "./todo";

test("add item", () => {
  // 准备数据
  const todoStore = useTodoStore();
  title = "吃饭";
  const todo = { title };

  // 调用
  todoStore.addTodo(todo);

  // 验证
  expect(todoStore.todos[0].title).toBe(title);

  // 拆卸
  reset();
});
```

## 准备数据的方式

### 内联建立

直接把数据放在测试实例中

案例:

```ts
test("add item", () => {
  // 准备数据
  const todo = { title: "吃饭" };
});
```

优缺点

- 编写方便, 适合刚刚创建的测试
- 代码重复, 每个测试实例都要写一遍, 当数据结构发生变化将造成大面积报错
  例如 addTodo 的参数除了 title, 需要增加一个 value
- 当准备数据的逻辑变复杂时, 影响测试可读性

### 委托建立

委托一个函数对数据进行创建

案例:

```ts
function createTodo(title: string) {
  return {
    title,
  };
}
test("add item", () => {
  // 准备数据
  const todo = createTodo("吃饭");
});
```

优缺点:

- 解决重复代码
- 通过函数命名提高可读性

### 隐式建立

通过测试框架 API 创建数据

案例:

```ts
function createTodo(title: string) {
  return {
    title,
  };
}

describe("todo", () => {
  beforeEach(() => {
    // 准备数据
    const todo = createTodo("吃饭");
  });

  test("add item", () => {});
});
```

优缺点:

- 代码精简, 适合多个测试实例通用的的数据
- - 容易堆积代码不需要的数据(充分使用测试层级, 对测试进行模块细分, 针对性使用隐式数据)
- 测试实例逻辑被切割, 可读性变差

### 后门建立

也就是调用非公开的 API 方式来准备测试数据

比如需要测试删除数据, 但是没有增加数据的函数, 只能从后门操作数据, 案例:

```ts
test("remove item", () => {
  // 准备数据
  const todoStore = useTodoStore();
  const todo = { title: "吃饭" };
  todoStore.todos.push(todo);

  // 调用
  todoStore.removeTodo(todo);

  // 验证
  expect(todoStore.todos.length).toBe(0);
});
```

优缺点:

- 优先使用前三种方式, 后门建立数据的测试往往是脆弱的测试
- 在功能完善前可以先借助后门测试, 后面功能完善再移除后门数据

## 最小准备数据原则

准备数据应该和当前测试功能贴合, 去掉不需要的数据保持代码可读性

案例:

```typescrip
describe("todo", () => {
  // 不合理的测试
  test("buy book", () => {
    const user = new User("罗健文", 12, "ljw@tys.com", "广州");
    const product = new Product("Book", 1, "顺丰空运");

    const result = user.buy(product);

    expect(result).toBe("User 罗健文 bought Book");
  });

  // 方法一, 使用参数默认值
  test("v1", () => {
    const user = new User("罗健文");
    const product = new Product("Book");

    const result = user.buy(product);

    expect(result).toBe("User 罗健文 bought Book");
  });

  // 方法二, 使用委托建立数据, 隐藏不需要的属性
  test("v2", () => {
    const user = new createUser("罗健文");
    const product = new createProduct("Book");

    const result = user.buy(product);

    expect(result).toBe("User 罗健文 bought Book");
  });

  // 方法三, 创建虚拟对象
  test("v3", () => {
    const user = new User("罗健文");
    const product = { name: "Book" } as Product;

    const result = user.buy(product);

    expect(result).toBe("User 罗健文 bought Book");
  });
});

function createUser(name: string) {
  return new User(name, 12, "ljw@tys.com", "广州");
}
function createProduct(name: string) {
  return new Product(name, 1, "顺丰空运");
}
```

**单元测试需要非常注意可读性和可维护性, 如果测试代码维护成本太高, 将会导致测试代码成为负担影响开发**

## 程序的间接输入

上面的测试案例都是直接输入, 数据创建完成后直接提供到调用阶段进行使用

当数据是由函数调用其他模块生成的数据, 不需要测试实例创建的就是间接数据, 根据依赖类型的不同, 提供以下案例

### 依赖变量

- index.ts

name 和 gold 分别是 string 和 number 类型的 const 常量, 被应用到了函数 tellName

```ts
import { gold, name } from "./config";

export function tellName() {
  return `${name} have ${gold} gold`;
}
```

- case.spec.ts

通过**importOriginal**可以拿到全部原始数据, 比如 gold 不需要 mock 但是需要被测试函数使用, 就需要**importOriginal**获取到原始值

```ts
import { describe, test, expect, vi } from "vitest";
import { tellName } from "./index";

// mock数据, 对config.ts导出的数据做定制
vi.mock("./config", async (importOriginal) => {
  const data: any = await importOriginal();
  return {
    ...data,
    name: "roman",
  };
});

describe("变量形式", () => {
  test("属性", async () => {
    // 调用
    const r = tellName();

    // 验证
    expect(r).toBe("roman have 3 gold");
  });
});
```

### 依赖对象

对象的值可以直接在准备数据阶段进行赋值

- index.ts

```ts
import config from "./config";

export function tellAge() {
  if (config.allow) {
    return 2;
  }
  return "不知道";
}

export function tellByFn() {
  return config.getAge() === "18" ? "yes" : "no";
}
```

- case.spec.ts

```ts
import { describe, test, expect, vi } from "vitest";
import { config } from "./config";
import { tellAge, tellByFn } from ".";

describe("对象形式", () => {
  test("属性", async () => {
    // 准备数据
    config.allow = false;

    // 调用
    const r = await tellAge();

    // 验证
    expect(r).toBe("不知道");
  });
  test("方法", async () => {
    // 准备数据
    config.getAge = () => "18";

    // 调用
    const r = await tellByFn();

    // 验证
    expect(r).toBe("yes");
  });
});
```

### 依赖函数

- index.ts

```ts
import { userAge } from "./user";

export function doubleUserAge(): number {
  return userAge() * 2;
}
```

- case.spec.ts

```ts
import { doubleUserAge } from "./index";
import { describe, test, expect, vi } from "vitest";

// mock数据, 对user.ts导出的数据做定制
vi.mock("./user", () => {
  return {
    userAge: () => 2,
  };
});

describe("间接input", () => {
  test("frist", () => {
    // 调用
    const r = doubleUserAge();

    // 验证
    expect(r).toBe(4);
  });
});
```

### 第三方库

以 axios 库为例

- index.ts

```ts
import axios from "axios";

interface User {
  name: string;
  age: number;
}

export async function doubleUserAge() {
  const user: User = await axios.get("/user/1");
  return user.age * 2;
}
```

- case.spec.ts

```ts
import { doubleUserAge } from "./index";
import { describe, test, expect, vi } from "vitest";
import axios from "axios";

// 对第三方库做mock
vi.mock("axios");

describe("第三方库", () => {
  test("frist", async () => {
    // 准备数据
    vi.mocked(axios.get).mockResolvedValue({ age: 2 });

    // 调用
    const r = await doubleUserAge();

    // 验证
    expect(r).toBe(4);
  });
});
```

### 环境变量

- index.ts

```ts
export function doubleUserAge(): number {
  return Number(process.env.USER_AGE) * 2;
}
```

- case.spec.ts

使用**vi.stubEnv**设置环境变量, 并且使用**afterEach**对每个测试实例进行 reset 数据

**vi.stubEnv**适用于 webpack 和 vite 的环境变量

```ts
import { doubleUserAge } from "./index";
import { describe, test, expect, vi, afterEach } from "vitest";

afterEach(() => {
  // 移除数据
  vi.unstubAllEnvs();
});

describe("环境变量", () => {
  test("frist", () => {
    // 准备数据
    vi.stubEnv("USER_AGE", "2");
    // 调用
    const r = doubleUserAge();

    // 验证
    expect(r).toBe(4);
  });
});
```

### 全局变量

和环境变量用法相似, 使用**vi.stubGlobal**

### mock 注意事项

1. vi.mock 将对整个测试文件生效
2. vi.mock 编译阶段会提高到顶部优先处理
3. 可以使用 vi.mocked 对每个测试实例 mock 值
4. 一个测试文件里测试内容应该相关, 所以 vi.mock 能适应大部分场景
5. 当逻辑代码和间接输入数据融合的时候, 不好进行 mock 处理, 可以加一个间接层如上面案例中的 config.ts 和 user.ts, 将依赖数据拆分.

## 依赖注入

先了解两个概念

- 依赖倒置原则

高层模块不应该依赖低层模块, 两者应该通过抽象接口联系, 降低模块间的耦合.

A(高层) --依赖--> B(低层)

修改成

A(高层) --依赖--> C(接口) <--实现-- B(低层)

- 程序接缝

这个 C(接口) 就是程序的接缝, 通过创建接缝可以轻松改变/替换 B(低层) 模块的实现, 不影响其他代码

### 分析函数

```ts
import { readFileSync } from "fs";

export function readAndProcessFile(filePath: string): string {
  const content = readFileSync(filePath);
  return `${content} -> test unit`;
}
```

**fs 模块**就是函数强依赖的低层, 如果要测试就必须对 fs 模块做测试替身处理

#### 函数的依赖注入

对函数进行改造, 将强依赖模块以**参数**形式抽离

```ts
export interface FileReader {
  read(filePath: string): string;
}

export function readAndProcessFile(
  filePath: string,
  fileReader: FileReader
): string {
  const content = fileReader.read(filePath);
  return `${content} -> test unit`;
}
```

- case.spec.ts

```ts
import { describe, test, expect } from "vitest";
import { readAndProcessFile, FileReader } from "./index";

describe("依赖注入", () => {
  test("fn", () => {
    class TexFileReader implements FileReader {
      read(filePath: string) {
        return "ljw";
      }
    }

    const result = readAndProcessFile("test", new TexFileReader());

    expect(result).toBe("ljw -> test unit");
  });
});
```

### 分析类

跟函数一样, 我们也可以对类进行分析改造

```ts
import { readFileSync } from "fs";

export class ReadAndProcessFile {
  run(filePath: string) {
    const content = readFileSync(filePath);
    return `${content} -> test unit`;
  }
}
```

#### 构造函数(必备参数)

```ts
export interface FileReader {
  read(filePath: string): string;
}

export class ReadAndProcessFile {
  private _fileReader: FileReader;
  constructor(fileReader: FileReader) {
    this._fileReader = fileReader;
  }
  run(filePath: string) {
    const content = this._fileReader.read(filePath);
    return `${content} -> test unit`;
  }
}
```

```ts
import { describe, test, expect } from "vitest";
import { ReadAndProcessFile, FileReader } from "./class";

test("构造函数", () => {
  class TexFileReader implements FileReader {
    read(filePath: string) {
      return "ljw";
    }
  }

  const result = new ReadAndProcessFile(new TexFileReader()).run("test");

  expect(result).toBe("ljw -> test unit");
});
```

#### 属性

```ts
export class ReadAndProcessFile {
  private _fileReader: FileReader;
  constructor() {}
  run(filePath: string) {
    const content = this._fileReader.read(filePath);
    return `${content} -> test unit`;
  }

  set fileReader(fileReader: FileReader) {
    this._fileReader = fileReader;
  }
}
```

```ts
import { describe, test, expect } from "vitest";
import { ReadAndProcessFile, FileReader } from "./class";

test("属性", () => {
  class TexFileReader implements FileReader {
    read(filePath: string) {
      return "ljw";
    }
  }
  const readAndProcessFile = new ReadAndProcessFile();
  readAndProcessFile.fileReader = new TexFileReader();
  const result = readAndProcessFile.run("test");

  expect(result).toBe("ljw -> test unit");
});
```

#### 方法

```ts
export class ReadAndProcessFile {
  private _fileReader: FileReader;
  constructor() {}
  run(filePath: string) {
    const content = this._fileReader.read(filePath);
    return `${content} -> test unit`;
  }

  setFileReader(fileReader: FileReader) {
    this._fileReader = fileReader;
  }
}
```

```ts
import { describe, test, expect } from "vitest";
import { ReadAndProcessFile, FileReader } from "./class";

test("方法", () => {
  class TexFileReader implements FileReader {
    read(filePath: string) {
      return "ljw";
    }
  }
  const readAndProcessFile = new ReadAndProcessFile();
  readAndProcessFile.setFileReader(new TexFileReader());
  const result = readAndProcessFile.run("test");

  expect(result).toBe("ljw -> test unit");
});
```

## 验证的方式

### 状态验证

状态指的是属性和数据结构

状态验证也就是不管实现细节, 我们只需要确定与系统交互之后, 最后系统输出的状态符合我们的预期, 也就是黑盒测试, 其好处是我们可以**随意重构实现细节**.
上面的例子都是状态验证

### 行为验证

验证对象之间的交互是否按预期进行, 比如函数是否被调用, 其调用参数是什么等. 属于白盒测试

- 缺点

1. 破坏封装性, 需要暴露内部细节, 当代码需要修改重构时需要同步修改(如改变函数名称), 维护成本高

2. 丧失测试有效性, 即使行为是正确的, 如果内部细节不正确, 得到的结果也会不符合预期

### 使用时机

- 优先使用状态验证

- 无法获取状态的时候, 如调用后端接口并且接口没有返回信息

- 时间成本, 行为测试因为不用验证数据, 检测费时短

登录案例:

- index.ts

```ts
import { Login } from "login";

const state = {
  tip: "",
};

export function login(name: string, password: string) {
  const res = Login(name, password);
  if (res) {
    state.tip = "success";
  }
}

export function getTip() {
  return state.tip;
}
```

- case.spec.ts

```ts
import { describe, test, expect, vi } from "vitest";
import { getTip, login } from "./index";
import { Login } from "login";

vi.mock("login", () => {
  return {
    Login: vi.fn().mockReturnValue(true),
  };
});

describe("行为验证", () => {
  test("frist", () => {
    login("ljw", "pass");

    // 行为测试
    expect(Login).toBeCalled();
    expect(Login).toBeCalledWith("ljw", "pass");
    expect(Login).toBeCalledTimes(1);

    // 状态测试
    expect(getTip()).toBe("success");
  });
});
```

## 测试的其他场景

### 保持可预测性

当一个功能的返回值是确定的可预测的, 我们才能对功能进行测试

#### 外部依赖

如 api, 第三方服务, 数据库数据等可以直接对外部依赖进行测试替身, 确定功能的输入

#### 随机数

```ts
export function generateRandomString(length: number): string {
  let result = "";
  const characters = "abcdefghijkLmnopqrstuvwxyz";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length); //生成字母
    result += characters.charAt(randomIndex); //将指定位置上的字符添加到结果字符串中
  }
  return result;
}
```

```ts
import { describe, test, expect, vi } from "vitest";
import { checkFriday, generateRandomString } from "./index";

describe("可预测性", () => {
  test("随机数", () => {
    // 确定随机数返回值
    vi.spyOn(Math, "random").mockImplementationOnce(() => 0.1);
    vi.spyOn(Math, "random").mockImplementationOnce(() => 0.2);

    const result = generateRandomString(2);

    expect(result).toBe("fc");
  });
});
```

#### 日期

```ts
export function checkFriday(): string {
  const today = new Date();

  if (today.getDay() === 5) {
    return "happy";
  } else {
    return "sad";
  }
}
```

```ts
import { describe, test, expect, vi } from "vitest";
import { checkFriday, generateRandomString } from "./index";

describe("可预测性", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  test("日期", () => {
    let result = "";
    // 设置日期
    vi.setSystemTime(new Date(2023, 6, 6));
    result = checkFriday();
    expect(result).toBe("sad");

    vi.setSystemTime(new Date(2023, 6, 7));
    result = checkFriday();
    expect(result).toBe("happy");
  });
});
```

### 快速反馈

#### 外部依赖

如 api, 第三方服务, 数据库数据等可以直接对外部依赖进行测试替身处理, 做出快速响应

#### time

```ts
export class User {
  id: string;

  constructor(id: string) {
    this.id = id;
  }

  fetchData(callback: (data: string) => void, delay: number): void {
    setTimeout(() => {
      const data = `Data for user with id: ${this.id}`;
      callback(data);
    }, delay);
  }
}

export function sayHi() {
  setInterval(() => {
    console.log("hi");
  }, 100);
}
```

```ts
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { User, delay, fetchUserData, sayHi } from "./index";

describe("快速反馈", () => {
  test("setTimeout", () => {
    const user = new User("1");
    const cb = vi.fn();
    const wait = 1000;

    user.fetchData(cb, wait);
    // 时间快进
    vi.advanceTimersByTime(wait);

    // 直接跳到下一个异步结束时间
    // vi.advanceTimersToNextTimer();

    // 跳完全部异步
    // vi.runAllTimers()

    expect(cb).toBeCalledWith("Data for user with id: 1");
  });

  test("setInterval", () => {
    vi.spyOn(console, "log");
    sayHi();
    vi.advanceTimersToNextTimer();

    expect(console.log).toBeCalled();
  });
});
```

#### promise

```ts
export function fetchUserData() {
  return new Promise((resolve, reject) => {
    resolve("1");
  });
}

export function delay(time: number) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("1");
    }, 1000);
  });
}
```

```ts
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { User, delay, fetchUserData, sayHi } from "./index";

describe("快速反馈", () => {
  test("promise", async () => {
    const result = await fetchUserData();
    expect(result).toBe("1");
  });

  test("delay", async () => {
    const result = delay(1000);
    vi.advanceTimersToNextTimer();

    expect(result).resolves.toBe("1");
  });
});
```

## 测试替身的要点

测试替身核心能力就是将被测功能与其所依赖的模块进行隔离.

### 加速执行测试

Promise / setTimeout / setInterval / 复杂计算等需要程序等待或长时间运算的情况, 都可以抽离成单独模块通过测试替身进行处理.

### 使执行变得确定

对随机数和日期等无法确定的数据, 可以通过测试替身返回确定值使功能具有可预测性.

### 模拟特殊情况

例如模拟抛出错误

### 检测函数使用情况

前面介绍的行为测试
