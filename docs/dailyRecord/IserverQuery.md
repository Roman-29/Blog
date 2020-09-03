# Iserver查询

## 查询（使用超图 API）

### 地图服务图层查询

**`SuperMap.REST.GetLayersInfoService`**

获取图层信息服务类。 该类负责将从客户端指定的服务器上获取该服务器提供的图层信息。

使用场景示例：

获取地图服务的所有图层供用户选择，根据选择的图层进行查询操作

用法示例：

```js
var url = 地图服务地址
var getLayersInfoService = new SuperMap.REST.GetLayersInfoService(url, {
    eventListeners: {
        "processCompleted": queryLayersInfoCompleted
        "processFailed": processFailed
    }
});
getLayersInfoService.processAsync();
```

### 图层字段信息查询

**`SuperMap.REST.GetFieldsService`**

字段查询服务，支持查询指定数据集的中所有属性字段（field）的集合

| 属性                | 介绍                             |
| ------------------- | -------------------------------- |
| dataset {String}    | 要查询的数据集名称。             |
| datasource {String} | 要查询的数据集所在的数据源名称。 |

使用场景示例：

获取到某个图层下的所有字段供用户选择，根据选择的字段进行字段统计

用法示例：

```js
var url = 数据服务地址;
getFieldsService = new SuperMap.REST.GetFieldsService(url, {
  eventListeners: {
    processCompleted: getFieldsCompleted,
    processFailed: processFailed
  },
  datasource: dataInfo.dataSourceName,
  dataset: dataInfo.name
});
getFieldsService.processAsync();
```

### 数据集查询基类介绍

#### `SuperMap.REST.GetFeaturesParametersBase`

数据服务中数据集查询参数基类

| 属性                         | 简介                                                                                                                                                               |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| datasetNames {Array(String)} | 数据集集合中的数据集名称列表。                                                                                                                                     |
| maxFeatures {Integer}        | 进行 SQL 查询时，用于设置服务端返回查询结果条目数量，默认为 1000。                                                                                                 |
| returnContent {Boolean}      | 是否立即返回新创建资源的表述还是返回新资源的 URI。 如果为 true，则直接返回新创建资源，即查询结果的表述。 如果为 false，则返回的是查询结果资源的 URI。默认为 true。 |
| returnCountOnly {Boolean}    | 只返回查询结果的总数，默认为 false。                                                                                                                               |
| fromIndex {Integer}          | 查询结果的最小索引号。 默认值是 0，如果该值大于查询结果的最大索引号，则查询结果为空。                                                                              |
| toIndex {Integer}            | 查询结果的最大索引号。 默认值是 19，如果该值大于查询结果的最大索引号，则以查询结果的最大索引号为终止索引号。                                                       |

#### `SuperMap.REST.GetFeaturesServiceBase`

数据服务中数据集查询服务基类。 查询结果通过该类支持的事件的监听函数参数获取。
获取的结果数据包括 result 、originResult 两种， 其中，originResult 为服务端返回的用 JSON 对象表示的查询结果数据，result 为服务端返回的查询结果数据。

| 属性                    | 介绍                                                                                                                                     |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| url {String}            | 数据查询结果资源地址。请求数据服务中数据集查询服务， URL 应为：http://{服务器地址}:{服务端口号}/iserver/services/{数据服务名}/rest/data/ |
| eventListeners {Object} | 监听器对象。监听查询成功或失败事件                                                                                                       |

监听查询完成或失败的方法：

```js
// 方法一
var myService = new SuperMap.REST.GetFeaturesServiceBase(url);
myService.events.on({
    "processCompleted": getFeatureCompleted,
     "processFailed": getFeatureError
});
function getFeatureCompleted(GetFeaturesEventArgs){//todo};
function getFeatureError(GetFeaturesEventArgs){//todo};

// 方法二
var myService = new SuperMap.REST.GetFeaturesServiceBase(url, {
    eventListeners: {
        "processCompleted": getFeatureCompleted,
        "processFailed": getFeatureError
    }
});
```

### 数据集 ID 查询

可以使用通过 SQL 查询数据集的方法替代

**`SuperMap.REST.GetFeaturesByIDsParameters`**

Geometry 查询参数类。 该类用于设置 Geometry 查询的相关参数。

| 属性                   | 介绍                                                                                                                                    |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| fields {Array(String)} | 设置查询结果返回字段。 当指定了返回结果字段后，则 GetFeaturesResult 中的 features 的属性字段只包含所指定的字段。 不设置即返回全部字段。 |
| IDs {Array(Integer)}   | 所要查询指定的元素 ID 信息。                                                                                                            |

