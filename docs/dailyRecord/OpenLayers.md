# OpenLayers 基础

## 地图

### ol/Map（地图）

地图对象，作为GIS应用最基本的东西，用于装载layer。

基本实例化参数：

参数名|Type|简介
-|-|-
layers|ol/layer|图层。 如果未定义，则将渲染没有图层的地图。 图层是按提供的顺序渲染的，因此例如要使某图层出现在的顶部，则它必须位于图层组最后。
target|HTMLElement 或 string|地图的容器，DOM元素本身或DOM元素ID。 如果在构造时未指定，则必须调用setTarget函数才能渲染地图。
view|ol/View|地图的视图。也可以通过setView函数设置

```js
let map = new Map({
  overlays: [this.tipsOverlay],
  layers: this.basemapLayers,
  target: mapNode,
  view: mapView
});
```

### ol/View（视图）

View对象代表地图的简单2D视图。

#### 视图状态

视图由三种参数确定：center，resolution，和rotation。
每个状态具有相应的获取和设置，例如 getCenter和setCenter用于center状态。

#### 约束条件
setCenter，setResolution并setRotation可以用来改变视图的状态。并且View对象可以对这三个参数进行约束。

* 分辨率约束：
由resolutions，maxResolution，maxZoom和zoomFactor四个参数决定。
* 旋转约束：
由enableRotation和constrainRotation参数决定。默认情况下，旋转是允许的，并且在接近水平方向时其值会固定为零。
* 中心约束：
由extent参数决定。默认情况下，视图中心完全不受约束。

### ol/proj/Projection（坐标系）

投影定义类。对于非epsg3857，4326的坐标系的地图服务，是需要利用proj4插件定义投影，并注册，才能正常加载。

单位：
> 米："m"或"meter"
> 度："degrees"或"degree"

**踩坑记录：
Projection一定要带上单位。否则默认为“度”。如果坐标系的单位不是度的话就惨了，后面加载切片计算出来的切片行列号会差的十万八千里，而且很难想到是因为Projection单位导致的，相当难定位问题。**

```js
import proj4 from 'proj4';
import { Projection } from "ol/proj";

proj4.defs("EPSG:4525", "+proj=tmerc +lat_0=0 +lon_0=111 +k=1 +x_0=37500000 +y_0=0 +ellps=GRS80 +units=m +no_defs");
register(proj4);
projection = new Projection({
  code: "EPSG:4525",
  extent: [37528668.9634, 2376156.7121, 37641094.4958, 2510788.1806],
  units: "m"
});

let mapView = new View({
  projection,
  ...
});
```

有关各种投影的参数定义，可参考 

