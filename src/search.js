import cv from "@u4/opencv4nodejs";
import path from "path";
import {Map_Directory_Path} from "./utils/paths.js";

const search = (searchFilePath) => {
    const searchImageFile = cv.imread(searchFilePath, cv.IMREAD_UNCHANGED);


}

const SEARCH_FILE_PATH = path.join(Map_Directory_Path, "map_test1.jpg");
search(SEARCH_FILE_PATH);