**`SuperMap.REST.GetFeaturesByIDsService`**

数据集 ID 查询服务类。 在数据集集合中查找指定 ID 号对应的空间地物要素。

使用场景示例：

选择的一个或多个数据集进行 ID 查询，返回这些数据集中符合 ID 要求的要素

用法示例：

```js
var url; // 数据服务的根节点url
var getFeaturesByIDsParameters = new SuperMap.REST.GetFeaturesByIDsParameters({
  returnContent: true,
  datasetNames: ["数据源名称:数据集名称"],
  fromIndex: 0,
  IDs: [1, 247]
});
var getFeaturesByIDsService = new SuperMap.REST.GetFeaturesByIDsService(url, {
  eventListeners: {
    processCompleted: getFeatureCompleted,
    processFailed: getFeatureError
  }
});
getFeaturesByIDsService.processAsync(getFeaturesByIDsParameters); // 将客户端的查询参数传递到服务端。
```

### 数据集 SQL 查询

其实 SQL 查询可以替代上面的 ID 查询

**`SuperMap.REST.GetFeaturesBySQLParameters`**

数据服务中数据集 SQL 查询参数类。

| 属性                                           | 介绍             |
| ---------------------------------------------- | ---------------- |
| queryParameter {SuperMap.REST.FilterParameter} | 查询过滤条件参数 |

**`SuperMap.REST.FilterParameter`**

查询过滤条件参数类。 该类用于设置查询数据集的查询过滤参数。

| 属性                                      | 介绍                                                                                                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| attributeFilter {String}                  | 属性过滤条件。SLQ 语句                                                                                                                                 |
| name {String}                             | 查询数据集名称或者图层名称。一般情况下该字段为数据集名称，但在进行与地图相关功能的操作时， 需要设置为图层名称（图层名称格式：数据集名称@数据源别名）。 |
| joinItems {Array(SuperMap.REST.JoinItem)} | 与外部表的连接信息 JoinItem 数组。                                                                                                                     |
| linkItems {Array(SuperMap.REST.LinkItem)} | 与外部表的关联信息 LinkItem 数组。                                                                                                                     |
| ids {Array(String)}                       | 查询 id 数组，即属性表中的 SmID 值。                                                                                                                   |
| orderBy {String}                          | 查询排序的字段, orderBy 的字段须为数值型的。                                                                                                           |
| groupBy {String}                          | 查询分组条件的字段。                                                                                                                                   |
| fields {Array(String)}                    | 查询返回的字段数组。                                                                                                                                   |

**`SuperMap.REST.GetFeaturesBySQLService`**

数据服务中数据集 SQL 查询服务类。 在一个或多个指定的图层上查询符合 SQL 条件的空间地物信息。

使用场景示例：

只能对某个数据集进行查询，可以是 ID 查询也可以是 SQL 语句查询，并可以对查询出来的结果进行排序，分组操作

用法示例：

```js
var url = // 数据服务的根节点url
var getFeatureParam, getFeatureBySQLService, getFeatureBySQLParams;

getFeatureParam = new SuperMap.REST.FilterParameter({
    name: "数据集名称@数据源名称",
    attributeFilter: "SMID = 247"
});

getFeatureBySQLParams = new SuperMap.REST.GetFeaturesBySQLParameters({
    queryParameter: getFeatureParam,
    datasetNames: ["数据源名称:数据集名称"]
});

getFeatureBySQLService = new SuperMap.REST.GetFeaturesBySQLService(url, {
    eventListeners: {"processCompleted": processCompleted, "processFailed": processFailed}
});

getFeatureBySQLService.processAsync(getFeatureBySQLParams);
```

### 数据集范围查询

**`SuperMap.REST.GetFeaturesByBoundsParameters`**

数据集范围查询参数类。 该类用于设置数据集范围查询的相关参数。

| 属性                                              | 介绍                                                       |
| ------------------------------------------------- | ---------------------------------------------------------- |
| attributeFilter {String}                          | 范围查询属性过滤条件。SLQ 语句                             |
| bounds {SuperMap.Bounds}                          | 用于查询的范围对象。                                       |
| spatialQueryMode {SuperMap.REST.SpatialQueryMode} | 空间查询模式常量，必设参数，默认为 SuperMap.REST.CONTAIN。 |
| fields {Array(String)}                            | 查询返回的字段数组。                                       |
| queryParameter {SuperMap.REST.FilterParameter}    | 查询过滤条件参数。                                         |

**`SuperMap.REST.GetFeaturesByBoundsService`**

数据集范围查询服务类 查询与指定范围对象符合一定空间关系的矢量要素。

用法示例：

