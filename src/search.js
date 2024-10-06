import cv from "@u4/opencv4nodejs";
import path from "path";
import {searchMap} from "./libs/mapHelper.js";
import {Map_Directory_Path} from "./utils/paths.js";

const search = (searchFilePath) => {
    const searchImageFile = cv.imread(searchFilePath, cv.IMREAD_UNCHANGED);
    const response = searchMap(searchImageFile);

    console.dir(response);
}

const SEARCH_FILE_PATH = path.join(Map_Directory_Path, "1728043231277.jpg");
search(SEARCH_FILE_PATH);
