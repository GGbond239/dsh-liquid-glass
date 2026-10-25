# dsh-liquid-glass

透明 + 折射的「液态玻璃」聊天框与工具栏，并支持用 Wallpaper Engine 的 `.mpkg` 文件当动态壁纸。

一个纯前端（client-only）的 DSH 插件：没有构建步骤，没有外部资源，`lib/client.js` 直接由 DSH 的模块加载器执行。

> **兼容性**：针对 DeepSeek Harness（DSH）桌面版当前 UIDOM 开发。插件依赖 DSH 的 DOM 钩子（`data-composer-card`、CSS-module 后缀约定等），DSH 大版本升级后可能失效，可用设置页「附加玻璃选择器」修复或提交 Issue。

---

## 功能

**液态玻璃**
- 输入框卡片（`[data-composer-card]`）、会话头部（`header`）、浮动停靠区（`[data-queue-dock]`、`[data-conversation-composer-overlay]`）、可选侧边栏、**我发出的消息气泡**、**回复里的代码块** → 真透明 + `backdrop-filter` 模糊/饱和/亮度 + 内发光描边 + 高光渐变。
  - 气泡来自 ui-chat 的 `MessageItem.module.css`：`<hash>_userRow > <hash>_userStack > <hash>_bubble`。hash 每次构建都会变，后缀不会——和插件早已依赖的 `_centerCol` / `_sidebarCol` 是同一套约定，所以选择器只匹配 `_userRow` / `_userStack` / `_bubble` 后缀，绝不写死 hash。
  - 气泡是个没有 `position` 的静态 div，`:after` 高光会逃到最近的定位祖先上（也就是整片正文），所以插件额外给它加一条 `position:relative` 把高光钉在气泡自己身上。
- **真实折射**：一个 SVG `feTurbulence → feGaussianBlur → feDisplacementMap` 滤镜，通过 `backdrop-filter: url(#dshlg-refract)` 折射背景。这是渐进增强——先写普通的 `blur()` 声明，只有浏览器支持 `url(#…)` 形式的 `backdrop-filter` 时才追加第二条声明，因此不支持时只会失去折射，不会连模糊一起丢。
- **边缘折射（始终可用）**：不依赖 `url()` 滤镜的兼容折射——玻璃四边的内高光/暗边 + 内侧光晕 + 顶面镜面反光，`refractMode: "edge"` 可强制启用；设置页「诊断」会写明当前实际生效的是 SVG 还是边缘模式。
- 输入区原本会盖住背景的 36px 不透明渐变被换成可调的半透明遮罩；正文区另有一层可调「阅读遮罩」保证长文可读。
- **回复里的代码块不再是黑框**：代码块根节点带一个稳定的全局类 `md-code-block`（`clsx(css.block, "md-code-block", …)`，`MarkdownText` 之外唯一稳定的是 `md-table-wide`），所以它和其他表面一样被玻璃化；块内本来各自不透明的那三层填充——sticky 语言条外壳（`--dsw-alias-bg-base`）、语言条本身、`<pre>`（含 `.shiki` 的 `!important`）——在玻璃开启时全部置为透明，玻璃面才透得出来。三条规则用 `:where(pre)` 把特异度压到 (0,2,1)，仍然压得住自带的 `.block :where(pre.shiki){background:…!important}`。
- **行内代码片、JSON 块、联网引用卡片**（也就是回复里被框住的「链接」类内容）的底色分别来自 `--dsw-alias-markdown-code-block(-banner)` / `-inline-code` / `-citation`，而它们都是带 hash 的 CSS-module 类、没有稳定钩子——所以插件直接把别名重新指向半透明色，按主题分别覆盖（浅色 = bluish-50 / bluish-50 / neutral-50 / bluish-100，深色 = bluish-850 / bluish-900 / neutral-800 / bluish-800）。这里有个坑：把别名指向 `var(--同一个别名)` 会形成自定义属性循环、在计算值阶段直接失效，所以取值一律从**静态** token 出发并带十六进制兜底。只动别名、不碰 `body` 自身的背景，关闭玻璃时依旧零残留。
- 全部开关与参数都在设置里可调，关闭玻璃时是**纯粹的还原**：不写 `body` 背景，不留下任何可见残留。
- 顺带把 markdown 图片脚下的那块 `--dsw-alias-bg-base` 占位底色也置为透明——透明 PNG 的每个透明像素都会漏出那块底色，又是同一个「黑色矩形」的来源。

