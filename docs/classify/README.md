# CSS

## CSS3 animation（动画） 属性

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


<ToTop/>
