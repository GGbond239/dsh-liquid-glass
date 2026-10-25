/**
 * dsh-liquid-glass — browser half (v0.3.0).
 *
 * Loaded by the shell's module loader (`window.__ModuleLoader__.load({id, factory})`).
 * Everything is self-contained: no build step, no external asset, and only the
 * platform seed words `react` / `react/jsx-runtime` are required.
 *
 * What it does
 *   1. injects a stylesheet that turns the composer card, the conversation
 *      header, floating docks and (optionally) the sidebar into transparent,
 *      backdrop-filtered "liquid glass" surfaces (blur + saturate + an SVG
 *      displacement filter for real refraction);
 *   2. mounts a fixed backdrop layer behind the whole app that renders either a
 *      built-in animated mesh gradient or an uploaded wallpaper;
 *   3. registers a floating glass toolbar into the `shell.overlay` slot;
 *   4. registers a full settings page (id `liquid-glass`) into `settings.section`
 *      with the MPKG / Wallpaper Engine uploader, sliders and diagnostics.
 *
 * Storage: preferences in localStorage ("dsh-liquid-glass:prefs.v3"), wallpaper
 * bytes in IndexedDB ("dsh-liquid-glass.v3", stores `meta` + `media`).
 *
 * Escape hatches: the toolbar power button, Ctrl+Alt+G, and ?dshlg=off.
 */
