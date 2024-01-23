# Glados自动签到插件
Glados网站每日自动签到插件，打开浏览器时可自动进行签到。
<br>
适用于使用`Chromium`内核的浏览器如Chrome、Edge
---
## 项目框架与结构
使用`vite`+`vue`开发,引入`ant-design-vue`作为UI库
<br><br>
具体文件结构如下:
```
glados-daily-checkin
├── README.md
├── build.js                 // 整合各模块build文件的脚本文件
├── components.d.ts
├── globalConfig.js          // build文件输出目录设置
├── index.html               // 首页文件,项目指定为popup/main.ts
├── package-lock.json
├── package.json
├── src
│   ├── background           // v3中的service worker模块
│   │   └── index.js
│   ├── content              // content注入模块,没有实际用处
│   │   ├── index.css
│   │   └── index.js
│   └── popup                // popup模块,点击图标出现的页面
│       ├── formStateINTF.ts
│       ├── main.ts
│       └── popup.vue
├── tsconfig.json
├── tsconfig.node.json
├── vite.background.config.ts // background模块的build设置
├── vite.content.config.ts    // content模块的build设置
└── vite.popup.config.ts      // popup模块的开发和build设置,也是整个项目的设置
```
<br>

## 项目细节实现

项目具体开发过程与细节实现详见个人博客[待补充](https://www.ichirinko.top)

---
## 项目构建与使用
### 直接在浏览器中使用
因为本人不向~~邪恶的Google~~低头,没有交5刀的注册费,故Chrome与Edge无法直接加载crx文件，需要进行以下几步进行插件安装：
1. 下载release中的crx压缩包,解压到任一文件夹
2. 在浏览器中,点击右上角三点,选择"扩展程序"
3. 在扩展程序页面中,开启开发者模式后,选择加载已解压的扩展程序
4. 在弹出的窗口中选择解压文件夹,安装插件

### 通过代码构建和运行扩展程序
这个项目需要提前安装`NodeJS`和`Vite`,以及`Vue`框架
<br>
然后,在项目目录下使用以下的命令安装必要的项目依赖包
```shell
npm install
```
或
```shell
yarn install
```
<br>

然后,使用以下的命令运行项目
```shell
npm run dev
```
或
```shell
yarn dev
```

<br>

通过以下网址访问popup页面
```url
http://localhost:10086/
```
<br>

要构建项目为扩展程序包,使用以下的命令
```shell
npm run build
```
或
```shell
yarn build
```
得到的扩展程序包可以使用与第一种方法同样的方式导入浏览器中
