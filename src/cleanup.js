import {Index_Directory_Path} from "./utils/paths.js";
import {rmSync, mkdirSync} from "fs";

console.info(`Emptying ${Index_Directory_Path}`);
rmSync(Index_Directory_Path, {
    recursive: true,
    force: true,
});

mkdirSync(Index_Directory_Path);

console.info(`completed!`);
