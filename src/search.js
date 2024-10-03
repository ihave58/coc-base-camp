import path from "path";
import cv from "@u4/opencv4nodejs";
import {Map_Directory_Path} from "./paths";
import {match} from "./match";

const search = (searchFilePath) => {
    const searchImageFile = cv.imread(searchFilePath, cv.IMREAD_UNCHANGED);

    match(searchImageFile)
}

const SEARCH_FILE_PATH = path.join(Map_Directory_Path, "map_test1.jpg");
search(SEARCH_FILE_PATH);
