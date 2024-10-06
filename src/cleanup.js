import {Match_Directory_Path} from "./utils/paths.js";
import {rmSync, mkdirSync} from "fs";

console.info(`Emptying ${Match_Directory_Path}`);
rmSync(Match_Directory_Path, {
    recursive: true,
    force: true,
});

mkdirSync(Match_Directory_Path);

console.info(`completed!`);
