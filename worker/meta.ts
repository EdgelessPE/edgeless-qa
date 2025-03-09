import fs from "node:fs";
import type { Meta } from "../types";
import { getPaths } from "./path";
import { getShortcuts } from "./shortcut";

function genInstalledMeta(installedPath: string): Meta["installed"] {
	return {
		at: installedPath,
		shortcutsAdded: getShortcuts(),
		pathsAdded: getPaths(),
	};
}

function genUninstalledMeta(
	installedPath: string,
	added: string[],
): Meta["uninstalled"] {
	return {
		appRemoved: !fs.existsSync(installedPath),
		appData: added,
	};
}

export { genInstalledMeta, genUninstalledMeta };
