import { Meta } from "../types";
import { getShortcuts } from "./shortcut";
import { getPaths } from "./path";
import fs from "fs";

function genInstalledMeta(installedPath: string): Meta["installed"] {
  return {
    at: installedPath,
    shortcutsAdded: getShortcuts(),
    pathsAdded: getPaths(),
  };
}

function genUninstalledMeta(
  installedPath: string,
  added: string[]
): Meta["uninstalled"] {
  return {
    appRemoved: !fs.existsSync(installedPath),
    appData: added,
  };
}

export { genInstalledMeta, genUninstalledMeta };