**动态壁纸**
- 内置动态网格渐变（极光 / 晨雾 / 深海 / 单色 + 色相旋转），在没用壁纸时使用。
- 上传 `.mpkg` / `.pkg` / `.zip`（Wallpaper Engine 包）或直接上传 `mp4 / webm / gif / 图片 / html`。
- 自己实现的 ZIP 解析（中央目录 + ZIP64 + `deflate-raw` 解压），会读 `project.json` 判断壁纸类型：
  - `video` → 用 `file` 指定的视频；
  - `web` → 用 `file` 指定的网页（沙箱 iframe）；
  - `scene` → 浏览器无法渲染 3D 场景，自动改用包内预览图（`preview` / `thumbnail` / `tumb*`）并给出提示；
  - 没有 `project.json` 时按 视频 → 网页 → 图片 的顺序猜。
- 壁纸字节存 IndexedDB，只有偏好设置存 localStorage，所以几百 MB 的视频也不会撑爆 localStorage。
- **壁纸真的看得见**：`#dshlg-backdrop` 是 `z-index:-1` 的固定层，会盖在画布背景之上、但被任何不透明容器挡住——DSH 的 shell 框架（`.BynINW_frame`）正是用 `--dsw-alias-bg-base` 铺满视口的。所以玻璃开启时，插件会把 `body`、`[data-dshlg-canvas]` 以及从聊天表面向上每一层「确实有底色」的祖先打上 `data-dshlg-clear`（`background-color:transparent !important`），关掉玻璃时这些标记全部撤掉，保证关闭后是纯净还原。判断用的是运行时 `getComputedStyle`（含透明度和背景图），因此不依赖某个具体类名。
- **壁纸铺满整屏**：`#dshlg-backdrop` 里先放一个宿主 div，真正的 `<img>` / `<video>` / `<iframe>` 再被塞进这个宿主里——两者都带 `.dshlg-wp-media` 类。所以尺寸规则必须指向**内层元素**（`#dshlg-backdrop>.dshlg-wp-media>*`）。如果只命中宿主，`<video>` 会退回 300×150 的默认尺寸、4K 图片会按原始像素铺开，而层的 `overflow:hidden` 就只让你看到左上角一小块——这正是「壁纸只能显示局部」的原因。想看到整张图（不被裁切）把「适配方式」改成**完整显示**（`object-fit:contain`），默认是**铺满**（`cover`），另有**拉伸**（`fill`）。

  这里有个必须注意的细节：我们的规则是 `!important`，所以一个被清除过的元素**下一次测量时本身就显示为透明**。如果每次都重新测量，标记会被撤销、不透明底色回来、壁纸再出现——表现为「显示几秒、消失几秒」的周期性闪烁。因此已经带标记的元素会**粘住**（不再重新测量），只在关闭玻璃时统一撤销。

**鼠标聚光灯**
- 一个跟着光标走的光斑，由同一个指针位置同时驱动两层：
  - `#dshlg-backdrop > .dshlg-wp-spot`：**提亮的是壁纸本身，不是叠一层白色**。它在指针处放一个 2r×2r 的圆盘，用 `backdrop-filter: brightness() saturate() contrast()` 真正提亮圆盘范围内的**背景像素**，再用 `mask-image: radial-gradient(circle closest-side …)` 让效果从圆心到边缘渐隐；光斑里是同一张壁纸更亮、更通透的版本——颜色与细节都还在，同时正好把「壁纸暗化」那层遮罩顶回来。旧版叠的是白色径向渐变加 `mix-blend-mode: screen`，白色会抬高黑位并冲淡颜色，看起来就是「泛白」，已弃用。
  - 圆盘用 `border-radius: 50%` 裁成与 mask 渐隐边界**完全重合**的圆：即使某个引擎忽略了 `mask-image`，最多只亮这个圆盘，绝不会亮满整个视口；而连 `mask-image` 都不支持的引擎（`detectCaps` 里只检测一次）会自动退回 `soft-light` 柔和染色，只提亮中间调而不会过曝。圆盘只用 `transform` 跟随指针（`translate3d(var(--dsh-lg-mx), var(--dsh-lg-my), 0) translate(-50%, -50%)`），所以指针移动路径完全不触发布局。
  - 每个玻璃表面的 `:after` 里再叠一道镜面高光，坐标按元素自身矩形换算，所以玻璃本身也像透镜一样跟着亮（这道高光的白色比早期版本更淡，避免玻璃整体发白）。
- 两处的原点都默认在一个屏幕外的像素（`--dsh-lg-mx/-my` 与 `--dsh-lg-sx/-sy`），没动过鼠标时什么都不渲染；鼠标移出窗口或窗口失焦会自动"停灯"。
- `MutationObserver` 只监听 `childList`，而这些自定义属性是 inline style 写入，所以指针移动**不可能**反过来触发刷新循环。
- 参数：光斑大小 120–900px、光斑强度 0–100%，默认 420px / 45%。强度是**真实曝光**而不是白色浓度：`brightness = 1 + 强度×0.012`、`saturate = 1 + 强度×0.0055`、`contrast = 1 + 强度×0.0016`，强度 0 时三个滤镜都是 1，也就是光斑完全不可见（而不是变成一层白）。

