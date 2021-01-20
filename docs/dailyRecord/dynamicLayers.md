# arcgis 动态工作空间与动态图层

ARCGIS 动态地图服务可以设置子图层为动态图层,动态图层有两种类型：DynamicMapLayer和DynamicDataLayer。

DynamicMapLayer 允许使用新的渲染器，定义表达式，不透明度，比例可见性等属性应用到地图服务中的子图层。单个地图服务图层可能存在多个动态地图图层。

DynamicDataLayer 提供了根据注册的工作空间中引用的数据动态创建图层的能力。数据可以是具有或不具有几何形状，要素类和栅格的表。这些数据源在services目录中不直接可见，但是可以通过ArcGIS Server管理器发布和配置。表数据可以连接到其他表或图层中。

## DynamicMapLayer 动态地图图层

动态地图图层其实和设置Sublayer属性十分相似,唯一的不同就是

## arcgis 动态图层添加 server 工作空间数据

arcgis API 允许使用来自已注册工作空间的数据创建动态图层。包括 SHP,图片,MDB(文件地理数据库),GDB(企业级数据库)

## 配置动态工作空间

## Raster 类型文件(图片)

加载

```js
var dynamicLayerInfos = [];
var optionsArray = [];

var dynamicLayerInfo = new DynamicLayerInfo();
// 一定要给ID,否则图层不加载
dynamicLayerInfo.id = 1;

var imageDataSource = new RasterDataSource();
imageDataSource.workspaceId = "MyImageWorkspaceID";
imageDataSource.dataSourceName = "03061002.jpg";

var layerSource = new LayerDataSource();
layerSource.dataSource = imageDataSource;

dynamicLayerInfo.source = layerSource;
dynamicLayerInfos.push(dynamicLayerInfo);

var dynamicLayer = new ArcGISDynamicMapServiceLayer(url);
dynamicLayer.setDynamicLayerInfos(dynamicLayerInfos);
```
