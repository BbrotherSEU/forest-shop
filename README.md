# 林间文具店

[English](#forest-stationery-shop)

在浏览器里逛一家小文具店。先看到木屋外观，点门进去，再用方向键或鼠标在店里走动。镜头只跟着人平移，房间本身不会转向。

## 怎么玩

1. 打开页面后，点木门走进店里。
2. 用方向键或 `W` `A` `S` `D` 走路，也可以点地面，人会走过去。
3. 点蓝色柜子或木柜子，查看里面的文具，再放进购物车。桌上的水彩笔和胶水可以直接点。
4. 右上角打开购物车，确认金额后结账。店里的门可以走回外面。

价格用元和角，1 元 = 10 角。购物车最多 8 件，同一种最多 2 件。

| 位置 | 文具 |
| --- | --- |
| 蓝色柜子 | 铅笔 5角、橡皮 8角、尺子 1元、铅笔盒 2元5角 |
| 木柜子 | 练习本 1元5角、文件夹 1元2角、便签 6角 |
| 桌子 | 水彩笔 3元、胶水 1元2角 |

## 本地运行

需要 Node.js 20 或更新版本。

```bash
npm install
npm run dev
```

浏览器打开终端里显示的本地地址。常用命令：

```bash
npm run build
npm run preview
```

## 技术

Vite、React、TypeScript、React Three Fiber、Three.js、Zustand、Tailwind CSS。画面用分阶卡通着色，店内镜头是固定斜上方的跟随镜头。

---

# Forest Stationery Shop

[中文](#林间文具店)

A small stationery shop you can walk through in the browser. The first view is the wooden storefront. Click the door to go inside, then move with the arrow keys or the mouse. The camera follows the character by sliding only, so the room never turns.

## How to play

1. Click the wooden door to enter.
2. Walk with the arrow keys or `W` `A` `S` `D`. You can also click the floor and the character will walk there.
3. Click the blue cabinet or the wooden cabinet to see the supplies inside and add them to the cart. The marker and glue on the table can be clicked directly.
4. Open the cart at the top right, check the total, and check out. The door inside the shop leads back outside.

Prices use yuan and jiao, and 1 yuan = 10 jiao. The cart holds up to 8 items, with at most 2 of the same item.

| Place | Supplies |
| --- | --- |
| Blue cabinet | pencil 5 jiao, eraser 8 jiao, ruler 1 yuan, pencil case 2 yuan 5 jiao |
| Wooden cabinet | notebook 1 yuan 5 jiao, folder 1 yuan 2 jiao, sticky notes 6 jiao |
| Table | marker 3 yuan, glue 1 yuan 2 jiao |

## Run locally

Node.js 20 or newer is required.

```bash
npm install
npm run dev
```

Open the local address printed in the terminal. Other commands:

```bash
npm run build
npm run preview
```

## Stack

Vite, React, TypeScript, React Three Fiber, Three.js, Zustand, and Tailwind CSS. The scene uses toon shading. Indoors, the camera stays at a fixed high angle and only follows the character.
