# 2019

## 十一月

### arcgis API 中renderer类的使用

#### BlendRenderer（混合渲染）

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

关于blendMode更多信息，参考：
https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation#Types

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

#### ClassBreaksRenderer（分级渲染）

```js
require(["esri/renderers/ClassBreaksRenderer"], function(ClassBreaksRenderer) { /* code goes here */ });
```

使用场景:
根据给定的具体某个属性字段，根据该字段的值进行梯度分类，用不同符号的分类渲染。

**API 3.28**
ClassBreaksRenderer常用属性介绍：
值|类型|描述
-|-|-
attributeField|String|渲染器匹配的属性字段（计算方法）
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

#### UniqueValueRenderer（唯一值渲染）

```js
require(["esri/renderers/UniqueValueRenderer"], function(UniqueValueRenderer) { /* code goes here */ });
```

使用场景:
根据给定的具体一个或多个属性字段，根据这些字段的值，对每一组唯一的值进行不同符号的分类渲染。

**API 3.28**
UniqueValueRenderer常用属性介绍：
值|类型|描述
-|-|-
attributeField|String|渲染器匹配的属性字段（计算方法）
defaultSymbol |Symbol|无法匹配值或中断时使用的默认符号。
fieldDelimiter|String|如果指定了多个属性字段，值之间的分隔符
infos|Object[]|唯一值渲染配置
valueExpression|String|一个Arcade表达式，其值为字符串或数字。
visualVariables|Object[]|设置颜色，透明度，大小，和旋转度

valueExpression使用介绍：
http://localhost/arcgis_js_v328_sdk/arcgis_js_api/sdk/jssamples/renderer_arcade.html

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


#### DotDensityRenderer（点密度渲染）

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

#### HeatmapRenderer（热力图渲染）

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

#### ScaleDependentRenderer（不同比例尺不同渲染）

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
同理，在3.x的API同样........

#### SimpleRenderer（简单渲染）

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


## 十月

### CSS3 animation（动画） 属性

使用animation能够创建动画，这可以在许多网页中取代动画图片、Flash 动画以及 JavaScript。

**定义和用法**

animation 属性是一个简写属性，用于设置六个动画属性：

值|描述
-|-
animation-name |规定需要绑定到选择器的 keyframe 名称
animation-duration|规定完成动画所花费的时间，以秒或毫秒计
animation-timing-function|规定动画的速度曲线（）
animation-delay|规定在动画开始之前的延迟
animation-iteration-count|规定动画应该播放的次数
animation-direction|规定是否应该轮流反向播放动画

**具体值介绍**

animation-timing-function

* linear：动画从头到尾的速度是相同的。

* ease：默认。动画以低速开始，然后加快，在结束前变慢。

------

animation-iteration-count

* n：定义动画播放次数的数值。

* infinite：规定动画应该无限次播放。

--------

animation-direction

* normal：默认值。动画应该正常播放。

* alternate：动画应该轮流反向播放。

**进度条示例**

今天看项目代码，发现了一个进度条使用了animation动画，感觉很有意思，就收纳下来啦😍

```css
.download-progress {
  width: 150px;
  line-height: 15px;
  height: 15px;
  background: linear-gradient(45deg,
    #007DFF 10%,
    #a4cae7 20%,
    #007DFF 30%,
    #a4cae7 40%,
    #007DFF 50%,
    #a4cae7 60%,
    #007DFF 70%,
    #a4cae7 80%,
    #007DFF 90%,
    #a4cae7 100%);
  border-radius: 15px;
  border: 1px #93d4ff solid;
  background-size: 200% 100%;
  animation: dynamics 3s linear infinite;
  -webkit-animation: dynamics 3s linear infinite;
  -moz-animation: dynamics 3s linear infinite;
  overflow: hidden;
  text-align: right;

@keyframes dynamics {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 100% 0%;
  }
}
```

**以及一个好玩的示例**

```html
<div style="width: 100%;height: 100%;">
  <p id="animated_div">CSS3 动画</p>
</div>
```
```css
#animated_div
	{
	  width:60px;
	  height:40px;
	  background:#92B901;
	  position:relative;
	  -webkit-animation: animated_div 5s infinite;
	}

@keyframes animated_div
	{
	  0%		{transform: rotate(0deg);left:0px;}
	  25%		{transform: rotate(20deg);left:0px;}
	  50%		{transform: rotate(0deg);left:500px;}
	  55%		{transform: rotate(0deg);left:500px;}
	  70%		{transform: rotate(0deg);left:500px;background:#1ec7e6;}
	  100%	{transform: rotate(-360deg);left:0px;}
	}
```
效果如下：
<img :src="('/images/CSS3 animation（动画）属性/GIF.gif')">

<ToTop/>
