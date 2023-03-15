import fs from "fs";
import {EPT_DIR} from "./constants";
import path from "path";

function getPaths() {
    const p=path.join(EPT_DIR,"bin")
    if(!fs.existsSync(p)) return []
    return fs.readdirSync(p)
}

export {
    getPaths
}