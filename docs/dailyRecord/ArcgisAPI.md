# Arcgis API

## Arcgis API 渲染

### SimpleRenderer（简单渲染）

```js
require(["esri/renderers/SimpleRenderer"], function(SimpleRenderer) { /* code goes here */ });
```

使用场景:
给图层的要素统一设置固定的渲染方案

**API 3.28**
SimpleRenderer常用属性介绍：

值|类型|描述
-|-|-
symbol|Symbol|渲染的符号
visualVariables|Object[]|设置颜色，透明度，大小，和旋转度


使用案例：
```js
var renderer = new SimpleRenderer(symbol);

renderer.setVisualVariables([{
    type: "sizeInfo",
    field: "field",
    minSize: 5,
    maxSize: 50,
    minDataValue: 50,
    maxDataValue: 1000
  }]);
```

值得注意的是：
动态图层（ArcGISDynamicMapServiceLayer）中的LayerDrawingOptions属性设置visualVariables是无效的，会被忽略

### ClassBreaksRenderer（分级渲染）

```js
require(["esri/renderers/ClassBreaksRenderer"], function(ClassBreaksRenderer) { /* code goes here */ });
```

使用场景:
根据给定的具体某个属性字段，根据该字段的值进行梯度分类，用不同符号的分类渲染。

**API 3.28**
ClassBreaksRenderer常用属性介绍：
值|类型|描述
-|-|-
attributeField|String|渲染器匹配的属性字段
defaultSymbol |Symbol|无法匹配值或中断时使用的默认符号。
infos|Object[]|分级渲染配置
isMaxInclusive|Boolean|分级渲染值上包含（默认true）
normalizationType|	String|指示如何规范化数据。
normalizationTotal |	Number|总值
normalizationField|String|attributeField属性的字段会除这个字段
visualVariables|Object[]|设置颜色，透明度，大小，和旋转度

使用案例：
```js
var renderer = new ClassBreaksRenderer(defaultSymbol, attributeField);

renderer.addBreak(0, 25, new SimpleFillSymbol().setColor(new Color([56, 168, 0, 0.5])));
renderer.addBreak(25, 75, new SimpleFillSymbol().setColor(new Color([139, 209, 0, 0.5])));

// 如果使用normalizationType
// Break的值将会改变

// normalizationTotal是所有要素attributeField字段的总和
// 判断的Break的值将变成 attributeField/normalizationTotal*100

// renderer.normalizationType = "percent-of-total";
// renderer.normalizationTotal = 1000;

// attributeField将会除normalizationField字段
// 判断的Break的值将变成 attributeField/normalizationField
renderer.normalizationType = "field";
renderer.normalizationField = "normalizationField";
```

### UniqueValueRenderer（唯一值渲染）

```js
require(["esri/renderers/UniqueValueRenderer"], function(UniqueValueRenderer) { /* code goes here */ });
```

使用场景:
根据给定的具体一个或多个属性字段，根据这些字段的值，对每一组唯一的值进行不同符号的分类渲染。

**API 3.28**
UniqueValueRenderer常用属性介绍：
值|类型|描述
-|-|-
attributeField|String|渲染器匹配的属性字段
defaultSymbol |Symbol|无法匹配值或中断时使用的默认符号。
fieldDelimiter|String|如果指定了多个属性字段，值之间的分隔符
infos|Object[]|唯一值渲染配置
valueExpression|String|一个Arcade表达式，其值为字符串或数字。
visualVariables|Object[]|设置颜色，透明度，大小，和旋转度

