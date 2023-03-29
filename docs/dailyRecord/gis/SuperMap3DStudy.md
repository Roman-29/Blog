# 三维 WebGIS 学习笔记

本文从 BIM, 3ds Max, 倾斜摄影三种三维模型为切入点, 从模型构建, 接入 GIS 平台以及性能优化, 模型缓存等方面对三维模型进行介绍.

## BIM 模型

BIM 中文名建筑信息模型技术, 是以三维图形为主、物件为导向、建筑学有关的电脑辅助设计。通俗来说就是将 CAD 图纸转换为三维模型的技术.

### BIM 建模注意事项

为提升 BIM 模型在 GIS 平台的性能, 建模人员和开发人员, 在前期沟通和数据对接时都应注意如下事项:

- 1. 避免重复, 冗余的对象

- 2. 避免复杂对象(上万个三角面), 可以对模型进行拆分

- 3. 避免超长对象(长达数公里), 可以进行分段

- 4. 避免多子对象(上百个子对象), 合理对模型进行合并和拆分

- 5. 圆柱对象, 可以利用六边形代替

- 6. 避免使用大纹理贴图

### BIM 数据接入超图平台

按优先顺序, 有如下三个方式

#### 1. 插件导出

![image](../../.vuepress/public/images/SuperMap3DStudy/1.png)

#### 2. 超图桌面端直接导入

![image](../../.vuepress/public/images/SuperMap3DStudy/2.png)

#### 3. 导出为交换格式再导入

![image](../../.vuepress/public/images/SuperMap3DStudy/3.png)

### BIM 模型对接常见问题

Q: BIM 模型导入后, 无法添加到球面场景

- A: 检查坐标系是否正确

Q: BIM 模型空间位置不正确

- A: 检查坐标值是否正确

Q: 多种数据坐标系不统一, BIM 模型与其他数据无法匹配

- A: 先进行投影转换为同一坐标系, 再进行三维配准对模型位置进行校正

Q: 贴图有色差

- A: 检查建模时是否设置了多重纹理.

### 性能优化

检查顶点

![image](../../.vuepress/public/images/SuperMap3DStudy/23.png)

检查三角面

![image](../../.vuepress/public/images/SuperMap3DStudy/24.png)

![image](../../.vuepress/public/images/SuperMap3DStudy/25.png)

## 3ds Max 模型

### 3ds Max 建模注意事项

- 1. 避免使用大纹理贴图

- 2. 低面建模, 减少模型的面片

![image](../../.vuepress/public/images/SuperMap3DStudy/5.png)

![image](../../.vuepress/public/images/SuperMap3DStudy/6.png)

作为开发人员可以不动手改模型, 但是要知道什么地方会影响展示性能

### 3ds Max 模型接入超图平台

使用超图提供的插件生成模型数据集, 和 BIM 模型类似

导出时注意将 建筑, 树木, 地块等分别导出到单独的模型数据集中, 便于在桌面端对不同的要素进行管理, 例如各个图层显隐, 可见高度范围等.

### 性能优化

首先最直观的就是在浏览器中对加载的模型进行检查

![image](../../.vuepress/public/images/SuperMap3DStudy/21.png)

显示优化, 可以控制图层的可见范围

![image](../../.vuepress/public/images/SuperMap3DStudy/22.png)

## 倾斜摄影模型

### 倾斜摄影自动化建模

![image](../../.vuepress/public/images/SuperMap3DStudy/7.png)

#### 成果类型介绍

倾斜摄影模型有两种成果数据

![image](../../.vuepress/public/images/SuperMap3DStudy/26.png)

![image](../../.vuepress/public/images/SuperMap3DStudy/27.png)

### 倾斜摄影建模的特点

- 1. 建模速度快, 成本低

- 2. 纹理真实

- 3. 只是一张皮, 无法对室内建模

- 4. 容易出现变形

### 倾斜摄影建模接入超图平台

- 1. 桌面端对倾斜摄影 osgb 生成配置文件, 通过 scp 配置文件快速读取模型文件

![image](../../.vuepress/public/images/SuperMap3DStudy/8.png)

- 2. 直接导入数据集

![image](../../.vuepress/public/images/SuperMap3DStudy/14.png)

- 3. 倾斜摄影建模软件对接 S3M 标准, 直接生成 S3M 三维切片缓存数据

![image](../../.vuepress/public/images/SuperMap3DStudy/9.png)

### 性能优化

#### 合并根节点

![image](../../.vuepress/public/images/SuperMap3DStudy/10.png)

#### 纹理压缩

![image](../../.vuepress/public/images/SuperMap3DStudy/11.png)

#### 生成 S3M

![image](../../.vuepress/public/images/SuperMap3DStudy/12.png)

#### 生成大文件

![image](../../.vuepress/public/images/SuperMap3DStudy/13.png)

## 二三维缓存原理和意义

### 缓存概述

对 GIS 数据进行预处理, 创建缓存, 在很大程度上缩短了用户等待时间, 提高了数据浏览的速率, 使 GIS 数据浏览变得更加流畅.

#### 三维场景支持的缓存类型

超图的缓存类型比较多, 归类总结如下:

![image](../../.vuepress/public/images/SuperMap3DStudy/4.png)

#### 生成缓存以及关键参数

![image](../../.vuepress/public/images/SuperMap3DStudy/17.png)

![image](../../.vuepress/public/images/SuperMap3DStudy/28.png)

### 模型&矢量数据缓存解析

![image](../../.vuepress/public/images/SuperMap3DStudy/15.png)

#### scp 文件解析

![image](../../.vuepress/public/images/SuperMap3DStudy/16.png)

### 影像缓存解析

#### sic3d 文件解析

![image](../../.vuepress/public/images/SuperMap3DStudy/18.png)

### 地形缓存解析

#### sct 文件解析

![image](../../.vuepress/public/images/SuperMap3DStudy/29.png)

### 地图缓存解析

二维地图数据也可以进行缓存提升性能

缓存类型可以选择栅格瓦片和矢量瓦片

![image](../../.vuepress/public/images/SuperMap3DStudy/19.png)

#### 矢量瓦片介绍

![image](../../.vuepress/public/images/SuperMap3DStudy/20.png)
