import fs from "fs";
import {EPT_DIR} from "./constants";
import path from "path";

function getPaths() {
    return fs.readdirSync(path.join(EPT_DIR,"bin"))
}

export {
    getPaths
}