window.__ModuleLoader__.load({
	id: "dsh-liquid-glass",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;

		const React = require("react");
		const h = React.createElement;

		const PKG = "dsh-liquid-glass";
		const NS = "ui.liquidGlass";
		const LS_PREFS = "dsh-liquid-glass:prefs.v3";
		const DB_NAME = "dsh-liquid-glass.v3";
		const DB_VERSION = 1;
		const FILTER_ID = "dshlg-refract";
		const BACKDROP_ID = "dshlg-backdrop";
		const SVG_ID = "dshlg-svg";

		/* ------------------------------------------------------------------ *
		 * dictionaries
		 * ------------------------------------------------------------------ */
		const DICT = {
			zh: {
				nav: "液态玻璃",
				toolbar: "液态玻璃工具栏",
				title: "液态玻璃与动态壁纸",
				intro: "让聊天框、工具栏与背景呈现透明折射的「液态玻璃」质感，并可使用 Wallpaper Engine 的 .mpkg 文件作为动态壁纸。",
				glass: "液态玻璃",
				glassOn: "启用液态玻璃",
				glassHint: "关闭后立即恢复原生外观，所有设置会保留",
				sidebar: "侧边栏也使用玻璃",
				toolbarShow: "显示悬浮工具栏",
				toolbarShowHint: "右下角的 ✦ 玻璃工具栏，随时切换与调参",
				refraction: "折射（实验性）",
				refractionHint: "弯折背景的玻璃折射效果；关闭后只剩模糊",
				refractMode: "折射方式",
				refractModeHint: "SVG 位移滤镜真实弯折背景；若引擎不支持会自动降级为边缘折射",
				refractAuto: "自动",
				refractEdge: "边缘（兼容）",
				refractSvg: "SVG 位移滤镜",
				look: "折射与模糊",
				blur: "模糊",
				refract: "折射强度",
				saturate: "饱和度",
				brightness: "亮度",
				tint: "玻璃不透明度",
				scrim: "正文遮罩",
				scrimHint: "越高正文越清晰，越低越通透",
				seat: "输入区遮罩",
				background: "内置背景",
				backgroundHint: "未使用壁纸时的动态网格渐变",
				preset: "预设",
				hue: "色相",
				presetAurora: "极光",
				presetDawn: "晨雾",
				presetOcean: "深海",
				presetMono: "单色",
				wallpaper: "动态壁纸",
				wallpaperOn: "使用动态壁纸",
				upload: "上传壁纸",
				uploadHint: "支持 Wallpaper Engine 的 .mpkg / .pkg，以及直接上传 mp4、webm、gif、图片或网页文件",
				drop: "把 .mpkg / 视频 / 图片拖到这里",
				pick: "选择文件",
				empty: "还没有壁纸。上传一个 .mpkg，或直接拖入视频/图片。",
				use: "启用",
				inUse: "使用中",
				del: "删除",
				size: "大小",
				kind: "类型",
				dim: "壁纸暗化",
				wpBlur: "壁纸模糊",
				wpBright: "壁纸亮度",
				fit: "适配方式",
				fitCover: "铺满",
				fitContain: "完整显示",
				fitFill: "拉伸",
				advanced: "高级",
				extras: "附加玻璃选择器",
				extrasHint: "用逗号分隔的 CSS 选择器，匹配到的元素也会变成玻璃（留空即忽略）",
				bubbles: "我发出的气泡也用玻璃",
				bubblesHint: "把右侧已发送的消息气泡一起玻璃化",
				spotlight: "鼠标聚光灯",
				spotlightHint: "跟随鼠标的光斑：把背景真正提亮、加饱和并提高对比（只提亮像素，不叠白），同时照亮玻璃表面（需开启液态玻璃）",
				spotlightOn: "启用聚光灯",
				spotSize: "光斑大小",
				spotStrength: "光斑强度",
				diagnostics: "诊断",
				recheck: "重新检测",
				reset: "恢复默认设置",
				clear: "删除全部壁纸",
				shortcut: "快捷键 Ctrl+Alt+G 切换玻璃，Ctrl+Alt+B 显示/隐藏工具栏，地址后加 ?dshlg=off 可临时关闭。",
				support: "支持检测",
				backdrop: "背景层",
				backdropNone: "未挂载",
				backdropCleared: "已清除的不透明容器",
				backdropHint: "未清除任何不透明容器，壁纸可能被遮挡",
				surfaces: "已玻璃化表面",
				active: "当前壁纸",
				none: "无",
				sceneNote: "该 mpkg 是 Wallpaper Engine 的 3D 场景（scene）类型，浏览器无法渲染，已改用包内预览图。",
				webNote: "网页壁纸在浏览器中的资源加载可能不完整。",
				err: "出错",
				ok: "完成",
				reading: "正在解析…",
				hideBar: "隐藏工具栏",
				settingsPath: "更多设置：设置 → 液态玻璃",
				open: "高级设置",
				close: "收起",
			},
			en: {
				nav: "Liquid glass",
				toolbar: "Liquid glass toolbar",
				title: "Liquid glass & dynamic wallpaper",
				intro: "Give the chat box, toolbars and background a transparent, refractive liquid-glass look, and use Wallpaper Engine .mpkg files as a live wallpaper.",
				glass: "Liquid glass",
				glassOn: "Enable liquid glass",
				glassHint: "Turning this off restores the native look; all settings are kept",
				sidebar: "Glass sidebar",
				toolbarShow: "Show floating toolbar",
				toolbarShowHint: "The ✦ toolbar in the bottom-right corner",
				refraction: "Refraction (experimental)",
				refractionHint: "Bends the backdrop through the glass; off leaves a plain blur",
				refractMode: "Refraction mode",
				refractModeHint: "The SVG displacement filter truly bends the backdrop; unsupported engines fall back to edge refraction",
				refractAuto: "Auto",
				refractEdge: "Edge (compatible)",
				refractSvg: "SVG displacement",
				look: "Refraction & blur",
				blur: "Blur",
				refract: "Refraction",
				saturate: "Saturation",
				brightness: "Brightness",
				tint: "Glass opacity",
				scrim: "Reading scrim",
				scrimHint: "Higher keeps text crisper, lower is more transparent",
				seat: "Composer scrim",
				background: "Built-in backdrop",
				backgroundHint: "Animated mesh gradient used when no wallpaper is active",
				preset: "Preset",
				hue: "Hue",
				presetAurora: "Aurora",
				presetDawn: "Dawn",
				presetOcean: "Ocean",
				presetMono: "Mono",
				wallpaper: "Dynamic wallpaper",
				wallpaperOn: "Use dynamic wallpaper",
				upload: "Upload wallpaper",
				uploadHint: "Wallpaper Engine .mpkg / .pkg, or mp4, webm, gif, images and web pages",
				drop: "Drop an .mpkg / video / image here",
				pick: "Choose file",
				empty: "No wallpaper yet. Upload an .mpkg or drop a video/image.",
				use: "Use",
				inUse: "Active",
				del: "Delete",
				size: "Size",
				kind: "Type",
				dim: "Wallpaper dim",
				wpBlur: "Wallpaper blur",
				wpBright: "Wallpaper brightness",
				fit: "Fit",
				fitCover: "Cover",
				fitContain: "Contain",
				fitFill: "Stretch",
				advanced: "Advanced",
				extras: "Extra glass selectors",
				extrasHint: "Comma separated CSS selectors whose matches also become glass",
				bubbles: "Sent bubbles in glass",
				bubblesHint: "Glassify the sent message bubbles on the right as well",
				spotlight: "Mouse spotlight",
				spotlightHint: "A light that follows the cursor: it lifts the backdrop's real brightness, saturation and contrast — brightening the pixels instead of laying white paint over them — and lights the glass surface too (needs glass on)",
				spotlightOn: "Enable spotlight",
				spotSize: "Spot size",
				spotStrength: "Spot strength",
				diagnostics: "Diagnostics",
				recheck: "Re-check",
				reset: "Reset settings",
				clear: "Delete all wallpapers",
				shortcut: "Ctrl+Alt+G toggles glass, Ctrl+Alt+B toggles the toolbar, ?dshlg=off disables it for one load.",
				support: "Feature support",
				backdrop: "Backdrop layer",
				backdropNone: "Not mounted",
				backdropCleared: "Opaque containers cleared",
				backdropHint: "No opaque container was cleared — the wallpaper may stay hidden",
				surfaces: "Glassified surfaces",
				active: "Active wallpaper",
				none: "None",
				sceneNote: "This mpkg is a Wallpaper Engine 3D scene; browsers cannot render it, so the bundled preview image is used.",
				webNote: "Web wallpapers may not load all of their assets in the browser.",
				err: "Error",
				ok: "Done",
				reading: "Parsing…",
				hideBar: "Hide toolbar",
				settingsPath: "More settings: Settings → Liquid glass",
				open: "Advanced settings",
				close: "Collapse",
			},
		};
		let pluginCtx = null;
		function langOf() {
			try {
				const l = pluginCtx && pluginCtx.locale && pluginCtx.locale.getLocale ? pluginCtx.locale.getLocale() : "";
				if (typeof l === "string" && l.toLowerCase().indexOf("en") === 0) return "en";
			} catch (error) {}
			return "zh";
		}
		function tr(key) {
			const d = DICT[langOf()] || DICT.zh;
			return d[key] !== undefined ? d[key] : key;
		}
		function mkT(props) {
			const bound = props && typeof props.t === "function" ? props.t : null;
			return function (key) {
				if (bound) {
					try {
						const v = bound(key);
						if (typeof v === "string" && v !== key) return v;
					} catch (error) {}
				}
				return tr(key);
			};
		}

		/* ------------------------------------------------------------------ *
		 * stylesheet
		 * ------------------------------------------------------------------ */
		/* NOT named `CSS`: that identifier is the CSSOM global, and shadowing it here
		   silently turned every CSS.supports() capability probe (including the
		   url(#filter) refraction probe) into `false`. */
		const CSS_TEXT = [
			/* ---- variables: plain numbers live on html, theme-derived ones on body ---- */
			"html.dsh-lg-on{--dsh-lg-blur:22px;--dsh-lg-sat:180%;--dsh-lg-bright:1.04;--dsh-lg-tint:42%;--dsh-lg-scrim-a:52%;--dsh-lg-seat-a:76%;--dsh-lg-hue:0deg;--dsh-lg-wp-dim:30%;--dsh-lg-wp-blur:0px;--dsh-lg-wp-bright:1}",
			"html.dsh-lg-on body{--dsh-lg-base:#ffffff;--dsh-lg-glass:color-mix(in srgb,var(--dsh-lg-base) var(--dsh-lg-tint),transparent);--dsh-lg-glass-strong:color-mix(in srgb,var(--dsh-lg-base) calc(var(--dsh-lg-tint) + 18%),transparent);--dsh-lg-edge:color-mix(in srgb,#ffffff 52%,transparent);--dsh-lg-edge-soft:color-mix(in srgb,#ffffff 18%,transparent);--dsh-lg-scrim:color-mix(in srgb,var(--dsw-alias-bg-base) var(--dsh-lg-scrim-a),transparent);--dsh-lg-seat-scrim:color-mix(in srgb,var(--dsw-alias-bg-base) var(--dsh-lg-seat-a),transparent);--dsh-lg-shadow:0 18px 44px rgba(15,22,45,.22),0 2px 10px rgba(15,22,45,.14);--dsh-lg-edge-bottom:color-mix(in srgb,#ffffff 34%,transparent);--dsh-lg-edge-glow:color-mix(in srgb,#ffffff 26%,transparent)}",
			"html.dsh-lg-on body[data-ds-dark-theme]{--dsh-lg-base:#78808f;--dsh-lg-edge:color-mix(in srgb,#ffffff 34%,transparent);--dsh-lg-edge-soft:color-mix(in srgb,#ffffff 10%,transparent);--dsh-lg-shadow:0 20px 52px rgba(0,0,0,.46),0 2px 10px rgba(0,0,0,.3);--dsh-lg-edge-bottom:color-mix(in srgb,#ffffff 18%,transparent);--dsh-lg-edge-glow:color-mix(in srgb,#ffffff 14%,transparent)}",

			/* ---- markdown blocks: no more opaque black cards ----
			   Code blocks, JSON bodies, inline code chips and the web/citation card all
			   paint themselves with these four aliases and live in hashed CSS-module
			   classes with no stable hook, so the aliases are re-pointed at a
			   translucent tint instead of chasing class names. The values mirror
			   theme.client.js exactly (light: bluish-50 / bluish-50 / neutral-50 /
			   bluish-100, dark: bluish-850 / bluish-900 / neutral-800 / bluish-800) and
			   carry a hex fallback in case a token is ever renamed. Only aliases are
			   touched — never body's own background — so glass-off stays a no-op. */
			"html.dsh-lg-on body{--dsw-alias-markdown-code-block:color-mix(in srgb,var(--dsw-static-neutral-bluish-50,#f2f4f7) 32%,transparent);--dsw-alias-markdown-code-block-banner:color-mix(in srgb,var(--dsw-static-neutral-bluish-50,#f2f4f7) 20%,transparent);--dsw-alias-markdown-inline-code:color-mix(in srgb,var(--dsw-static-neutral-50,#f2f4f7) 42%,transparent);--dsw-alias-markdown-citation:color-mix(in srgb,var(--dsw-static-neutral-bluish-100,#eceef2) 38%,transparent)}",
			"html.dsh-lg-on body[data-ds-dark-theme]{--dsw-alias-markdown-code-block:color-mix(in srgb,var(--dsw-static-neutral-bluish-900,#1a1f29) 34%,transparent);--dsw-alias-markdown-code-block-banner:color-mix(in srgb,var(--dsw-static-neutral-bluish-850,#232936) 22%,transparent);--dsw-alias-markdown-inline-code:color-mix(in srgb,var(--dsw-static-neutral-800,#2b3140) 42%,transparent);--dsw-alias-markdown-citation:color-mix(in srgb,var(--dsw-static-neutral-bluish-800,#2b3140) 38%,transparent)}",

			/* ---- transparent canvas: only the shell chrome, never the theme tokens ---- */
			"html.dsh-lg-on #root,html.dsh-lg-on #root>div,html.dsh-lg-on div:has(> [data-shell-overlay]),html.dsh-lg-on [data-dshlg-center],html.dsh-lg-on [class*='_centerCol']{background:transparent !important}",

			/* ---- fixed backdrop layer (z-index:-1 paints above the canvas, below the app) ---- */
			"#dshlg-backdrop{position:fixed;inset:0;z-index:-1;overflow:hidden;pointer-events:none;background:#05070d}",
			"#dshlg-backdrop>*{position:absolute;inset:0;width:100%;height:100%;border:0;margin:0}",
			/* The host div and the media element inside it BOTH carry .dshlg-wp-media —
			   the layer holds the host, the <img>/<video>/<iframe> is appended into that
			   host — so these rules have to target the INNER element. Left to itself an
			   <img>/<video> lays out at its intrinsic size (a 4K wallpaper is then four
			   screens wide) or at the 300x150 video default, and the layer's
			   overflow:hidden shows nothing but the top-left corner: the wallpaper
			   "only displays part of itself". */
			"#dshlg-backdrop>.dshlg-wp-media>*{position:absolute;inset:0;width:100%;height:100%;border:0;margin:0;object-fit:cover;object-position:center;filter:blur(var(--dsh-lg-wp-blur)) brightness(var(--dsh-lg-wp-bright))}",
			"#dshlg-backdrop[data-fit='contain']>.dshlg-wp-media>*{object-fit:contain}",
			"#dshlg-backdrop[data-fit='fill']>.dshlg-wp-media>*{object-fit:fill}",
			"#dshlg-backdrop>.dshlg-wp-scrim{background:color-mix(in srgb,#05070d var(--dsh-lg-wp-dim),transparent)}",
			"#dshlg-backdrop>.dshlg-wp-grad{filter:hue-rotate(var(--dsh-lg-hue));animation:dshlg-drift 34s ease-in-out infinite alternate}",
			"#dshlg-backdrop[data-preset='aurora']>.dshlg-wp-grad{background-image:radial-gradient(1100px 760px at 14% 6%,rgba(124,92,255,.62),transparent 62%),radial-gradient(980px 700px at 86% 10%,rgba(33,212,253,.4),transparent 64%),radial-gradient(1000px 860px at 74% 94%,rgba(255,93,177,.48),transparent 62%),radial-gradient(820px 820px at 16% 90%,rgba(42,245,152,.34),transparent 62%),linear-gradient(158deg,#0b1020,#161d31 46%,#0a1018)}",
			"#dshlg-backdrop[data-preset='dawn']>.dshlg-wp-grad{background-image:radial-gradient(1100px 760px at 12% 8%,rgba(255,196,178,.72),transparent 62%),radial-gradient(980px 700px at 84% 12%,rgba(186,214,255,.68),transparent 64%),radial-gradient(1000px 860px at 70% 92%,rgba(255,227,178,.62),transparent 62%),linear-gradient(162deg,#fdf7f2,#eef3fb 48%,#f7f2ff)}",
			"#dshlg-backdrop[data-preset='ocean']>.dshlg-wp-grad{background-image:radial-gradient(1100px 780px at 18% 10%,rgba(0,196,204,.5),transparent 62%),radial-gradient(980px 720px at 82% 16%,rgba(0,88,196,.48),transparent 64%),radial-gradient(1000px 860px at 64% 94%,rgba(0,58,132,.62),transparent 62%),linear-gradient(165deg,#031a2b,#062a45 52%,#01131f)}",
			"#dshlg-backdrop[data-preset='mono']>.dshlg-wp-grad{background-image:radial-gradient(1100px 780px at 20% 12%,var(--dsh-specific-sidebar-fill),transparent 64%),linear-gradient(160deg,var(--dsw-alias-bg-base),color-mix(in srgb,var(--dsw-alias-bg-base) 70%,#7c5cff))}",
			"@keyframes dshlg-drift{0%{transform:scale(1.12) translate3d(-1.4%,-1%,0)}100%{transform:scale(1.2) translate3d(1.4%,1%,0)}}",
			"@media (prefers-reduced-motion:reduce){#dshlg-backdrop>.dshlg-wp-grad{animation:none}}",

			/* ---- containers that would bury the backdrop ----
			   The shell frame paints an opaque --dsw-alias-bg-base over the whole
			   viewport (BynINW_frame, the element stampChrome marks as
			   [data-dshlg-canvas]), and #root/column wrappers may paint their own
			   fills. A layer at z-index:-1 can never show through those, so while the
			   glass is on every container on the path between the backdrop and the chat
			   surfaces is stamped [data-dshlg-clear] and made transparent. The mark is
			   released again when the glass goes off, leaving the app untouched. */
			"html.dsh-lg-on [data-dshlg-clear]{background-color:transparent !important;background-image:none !important}",

			/* ---- glass surfaces ---- */
			"html.dsh-lg-on [data-dshlg-glass]{background:var(--dsh-lg-glass) !important;backdrop-filter:blur(var(--dsh-lg-blur)) saturate(var(--dsh-lg-sat)) brightness(var(--dsh-lg-bright));-webkit-backdrop-filter:blur(var(--dsh-lg-blur)) saturate(var(--dsh-lg-sat)) brightness(var(--dsh-lg-bright));box-shadow:inset 0 1px 0 0 var(--dsh-lg-edge),inset 0 -1px 0 0 var(--dsh-lg-edge-bottom),inset 0 0 0 1px var(--dsh-lg-edge-soft),inset 0 0 26px -10px var(--dsh-lg-edge-glow),inset 0 -18px 30px -24px rgba(0,0,0,.4),var(--dsh-lg-shadow);transition:background-color .18s ease,box-shadow .18s ease}",
			"html.dsh-lg-on [data-dshlg-glass][data-dshlg-refract]{backdrop-filter:blur(var(--dsh-lg-blur)) saturate(var(--dsh-lg-sat)) url(#dshlg-refract) brightness(var(--dsh-lg-bright));-webkit-backdrop-filter:blur(var(--dsh-lg-blur)) saturate(var(--dsh-lg-sat)) url(#dshlg-refract) brightness(var(--dsh-lg-bright))}",
			"html.dsh-lg-on [data-dshlg-glass]:after{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:radial-gradient(circle var(--dsh-lg-sheen-r,260px) at var(--dsh-lg-sx,-99999px) var(--dsh-lg-sy,-99999px),color-mix(in srgb,#fff var(--dsh-lg-sheen-a,0%),transparent) 0%,transparent 70%),linear-gradient(140deg,color-mix(in srgb,var(--dsh-lg-edge) 30%,transparent) 0%,transparent 44%),linear-gradient(0deg,color-mix(in srgb,var(--dsh-lg-edge) 20%,transparent) 0%,transparent 16%);mix-blend-mode:screen;opacity:.9}",
			"html.dsh-lg-on [data-dshlg-glass][data-dshlg-flat]:after{content:none}",
			/* The sent bubble is a static div without position, so the :after gloss would
			   otherwise escape to the nearest positioned ancestor and cover the whole
			   transcript. Anchor it to the bubble; the sheen needs no overflow:hidden
			   because :after uses inset:0 with border-radius:inherit. */
			"html.dsh-lg-on [data-dshlg-glass='user-bubble']{position:relative}",
			/* A code block is three stacked opaque boxes: the sticky banner wrap
			   (--dsw-alias-bg-base), the banner itself and the <pre>. Once the root is a
			   glass surface they all go transparent so the frosted panel shows through.
			   :where(pre) keeps specificity at (0,2,1), which still beats the bundled
			   `.block :where(pre.shiki){background:…!important}` rule. */
			"html.dsh-lg-on [data-dshlg-glass='code-block']>:first-child{background-color:transparent !important;background-image:none !important}",
			"html.dsh-lg-on [data-dshlg-glass='code-block'] [data-code-block-banner]{background-color:transparent !important;background-image:none !important}",
			"html.dsh-lg-on [data-dshlg-glass='code-block'] :where(pre){background-color:transparent !important;background-image:none !important}",
			/* A markdown <img> sits on `--dsw-alias-bg-base` (MarkdownText's `.image`),
			   which shows through every transparent pixel of a transparent PNG and
			   behind the alt text while the file loads — i.e. an opaque rectangle in
			   the middle of a reply. `.markdown` is a stable global class (the bundled
			   sheet is full of `.markdown :not(pre) > code` style selectors). */
			"html.dsh-lg-on .markdown img{background-color:transparent !important}",
			/* ---- mouse spotlight ----
			   The lit circle is produced by filtering the BACKDROP itself — extra
			   brightness, saturation and a little contrast, shaped by a radial mask —
			   instead of painting a white gradient over the wallpaper. Painting white
			   lifts the blacks and desaturates whatever it covers, which is why the old
			   version read as a milky wash; filtering keeps every colour and every bit of
			   detail of the very same pixels, so the circle looks like a torch on the
			   image: brighter AND crisper, and it also punches back through the reading
			   scrim that dims the wallpaper.
			   The layer is a 2r x 2r disc that rides the pointer (transform only, so the
			   pointermove path never triggers layout) and is clipped by border-radius to
			   exactly the same circle the mask fades out at. That is deliberate: the
			   radius is the hard safety net, so even an engine that ignored mask-image
			   could only ever light that disc — never the whole viewport. Engines without
			   mask-image at all (checked once in detectCaps) fall back to a soft-light
			   tint, which lightens midtones instead of blowing them out. The mask fades
			   the effect out so there is no visible rim. */
			"#dshlg-backdrop>.dshlg-wp-spot{position:absolute;right:auto;bottom:auto;left:0;top:0;width:calc(var(--dsh-lg-spot-r,420px) * 2);height:calc(var(--dsh-lg-spot-r,420px) * 2);transform:translate3d(var(--dsh-lg-mx,-99999px),var(--dsh-lg-my,-99999px),0) translate(-50%,-50%);border-radius:50%;pointer-events:none;transition:opacity .35s ease;opacity:1}",
			"#dshlg-backdrop[data-spotmode='filter']>.dshlg-wp-spot{background:none;backdrop-filter:brightness(var(--dsh-lg-spot-b,1.45)) saturate(var(--dsh-lg-spot-s,1.28)) contrast(var(--dsh-lg-spot-c,1.08));-webkit-backdrop-filter:brightness(var(--dsh-lg-spot-b,1.45)) saturate(var(--dsh-lg-spot-s,1.28)) contrast(var(--dsh-lg-spot-c,1.08));mask-image:radial-gradient(circle closest-side at 50% 50%,#000 0%,rgba(0,0,0,.96) 36%,rgba(0,0,0,.52) 66%,transparent 100%);-webkit-mask-image:radial-gradient(circle closest-side at 50% 50%,#000 0%,rgba(0,0,0,.96) 36%,rgba(0,0,0,.52) 66%,transparent 100%)}",
			"#dshlg-backdrop[data-spotmode='tint']>.dshlg-wp-spot{background:radial-gradient(circle closest-side at 50% 50%,color-mix(in srgb,#fff var(--dsh-lg-spot-a,0%),transparent) 0%,transparent 72%);mix-blend-mode:soft-light}",
			"#dshlg-backdrop[data-spot='off']>.dshlg-wp-spot{opacity:0}",

			/* the composer seat paints an opaque gradient over the transcript: soften it */
			"html.dsh-lg-on [data-composer-seat]{background:linear-gradient(180deg,rgba(0,0,0,0) 0px,var(--dsh-lg-seat-scrim) 36px) !important}",
			/* keep long-form text readable on top of a wallpaper */
			"html.dsh-lg-on [data-conversation-scroll]{background:var(--dsh-lg-scrim)}",
			"html.dsh-lg-on header:has(> [data-conversation-header-leading]){border-bottom-color:transparent !important}",

			/* ---- own components: readable with or without the glass switch ---- */
			".dshlg-bar{position:absolute;right:18px;bottom:18px;z-index:40;display:flex;flex-direction:column;align-items:flex-end;gap:8px;pointer-events:auto;font:500 12px/1.5 inherit;color:var(--dsw-alias-label-primary)}",
			".dshlg-surface{background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l2);border-radius:16px;box-shadow:var(--dsw-elevation-soft);backdrop-filter:blur(14px) saturate(160%);-webkit-backdrop-filter:blur(14px) saturate(160%)}",
			"html.dsh-lg-on .dshlg-surface{background:var(--dsh-lg-glass-strong);border-color:transparent;box-shadow:inset 0 1px 0 0 var(--dsh-lg-edge),inset 0 0 0 1px var(--dsh-lg-edge-soft),var(--dsh-lg-shadow)}",
			".dshlg-fab{position:relative;width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:17px;line-height:1;padding:0;color:var(--dsw-alias-label-primary);overflow:hidden}",
			".dshlg-fab:hover{filter:brightness(1.06)}",
			".dshlg-fab.is-off{opacity:.72}",
			".dshlg-fab:after{content:'';position:absolute;inset:0;border-radius:50%;background:linear-gradient(140deg,rgba(255,255,255,.5),transparent 46%);mix-blend-mode:screen;pointer-events:none}",
			".dshlg-panel{width:268px;padding:12px 14px 14px;display:flex;flex-direction:column;gap:2px;animation:dshlg-pop .16s ease-out}",
			"@keyframes dshlg-pop{from{opacity:0;transform:translateY(6px) scale(.98)}to{opacity:1;transform:none}}",
			".dshlg-row{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:30px}",
			".dshlg-row-label{display:flex;flex-direction:column;gap:2px;min-width:0}",
			".dshlg-row-title{font-size:12px;font-weight:500;color:var(--dsw-alias-label-primary)}",
			".dshlg-hint{font-size:11px;color:var(--dsw-alias-label-tertiary);line-height:1.5}",
			".dshlg-row-ctl{display:flex;align-items:center;gap:8px;flex:none}",
			".dshlg-sep{height:1px;background:var(--dsw-alias-border-l3);margin:8px 0;flex:none}",
			".dshlg-switch{position:relative;width:38px;height:22px;border-radius:11px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);cursor:pointer;padding:0;flex:none;transition:background-color .16s ease}",
			".dshlg-switch.is-on{background:#2f7cf6;border-color:transparent}",
			".dshlg-knob{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.28);transition:transform .16s ease}",
			".dshlg-switch.is-on .dshlg-knob{transform:translateX(16px)}",
			".dshlg-slider{display:flex;align-items:center;gap:8px}",
			".dshlg-slider input[type=range]{width:132px;accent-color:#2f7cf6}",
			".dshlg-val{font-variant-numeric:tabular-nums;font-size:11px;color:var(--dsw-alias-label-secondary);min-width:44px;text-align:right}",
			".dshlg-btn{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);border-radius:9px;padding:6px 11px;font-size:12px;cursor:pointer;transition:filter .16s ease}",
			".dshlg-btn:hover{filter:brightness(1.05)}",
			".dshlg-btn:disabled{opacity:.5;cursor:default}",
			".dshlg-btn.is-primary{background:#2f7cf6;border-color:transparent;color:#fff}",
			".dshlg-btn.is-danger{color:#e5484d;border-color:#e5484d55}",
			".dshlg-page{display:flex;flex-direction:column;gap:14px;padding:6px 2px 48px;max-width:860px}",
			".dshlg-page h2{margin:0;font-size:17px;font-weight:600;color:var(--dsw-alias-label-primary)}",
			".dshlg-page p{margin:0}",
			".dshlg-card{padding:14px 16px 16px;display:flex;flex-direction:column;gap:4px}",
			".dshlg-card-title{margin:0 0 2px;font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary)}",
			".dshlg-desc{font-size:12px;color:var(--dsw-alias-label-tertiary);line-height:1.6;margin-bottom:6px}",
			".dshlg-note{font-size:12px;line-height:1.6;border-radius:9px;padding:8px 10px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-secondary)}",
			".dshlg-note.is-error{color:#e5484d;background:#e5484d1a}",
			".dshlg-note.is-ok{color:#2ea043;background:#2ea0431a}",
			".dshlg-drop{border:1.5px dashed var(--dsw-alias-border-l3);border-radius:12px;padding:18px;text-align:center;font-size:12px;color:var(--dsw-alias-label-secondary);display:flex;flex-direction:column;align-items:center;gap:10px;cursor:pointer;transition:border-color .16s ease,background-color .16s ease}",
			".dshlg-drop.is-over{border-color:#2f7cf6;background:#2f7cf61a}",
			".dshlg-list{display:flex;flex-direction:column;gap:8px;margin-top:4px}",
			".dshlg-item{display:flex;align-items:center;gap:12px;padding:8px;border-radius:12px;background:var(--dsw-alias-bg-layer-3);border:1px solid var(--dsw-alias-border-l3)}",
			".dshlg-item.is-active{border-color:#2f7cf6}",
			".dshlg-thumb{width:76px;height:44px;flex:none;border-radius:8px;overflow:hidden;background:#05070d;position:relative}",
			".dshlg-thumb>*{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border:0}",
			".dshlg-thumb-tag{display:flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-tertiary);font-size:11px;letter-spacing:.06em}",
			".dshlg-meta{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}",
			".dshlg-name{font-size:12px;font-weight:500;color:var(--dsw-alias-label-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
			".dshlg-sub{font-size:11px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
			".dshlg-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px}",
			".dshlg-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}",
			".dshlg-chip{font-size:11px;border-radius:999px;padding:3px 9px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-secondary);border:1px solid var(--dsw-alias-border-l3)}",
			".dshlg-chip.is-yes{color:#2ea043;border-color:#2ea04355}",
			".dshlg-chip.is-no{color:#e5484d;border-color:#e5484d55}",
			".dshlg-field{width:100%;box-sizing:border-box;border-radius:9px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);padding:7px 10px;font-size:12px}",
			".dshlg-seg{display:inline-flex;border:1px solid var(--dsw-alias-border-l2);border-radius:9px;overflow:hidden}",
			".dshlg-seg button{border:0;background:transparent;color:var(--dsw-alias-label-secondary);padding:5px 11px;font-size:12px;cursor:pointer}",
			".dshlg-seg button.is-on{background:#2f7cf6;color:#fff}",
			".dshlg-preview{position:relative;width:100%;height:132px;border-radius:12px;overflow:hidden;background:#05070d;border:1px solid var(--dsw-alias-border-l3)}",
			".dshlg-preview>*{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border:0}",
		].join("\n");

		const tagId = PKG + "/control.module.css";
		if (
			typeof document !== "undefined" &&
			document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null
		) {
			const tag = document.createElement("style");
			tag.dataset.plugin = PKG;
			tag.dataset.pluginCss = tagId;
			tag.textContent = CSS_TEXT;
			document.head.appendChild(tag);
		}

		/* ------------------------------------------------------------------ *
		 * preferences
		 * ------------------------------------------------------------------ */
		const DEFAULTS = {
			glassEnabled: true,
			glassSidebar: true,
			toolbarEnabled: true,
			toolbarOpen: false,
			refraction: true,
			refractMode: "auto",
			blur: 22,
			refract: 26,
			saturate: 180,
			brightness: 104,
			tint: 42,
			scrim: 52,
			seat: 76,
			preset: "aurora",
			hue: 0,
			wallpaperEnabled: true,
			activeWallpaperId: "",
			wpDim: 30,
			wpBlur: 0,
			wpBright: 100,
			wpFit: "cover",
			extraSelectors: "",
			glassBubbles: true,
			spotlight: true,
			spotSize: 420,
			spotStrength: 45,
		};

		function readPrefs() {
			const out = Object.assign({}, DEFAULTS);
			try {
				const raw = window.localStorage.getItem(LS_PREFS);
				if (raw) {
					const parsed = JSON.parse(raw);
					for (const key of Object.keys(DEFAULTS)) {
						if (parsed && parsed[key] !== undefined && parsed[key] !== null) out[key] = parsed[key];
					}
				}
			} catch (error) {}
			out.glassEnabled = out.glassEnabled !== false;
			return out;
		}
		function writePrefs(prefs) {
			try {
				window.localStorage.setItem(LS_PREFS, JSON.stringify(prefs));
			} catch (error) {}
		}

		/* ------------------------------------------------------------------ *
		 * tiny external store shared by the toolbar and the settings page
		 * ------------------------------------------------------------------ */
		const listeners = new Set();
		const store = {
			snapshot: {
				prefs: readPrefs(),
				wallpapers: [],
				loaded: false,
				active: null,
				caps: null,
				stats: { surfaces: [], refracting: false, mode: "off" },
				notice: "",
				noticeKind: "",
				busy: "",
				sessionDisabled: false,
			},
			set(patch, opts) {
				store.snapshot = Object.assign({}, store.snapshot, patch);
				if (!opts || opts.persist !== false) writePrefs(store.snapshot.prefs);
				for (const fn of Array.from(listeners)) {
					try {
						fn();
					} catch (error) {}
				}
			},
			setPrefs(patch) {
				const prefs = Object.assign({}, store.snapshot.prefs, patch);
				store.set({ prefs });
				applyPrefs();
			},
			subscribe(fn) {
				listeners.add(fn);
				return function () {
					listeners.delete(fn);
				};
			},
			getSnapshot() {
				return store.snapshot;
			},
		};
		function useSnap() {
			if (typeof React.useSyncExternalStore === "function") {
				return React.useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
			}
			const pair = React.useState(0);
			React.useEffect(function () {
				return store.subscribe(function () {
					pair[1](function (n) {
						return n + 1;
					});
				});
			}, []);
			return store.getSnapshot();
		}
		function isGlassActive() {
			const s = store.snapshot;
			return !!s.prefs.glassEnabled && !s.sessionDisabled;
		}

		/* ------------------------------------------------------------------ *
		 * IndexedDB (wallpaper meta + bytes)
		 * ------------------------------------------------------------------ */
		function openDb() {
			return new Promise(function (resolve, reject) {
				if (typeof indexedDB === "undefined") {
					reject(new Error("当前环境不支持 IndexedDB"));
					return;
				}
				const req = indexedDB.open(DB_NAME, DB_VERSION);
				req.onupgradeneeded = function () {
					const db = req.result;
					if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta", { keyPath: "id" });
					if (!db.objectStoreNames.contains("media")) db.createObjectStore("media");
				};
				req.onsuccess = function () {
					resolve(req.result);
				};
				req.onerror = function () {
					reject(req.error || new Error("IndexedDB 打开失败"));
				};
			});
		}
		function tx(db, name, mode) {
			return db.transaction(name, mode).objectStore(name);
		}
		function wrap(request) {
			return new Promise(function (resolve, reject) {
				request.onsuccess = function () {
					resolve(request.result);
				};
				request.onerror = function () {
					reject(request.error);
				};
			});
		}
		async function dbAllMeta() {
			const db = await openDb();
			return (await wrap(tx(db, "meta", "readonly").getAll())) || [];
		}
		async function dbPutMeta(meta) {
			const db = await openDb();
			await wrap(tx(db, "meta", "readwrite").put(meta));
		}
		async function dbPutMedia(id, bytes) {
			const db = await openDb();
			await wrap(tx(db, "media", "readwrite").put(bytes, id));
		}
		async function dbGetMedia(id) {
			const db = await openDb();
			return await wrap(tx(db, "media", "readonly").get(id));
		}
		async function dbDelete(id) {
			const db = await openDb();
			await wrap(tx(db, "meta", "readwrite").delete(id));
			await wrap(tx(db, "media", "readwrite").delete(id));
		}

		/* ------------------------------------------------------------------ *
		 * helpers
		 * ------------------------------------------------------------------ */
		function uid() {
			return "w" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
		}

		/* #region mpkg-core — extracted verbatim by test-mpkg.mjs (keep plain, self-contained declarations) */
		const MAX_BYTES = 320 * 1024 * 1024;
		const WARN_BYTES = 96 * 1024 * 1024;

		function fmtBytes(n) {
			const v = Number(n) || 0;
			if (v < 1024) return v + " B";
			if (v < 1024 * 1024) return (v / 1024).toFixed(1) + " KB";
			if (v < 1024 * 1024 * 1024) return (v / 1024 / 1024).toFixed(1) + " MB";
			return (v / 1024 / 1024 / 1024).toFixed(2) + " GB";
		}
		function extOf(name) {
			const s = String(name || "");
			const i = s.lastIndexOf(".");
			return i < 0 ? "" : s.slice(i + 1).toLowerCase();
		}
		function baseName(name) {
			const s = String(name || "").replace(/\\/g, "/");
			return s.slice(s.lastIndexOf("/") + 1);
		}

		const VIDEO_MIME = {
			mp4: "video/mp4",
			m4v: "video/mp4",
			webm: "video/webm",
			mkv: "video/x-matroska",
			mov: "video/quicktime",
			avi: "video/x-msvideo",
			ogv: "video/ogg",
		};
		const IMAGE_MIME = {
			gif: "image/gif",
			jpg: "image/jpeg",
			jpeg: "image/jpeg",
			png: "image/png",
			webp: "image/webp",
			avif: "image/avif",
			bmp: "image/bmp",
		};
		const WEB_MIME = { html: "text/html", htm: "text/html" };

		function guessMediaKind(name, mime) {
			const ext = extOf(name);
			if (VIDEO_MIME[ext]) return { kind: "video", mime: VIDEO_MIME[ext] };
			if (IMAGE_MIME[ext]) return { kind: "image", mime: IMAGE_MIME[ext] };
			if (WEB_MIME[ext]) return { kind: "web", mime: WEB_MIME[ext] };
			if (ext === "pkg") return { kind: "scene", mime: "application/octet-stream" };
			const m = String(mime || "");
			if (m.indexOf("video/") === 0) return { kind: "video", mime: m };
			if (m.indexOf("image/") === 0) return { kind: "image", mime: m };
			if (m === "text/html") return { kind: "web", mime: m };
			return { kind: "unknown", mime: m || "application/octet-stream" };
		}

		function toArrayBuffer(buffer) {
			if (buffer instanceof ArrayBuffer) return buffer;
			if (ArrayBuffer.isView(buffer)) return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
			return new Uint8Array(buffer || 0).buffer;
		}

		function looksLikeZip(buffer) {
			const ab = toArrayBuffer(buffer);
			const u8 = new Uint8Array(ab, 0, Math.min(4, ab.byteLength));
			return u8.length >= 2 && u8[0] === 0x50 && u8[1] === 0x4b;
		}

		async function readZipEntries(buffer) {
			const ab = toArrayBuffer(buffer);
			const u8 = new Uint8Array(ab);
			const dv = new DataView(ab);
			let eocd = -1;
			const lowest = Math.max(0, u8.length - 66000);
			for (let i = u8.length - 22; i >= lowest; i--) {
				if (dv.getUint32(i, true) === 0x06054b50) {
					eocd = i;
					break;
				}
			}
			if (eocd < 0) throw new Error("不是有效的 ZIP / MPKG（找不到中央目录）");
			let count = dv.getUint16(eocd + 10, true);
			let cdSize = dv.getUint32(eocd + 12, true);
			let cdOffset = dv.getUint32(eocd + 16, true);
			if (cdOffset === 0xffffffff || count === 0xffff || cdSize === 0xffffffff) {
				const loc = eocd - 20;
				if (loc >= 0 && dv.getUint32(loc, true) === 0x07064b50) {
					const z64 = Number(dv.getBigUint64(loc + 8, true));
					if (z64 >= 0 && z64 + 56 <= u8.length && dv.getUint32(z64, true) === 0x06064b50) {
						count = Number(dv.getBigUint64(z64 + 32, true));
						cdSize = Number(dv.getBigUint64(z64 + 40, true));
						cdOffset = Number(dv.getBigUint64(z64 + 48, true));
					}
				}
			}
			const entries = [];
			let p = cdOffset;
			const end = Math.min(cdOffset + cdSize, u8.length);
			while (p + 46 <= end && entries.length < 8192) {
				if (dv.getUint32(p, true) !== 0x02014b50) break;
				const method = dv.getUint16(p + 10, true);
				let compSize = dv.getUint32(p + 20, true);
				let size = dv.getUint32(p + 24, true);
				const nameLen = dv.getUint16(p + 28, true);
				const extraLen = dv.getUint16(p + 30, true);
				const commentLen = dv.getUint16(p + 32, true);
				let offset = dv.getUint32(p + 42, true);
				const name = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nameLen));
				if (size === 0xffffffff || compSize === 0xffffffff || offset === 0xffffffff) {
					let e = p + 46 + nameLen;
					const eEnd = e + extraLen;
					while (e + 4 <= eEnd) {
						const id = dv.getUint16(e, true);
						const len = dv.getUint16(e + 2, true);
						if (id === 0x0001) {
							let q = e + 4;
							if (size === 0xffffffff && q + 8 <= eEnd) {
								size = Number(dv.getBigUint64(q, true));
								q += 8;
							}
							if (compSize === 0xffffffff && q + 8 <= eEnd) {
								compSize = Number(dv.getBigUint64(q, true));
								q += 8;
							}
							if (offset === 0xffffffff && q + 8 <= eEnd) {
								offset = Number(dv.getBigUint64(q, true));
								q += 8;
							}
							break;
						}
						e += 4 + len;
					}
				}
				entries.push({ name: name, method: method, size: size, compSize: compSize, offset: offset, dir: name.charAt(name.length - 1) === "/" });
				p += 46 + nameLen + extraLen + commentLen;
			}
			if (!entries.length) throw new Error("ZIP 中央目录为空或已损坏");
			return entries;
		}

		async function readZipEntry(buffer, entry) {
			if (entry.dir) return new Uint8Array(0);
			const ab = toArrayBuffer(buffer);
			const u8 = new Uint8Array(ab);
			const dv = new DataView(ab);
			const p = entry.offset;
			if (p + 30 > u8.length || dv.getUint32(p, true) !== 0x04034b50) throw new Error("ZIP 本地文件头损坏：" + entry.name);
			const nameLen = dv.getUint16(p + 26, true);
			const extraLen = dv.getUint16(p + 28, true);
			const start = p + 30 + nameLen + extraLen;
			const raw = u8.subarray(start, start + entry.compSize);
			if (entry.method === 0) return raw.slice();
			if (entry.method !== 8) throw new Error("不支持的压缩方式 " + entry.method + "：" + entry.name);
			if (typeof DecompressionStream === "undefined") throw new Error("当前环境缺少 DecompressionStream，无法解压");
			const stream = new ReadableStream({
				start(controller) {
					controller.enqueue(raw);
					controller.close();
				},
			});
			const out = stream.pipeThrough(new DecompressionStream("deflate-raw"));
			return new Uint8Array(await new Response(out).arrayBuffer());
		}

		async function parseWallpaperPackage(buffer, options) {
			const opt = options || {};
			const notes = [];
			const entries = await readZipEntries(buffer);
			const list = entries.filter(function (e) {
				return !e.dir;
			});
			const byName = function (want) {
				const clean = String(want || "").replace(/^\.?\//, "");
				return (
					list.find(function (e) {
						return e.name === clean;
					}) ||
					list.find(function (e) {
						return e.name.toLowerCase().slice(-clean.length - 1) === "/" + clean.toLowerCase();
					}) ||
					list.find(function (e) {
						return baseName(e.name).toLowerCase() === baseName(clean).toLowerCase();
					}) ||
					null
				);
			};
			let project = null;
			const pjEntry = byName("project.json") || list.find(function (e) {
				return /project\.json$/i.test(e.name);
			});
			if (pjEntry) {
				try {
					project = JSON.parse(new TextDecoder().decode(await readZipEntry(buffer, pjEntry)));
				} catch (error) {
					notes.push("project.json 解析失败：" + (error && error.message ? error.message : error));
				}
			}
			const declaredType = project && typeof project.type === "string" ? project.type.toLowerCase() : "";
			const declaredFile = project && typeof project.file === "string" ? project.file : "";
			let pick = null;
			const isPreviewName = function (name) {
				return /(^|\/)(tumb|thumbnail|preview)[^/]*\.(gif|jpe?g|png|webp|avif|bmp)$/i.test(name);
			};
			const scenePreview = function () {
				return (
					(project && typeof project.preview === "string" && project.preview ? byName(project.preview) : null) ||
					list.find(function (e) {
						return isPreviewName(e.name);
					}) ||
					null
				);
			};
			if (declaredType === "scene") {
				// A scene package declares `file: "scene.json"` — the 3D descriptor, which a browser
				// cannot render at all. Its bundled preview image is the only usable media, so the
				// declared file must NOT win here.
				pick = scenePreview();
				if (pick) notes.push("scene 类型：已使用包内预览图代替 3D 场景。");
			} else if (declaredFile) {
				pick = byName(declaredFile);
			}
			if (!pick) {
				const order =
					declaredType === "web"
						? ["web", "video", "image"]
						: declaredType === "scene"
							? ["image", "video"]
							: declaredType === "video"
								? ["video", "image", "web"]
								: ["video", "web", "image"];
				for (const want of order) {
					pick = list.find(function (e) {
						return guessMediaKind(e.name).kind === want && !isPreviewName(e.name);
					});
					if (pick) break;
				}
			}
			let media = null;
			let kind = "unknown";
			let mime = "application/octet-stream";
			if (pick) {
				const guess = guessMediaKind(pick.name, pick.mime);
				kind = guess.kind;
				mime = guess.mime;
				if (opt.maxBytes && pick.size > opt.maxBytes) throw new Error("媒体文件过大（" + fmtBytes(pick.size) + "），上限 " + fmtBytes(opt.maxBytes));
				const bytes = await readZipEntry(buffer, pick);
				media = { name: pick.name, size: bytes.byteLength, mime: mime, kind: kind, bytes: bytes };
				if (kind === "video" && /matroska|quicktime|msvideo/.test(mime)) notes.push("该视频格式（" + mime + "）在 Chromium 中可能无法播放，建议改用 mp4 / webm。");
				if (opt.warnBytes && bytes.byteLength > opt.warnBytes) notes.push("媒体较大（" + fmtBytes(bytes.byteLength) + "），首次加载会较慢。");
			} else {
				notes.push("压缩包内没有可播放的媒体（视频 / 网页 / 图片）。");
			}
			return {
				container: "zip",
				kind: kind,
				mime: mime,
				media: media,
				project: project
					? { type: project.type || "", title: project.title || "", file: project.file || "", preview: project.preview || "" }
					: null,
				entryCount: list.length,
				entries: list.slice(0, 300).map(function (e) {
					return { name: e.name, size: e.size, method: e.method };
				}),
				notes: notes,
			};
		}

		async function inspectUpload(fileName, buffer, options) {
			const opt = options || {};
			const ext = extOf(fileName);
			const ab = toArrayBuffer(buffer);
			if (ab.byteLength > (opt.maxBytes || MAX_BYTES)) throw new Error("文件过大（" + fmtBytes(ab.byteLength) + "），上限 " + fmtBytes(opt.maxBytes || MAX_BYTES));
			const zipish = looksLikeZip(ab) || ext === "mpkg" || ext === "pkg" || ext === "zip";
			if (zipish) {
				try {
					return await parseWallpaperPackage(ab, opt);
				} catch (error) {
					if (!VIDEO_MIME[ext] && !IMAGE_MIME[ext] && !WEB_MIME[ext]) throw error;
				}
			}
			const guess = guessMediaKind(fileName, "");
			return {
				container: zipish ? "zip?" : "raw",
				kind: guess.kind,
				mime: guess.mime,
				media: { name: baseName(fileName), size: ab.byteLength, mime: guess.mime, kind: guess.kind, bytes: new Uint8Array(ab) },
				project: null,
				entryCount: 0,
				entries: [],
				notes: guess.kind === "unknown" ? ["无法识别该文件类型，将按原样保存。"] : [],
			};
		}
		/* #endregion mpkg-core */

		/* ------------------------------------------------------------------ *
		 * runtime: filter, backdrop, surfaces
		 * ------------------------------------------------------------------ */
		let svgFilter = null;
		let observer = null;
		let frameQueued = false;
		let mediaUrl = "";
		let mediaKey = "";

		function ensureSvgFilter() {
			if (svgFilter && svgFilter.isConnected) return svgFilter;
			const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			svg.id = SVG_ID;
			svg.setAttribute("aria-hidden", "true");
			svg.setAttribute("focusable", "false");
			svg.setAttribute("width", "0");
			svg.setAttribute("height", "0");
			svg.style.cssText = "position:fixed;width:0;height:0;overflow:hidden;pointer-events:none;opacity:0";
			const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
			filter.id = FILTER_ID;
			filter.setAttribute("x", "-25%");
			filter.setAttribute("y", "-25%");
			filter.setAttribute("width", "150%");
			filter.setAttribute("height", "150%");
			filter.setAttribute("color-interpolation-filters", "sRGB");
			const noise = document.createElementNS("http://www.w3.org/2000/svg", "feTurbulence");
			noise.setAttribute("type", "fractalNoise");
			noise.setAttribute("baseFrequency", "0.0065 0.013");
			noise.setAttribute("numOctaves", "2");
			noise.setAttribute("seed", "17");
			noise.setAttribute("result", "noise");
			const soften = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
			soften.setAttribute("in", "noise");
			soften.setAttribute("stdDeviation", "1.7");
			soften.setAttribute("result", "soft");
			const displace = document.createElementNS("http://www.w3.org/2000/svg", "feDisplacementMap");
			displace.setAttribute("in", "SourceGraphic");
			displace.setAttribute("in2", "soft");
			displace.setAttribute("xChannelSelector", "R");
			displace.setAttribute("yChannelSelector", "G");
			displace.setAttribute("scale", String(store.snapshot.prefs.refract));
			filter.appendChild(noise);
			filter.appendChild(soften);
			filter.appendChild(displace);
			svg.appendChild(filter);
			document.body.appendChild(svg);
			svgFilter = svg;
			return svg;
		}
		function syncRefractScale() {
			const el = document.getElementById(FILTER_ID);
			if (!el) return;
			const node = el.querySelector("feDisplacementMap");
			if (node) node.setAttribute("scale", String(store.snapshot.prefs.refract));
		}

		const SURFACES = [
			{ key: "composer-card", selector: "[data-composer-card]" },
			{ key: "header", selector: "header:has(> [data-conversation-header-leading])" },
			{ key: "queue-dock", selector: "[data-queue-dock]" },
			{ key: "composer-overlay", selector: "[data-conversation-composer-overlay]" },
		];
		const SIDEBAR_SURFACE = { key: "sidebar", selector: "[class*='_sidebarCol'] > *" };
		/* The bubble I send comes from ui-chat's MessageItem.module.css:
		   <hash>_userRow > <hash>_userStack > <hash>_bubble. The hash changes on every
		   build, the suffixes do not — the same contract this plugin already relies on
		   for _centerCol / _sidebarCol. The bubble is a static div without position or
		   overflow, so a dedicated rule anchors the :after gloss to it (see CSS_TEXT). */
		const BUBBLE_SURFACE = {
			key: "user-bubble",
			selector: "[class*='_userRow'] [class*='_bubble'], [class*='_userStack'] > [class*='_bubble']",
		};
		/* Markdown code blocks are the one markdown component with a stable class
		   hook: ui-primitives renders
		   clsx(css.block, "md-code-block", …) (index.js:10875). The sticky banner
		   wrap, the banner and the <pre> inside each paint their own opaque fill, so
		   CSS makes them transparent once this root is a glass surface. */
		const CODE_SURFACE = {
			key: "code-block",
			selector: "[data-conversation-content] .md-code-block",
		};

		/* ------------------------------------------------------------------ *
		 * mouse spotlight
		 *
		 * A single pointer position feeds two coordinated highlights:
		 *  - .dshlg-wp-spot lives inside the backdrop layer, so the glass sits in
		 *    front of the light and refracts it — this is the part that reads as a
		 *    real spotlight on the wallpaper;
		 *  - a specular sheen inside [data-dshlg-glass]:after, positioned per element
		 *    in element-local coordinates, so the glass itself reacts like a lens.
		 * Every origin defaults to a far away pixel, so with no pointer movement
		 * nothing renders. The MutationObserver only watches childList, so writing
		 * these custom properties can never feed a refresh loop back into itself.
		 * ------------------------------------------------------------------ */
		const SPOT_AWAY = "-99999px";
		let spotX = -99999;
		let spotY = -99999;
		let spotFrame = 0;
		let spotHosts = new Set();
		let spotRects = [];
		let spotRectsAt = 0;
		let spotInside = false;

		function spotActive() {
			return isGlassActive() && !!store.snapshot.prefs.spotlight;
		}
		function writeSpotVars() {
			const prefs = store.snapshot.prefs;
			const root = document.documentElement;
			const strength = Math.max(0, Math.min(100, Number(prefs.spotStrength) || 0));
			root.style.setProperty("--dsh-lg-spot-r", prefs.spotSize + "px");
			/* The strength slider drives real exposure, not an alpha of white paint:
			   at 0 the three filters are the identity, so the spotlight is invisible;
			   at 45 (default) the wallpaper comes back to roughly its undimmed
			   luminance and a little past it. Saturate and contrast are what keep the
			   lit area from looking bleached — they give back the colour that the
			   scrim and the brightness lift take out. */
			root.style.setProperty("--dsh-lg-spot-b", (1 + strength * 0.012).toFixed(3));
			root.style.setProperty("--dsh-lg-spot-s", (1 + strength * 0.0055).toFixed(3));
			root.style.setProperty("--dsh-lg-spot-c", (1 + strength * 0.0016).toFixed(3));
			/* only the degraded tint mode uses the old alpha */
			root.style.setProperty("--dsh-lg-spot-a", Math.round(strength * 0.62) + "%");
			root.style.setProperty("--dsh-lg-sheen-r", Math.round(prefs.spotSize * 0.62) + "px");
			root.style.setProperty("--dsh-lg-sheen-a", Math.round(strength * 0.34) + "%");
		}
		function clearSpotHost(el) {
			spotHosts.delete(el);
			try {
				el.style.removeProperty("--dsh-lg-sx");
				el.style.removeProperty("--dsh-lg-sy");
			} catch (error) {}
		}
		function parkSpot() {
			spotInside = false;
			const root = document.documentElement;
			root.style.setProperty("--dsh-lg-mx", SPOT_AWAY);
			root.style.setProperty("--dsh-lg-my", SPOT_AWAY);
			for (const el of Array.from(spotHosts)) clearSpotHost(el);
		}
		/* Reading every rect on every frame would force a layout per pointermove; the
		   cache is refreshed at most four times a second (and on every surface pass),
		   which is invisible for a light that follows the cursor. */
		function spotTargets(now) {
			if (spotRects.length && now - spotRectsAt < 250) return spotRects;
			spotRectsAt = now;
			const out = [];
			for (const el of Array.from(document.querySelectorAll("[data-dshlg-glass]"))) {
				try {
					out.push({ el: el, rect: el.getBoundingClientRect() });
				} catch (error) {}
			}
			spotRects = out;
			return out;
		}
		function flushSpot() {
			spotFrame = 0;
			if (!spotActive() || !spotInside) return;
			const root = document.documentElement;
			root.style.setProperty("--dsh-lg-mx", spotX + "px");
			root.style.setProperty("--dsh-lg-my", spotY + "px");
			const next = new Set();
			for (const item of spotTargets(Date.now())) {
				const el = item.el;
				const rect = item.rect;
				if (!rect || !el.style || typeof el.style.setProperty !== "function") continue;
				if (spotX < rect.left - 160 || spotX > rect.right + 160 || spotY < rect.top - 160 || spotY > rect.bottom + 160) continue;
				el.style.setProperty("--dsh-lg-sx", spotX - rect.left + "px");
				el.style.setProperty("--dsh-lg-sy", spotY - rect.top + "px");
				next.add(el);
			}
			for (const el of Array.from(spotHosts)) if (!next.has(el)) clearSpotHost(el);
			spotHosts = next;
		}
		function onSpotMove(event) {
			if (!spotActive()) return;
			spotX = typeof event.clientX === "number" ? event.clientX : 0;
			spotY = typeof event.clientY === "number" ? event.clientY : 0;
			spotInside = true;
			if (spotFrame) return;
			spotFrame = typeof requestAnimationFrame === "function" ? requestAnimationFrame(flushSpot) : setTimeout(flushSpot, 60);
		}
		function scheduleSpot() {
			if (spotFrame) return;
			spotFrame = typeof requestAnimationFrame === "function" ? requestAnimationFrame(flushSpot) : setTimeout(flushSpot, 60);
		}
		function syncSpot() {
			writeSpotVars();
			if (!spotActive() || !spotInside) {
				/* never moved, just disabled or the window lost focus: publish the
				   off-screen origin instead of leaving the variables unset */
				parkSpot();
				return;
			}
			/* the pointer already sits somewhere inside the window: light it up again
			   instead of waiting for the next move */
			scheduleSpot();
		}

		function stampChrome() {
			const overlay = document.querySelector("[data-shell-overlay]");
			if (!overlay || !overlay.parentElement) return;
			const frame = overlay.parentElement;
			if (frame.getAttribute("data-dshlg-canvas") !== "1") frame.setAttribute("data-dshlg-canvas", "1");
			if (overlay.parentElement.querySelector("[data-dshlg-center]")) return;
			const children = Array.from(frame.children);
			let center = children.find(function (el) {
				return el !== overlay && el.querySelector && el.querySelector("[data-conversation-content], [data-conversation-scroll]");
			});
			if (!center) {
				center = children.find(function (el) {
					return el !== overlay && typeof el.className === "string" && /_centerCol/.test(el.className);
				});
			}
			if (center && center.getAttribute("data-dshlg-center") !== "1") center.setAttribute("data-dshlg-center", "1");
		}

		function mark(el, key) {
			if (el.getAttribute("data-dshlg-glass") !== key) el.setAttribute("data-dshlg-glass", key);
		}
		function unmark(el) {
			if (el.hasAttribute("data-dshlg-glass")) el.removeAttribute("data-dshlg-glass");
			if (el.hasAttribute("data-dshlg-refract")) el.removeAttribute("data-dshlg-refract");
		}

		/* The MutationObserver fires constantly (streaming text, timers). Publishing on every pass
		   would re-render the toolbar and settings page, and — because our own DOM writes also
		   mutate the body — feed the observer in a loop. Only publish on a real change. */
		let lastStatsKey = "";
		function publishStats(surfaces, refracting, mode) {
			const layer = document.getElementById(BACKDROP_ID);
			const active = store.snapshot.prefs.wallpaperEnabled ? store.snapshot.active : null;
			const backdrop = {
				layer: !!layer,
				preset: store.snapshot.prefs.preset,
				media: active ? active.kind : "",
				cleared: clearStats.cleared,
				names: clearStats.names.slice(),
			};
			const key =
				(refracting ? "1" : "0") +
				"|" + mode +
				"|" + surfaces.join(",") +
				"|" + (backdrop.layer ? "L" : "-") + backdrop.preset + backdrop.media + backdrop.cleared + backdrop.names.join(",");
			if (key === lastStatsKey) return;
			lastStatsKey = key;
			store.set({ stats: { surfaces: surfaces.slice(), refracting: !!refracting, mode: mode, backdrop: backdrop } }, { persist: false });
		}

		/* "svg" bends the backdrop with an SVG displacement filter. Chromium's backdrop-filter has
		   historically been unreliable with url() references, so it is never the only refraction:
		   "edge" (rim light + inner glow) always renders, and auto resolves to whichever the engine
		   claims to support. */
		function refractModeOf(prefs, caps) {
			if (!prefs.refraction) return "off";
			if (prefs.refractMode === "edge") return "edge";
			const usable = !!(caps && caps.refractFilter) && !!document.getElementById(FILTER_ID);
			return usable ? "svg" : "edge";
		}

		function refreshSurfaces() {
			const prefs = store.snapshot.prefs;
			const mode = refractModeOf(prefs, store.snapshot.caps);
			/* surfaces may have just been added/removed: drop the spotlight rect cache */
			spotRectsAt = 0;
			if (!isGlassActive()) {
				for (const el of Array.from(document.querySelectorAll("[data-dshlg-glass]"))) unmark(el);
				syncBackdropClearing(true);
				publishStats([], false, mode);
				return;
			}
			const stats = [];
			/* Elements that keep their mark this pass. Anything still carrying
			   data-dshlg-glass but absent from this set is stale (the sidebar switch was
			   turned off, a custom selector was edited, a surface changed its selector)
			   and must be released, otherwise the old surface stays glass forever. */
			const kept = new Set();
			const list = SURFACES.slice();
			if (prefs.glassSidebar) list.push(SIDEBAR_SURFACE);
			if (prefs.glassBubbles) list.push(BUBBLE_SURFACE);
			list.push(CODE_SURFACE);
			const custom = String(prefs.extraSelectors || "")
				.split(/[,\n]/)
				.map(function (s) {
					return s.trim();
				})
				.filter(Boolean);
			for (const spec of list) {
				let nodes = [];
				try {
					nodes = Array.from(document.querySelectorAll(spec.selector));
				} catch (error) {
					continue;
				}
				for (const el of nodes) {
					if (el.closest("#" + BACKDROP_ID) || el.closest("#" + SVG_ID)) continue;
					mark(el, spec.key);
					kept.add(el);
					stats.push(spec.key);
				}
			}
			for (const selector of custom) {
				let nodes = [];
				try {
					nodes = Array.from(document.querySelectorAll(selector));
				} catch (error) {
					continue;
				}
				for (const el of nodes) {
					mark(el, "custom");
					kept.add(el);
					stats.push("custom");
				}
			}
			const wantRefract = mode === "svg";
			for (const el of Array.from(document.querySelectorAll("[data-dshlg-glass]"))) {
				if (!kept.has(el)) {
					unmark(el);
					continue;
				}
				const isCard = el.getAttribute("data-dshlg-glass") === "composer-card";
				if (wantRefract && isCard) {
					if (!el.hasAttribute("data-dshlg-refract")) el.setAttribute("data-dshlg-refract", "");
				} else if (el.hasAttribute("data-dshlg-refract")) {
					el.removeAttribute("data-dshlg-refract");
				}
			}
			syncBackdropClearing(false);
			publishStats(stats, wantRefract, mode);
		}

		/* ------------------------------------------------------------------ *
		 * wallpaper visibility
		 *
		 * #dshlg-backdrop is a fixed layer at z-index:-1, i.e. above the canvas
		 * background (body's background propagates to the canvas) but below the
		 * document. Every in-flow container that paints an opaque fill therefore
		 * covers it: the shell frame does exactly that with
		 * .BynINW_frame{background:var(--dsw-alias-bg-base)}, which is why neither a
		 * preset gradient nor an uploaded wallpaper was ever visible. While the glass
		 * is on, body, the frame and every opaque wrapper on the path down to the chat
		 * surfaces are stamped [data-dshlg-clear]; stale marks are released on every
		 * pass so the app is pixel-identical once the glass is switched off.
		 * ------------------------------------------------------------------ */
		const CLEAR_ATTR = "data-dshlg-clear";
		const CLEAR_SKIP = "[data-dshlg-glass],[data-conversation-scroll],[data-composer-seat],#" + BACKDROP_ID;
		let clearAt = 0;

		function paintsBackground(el) {
			let cs = null;
			try {
				cs = typeof window.getComputedStyle === "function" ? window.getComputedStyle(el) : null;
			} catch (error) {
				cs = null;
			}
			if (!cs) return false;
			const color = String(cs.backgroundColor || "");
			const rgb = /rgba?\(([^)]+)\)/.exec(color);
			if (rgb) {
				const parts = rgb[1].split(",");
				const alpha = parts.length > 3 ? parseFloat(parts[3]) : 1;
				if (alpha > 0.01) return true;
			}
			const image = String(cs.backgroundImage || "none");
			return image !== "none" && image !== "" && image !== "undefined";
		}

		let clearStats = { cleared: 0, names: [] };
		function syncBackdropClearing(force) {
			const now = Date.now();
			const cloth = isGlassActive();
			if (cloth) stampChrome();
			/* Not throttled while the canvas mark is still missing: a freshly mounted
			   frame must be cleared on the very next pass, not up to 1.2 s later. */
			const canvas = cloth ? document.querySelector("[data-dshlg-canvas]") : null;
			if (!force && !(canvas && !canvas.hasAttribute(CLEAR_ATTR)) && now - clearAt < 1200) return;
			clearAt = now;
			const kept = new Set();
			const keep = function (el) {
				if (!el || el.nodeType !== 1 || el === document.documentElement) return;
				if (el.hasAttribute(CLEAR_ATTR)) {
					kept.add(el);
					return;
				}
				kept.add(el);
				el.setAttribute(CLEAR_ATTR, "");
			};
			if (cloth) {
				keep(document.body);
				keep(document.querySelector("[data-dshlg-canvas]"));
				const seeds = [
					document.querySelector("[data-composer-card]"),
					document.querySelector("[data-conversation-content]"),
					document.querySelector("[data-shell-overlay]"),
				];
				for (const seed of seeds) {
					let el = seed && seed.parentElement ? seed.parentElement : null;
					while (el && el !== document.documentElement) {
						let skip = false;
						try {
							skip = el.closest(CLEAR_SKIP) !== null;
						} catch (error) {
							skip = false;
						}
						/* An element that already carries the mark is kept WITHOUT
						   re-measuring: our own !important rule makes its computed
						   background read as transparent, so re-measuring would release
						   the mark, the opaque fill would return, and the wallpaper would
						   flicker on every pass. Marks are released only when the glass
						   goes off (or when the element leaves the document). */
						if (!skip && (el.hasAttribute(CLEAR_ATTR) || paintsBackground(el))) keep(el);
						el = el.parentElement;
					}
				}
			}
			for (const el of Array.from(document.querySelectorAll("[" + CLEAR_ATTR + "]"))) {
				if (!kept.has(el)) el.removeAttribute(CLEAR_ATTR);
			}
			const names = [];
			for (const el of kept) {
				const mark = String(el.className || "") || el.tagName.toLowerCase();
				names.push(mark.split(/\s+/)[0].slice(0, 28));
			}
			clearStats = { cleared: kept.size, names: names.slice(0, 3) };
		}

		function refreshBackdrop() {
			const existing = document.getElementById(BACKDROP_ID);
			if (!isGlassActive()) {
				if (existing) existing.remove();
				releaseMedia();
				return;
			}
			let layer = existing;
			if (!layer) {
				layer = document.createElement("div");
				layer.id = BACKDROP_ID;
				layer.setAttribute("aria-hidden", "true");
				layer.setAttribute("data-preset", store.snapshot.prefs.preset);
				layer.setAttribute("data-fit", store.snapshot.prefs.wpFit);
				layer.appendChild(hidden("dshlg-wp-grad"));
				layer.appendChild(hidden("dshlg-wp-media"));
				layer.appendChild(hidden("dshlg-wp-scrim"));
				layer.appendChild(hidden("dshlg-wp-spot"));
				if (document.body.firstChild) document.body.insertBefore(layer, document.body.firstChild);
				else document.body.appendChild(layer);
			}
			const prefs = store.snapshot.prefs;
			layer.setAttribute("data-preset", prefs.preset);
			layer.setAttribute("data-fit", prefs.wpFit);
			layer.setAttribute("data-spot", prefs.spotlight ? "on" : "off");
			layer.setAttribute("data-spotmode", store.snapshot.caps && store.snapshot.caps.spotMask ? "filter" : "tint");
			const active = prefs.wallpaperEnabled ? store.snapshot.active : null;
			const mediaHost = layer.querySelector(".dshlg-wp-media");
			const gradHost = layer.querySelector(".dshlg-wp-grad");
			const key = active ? active.id + "|" + active.kind + "|" + (active.url || "") : "gradient";
			if (mediaKey !== key) {
				mediaKey = key;
				mediaHost.textContent = "";
				gradHost.style.display = active ? "none" : "";
				if (active && active.url) {
					if (active.kind === "video") {
						const video = document.createElement("video");
						video.className = "dshlg-wp-media";
						video.src = active.url;
						video.loop = true;
						video.muted = true;
						video.autoplay = true;
						video.playsInline = true;
						video.setAttribute("muted", "");
						video.setAttribute("playsinline", "");
						mediaHost.appendChild(video);
						const p = video.play();
						if (p && p.catch) p.catch(function () {});
					} else if (active.kind === "image") {
						const img = document.createElement("img");
						img.className = "dshlg-wp-media";
						img.alt = "";
						img.src = active.url;
						mediaHost.appendChild(img);
					} else if (active.kind === "web") {
						const frame = document.createElement("iframe");
						frame.className = "dshlg-wp-media";
						frame.setAttribute("sandbox", "allow-scripts");
						frame.setAttribute("scrolling", "no");
						frame.srcdoc = active.html || "";
						mediaHost.appendChild(frame);
					}
				}
			}
		}
		function hidden(className) {
			const el = document.createElement("div");
			el.className = className;
			return el;
		}
		function releaseMedia() {
			if (mediaUrl) {
				try {
					URL.revokeObjectURL(mediaUrl);
				} catch (error) {}
			}
			mediaUrl = "";
			mediaKey = "";
		}

		function applyPrefs() {
			const prefs = store.snapshot.prefs;
			const root = document.documentElement;
			if (isGlassActive()) root.classList.add("dsh-lg-on");
			else root.classList.remove("dsh-lg-on");
			const mode = refractModeOf(prefs, store.snapshot.caps);
			if (isGlassActive() && mode === "svg") root.classList.add("dsh-lg-refract");
			else root.classList.remove("dsh-lg-refract");
			root.style.setProperty("--dsh-lg-blur", prefs.blur + "px");
			root.style.setProperty("--dsh-lg-sat", prefs.saturate + "%");
			root.style.setProperty("--dsh-lg-bright", String(prefs.brightness / 100));
			root.style.setProperty("--dsh-lg-tint", prefs.tint + "%");
			root.style.setProperty("--dsh-lg-scrim-a", prefs.scrim + "%");
			root.style.setProperty("--dsh-lg-seat-a", prefs.seat + "%");
			root.style.setProperty("--dsh-lg-hue", prefs.hue + "deg");
			root.style.setProperty("--dsh-lg-wp-dim", prefs.wpDim + "%");
			root.style.setProperty("--dsh-lg-wp-blur", prefs.wpBlur + "px");
			root.style.setProperty("--dsh-lg-wp-bright", String(prefs.wpBright / 100));
			syncRefractScale();
			syncSpot();
			refreshBackdrop();
			syncBackdropClearing(true);
			refreshSurfaces();
		}

		function scheduleRefresh() {
			if (frameQueued) return;
			frameQueued = true;
			const run = function () {
				frameQueued = false;
				stampChrome();
				refreshSurfaces();
			};
			if (typeof requestAnimationFrame === "function") requestAnimationFrame(run);
			else setTimeout(run, 120);
		}

		function detectCaps() {
			const supports = function (prop, value) {
				try {
					const cssom = typeof window !== "undefined" ? window.CSS : typeof CSS !== "undefined" ? CSS : null;
					return cssom && cssom.supports ? cssom.supports(prop, value) : false;
				} catch (error) {
					return false;
				}
			};
			const video = document.createElement("video");
			const caps = {
				backdropFilter: supports("backdrop-filter", "blur(2px)") || supports("-webkit-backdrop-filter", "blur(2px)"),
				refractFilter: supports("backdrop-filter", "url(#" + FILTER_ID + ")"),
				colorMix: supports("color", "color-mix(in srgb, #ffffff 50%, transparent)"),
				/* the spotlight filters the backdrop through a radial mask; without
				   mask-image the whole viewport would be brightened, so it degrades to
				   the tint layer instead */
				spotMask: supports("mask-image", "radial-gradient(#000, transparent)") || supports("-webkit-mask-image", "radial-gradient(#000, transparent)"),
				hasSelector: supports("selector(:has(*))") || safeSelect("html:has(body)"),
				mo: typeof MutationObserver !== "undefined",
				deflate: typeof DecompressionStream !== "undefined",
				idb: typeof indexedDB !== "undefined",
				mp4: video.canPlayType('video/mp4; codecs="avc1.42E01E"') !== "",
				webm: video.canPlayType('video/webm; codecs="vp9"') !== "",
				electron: String(navigator.userAgent || ""),
			};
			return caps;
		}
		function safeSelect(selector) {
			try {
				document.querySelector(selector);
				return true;
			} catch (error) {
				return false;
			}
		}

		/* ------------------------------------------------------------------ *
		 * wallpaper actions
		 * ------------------------------------------------------------------ */
		async function loadWallpapers() {
			if (store.snapshot.loaded || store.snapshot.busy === "load") return;
			store.set({ busy: "load" }, { persist: false });
			try {
				const metas = await dbAllMeta();
				metas.sort(function (a, b) {
					return (b.createdAt || 0) - (a.createdAt || 0);
				});
				store.set({ wallpapers: metas, loaded: true, busy: "", caps: store.snapshot.caps || detectCaps() }, { persist: false });
				const prefs = store.snapshot.prefs;
				const wanted = metas.find(function (m) {
					return m.id === prefs.activeWallpaperId;
				});
				if (wanted) await activateWallpaper(wanted.id, true);
			} catch (error) {
				store.set({ busy: "", notice: "读取壁纸库失败：" + msg(error), noticeKind: "error" }, { persist: false });
			}
		}
		function msg(error) {
			return error && error.message ? error.message : String(error);
		}
		async function activateWallpaper(id, silent) {
			try {
				store.set({ busy: "activate" }, { persist: false });
				const meta = store.snapshot.wallpapers.find(function (m) {
					return m.id === id;
				});
				if (!meta) throw new Error("找不到该壁纸记录");
				let bytes = await dbGetMedia(id);
				if (!bytes) throw new Error("壁纸数据缺失，请重新上传");
				if (bytes instanceof ArrayBuffer) bytes = new Uint8Array(bytes);
				let kind = meta.kind;
				let html = "";
				if (kind === "web" || meta.mime === "text/html") {
					html = new TextDecoder().decode(new Uint8Array(bytes.buffer || bytes, bytes.byteOffset || 0, bytes.byteLength));
					kind = "web";
				}
				releaseMedia();
				let url = "";
				if (kind !== "web") {
					const blob = new Blob([bytes], { type: meta.mime || "application/octet-stream" });
					url = URL.createObjectURL(blob);
					mediaUrl = url;
				}
				store.set(
					{
						active: { id: meta.id, name: meta.name, kind: kind, mime: meta.mime, size: meta.size, url: url, html: html },
						busy: "",
						notice: silent ? store.snapshot.notice : "已启用：" + meta.name,
						noticeKind: "ok",
					},
					{ persist: false }
				);
				if (store.snapshot.prefs.activeWallpaperId !== id) store.setPrefs({ activeWallpaperId: id, wallpaperEnabled: true });
				else applyPrefs();
			} catch (error) {
				store.set({ busy: "", notice: msg(error), noticeKind: "error" }, { persist: false });
			}
		}
		async function addFiles(fileList) {
			const files = Array.from(fileList || []);
			if (!files.length) return;
			for (const file of files) {
				try {
					store.set({ busy: "read:" + file.name, notice: tr("reading") + " " + file.name, noticeKind: "" }, { persist: false });
					const buffer = await file.arrayBuffer();
					const info = await inspectUpload(file.name, buffer, { maxBytes: MAX_BYTES, warnBytes: WARN_BYTES });
					if (!info.media) throw new Error((info.notes && info.notes[0]) || "包内没有可用媒体");
					const id = uid();
					const meta = {
						id: id,
						name: file.name,
						createdAt: Date.now(),
						size: info.media.size,
						source: info.container,
						kind: info.media.kind,
						mime: info.media.mime,
						mediaName: info.media.name,
						entryCount: info.entryCount,
						declaredType: info.project && info.project.type ? info.project.type : "",
						notes: info.notes,
					};
					await dbPutMedia(id, info.media.bytes.buffer ? info.media.bytes.buffer.slice(info.media.bytes.byteOffset, info.media.bytes.byteOffset + info.media.bytes.byteLength) : info.media.bytes);
					await dbPutMeta(meta);
					const wallpapers = [meta].concat(store.snapshot.wallpapers);
					store.set(
						{
							wallpapers: wallpapers,
							busy: "",
							notice:
								(info.notes && info.notes.length ? info.notes.join("；") + " " : "") +
								"已添加：" + file.name + "（" + info.media.kind + "，" + fmtBytes(info.media.size) + "）",
							noticeKind: "ok",
						},
						{ persist: false }
					);
					await activateWallpaper(id, true);
				} catch (error) {
					store.set({ busy: "", notice: file.name + "：" + msg(error), noticeKind: "error" }, { persist: false });
				}
			}
		}
		async function removeWallpaper(id) {
			try {
				await dbDelete(id);
				const wallpapers = store.snapshot.wallpapers.filter(function (m) {
					return m.id !== id;
				});
				const wasActive = store.snapshot.prefs.activeWallpaperId === id;
				store.set({ wallpapers: wallpapers, notice: "已删除", noticeKind: "ok" }, { persist: false });
				if (wasActive) {
					releaseMedia();
					store.set({ active: null }, { persist: false });
					store.setPrefs({ activeWallpaperId: "" });
				}
			} catch (error) {
				store.set({ notice: msg(error), noticeKind: "error" }, { persist: false });
			}
		}
		async function clearWallpapers() {
			for (const meta of store.snapshot.wallpapers.slice()) await removeWallpaper(meta.id);
		}

		/* ------------------------------------------------------------------ *
		 * shared UI atoms
		 * ------------------------------------------------------------------ */
		function Surface(props) {
			return h("div", { className: "dshlg-surface" + (props.className ? " " + props.className : ""), style: props.style }, props.children);
		}
		function Row(props) {
			return h(
				"div",
				{ className: "dshlg-row" },
				h(
					"div",
					{ className: "dshlg-row-label" },
					h("span", { className: "dshlg-row-title" }, props.label),
					props.hint ? h("span", { className: "dshlg-hint" }, props.hint) : null
				),
				h("div", { className: "dshlg-row-ctl" }, props.children)
			);
		}
		function Switch(props) {
			return h(
				"button",
				{
					type: "button",
					role: "switch",
					"aria-checked": props.checked ? "true" : "false",
					className: "dshlg-switch" + (props.checked ? " is-on" : ""),
					onClick: function () {
						props.onChange(!props.checked);
					},
				},
				h("span", { className: "dshlg-knob" })
			);
		}
		function Slider(props) {
			return h(
				"div",
				{ className: "dshlg-slider" },
				h("input", {
					type: "range",
					min: props.min,
					max: props.max,
					step: props.step || 1,
					value: props.value,
					onChange: function (event) {
						props.onChange(Number(event.target.value));
					},
				}),
				h("span", { className: "dshlg-val" }, props.value + (props.suffix || ""))
			);
		}
		function Btn(props) {
			return h(
				"button",
				{
					type: "button",
					className: "dshlg-btn" + (props.variant ? " is-" + props.variant : ""),
					disabled: !!props.disabled,
					onClick: props.onClick,
				},
				props.children
			);
		}
		function Notice(props) {
			return h("div", { className: "dshlg-note" + (props.kind ? " is-" + props.kind : "") }, props.text);
		}

		/* ------------------------------------------------------------------ *
		 * toolbar (shell.overlay slot)
		 * ------------------------------------------------------------------ */
		function LiquidToolbar(props) {
			const snap = useSnap();
			const t = mkT(props);
			const p = snap.prefs;
			const inputRef = React.useRef(null);
			const onPick = function (event) {
				const files = event.target.files;
				if (files && files.length) addFiles(files);
				event.target.value = "";
			};
			const fab = h(
				"button",
				{
					type: "button",
					className: "dshlg-fab dshlg-surface" + (isGlassActive() ? "" : " is-off"),
					title: t("glass") + " · Ctrl+Alt+G",
					onClick: function () {
						store.setPrefs({ glassEnabled: !p.glassEnabled, toolbarOpen: true });
						store.set({ sessionDisabled: false }, { persist: false });
					},
				},
				h("span", null, isGlassActive() ? "✦" : "✧")
			);
			if (!p.toolbarOpen) {
				return h("div", { className: "dshlg-bar" }, fab, h("input", { ref: inputRef, type: "file", accept: ".mpkg,.pkg,.zip,video/*,image/*,.html", multiple: true, style: { display: "none" }, onChange: onPick }));
			}
			const active = snap.active;
			return h(
				"div",
				{ className: "dshlg-bar" },
				h(
					Surface,
					{ className: "dshlg-panel" },
					h(Row, { label: t("glassOn") }, h(Switch, { checked: p.glassEnabled, onChange: function (v) { store.setPrefs({ glassEnabled: v }); store.set({ sessionDisabled: false }, { persist: false }); } })),
					h(Row, { label: t("wallpaperOn"), hint: active ? active.name : t("none") }, h(Switch, { checked: p.wallpaperEnabled, onChange: function (v) { store.setPrefs({ wallpaperEnabled: v }); } })),
					h("div", { className: "dshlg-sep" }),
					h(Row, { label: t("blur") }, h(Slider, { value: p.blur, min: 0, max: 48, onChange: function (v) { store.setPrefs({ blur: v }); }, suffix: "px" })),
					h(Row, { label: t("refract") }, h(Slider, { value: p.refract, min: 0, max: 90, onChange: function (v) { store.setPrefs({ refract: v }); } })),
					h("div", { className: "dshlg-sep" }),
					h(
						"div",
						{ className: "dshlg-row" },
						h(Btn, { variant: "primary", onClick: function () { if (inputRef.current) inputRef.current.click(); } }, "⬆ " + t("pick")),
						h(Btn, { onClick: function () { store.setPrefs({ toolbarOpen: false }); } }, t("close"))
					),
					h("div", { className: "dshlg-hint" }, t("settingsPath")),
					h("input", { ref: inputRef, type: "file", accept: ".mpkg,.pkg,.zip,video/*,image/*,.html", multiple: true, style: { display: "none" }, onChange: onPick })
				),
				fab
			);
		}

		/* ------------------------------------------------------------------ *
		 * settings page (settings.section slot)
		 * ------------------------------------------------------------------ */
		function LiquidGlassSettings(props) {
			const snap = useSnap();
			const t = mkT(props);
			const p = snap.prefs;
			const inputRef = React.useRef(null);
			const [over, setOver] = React.useState(false);
			React.useEffect(function () {
				loadWallpapers();
			}, []);
			const caps = snap.caps || {};
			const preset = function (id) {
				store.setPrefs({ preset: id });
			};
			const seg = function (options, value, onChange) {
				return h(
					"div",
					{ className: "dshlg-seg" },
					options.map(function (option) {
						return h(
							"button",
							{
								key: option.value,
								type: "button",
								className: value === option.value ? "is-on" : "",
								onClick: function () {
									onChange(option.value);
								},
							},
							option.label
						);
					})
				);
			};
			const chip = function (label, ok) {
				return h("span", { key: label, className: "dshlg-chip" + (ok === true ? " is-yes" : ok === false ? " is-no" : "") }, label);
			};
			const active = snap.active;
			const preview = function () {
				if (!active) return h("div", { className: "dshlg-note" }, t("empty"));
				const inner =
					active.kind === "video"
						? h("video", { src: active.url, muted: true, loop: true, autoPlay: true, playsInline: true })
						: active.kind === "image"
							? h("img", { src: active.url, alt: "" })
							: h("iframe", { srcDoc: active.html || "", sandbox: "allow-scripts", scrolling: "no" });
				return h("div", { className: "dshlg-preview" }, inner);
			};
			const entries = function (list) {
				if (!list.length) return null;
				return h(
					"div",
					{ className: "dshlg-list" },
					list.map(function (meta) {
						const isActive = p.activeWallpaperId === meta.id;
						return h(
							"div",
							{ key: meta.id, className: "dshlg-item" + (isActive ? " is-active" : "") },
							h(
									"div",
									{ className: "dshlg-thumb" },
									/* only the active entry owns a blob URL — never render an empty-src <video> */
									isActive && active && active.url ? (
										meta.kind === "video" ? (
											h("video", { src: active.url, muted: true, autoPlay: true, playsInline: true })
										) : meta.kind === "web" ? (
											h("span", { className: "dshlg-thumb-tag" }, "HTML")
										) : (
											h("img", { src: active.url, alt: "" })
										)
									) : (
										h("span", { className: "dshlg-thumb-tag" }, (extOf(meta.mediaName || meta.name) || "?").toUpperCase())
									)
								),
							h(
								"div",
								{ className: "dshlg-meta" },
								h("span", { className: "dshlg-name" }, meta.name),
								h("span", { className: "dshlg-sub" }, meta.kind + " · " + fmtBytes(meta.size) + " · " + (meta.mediaName || "")),
								meta.declaredType ? h("span", { className: "dshlg-sub" }, "Wallpaper Engine type: " + meta.declaredType) : null,
								meta.notes && meta.notes.length ? h("span", { className: "dshlg-sub" }, meta.notes.join("；")) : null
							),
							h(
								"div",
								{ className: "dshlg-row-ctl" },
								isActive ? h("span", { className: "dshlg-chip is-yes" }, t("inUse")) : h(Btn, { onClick: function () { activateWallpaper(meta.id); } }, t("use")),
								h(Btn, { variant: "danger", onClick: function () { removeWallpaper(meta.id); } }, t("del"))
							)
						);
					})
				);
			};
			const onDrop = function (event) {
				event.preventDefault();
				setOver(false);
				if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length) addFiles(event.dataTransfer.files);
			};
			return h(
				"div",
				{ className: "dshlg-page" },
				h("h2", null, t("title")),
				h("p", { className: "dshlg-desc" }, t("intro")),
				snap.notice ? h(Notice, { text: snap.notice, kind: snap.noticeKind }) : null,
				h(
					Surface,
					{ className: "dshlg-card" },
					h("h3", { className: "dshlg-card-title" }, t("glass")),
					h(Row, { label: t("glassOn"), hint: t("glassHint") }, h(Switch, { checked: p.glassEnabled, onChange: function (v) { store.set({ sessionDisabled: false }, { persist: false }); store.setPrefs({ glassEnabled: v }); } })),
					h(Row, { label: t("refraction"), hint: t("refractionHint") }, h(Switch, { checked: p.refraction, onChange: function (v) { store.setPrefs({ refraction: v }); } })),
					h(
						Row,
						{ label: t("refractMode"), hint: t("refractModeHint") },
						seg(
							[
								{ value: "auto", label: t("refractAuto") },
								{ value: "edge", label: t("refractEdge") },
							],
							p.refractMode === "edge" ? "edge" : "auto",
							function (v) { store.setPrefs({ refractMode: v }); }
						)
					),
					h(Row, { label: t("sidebar") }, h(Switch, { checked: p.glassSidebar, onChange: function (v) { store.setPrefs({ glassSidebar: v }); } })),
					h(Row, { label: t("bubbles"), hint: t("bubblesHint") }, h(Switch, { checked: p.glassBubbles, onChange: function (v) { store.setPrefs({ glassBubbles: v }); } })),
					h(Row, { label: t("toolbarShow"), hint: t("toolbarShowHint") }, h(Switch, { checked: p.toolbarEnabled, onChange: function (v) { store.setPrefs({ toolbarEnabled: v }); } }))
				),
				h(
					Surface,
					{ className: "dshlg-card" },
					h("h3", { className: "dshlg-card-title" }, t("look")),
					h(Row, { label: t("blur") }, h(Slider, { value: p.blur, min: 0, max: 48, onChange: function (v) { store.setPrefs({ blur: v }); }, suffix: "px" })),
					h(Row, { label: t("refract") }, h(Slider, { value: p.refract, min: 0, max: 90, onChange: function (v) { store.setPrefs({ refract: v }); } })),
					h(Row, { label: t("saturate") }, h(Slider, { value: p.saturate, min: 100, max: 260, onChange: function (v) { store.setPrefs({ saturate: v }); }, suffix: "%" })),
					h(Row, { label: t("brightness") }, h(Slider, { value: p.brightness, min: 80, max: 140, onChange: function (v) { store.setPrefs({ brightness: v }); }, suffix: "%" })),
					h(Row, { label: t("tint") }, h(Slider, { value: p.tint, min: 6, max: 80, onChange: function (v) { store.setPrefs({ tint: v }); }, suffix: "%" })),
					h(Row, { label: t("scrim"), hint: t("scrimHint") }, h(Slider, { value: p.scrim, min: 0, max: 92, onChange: function (v) { store.setPrefs({ scrim: v }); }, suffix: "%" })),
					h(Row, { label: t("seat") }, h(Slider, { value: p.seat, min: 0, max: 100, onChange: function (v) { store.setPrefs({ seat: v }); }, suffix: "%" }))
				),
				h(
					Surface,
					{ className: "dshlg-card" },
					h("h3", { className: "dshlg-card-title" }, t("spotlight")),
					h("p", { className: "dshlg-desc" }, t("spotlightHint")),
					h(Row, { label: t("spotlightOn") }, h(Switch, { checked: p.spotlight, onChange: function (v) { store.setPrefs({ spotlight: v }); } })),
					h(Row, { label: t("spotSize") }, h(Slider, { value: p.spotSize, min: 120, max: 900, step: 10, onChange: function (v) { store.setPrefs({ spotSize: v }); }, suffix: "px" })),
					h(Row, { label: t("spotStrength") }, h(Slider, { value: p.spotStrength, min: 0, max: 100, onChange: function (v) { store.setPrefs({ spotStrength: v }); }, suffix: "%" }))
				),
				h(
					Surface,
					{ className: "dshlg-card" },
					h("h3", { className: "dshlg-card-title" }, t("background")),
					h("p", { className: "dshlg-desc" }, t("backgroundHint")),
					h(Row, { label: t("preset") }, seg([
						{ value: "aurora", label: t("presetAurora") },
						{ value: "dawn", label: t("presetDawn") },
						{ value: "ocean", label: t("presetOcean") },
						{ value: "mono", label: t("presetMono") },
					], p.preset, preset)),
					h(Row, { label: t("hue") }, h(Slider, { value: p.hue, min: 0, max: 360, step: 2, onChange: function (v) { store.setPrefs({ hue: v }); }, suffix: "°" }))
				),
				h(
					Surface,
					{ className: "dshlg-card" },
					h("h3", { className: "dshlg-card-title" }, t("wallpaper")),
					h(Row, { label: t("wallpaperOn") }, h(Switch, { checked: p.wallpaperEnabled, onChange: function (v) { store.setPrefs({ wallpaperEnabled: v }); } })),
					h(Row, { label: t("fit") }, seg([
						{ value: "cover", label: t("fitCover") },
						{ value: "contain", label: t("fitContain") },
						{ value: "fill", label: t("fitFill") },
					], p.wpFit, function (v) { store.setPrefs({ wpFit: v }); })),
					preview(),
					h(Row, { label: t("dim") }, h(Slider, { value: p.wpDim, min: 0, max: 90, onChange: function (v) { store.setPrefs({ wpDim: v }); }, suffix: "%" })),
					h(Row, { label: t("wpBlur") }, h(Slider, { value: p.wpBlur, min: 0, max: 40, onChange: function (v) { store.setPrefs({ wpBlur: v }); }, suffix: "px" })),
					h(Row, { label: t("wpBright") }, h(Slider, { value: p.wpBright, min: 40, max: 140, onChange: function (v) { store.setPrefs({ wpBright: v }); }, suffix: "%" })),
					h(
						"div",
						{
							className: "dshlg-drop" + (over ? " is-over" : ""),
							onClick: function () { if (inputRef.current) inputRef.current.click(); },
							onDragOver: function (event) { event.preventDefault(); setOver(true); },
							onDragLeave: function () { setOver(false); },
							onDrop: onDrop,
						},
						h("div", null, snap.busy ? t("reading") + " " + snap.busy : t("drop")),
						h(Btn, { variant: "primary" }, "⬆ " + t("upload")),
						h("div", { className: "dshlg-hint" }, t("uploadHint"))
					),
					h("input", { ref: inputRef, type: "file", accept: ".mpkg,.pkg,.zip,video/*,image/*,.html", multiple: true, style: { display: "none" }, onChange: function (event) { if (event.target.files && event.target.files.length) addFiles(event.target.files); event.target.value = ""; } }),
					entries(snap.wallpapers)
				),
				h(
					Surface,
					{ className: "dshlg-card" },
					h("h3", { className: "dshlg-card-title" }, t("advanced")),
					h(Row, { label: t("extras"), hint: t("extrasHint") }),
					h("input", {
						className: "dshlg-field dshlg-mono",
						placeholder: "[data-conversation-tabs], [data-queue-dock]",
						value: p.extraSelectors,
						onChange: function (event) { store.setPrefs({ extraSelectors: event.target.value }); },
					})
				),
				h(
					Surface,
					{ className: "dshlg-card" },
					h("h3", { className: "dshlg-card-title" }, t("diagnostics")),
					h(
						"div",
						{ className: "dshlg-chips" },
						chip("backdrop-filter", !!caps.backdropFilter),
						chip("url(#) refraction", !!caps.refractFilter),
						chip("color-mix", !!caps.colorMix),
						chip("mask-image", !!caps.spotMask),
						chip("DecompressionStream", !!caps.deflate),
						chip("IndexedDB", !!caps.idb),
						chip("mp4", !!caps.mp4),
						chip("webm", !!caps.webm)
					),
					h(Row, { label: t("surfaces"), hint: (snap.stats.surfaces || []).join(", ") || t("none") }, h("span", { className: "dshlg-val" }, String((snap.stats.surfaces || []).length))),
					h(Row, { label: t("refractMode"), hint: snap.stats.mode === "svg" ? t("refractSvg") : snap.stats.mode === "edge" ? t("refractEdge") : t("none") }),
					h(Row, { label: t("active"), hint: active ? active.kind + " · " + active.name : t("none") }),
					h(
						Row,
						{
							label: t("backdrop"),
							hint: snap.stats.backdrop && snap.stats.backdrop.cleared
								? t("backdropCleared") + ": " + (snap.stats.backdrop.names || []).join(", ")
								: t("backdropHint")
						},
						h(
							"span",
							{ className: "dshlg-val" },
							snap.stats.backdrop && snap.stats.backdrop.layer
								? (snap.stats.backdrop.preset || "-") +
									" · " + (snap.stats.backdrop.media || t("none")) +
									" · " + String(snap.stats.backdrop.cleared)
								: t("backdropNone")
						)
					),
					h("div", { className: "dshlg-sep" }),
					h(
						"div",
						{ className: "dshlg-row" },
						h(Btn, { onClick: function () { store.set({ caps: detectCaps() }, { persist: false }); refreshBackdrop(); scheduleRefresh(); } }, t("recheck")),
						h(Btn, { onClick: function () { const prefs = readPrefs(); store.set({ prefs: Object.assign({}, DEFAULTS, { activeWallpaperId: prefs.activeWallpaperId }) }); applyPrefs(); } }, t("reset")),
						h(Btn, { variant: "danger", onClick: function () { clearWallpapers(); const metas = []; store.set({ wallpapers: metas }, { persist: false }); } }, t("clear"))
					),
					h("div", { className: "dshlg-hint" }, t("shortcut"))
				)
			);
		}

		/* ------------------------------------------------------------------ *
		 * runtime install / teardown
		 * ------------------------------------------------------------------ */
		function installRuntime() {
			document.documentElement.classList.add("dsh-lg-host");
			const caps = detectCaps();
			store.set({ caps: caps }, { persist: false });
			ensureSvgFilter();
			const onKey = function (event) {
				if (!event.ctrlKey || !event.altKey) return;
				const key = String(event.key || "").toLowerCase();
				if (key === "g") {
					event.preventDefault();
					store.setPrefs({ glassEnabled: !store.snapshot.prefs.glassEnabled });
					store.set({ sessionDisabled: false }, { persist: false });
				} else if (key === "b") {
					event.preventDefault();
					store.setPrefs({ toolbarEnabled: !store.snapshot.prefs.toolbarEnabled });
				}
			};
			window.addEventListener("keydown", onKey, true);
			const onSpotLeave = function (event) {
				if (!event || !event.relatedTarget) parkSpot();
			};
			window.addEventListener("pointermove", onSpotMove, { passive: true });
			window.addEventListener("pointerdown", onSpotMove, { passive: true });
			window.addEventListener("mouseout", onSpotLeave, true);
			window.addEventListener("blur", parkSpot);
			try {
				const q = new URL(window.location.href).searchParams.get("dshlg");
				if (q === "off") store.set({ sessionDisabled: true }, { persist: false });
			} catch (error) {}
			applyPrefs();
			stampChrome();
			refreshSurfaces();
			observer = new MutationObserver(function () {
				scheduleRefresh();
			});
			observer.observe(document.body, { childList: true, subtree: true });
			const timer = window.setInterval(scheduleRefresh, 4000);
			return function () {
				window.clearInterval(timer);
				window.removeEventListener("keydown", onKey, true);
				window.removeEventListener("pointermove", onSpotMove);
				window.removeEventListener("pointerdown", onSpotMove);
				window.removeEventListener("mouseout", onSpotLeave, true);
				window.removeEventListener("blur", parkSpot);
				parkSpot();
				if (observer) observer.disconnect();
				observer = null;
				const layer = document.getElementById(BACKDROP_ID);
				if (layer) layer.remove();
				const svg = document.getElementById(SVG_ID);
				if (svg) svg.remove();
				svgFilter = null;
				releaseMedia();
				document.documentElement.classList.remove("dsh-lg-on", "dsh-lg-refract", "dsh-lg-host");
				for (const el of Array.from(document.querySelectorAll("[data-dshlg-glass]"))) unmark(el);
			};
		}

		const inject = ["slots", "locale"];
		function apply(ctx) {
			pluginCtx = ctx;
			ctx.effect(function () {
				return ctx.locale.register(NS, { zh: DICT.zh, en: DICT.en });
			}, PKG + ": dictionaries");
			ctx.effect(function () {
				return installRuntime();
			}, PKG + ": runtime");
			ctx.slots.inject("shell.overlay", function () {
				return ctx.slots.register(
					{
						name: "shell.overlay",
						id: "liquid-glass-toolbar",
						order: 40,
						locale: NS,
						label: function () {
							return tr("toolbar");
						},
						inject: function () {
							return { prefs: store };
						},
					},
					LiquidToolbar
				);
			});
			ctx.slots.inject("settings.section", function () {
				return ctx.slots.register(
					{
						name: "settings.section",
						id: "liquid-glass",
						order: 16,
						locale: NS,
						label: function () {
							return tr("nav");
						},
					},
					LiquidGlassSettings
				);
			});
		}

		exports.name = PKG;
		exports.NS = NS;
		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	},
});