[epsg](https://epsg.io/)

### ol/Overlay（地图弹窗）

要在地图上显示并附加到单个地图位置的元素。通过绑定到地理坐标，跟随地图的移动而移动。

基本实例化参数：

参数名|Type|简介
-|-|-
id|string|图层ID
element|HTMLElement|DOM元素
offset|Array|偏移
positioning|ol/OverlayPositioning|定义叠加层相对于其position属性的实际定位方式

使用示例

```js
import Overlay from 'ol/Overlay';

createOverLay() {
  if (this.TipElement) {
    this.TipElement.parentNode.removeChild(
      this.TipElement
    );
  }
  this.TipElement = document.createElement("div");
  this.TipElement.className = "ol-tooltip ol-tooltip-measure";
  this.TipElement.innerHTML = "MyOverlay";
  this.TipOverlay = new Overlay({
    id: "measureOverlay",
    element: this.TipElement,
    offset: [0, -7],
    positioning: "bottom-center"
  });
  this.TipOverlay.setPosition(tooltipCoord);
  this.map.addOverlay(this.TipOverlay);
}
```

## 图层

### ol/layer/Image

动态服务图层类

基本实例化参数：

参数名|Type|简介
-|-|-
opacity|number|透明度（默认是1）
visible|boolean|是否可见
extent|ol/extent|图层渲染的边界范围
zIndex|number|图层的叠加顺序
map||map对象
source|ol/source/Image|image图层资源类

### ol/layer/Tile

切片服务图层类

基本实例化参数：

参数名|Type|简介
-|-|-
opacity|number|透明度（默认是1）
visible|boolean|是否可见
extent|ol/extent|图层渲染的边界范围
zIndex|number|图层的叠加顺序
map||map对象
source|ol/source/Tile|Tile图层资源类

### ol/source/XYZ

加载切片服务的切片资源类

基本实例化参数：

参数名|Type|简介
-|-|-
crossOrigin|string|加载图像的crossOrigin属性
projection|ol/proj|坐标系
opaque|boolean|图层是否不透明（默认是）
url|string|arcgis 服务地址
tileGrid|ol/tilegrid/TileGrid|切片组
url|string|切片服务地址 + "/tile/{z}/{y}/{x}"
tileSize|number|切片大小，没有的话读取tileGrid的

### ol/tilegrid/TileGrid

用于设置地图服务的切片组

基本实例化参数：

参数名|Type|简介
-|-|-
tileSize|number|切片大小
resolutions|Array|Resolution代表当前地图范围内，1像素代表多少地图单位，地图单位取决于空间参考。
origin|Array|切片原点
extent|ol/extent|请求切片的边界范围

### arcgis动态图层

openlayers提供了加载arcgis mapserver的动态图层类（ol/source/ImageArcGISRest）。

**使用场景：在openlayers中以动态服务图层的方式加载 Arcgis Server的MapServer。对标arcgis api中的mapImageLayer**

基本实例化参数：

参数名|Type|简介
-|-|-
crossOrigin|string|加载图像的crossOrigin属性
params|Object|ArcGIS Rest参数(后面会举例说明)
projection|ol/proj|坐标系，默认跟随mapView
url|string|arcgis 服务地址

使用示例：

```js
import ImageLayer from "ol/layer/Image";
import ImageArcGISRest from "ol/source/ImageArcGISRest";

let arcgisImageSource = new ImageArcGISRest({
  params: {
    // 只显示下标为0的图层
    LAYERS: `show:0`,
    // 可为空，动态图层服务端渲染等参数的填写位置
    dynamicLayers: "..."
  },
  url: serviceInfo.url,
  crossOrigin: "anonymous"
});

let layer = new ImageLayer({
  id: id,
  visible: true,
  source: arcgisImageSource
});

map.addLayer(layer);
```

### arcgis动态图层（类切片）

由于动态图层的原理，对于数据较多的服务，server出图的时间会不尽人意。所以出现了这种加载方式。

**Q:
何为类切片图层？**

**A:
一般来说动态图层都是将当前视图范围传给server，由server渲染一张图片显示出来。
类切片是将当前视图范围按照一定的宽高做分割，分割后将分块范围通过并发请求server渲染分割区域的图片，最后将这些图片按切片图层的原理拼接回来。**

**Q:
有何优点？**

**A:
比如当前视图数据较多，server渲染一张图需要四秒。理论上将这个范围分成4份去并发的请求，渲染时间会缩短为1秒，以此类推分成8份会到0.5秒。当然还会受到浏览器最大并发请求数的限制，但是理论上效果是会好于一般的动态图层**

基本实例化参数：

参数名|Type|简介
-|-|-
crossOrigin|string|加载图像的crossOrigin属性
params|Object|ArcGIS Rest参数(后面会举例说明)
projection|ol/proj|坐标系，默认跟随mapView
url|string|arcgis 服务地址
tileGrid|ol/tilegrid/TileGrid|切片组。决定动态图层如何切割（默认根据mapView的Projection的范围进行切割）

使用示例：

```js
import TileLayer from "ol/layer/Tile";
import TileArcGISRest from "ol/source/TileArcGISRest";

let arcgisImageSource = new TileArcGISRest({
  params: {
    // 只显示下标为0的图层
    LAYERS: `show:0`,
    // 可为空，动态图层服务端渲染等参数的填写位置
    dynamicLayers: "..."
  },
  url: serviceInfo.url,
  crossOrigin: "anonymous"
});

let layer = new TileLayer({
  id: id,
  visible: true,
  source: arcgisImageSource
});

map.addLayer(layer);
```

### arcgis切片图层

openlayers提供了加载切片服务图层类（ol/source/XYZ）

使用场景：在openlayers中以切片服务图层的方式加载 Arcgis Server的MapServer。对标arcgis api中的tileLayer

使用示例：

```js
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import TileGrid from "ol/tilegrid/TileGrid";

let tileGrid = new TileGrid({
  tileSize: 256,
  origin: [*,*],
  resolutions: [*,*,*,*]
});

// 瓦片数据源
let arcgisXYZTileSource = new XYZ({
  tileGrid: tileGrid,
  projection: "EPSG:4525",
  url: mapServerUrl + "/tile/{z}/{y}/{x}",
  crossOrigin: "anonymous"
});

let layer = new TileLayer({
  id: id,
  className: id,
  visible: true,
  source: arcgisXYZTileSource
});

map.addLayer(layer);
```

### supermap动态图层

openlayers本身是不支持直接加载超图服务的。但是超图提供了图层类，使得openlayers上可以加载SuperMap iServer Image 图层源。

工具类具体信息参考：

[ImageSuperMapRest](https://github.com/SuperMap/iClient-JavaScript/blob/master/src/openlayers/mapping/ImageSuperMapRest.js)

基本实例化参数：

参数名|Type|简介
-|-|-
url|string|地图服务地址
layersID|string|指定图层显隐
prjCoordSys|object|坐标系

特别说明：
layersID这个属性是用来控制子图层显隐的，具体介绍如下：

>当前地图图层ID的定义规则如下： 
>1.  各级图层按照图层顺序自上而下从0开始编号； 
>2.  冒号（:）前为地图； 
>3.  英文句号（.）表示其他各级图层间的从属关系； 
>4.  英文逗号（,）表示图层间的分隔。
>
>例如： 
>1.  [0:0,1,2.0]表示地图0下面的图层：0、1及其下属所有子图层，和2下的子图层0； 
>2.  [1:1.2,2]表示地图1下面的图层：1下的子图层2，和图层2及其下属所有子图层；
>3.  两个示例合并在一起则是：[0:0,1,2.0,1:1.2,2]
>此外，[0,1,2,3]表示地图0下面的图层0、1、2、3及所有子图层，[0:,1:,2:]表示地图0、1、2及其所有子图层。 
>4.  当我们初始化图层之后还想改变图层显示时可以直接如下进行设置： layer.layersID = “[0:0,1,7,11]”

使用示例：

```js
import TileLayer from "ol/layer/Tile";
import { ImageSuperMapRest } from "***/ImageSuperMapRest";

let supermapImageSource = new ImageSuperMapRest({
  url: serviceUrl,
  prjCoordSys: {
    epsgCode: "4525"
  },
  crossOrigin: "anonymous",
  layersID: "[0:0,1,2]"
});
let layer = new TileLayer({
  id: id,
  className: id,
  visible: true,
  source: supermapImageSource
});

map.addLayer(layer);
```

### supermap动态图层（类切片）

openlayers本身是不支持直接加载超图服务的。但是超图提供了图层类，使得openlayers上可以加载SuperMap iServer TileImage 图层源。

工具类具体信息参考：

[TileSuperMapRest](https://github.com/SuperMap/iClient-JavaScript/blob/master/src/openlayers/mapping/TileSuperMapRest.js)

基本实例化参数：

参数名|Type|简介
-|-|-
url|string|地图服务地址
layersID|string|指定图层显隐
prjCoordSys|object|坐标系
tileGrid|ol/tilegrid/TileGrid|切片组。

使用示例：

```js
import TileLayer from "ol/layer/Tile";
import TileGrid from "ol/tilegrid/TileGrid";
import { ImageSuperMapRest } from "***/TileSuperMapRest";

let tileGrid = new TileGrid({
  tileSize: 256,
  origin: [*,*],
  resolutions: [*,*,*,*]
});

let supermapImageSource = new ImageSuperMapRest({
  url: serviceUrl,
  tileGrid: tileGrid,
  prjCoordSys: {
    epsgCode: "4525"
  },
  crossOrigin: "anonymous",
  layersID: "[0:0,1,2]"
});
let layer = new TileLayer({
  id: id,
  className: id,
  visible: true,
  source: supermapImageSource
});

map.addLayer(layer);
```

### supermap切片图层

稍后补充

## 空间图形

### geometryol/geom/Geometry（几何）

几何对象的基类。 此类没有构造函数，不能被实例化。

对标arcgis api中的 `esri/geometry/Geometry`

要构造几何体，具体请参见官方文档，这里不再赘述：

>点类型
[单点](https://openlayers.org/en/latest/apidoc/module-ol_geom_Point-Point.html)
[多点](https://openlayers.org/en/latest/apidoc/module-ol_geom_MultiPoint-MultiPoint.html)

>线类型
[折线](https://openlayers.org/en/latest/apidoc/module-ol_geom_LineString-LineString.html)
[自由线](https://openlayers.org/en/latest/apidoc/module-ol_geom_MultiLineString-MultiLineString.html)

>面类型
[多边形](https://openlayers.org/en/latest/apidoc/module-ol_geom_Polygon-Polygon.html)
[圆](https://openlayers.org/en/latest/apidoc/module-ol_geom_Circle-Circle.html)

### ol/Feature（要素）

几何要素。包含geometry，attributes以及样式style。
对标arcgis api的 Graphic。

可以使用setStyle分别设置样式。 否则，它们将使用其矢量层的样式。

实例化参数：可以直接传递Geometry对象，也可以是一个对象。如果是对象，则对象必须包含一个geometry的属性作为Feature的几何图形。


使用示例：

```js
import { Point, LineString, Polygon } from "ol/geom";
import Feature from "ol/Feature";

// 一个矩形
Geo = new Polygon([
  [
    [xmin, ymin],
    [xmin, ymax],
    [xmax, ymax],
    [xmax, ymin],
    [xmin, ymin]
  ]
]);

let tempFeature = new Feature({
  attributes: Attributes,
  geometry: Geo,
  name: 'My Polygon'
});

feature.setStyle(symbol);
```

### ol/style/Style（样式）

几何图形的样式类。

基本实例化参数：

参数名|Type|简介
-|-|-
fill|ol/style/Fill|填充样式
image|ol/style/Image|图片样式
renderer|RenderFunction|渲染器，设置后fill，stroke 和 image都会忽略
stroke|ol/style/Stroke|外边线的样式
text|ol/style/Text|文本样式

```js
import { Style, Circle, Fill, Stroke } from "ol/style";

const symbol = new Style({
  fill: new Fill({
    color: "rgba(255, 0, 0, 0)"
  }),
  image: new Circle({
    fill: new Fill({
      color: "rgba(255, 0, 0, 1)"
    }),
    radius: 10,
    stroke: new Stroke({
      color: "rgba(255, 0, 0, 0)",
      width: 1
    })
  }),
  stroke: new Stroke({
    color: "rgba(255, 0, 0, 1)",
    width: 2
  })
});
```

### ol/layer/Vector（矢量图层）

呈现给客户端的矢量数据。
对标arcgis api的`esri/layers/GraphicsLayer`

基本实例化参数：

参数名|Type|简介
-|-|-
opacity|number|透明度（默认是1）
visible|boolean|是否可见
extent|ol/extent|图层渲染的边界范围
zIndex|number|图层的叠加顺序
source|ol/source/Vector|矢量数据

使用示例：
```js
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";

let vectorSource = new VectorSource();
let vectorLayer = new VectorLayer({
  id: layerID,
  className: layerID,
  source: vectorSource
});

map.addLayer(vectorLayer);

vectorLayer.getSource().addFeature(feature);
```

### ol/interaction/Draw（绘制）

绘制要素几何的交互工具。

基本实例化参数：

参数名|Type|简介
-|-|-
type|ol/geom/GeometryType|用此实例绘制的几何类型
features|ol/Feature|绘制要素的目标集合
source|ol/source/Vector|绘制要素的目标源
style|ol/style/Style|草图样式
freehand|boolean|是否自由绘制，默认否

```js
const DRAWTYPE = {
  POINT: "Point", // 点
  LINE_STRING: "LineString", // 线
  POLYGON: "Polygon", // 面
  CIRCLE: "Circle", // 圆,规则多边形
  BOX: "Box", // 矩形
  NONE: "None" // 关闭draw
};

let drawInteraction = new Draw({
  type: DRAWTYPE.POLYGON,
  freehand: false,
});
map.addInteraction(drawInteraction);

drawInteraction.on("drawend", DrawEvent => {
  map.removeInteraction(drawInteraction);
  vectorLayer.getSource().clear();

  let feature = DrawEvent.feature;
  vectorLayer.getSource().addFeature(feature);
});
```

## 关于查询服务

在openlayers中加载arcgis或超图的服务，对服务进行查询的方式，除了使用对应厂商提供的API，也可以自己根据服务提供的查询接口，补充参数进行查询请求。

这里不介绍查询的参数，只介绍如何将两家的服务查询出来的要素渲染到openlayers的地图上。

### arcgis服务

将arcgis服务查询到的要素转化为openlayers的要素。

关于查询的参数可以参考arcgis api 官网

[Query](https://developers.arcgis.com/javascript/latest/api-reference/esri-tasks-support-Query.html)

使用案例：

```js
import http from "../Utils/http";
import { Point, LineString, Polygon } from "ol/geom";
import Feature from "ol/Feature";

const esriGeometryType = {
  esriGeometryPoint: "esriGeometryPoint",
  esriGeometryMultipoint: "esriGeometryMultipoint",
  esriGeometryPolyline: "esriGeometryPolyline",
  esriGeometryPolygon: "esriGeometryPolygon",
  esriGeometryEnvelope: "esriGeometryEnvelope"
};

http.post(`${this.url}/${layerID}/query`,param).then(response => {
  let result = dealWithEsriResult(response);
  resolve(result)
})
.catch(error => {
  reject(error);
});

// 处理arcgis查询结果
dealWithEsriResult(result){
  result.features.forEach(feature => {
    let tempGeo = esriGeometry2OLGeo(feature.geometry, result.geometryType);
    let tempFeature = new Feature({ geometry: tempGeo });
    tempFeature.attributes = feature.attributes;
    tempResult.push(tempFeature);
  });
  Object.assign(result, { features: tempResult });
  return result;
}

/**
 * @description 将esri geometry对象转换成openlayer geometry对象
 * @param {String} geometryType
 */
const esriGeometry2OLGeo = (esriGeometry, geometryType) => {
  let olgeo = null;
  switch (geometryType) {
    case esriGeometryType.esriGeometryPoint:
      olgeo = new Point([esriGeometry.x, esriGeometry.y]);
      break;
    case esriGeometryType.esriGeometryMultipoint:
      break;
    case esriGeometryType.esriGeometryPolyline:
      olgeo = new LineString(esriGeometry.paths[0]);
      break;
    case esriGeometryType.esriGeometryPolygon:
      olgeo = new Polygon(esriGeometry.rings);
      break;
    case esriGeometryType.esriGeometryEnvelope:
      olgeo = new Polygon([
        [
          [esriGeometry.xmin, esriGeometry.ymin],
          [esriGeometry.xmin, esriGeometry.ymax],
          [esriGeometry.xmax, esriGeometry.ymax],
          [esriGeometry.xmax, esriGeometry.ymin],
          [esriGeometry.xmin, esriGeometry.ymin]
        ]
      ]);
      break;
  }
  return olgeo;
};
```

### 超图服务

将超图服务查询到的要素转化为openlayers的要素。

关于查询的参数可以参考我之前写的使用超图API查询的笔记

[超图查询API](https://roman-29.github.io/Blog/dailyRecord/SuperMapWebGL.html#%E6%9F%A5%E8%AF%A2)

使用案例：

```js
import http from "../Utils/http";
import { Point, LineString, Polygon } from "ol/geom";
import Feature from "ol/Feature";

const smGeometryType = {
  smGeometryPoint: "POINT",
  smGeometryPolyline: "LINE",
  smGeometryPolygon: "REGION",
  smGeometryEnvelope: "RECTANGLE"
};

http.post(`${this.url}/rest/data/featureResults.json?returnContent=true`,param).then(response => {
  let result = dealWithSuperMapResult(response);
  resolve(result)
})
.catch(error => {
  reject(error);
});

// 处理超图查询结果
dealWithSuperMapResult(result){
  let tempResult = [];
  result.features.forEach(feature => {
    let tempGeo = smGeometry2OLGeo(feature.geometry);
    let tempAttributes = {};
    feature.fieldNames.forEach((fieldName, index) => {
      tempAttributes[fieldName] = feature.fieldValues[index];
    });
    let tempFeature = new Feature({
      attributes: tempAttributes,
      geometry: tempGeo
    });
    tempFeature.attributes = tempAttributes;
    tempResult.push(tempFeature);
  });
  Object.assign(result, { features: tempResult });
  return result;
}

/**
 * @description 将supermap geometry对象转 openlayer geometry对象
 */
const smGeometry2OLGeo = smGeometry => {
  let olgeo = null,
    pointArr2 = [];
  let startIndex = 0;
  smGeometry.parts.forEach(part => {
    let tempPoints = smGeometry.points.slice(startIndex, startIndex + part);
    startIndex += part;
    let pointArr1 = tempPoints.map(item => {
      return [item.x, item.y];
    });
    pointArr2.push(pointArr1);
  });
  switch (smGeometry.type) {
    case smGeometryType.smGeometryPoint:
      olgeo = new Point([smGeometry.points[0].x, smGeometry.points[0].y]);
      break;
    case smGeometryType.smGeometryPolyline:
      olgeo = new LineString(pointArr2);
      break;
    case smGeometryType.smGeometryPolygon:
      olgeo = new Polygon(pointArr2);
      break;
    case smGeometryType.smGeometryEnvelope:
      olgeo = new Polygon([
        [
          [smGeometry.xmin, smGeometry.ymin],
          [smGeometry.xmin, smGeometry.ymax],
          [smGeometry.xmax, smGeometry.ymax],
          [smGeometry.xmax, smGeometry.ymin],
          [smGeometry.xmin, smGeometry.ymin]
        ]
      ]);
      break;
  }
  return olgeo;
};
```

<ToTop/>