**工具栏**
- `shell.overlay` 插槽里的一枚 ✦ 玻璃浮岛，点开即可切换玻璃/壁纸、调模糊与折射、直接上传文件。
- 快捷键：`Ctrl+Alt+G` 切换玻璃，`Ctrl+Alt+B` 显示/隐藏工具栏。
- 逃生舱：地址后加 `?dshlg=off` 可临时关闭（不改动任何设置）。

**设置页**
- 「设置 → 液态玻璃」一页：外观参数、内置背景、壁纸库（预览 / 启用 / 删除）、高级选择器、诊断（能力检测 + 当前已玻璃化的表面 + 当前壁纸 + **背景层状态**：预设 / 壁纸类型 / 已清除的不透明容器数量与类名）。诊断里的能力芯片包括 `backdrop-filter`、`url(#) refraction`、`color-mix`、`mask-image`（决定聚光灯用「提亮像素」还是「柔和染色」）、`DecompressionStream`、`IndexedDB`、`mp4`、`webm`。

---

## 安装 / 更新

1. 关闭 DeepSeek Harness
2. 将 `dsh-liquid-glass` 文件夹放入 `%USERPROFILE%\.dsh\profiles\desktop\node_modules\`
3. 编辑 `%USERPROFILE%\.dsh\profiles\desktop\package.json`：
   - `dependencies` 增加 `"dsh-liquid-glass": "0.5.2"`
   - `dsh.profile.bundles` 数组增加 `"dsh-liquid-glass"`
4. 重启 DeepSeek Harness 生效

若希望改动即时生效，可将安装目录做成目录联接（junction），并在 profile 的 `cordis.patch.yml` 中加入**插入式**补丁（没有 `insert` 的条目只会覆盖已存在的 `id`，找不到会被静默跳过）：

```yaml
- insert:
    - id: dsh-liquid-glass
      name: 'dsh-liquid-glass'
```

---

## 测试

`lib/client.js` 中的 ZIP / mpkg 解析器为自包含实现（`/* #region mpkg-core */ … /* #endregion */` 区间），可在 Node 中离线测试；完整测试脚本（mpkg 解析 35 项断言、浏览器半边端到端 159 项断言）暂未随仓库分发，后续版本补充。

---

## 参数（localStorage `dsh-liquid-glass:prefs.v3`）

| 键 | 默认 | 说明 |
| --- | --- | --- |
| `glassEnabled` | `true` | 液态玻璃总开关 |
| `glassSidebar` | `true` | 侧边栏也玻璃化 |
| `glassBubbles` | `true` | 我发出的消息气泡也玻璃化 |
| `spotlight` / `spotSize` / `spotStrength` | `true` / `420` / `45` | 鼠标聚光灯：开关 / 光斑 px / 强度 %（强度驱动 brightness/saturate/contrast 的真实曝光，0 = 完全不可见） |
| `toolbarEnabled` / `toolbarOpen` | `true` / `false` | 悬浮工具栏 |
| `refraction` | `true` | 折射总开关 |
| `refractMode` | `"auto"` | `auto`（支持时用 SVG 位移折射，否则用边缘折射）/ `edge`（始终用边缘折射） |
| `blur` / `refract` | `22` / `26` | 模糊 px / 折射强度 |
| `saturate` / `brightness` | `180` / `104` | 玻璃滤镜 |
| `tint` | `42` | 玻璃不透明度 % |
| `scrim` / `seat` | `52` / `76` | 正文 / 输入区遮罩 % |
| `preset` / `hue` | `aurora` / `0` | 内置背景 |
| `wallpaperEnabled` / `activeWallpaperId` | `true` / `""` | 壁纸 |
| `wpDim` / `wpBlur` / `wpBright` / `wpFit` | `30` / `0` / `100` / `cover` | 壁纸外观 |
| `extraSelectors` | `""` | 额外的玻璃选择器（逗号分隔） |

壁纸数据在 IndexedDB 数据库 `dsh-liquid-glass.v3`（`meta` + `media` 两个 store）。

---

## 已知限制

- Wallpaper Engine 的 **scene（3D）** 和 **application** 类型无法在浏览器里运行，插件会退回到包内预览图。
- 网页类型壁纸在 iframe 里可能加载不全外部资源（沙箱只允许脚本，不允许同源访问）。
- `.mkv` / `.mov` / `.avi` 在 Chromium 里通常解不出来，会提示改用 `mp4` / `webm`。
- 玻璃化依赖 DSH 现有的 DOM 钩子（`data-composer-card`、`header:has(> [data-conversation-header-leading])` 等）。这些是当前版本 UIDOM 的稳定特征，但 DSH 大版本升级后可能变化——此时用设置页的「附加玻璃选择器」即可补上，或改 `lib/client.js` 里的 `SURFACES` 表。