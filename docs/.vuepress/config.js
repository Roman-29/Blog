module.exports = {
  base: "/Blog/",
  title: "Roman's Notebook",
  description: "📝每天记录一点点",
  head: [["link", { rel: "icon", href: "/images/logo.png" }]],
  themeConfig: {
    nav: [
      { text: "📚学习总结", link: "/dailyRecord/" },
      { text: "📌书签整理", link: "/bookmark/" },
      { text: "✔️编码规范&协同开发", link: "/lint/" },
      {
        text: "📖知识脑图",
        link:
          "http://shooterblog.site/Learn-JS-Demo/%E5%89%8D%E7%AB%AF%E7%9F%A5%E8%AF%86%E5%9B%BE%E8%B0%B1/index.html",
      },
      {
        text: "🔗Github",
        link: "https://github.com/Roman-29",
      },
    ],
    sidebar: {
      "/dailyRecord/": [
        {
          title: "Vue3源码",
          collapsable: true,
          children: [
            "vue/VUE3-miniVue",
            "vue/VUE3-reactivity-core",
            "vue/VUE3-reactivity-advance",
            "vue/VUE3-runtime-core",
            "vue/VUE3-runtime-update",
            "vue/VUE3-runtime-diff",
          ],
        },
        {
          title: "单元测试",
          collapsable: true,
          children: ["unittest/hello-test", "unittest/vitest"],
        },
        {
          title: "GIS",
          collapsable: true,
          children: [
            "gis/OpenLayers",
            "gis/OLSourceCode1",
            "gis/OLSourceCode2",
            "gis/ArcgisAPI",
            "gis/GISsystem",
            "gis/SuperMapWebGL",
            "gis/SuperMap3DStudy",
          ],
        },
        {
          title: "前端模块化和打包工具",
          collapsable: true,
          children: [
            "modularization/qdmkh",
            "modularization/webpack",
            "modularization/webpackAdvanced",
            "modularization/vite",
          ],
        },
        {
          title: "内功修炼",
          collapsable: true,
          children: [
            "base/HTTP",
            "base/CrossDomain",
            "base/Nginx",
            "base/this",
            "base/TypeScript",
          ],
        },
        {
          title: "前端异常监控",
          collapsable: true,
          children: ["FrontendMonitor"],
        },
        {
          title: "总结",
          collapsable: true,
          children: ["2020"],
        },
        {
          title: "其他",
          collapsable: true,
          children: ["other/ITEnvironment"],
        },
      ],
      "/lint/": [
        {
          title: "编码规范",
          collapsable: true,
          children: ["", "es6", "vue"],
        },
        {
          title: "协同开发",
          collapsable: true,
          children: ["gitBase", "collaborative"],
        },
      ],
      "/bookmark/": [
        {
          title: "书签整理",
          collapsable: false,
          children: ["", "backend", "tool"],
        },
      ],
    },
    lastUpdated: "Last Updated",
    sidebarDepth: 2,
  },
  plugins: ["@vuepress/medium-zoom"],
};
