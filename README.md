# Lucky 的日常

Lucky 的猫咪贴纸相册与日记。收录五段视频和四张照片，支持立体封面、纸页翻阅、三个章节、静音悬停预览和大图查看。

这是一个可直接部署到 GitHub Pages 的静态网站，不需要安装依赖或构建。

## 更新相册

- 编辑 `content.js` 修改记录、标题、日期、照片与视频路径。
- 照片和视频放在 `assets/`。视频为 H.264/AAC MP4，封面直接取自视频。
- `app.js` 负责日记与媒体查看，`album.js` 负责相册与动效。
- `styles.css` 和 `album.css` 负责样式与手机适配。

日期表示收录日期。所有照片和视频由猫咪主人提供。

## 本地浏览

在此目录运行 `python -m http.server 4173`，然后打开 `http://localhost:4173/`。

## GitHub Pages

在仓库 Settings → Pages 中选择 Deploy from a branch，选择 `main` 和 `/(root)`。`.nojekyll` 保证按静态文件直接发布。

所有资源使用相对路径，支持仓库子路径部署。默认相册在 `#/`，日记列表在 `#/notes`，单篇记录在 `#/note/...`。

## 效果

支持跳过封面、键盘与触摸翻页，遵循系统的“减少动态效果”设置。视频详情由用户手动播放，保留原声；桌面鼠标悬停的预览为静音，省流量模式下不启用。

页面效果参考 https://squadbook.com/cats/ ，使用独立实现与 Lucky 的原素材。
