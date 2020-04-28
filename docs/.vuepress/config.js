module.exports = {
  base: "/Blog/",
  title: "Roman's Notebook",
  description: '📝每天记录一点点',
  head: [
    ['link', { rel: 'icon', href: '/images/logo.png' }]
  ],
  themeConfig: {
    nav: [
      { text: "📚学习总结", link: "/dailyRecord/" },
      // { text: "📚笔记分类", link: "/classify/" },
      { text: "📌书签整理", link: "/bookmark/" },
      { text: "✔️编码规范&协同开发", link: "/lint/" },
      {
        text: "📖知识脑图",
        link:
          "http://shooterblog.site/Learn-JS-Demo/%E5%89%8D%E7%AB%AF%E7%9F%A5%E8%AF%86%E5%9B%BE%E8%B0%B1/index.html"
      },
      {
        text: "🔗Github",
        link:
          "https://github.com/Roman-29"
      }
    ],
    sidebar: {
      "/dailyRecord/": [
        {
          title: "前端模块化",
          collapsable: true,
          children: [
            "qdmkh","webpack"
          ]
        },
        {
          title: "前端疑难杂症",
          collapsable: true,
          children: [
            "HTTP","CrossDomain"
          ]
        },
        {
          title: "GIS",
          collapsable: true,
          children: [
            "ArcgisAPI","GISsystem","SuperMapWebGL","SuperMapIserver"
          ]
        },
        {
          title: "CSS",
          collapsable: true,
          children: [
            "CSS"
          ]
        }
      ],
      "/lint/": [
        {
          title: "编码规范",
          collapsable: true,
          children: ["", "es6", "vue"]
        },
        {
          title: "协同开发",
          collapsable: true,
          children: ["gitBase", "collaborative"]
        }
      ],
      "/bookmark/": [
        {
          title: "书签整理",
          collapsable: false,
          children: ["", "backend", "tool"]
        }
      ]
    },
    lastUpdated: "Last Updated",
    sidebarDepth: 2
  }
}