```js
var url = // 数据服务的根节点url
var bounds = feature.geometry.bounds;

var GetFeaturesByBoundsParameters, getFeaturesByGeometryService;
GetFeaturesByBoundsParameters = new SuperMap.REST.GetFeaturesByBoundsParameters({
    datasetNames: ["数据源名称:数据集名称"],
    spatialQueryMode: SuperMap.REST.SpatialQueryMode.INTERSECT,
    bounds: bounds
});
getFeaturesByGeometryService = new SuperMap.REST.GetFeaturesByBoundsService(url, {
    eventListeners: {
        "processCompleted": processCompleted,
        "processFailed": processFailed
    }
});
getFeaturesByGeometryService.processAsync(GetFeaturesByBoundsParameters);
```

### 数据集几何查询

**`SuperMap.REST.GetFeaturesByGeometryParameters`**

数据集几何查询参数类。 该类用于设置数据集几何查询的相关参数。

| 属性                                              | 介绍                                                       |
| ------------------------------------------------- | ---------------------------------------------------------- |
| attributeFilter {String}                          | 范围查询属性过滤条件。SLQ 语句                             |
| fields {Array(String)}                            | 查询返回的字段数组。                                       |
| geometry {SuperMap.Geometry}                      | 用于查询的几何对象。                                       |
| spatialQueryMode {SuperMap.REST.SpatialQueryMode} | 空间查询模式常量，必设参数，默认为 SuperMap.REST.CONTAIN。 |
| queryParameter {SuperMap.REST.FilterParameter}    | 查询过滤条件参数。                                         |

**`SuperMap.REST.GetFeaturesByGeometryService`**

数据集几何查询服务类 查询与指定几何对象符合一定空间关系的矢量要素。

用法示例：

```js
var url = // 数据服务的根节点url
let getFeaturesByGeometryParameters = new SuperMap.REST.GetFeaturesByGeometryParameters({
    datasetNames: ["数据源名称:数据集名称"],
    spatialQueryMode: SuperMap.REST.SpatialQueryMode.INTERSECT,
    geometry: drawGeometryArgs.feature.geometry
});
let getFeaturesByGeometryService = new SuperMap.REST.GetFeaturesByGeometryService(url, {
    eventListeners: {
        "processCompleted": processCompleted,
        "processFailed": processFailed
    }
});
getFeaturesByGeometryService.processAsync(getFeaturesByGeometryParameters);
```

### 数据集缓冲区查询

**`SuperMap.REST.GetFeaturesByBufferParameters`**

数据服务中数据集缓冲区查询参数类。

| 属性 | 介绍 |
| ---- | ---- |


attributeFilter {String} 属性查询条件。SLQ 语句
fields {Array(String)}|查询返回的字段数组。
geometry {SuperMap.Geometry}|用于查询的几何对象。
bufferDistance {Number}|buffer 距离,单位与所查询图层对应的数据集单位相同。
queryParameter {SuperMap.REST.FilterParameter}|查询过滤条件参数。

**`SuperMap.REST.GetFeaturesByBufferService`**

数据服务中数据集缓冲区查询服务类。

用法示例：

```js
var url = // 数据服务的根节点url
let getFeatureParameter = new SuperMap.REST.GetFeaturesByBufferParameters({
    bufferDistance: 30,
    attributeFilter: "SMID > 0",
    datasetNames: ["数据源名称:数据集名称"],
    geometry: feature.geometry
});
let getFeatureService = new SuperMap.REST.GetFeaturesByBufferService(url, {
    eventListeners: {
        "processCompleted": processCompleted,
        "processFailed": processFailed
    }
});
getFeatureService.processAsync(getFeatureParameter);
```

### 数据集字段统计

**`SuperMap.REST.FieldStatisticService`**

字段查询统计服务类。用来完成对指定数据集指定字段的查询统计分析，即求平均值，最大值等。

| 属性                | 介绍                                                   |
| ------------------- | ------------------------------------------------------ |
| datasource {String} | 数据集所在的数据源名称。                               |
| dataset {String}    | 数据集名称。                                           |
| field {String}      | 查询统计的目标字段名称。                               |
| statisticMode       | {SuperMap.REST.StatisticMode} 字段查询统计的方法类型。 |

用法示例：

```js
var url = // 数据服务的根节点url
var statisticService = new SuperMap.REST.FieldStatisticService(url, {
    eventListeners: {"processCompleted": statisticComplete, "processFailed": processFailed},
    datasource: 数据源名称,
    dataset: 数据集名称,
    field: 字段名称,
    statisticMode: 统计方式
})
statisticService.processAsync();
```

<ToTop/>