- [valueExpression使用介绍](http://localhost/arcgis_js_v328_sdk/arcgis_js_api/sdk/jssamples/renderer_arcade.html)

使用案例：
```js
var Options = {
  outFields: ["attributeField1", "attributeField2", "attributeField3", "attributeField4"],
};

  var uniqueValueRenderer = new UniqueValueRenderer(createSymbol("#d9d9d9"), function (graphic){
  var maxField = "Other";
  var max = 0;

  array.forEach(Options.outFields, function (field){
    if (graphic.attributes[field] > max) {
      maxField = field;
      max = graphic.attributes[field];
    }});

    return maxField;
  });

  function createSymbol(color){
    return new SimpleFillSymbol().setColor(new Color(color)).setOutline(
      new SimpleLineSymbol().setColor(new Color("#999999")).setWidth(1));
    }

  uniqueValueRenderer.addValue({ value: "attributeField1", symbol: createSymbol("#fd7f6f"), label: "Vegetables" });
  uniqueValueRenderer.addValue({ value: "attributeField2", symbol: createSymbol("#b2e061"), label: "Cotton" });
  uniqueValueRenderer.addValue({ value: "attributeField3", symbol: createSymbol("#bd7ebe"), label: "Wheat" });
  uniqueValueRenderer.addValue({ value: "attributeField4", symbol: createSymbol("#7eb0d5"), label: "Soybeans" });
```

### BlendRenderer（混合渲染）

```
require(["esri/renderers/BlendRenderer"], function(BlendRenderer) { /* code goes here */ });
```

使用场景：
对于存在两个或以上具有相互竞争的属性字段，使用混合渲染可以给每个属性都分配有唯一的颜色，并根据属性字段值的大小计算出相应的透明度，最后进行颜色混合。所以，属性值越高，颜色越占优势。

**API 3.28**
BlendRenderer常用属性介绍：
值|类型|描述
-|-|-
blendMode|String|决定颜色是如何混合在一起
fields|Object[]|不同属性对应的颜色
opacityStops|Object[]|值占比与透明度对应的设置
normalizationField|String| 几个竞争字段的总计值
symbol |Symbol|对应的渲染符号

- [关于blendMode更多信息](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation#Types)



案例：
```js
var blendRendererOptions = {
  blendMode: "darken", 
  symbol: new SimpleFillSymbol().setOutline(new SimpleLineSymbol().setWidth(1)),
  fields: [
    {
      field: "VALUE1",
      color: new Color([230, 0, 0])
    }, {
      field: "VALUE2",
      color: new Color([56, 168, 0])
    }
  ],
  opacityStops: [
    {
      value: 0,
      opacity: 0
    },
    {
      value: 1,
      opacity: 1
    }
  ],
  normalizationField: "Total"
};

renderer = new BlendRenderer(blendRendererOptions);
```

注：在4.11的API中暂无该渲染功能

### HeatmapRenderer（热力图渲染）

```js
require(["esri/renderers/HeatmapRenderer"], function(HeatmapRenderer) { /* code goes here */ });
```

使用场景:
在点要素的渲染中，通过根据每个点的位置，以及其影响的范围，并且互相叠加，渲染成一幅热力图。

**API 3.28**
HeatmapRenderer常用属性介绍：

值|类型|描述
-|-|-
blurRadius|Number|每个点的影像范围（以像素为单位）。
colorStops|Object[]|按比例去描述渲染器的颜色渐变。
colors|String[]|描述渲染器的颜色渐变。
field|String|用于热力点加权的属性字段。
maxPixelIntensity|Number|在色带中为最终颜色分配的像素强度值。
minPixelIntensity|Number|在色带中为初始强度分配的像素强度值。（一般大于零）


使用案例：
```js
var heatmapRenderer = new HeatmapRenderer({
  field: "Magnitude",
  blurRadius: 12,
  colorStops: [
    { ratio: 0, color: "rgba(250, 0, 0, 0)" },
    { ratio: 0.6, color: "rgb(250, 0, 0)" },
    { ratio: 0.85, color: "rgb(250, 150, 0)"},
    { ratio: 0.95, color: "rgb(255, 255, 0)"}],
  maxPixelIntensity: 100,
  minPixelIntensity: 10
});
```

### DotDensityRenderer（点密度渲染）

```js
require(["esri/renderers/DotDensityRenderer"], function(DotDensityRenderer) { /* code goes here */ });
```

使用场景:
在面要素的渲染中，通过面内点的密集程度来表示某个属性字段的大小。

**API 3.28**
DotDensityRenderer常用属性介绍：
值|类型|描述
-|-|-
backgroundColor|Color|面要素的背景色
dotShape|String|点样式
dotSize|Number|点大小
dotValue|Number|一个点代表的值
fields|Object[]|定义要映射的字段及其颜色
outline|LineSymbol|点的外框


使用案例：
```js
new DotDensityRenderer({
  fields: [{
    name: "M163_07",
    color: new Color("#CC8800")
  }],
  dotValue: 1600,
  dotSize: 1
  })
```

**API 4.11 的不同之处**

在4.11的版本中，更新了DotDensityRenderer这个渲染类型，其提供了两个新的属性，是在3.28里没有的，也比3.28的更好用了。

值|类型|描述
-|-|-
dotBlendingEnabled|Boolean|当设置了多个fields的时候，颜色是覆盖还是叠加
referenceScale|Number|渲染器将根据使用calculateDotValue（）方法根据地图比例的变化线性地重新计算点值，也即是dotValue

### ScaleDependentRenderer（不同比例尺不同渲染）

```js
require(["esri/renderers/ScaleDependentRenderer"], function(ScaleDependentRenderer) { /* code goes here */ });
```

使用场景:
在不同的地图比例尺中，执行不同的渲染方式。

**API 3.28**
HeatmapRenderer常用属性介绍：

值|类型|描述
-|-|-
rangeType|String|判断依据是zoom还是scale
rendererInfos|Object|定义不同缩放比例的渲染


使用案例：
```js
var renderer1 = new DotDensityRenderer({
  fields: [{
    name: "M163_07",
    color: new Color([52, 114, 53])
  }],
  dotValue: 4000,
  dotSize: 2
});

var renderer2 = new DotDensityRenderer({
  fields: [{
    name: "M163_07",
    color: new Color([52, 114, 53])
  }],
  dotValue: 1000,
  dotSize: 2
});

var scaleDependentRenderer = new ScaleDependentRenderer({
  rendererInfos: [{
    renderer: renderer1,
    maxScale: 10000000,
    minScale: 20000000
  }, {
    renderer: renderer2,
    maxScale: 5000000,
    minScale: 10000000
  }]
});
```

在4.11的API中是没有这个渲染类的，但是我们可以这样替代这个类
```js
view.watch("scale", function(newValue) {
    layer.renderer = newValue <= 5000000 ? simpleRenderer : heatmapRenderer;
});
```
同理，在3.x的API同样可以使用这个方法
```js
map.on("zoom-end", function (e) {
  var Scale = map.getScale();
  if (Scale<300000) {
    layer.setRenderer(renderer1);
  } else {
    layer.setRenderer(renderer2);
  }
});
```

## Arcgis API 事件

### 简介

API事件发生在用户与系统交互时，例如加载图层、操作鼠标等动作都会触发事件。我们可以通过监听事件并编写响应事件的代码使我们的系统更加具有交互性。

### 1. Layer事件

`esri/layers/Layer`是所有图层类的父类

Layer图层是Map对象的最基本组成部分，其拥有的事件有：

事件名|说明|返回值
-|-|-
layerview-create|在创建图层的LayerView并添加到View后触发。|{ <br> View,<br> LayerView,<br> Layer<br>}
layerview-destroy|在图层的LayerView被销毁,不再在视图中渲染之后触发。|{ <br>  View,<br> LayerView,<br>Layer<br>}

注：当一个layer添加到map后会实例化一个`esri/views/layers/LayerView`类。
LayerView是将单个图层添加到MapView或SceneView后的视图。

### 2. View事件

`esri/views/View`是MapView和SceneView的父类

事件名|说明
-|-
鼠标点击事件|一般为鼠标左键触发的操作
click|鼠标点击(mapPoint)
immediate-click|不受双击事件影响，鼠标左键后马上触发(mapPoint)
double-click|双击事件(mapPoint)
pointer-down|当鼠标按钮被按下，或者手指触碰到显示屏时触发。
pointer-up|释放鼠标按钮或显示触摸结束后触发。
drag|拖拽事件 
hold|在短时间内按住鼠标按钮后触发。
---|---
鼠标其他事件|鼠标移动等操作触发的事件
blur|当浏览器焦点从view中移开时触发。
focus|当浏览器的焦点在view上时触发。
mouse-wheel|鼠标滚轮在视图上滚动时触发
pointer-enter|在鼠标光标进入视图，或手指触摸开始后触发。
pointer-leave|在鼠标离开视图，或手指触摸结束后触发。
pointer-move|在鼠标或手指移动后触发。
---|---
其他事件|
resize|当view的dom元素的大小改变时触发。 
key-down|按下键盘键后触发
key-up|释放键盘键后触发。
layerview-create|在每个图层都有相应的LayerView创建并在视图中呈现后触发。
layerview-destroy|在一个LayerView被销毁并且不再在视图中呈现后触发

### 3. API3.x与4.x的区别

在3.x中
**esri/layers/layer** 类有

refresh-interval-change
scale-range-change
scale-visibility-change
opacity-change
visibility-change

**esri/map** 类有

basemap-change
extent-change
time-extent-change

这些xxx-change的事件在4.x都移除了，如果想达到3.x这些事件的效果，只需要watch监听一下对应的xxx属性变化就好。（不局限于上面提到的属性，layer和view的所有属性都可以监听）

例如，现在要监听地图的比例尺
```js
view.watch("scale",
  (newValue, oldValue, property, object) => {
    console.log("回调函数有4个参数，新值，旧值，属性名称，发起事件的对象")
  }
);
```

### 4. 关于API 4.x的其他属性或事件

* 如何知道map已经加载完成？

在`esri/views/View`中有when(callback, errback)函数。
当View类创建完成的时候，会触发回调函数。

使用场景(当map初始化完成后，将map，view，以及地图组件本身传给其他组件使用)
```js
// map.vue中：
mapView.when(
  lang.hitch(this, function() {
    console.log("地图创建完成");
    this.eventBus.$emit("mapInitReady", {
      map,
      mapView,
      mapComponents: this
    });
  })
);

// 工具组件：
beforeMount() {
    EventBus.$on("mapInitReady", this.mapReadyHandler)
},
methods: {
  mapReadyHandler(para) {
    this.map = para.map;
    this.mapView = para.mapView;
    this.mapComponents = para.mapComponents;
  }
}
```

* layer从被添加到map，到最后显示到页面上经历了什么？

1.layer被添加到map对象后，首先会创建layerView，当layerView创建好后会发布`layerview-create`事件

2.创建了layerView后，会获取layer数据，此时layer的updating属性为true

3.获取完数据，updating属性变为false，表示数据获取完毕

4.将数据渲染为canvas，添加到页面上

使用场景举例(地图打印)
```js
if (this.mapView.updating || !this.mapView.stationary) {
  const handle = this.mapView.watch("updating",(newValue => {
    if (!newValue) {
      // updating变成false，表示已更新好视图，可以开始打印
      this.Screenshot();
      handle.remove();
    }}).bind(this));
} else {
  this.Screenshot();
}

async Screenshot() {
  let screenshot = null;
  let dataURL = null;
  const viewType = this.mapComponents.getViewType();
  // 延时100ms,是因为updating变true的时候，还需要花时间将数据渲染成canvas
  setTimeout(async () => {
    if (viewType === "2d") {
      screenshot = await this.mapComponents.takeScreenshot();
      dataURL = screenshot.toDataURL("image/jpeg");
    } else {
      screenshot = await this.mapView.takeScreenshot();
      dataURL = screenshot.dataUrl;
    }
    const aLink = document.createElement("a");
    aLink.download = "map.jpeg";
    aLink.href = dataURL;
    aLink.click();
  }, 100);
},
```

* visible与suspended属性

suspended表示图层已经停止更新，当满足以下条件之一就为true

1. 图层的visible为false
2. 图层在当前地图比例上不可见。

<ToTop/>