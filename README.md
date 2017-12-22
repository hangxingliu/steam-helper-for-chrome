# Steam Helper For Chrome

![Gabe is so happy!](extension/icons/48.png)

> "Life is too short. Why don't you enjoy discount in Steam?"  
> ---Maybe from Gabe

A Chrome extension for enhancing steam website   
一个 Steam 网站助手 Chrome 插件

## Functions

0. A Steam links pop-up page for Chrome
1. Checking `I agree to the terms ...` automatically.
2. Input minimum price and 5 mount for buying trading card.
3. Show minimum total price in buying dialog.
4. Show game history prices in Steam store production page.
5. More is coming ...  

中文:   
0. 包含一个Steam相关链接的快捷弹出页面
1. 自动勾选 确认购买/出售 框框
2. 自动输入购买Steam卡片最小价格和5张
3. 显示购买的理想最低总价
4. 在Steam商店中显示游戏的历史价格
4. 更多的功能正在开发中 ...

## Install

1. Navigate to `chrome://extensions` in chrome.
2. Check `Developer mode` on, then click `Load Unpacked Extension`.
3. Choose `extension` folder in this project.
4. (Optional) You can delete this folder. (Because All extension codes have been copied into Chrome by Chrome)

中文:   
1. 在Chrome地址框中输入 `chrome://extensions` 回车
2. 选中 `开发者模式` 然后点击 `加载已解压的扩展程序…`
3. 选择 这个项目里面的 `extension` 目录
4. (可选的) 你现在可以删除这个文件夹了 (因为 Chrome 已经把插件的代码都加载到 Chrome 的文件夹下了) 

## Author

LiuYue @hangxingliu

Icons author: [Liam Thynne][IconAuthorWebsite]

## Contributing

1. Installing `node` and `npm` environment.
2. Executing `npm install`
3. Coding files in `extension` (**Ignore files in `extension/dist`. Because they were generated by automatic script**)
4. Executing `npm run build`/`npm run watch` to build scripts
5. Give me [Pull Request][PR]

## License

- All icons in this project under folder `extension/icons`:
	- I downloaded from [easyicon.net][IconFrom]
	- License: *Creative Commons Attribution-ShareAlike 4.0 International License*
	- Author: [Liam Thynne][IconAuthorWebsite]
- Sources are licensed under the [GPL-3.0 License](LICENSE).

[IconFrom]: http://www.easyicon.net/1194568-com_valvesoftware_Steam_icon.html
[IconAuthorWebsite]: https://dribbble.com/liamthynne
[PR]: https://github.com/hangxingliu/steam-helper-for-chrome/pulls
