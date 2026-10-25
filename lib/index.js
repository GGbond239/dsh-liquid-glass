/**
 * dsh-liquid-glass — host (server) half.
 *
 * This half intentionally does very little: every visual and every preference
 * lives in ./client.js (browser half). The host entry exists only so the cordis
 * loader can mount the plugin and the client-modules graph can discover,
 * reconcile and serve the browser half over /plugins.
 *
 * Preferences: localStorage key "dsh-liquid-glass:prefs.v3" (small, synchronous).
 * Wallpaper bytes: IndexedDB database "dsh-liquid-glass.v3" (meta + media stores).
 */

export const name = "dsh-liquid-glass";
export const NS = "ui.liquidGlass";
export const inject = [];

export function apply(ctx) {
	// Nothing to configure on the host side. The plugin needs no host service:
	// wallpaper files are uploaded, parsed and stored entirely in the browser.
}