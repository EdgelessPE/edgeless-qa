import { Result } from "ts-results";
import { MetaResult } from "./bindings/MetaResult";

export interface Task {
  scope: string;
  nepName: string;
  fileName: string;
  download: string;
}

export interface StartRes {
  task: Task;
  eptDownload?: string;
}

interface Meta {
  installed: {
    at: string;
    shortcutsAdded: string[];
    pathsAdded: string[];
  };
  uninstalled: {
    appRemoved: boolean;
    appData: string[];
  };
  nep: MetaResult;
}

export interface EndReq {
  scope: string;
  nepName: string;
  fileName: string;
  result: Result<{ readme: string; meta: Meta }, string>;
}

type ShotStage = "afterInstall" | "onRun" | "afterUninstall";
export interface TakeShotReq {
  scope: string;
  nepName: string;
  fileName: string;
  stage: ShotStage;
}

export interface TakeShotRes {
  fileName: string;
}

export interface StdoutShot {
  pathName: string;
  stdout: string;
}
