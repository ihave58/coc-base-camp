import {readdirSync} from "fs";
import path from "path";
import fs from "fs";
import cv from "@u4/opencv4nodejs";
import {Map_Directory_Path, Model_Directory_Path, Index_Directory_Path} from "../utils/paths.js";

const getAllMaps = () => {
    const mapPaths = readdirSync(Map_Directory_Path);
    const filteredMapPaths = mapPaths.filter(mapPath => mapPath.endsWith(".jpg"));

    return filteredMapPaths.map(mapName => {
        const absoluteMapPath = path.join(Map_Directory_Path, mapName);
        const mapImage = cv.imread(absoluteMapPath, cv.IMREAD_UNCHANGED);

        return {
            mapImage,
            mapName
        };
    }).slice(0, 3);
}

const getAllModels = () => {
    const modelPaths = readdirSync(Model_Directory_Path);
    const filteredModelPaths = modelPaths.filter(modelPath => modelPath.endsWith(".jpg"));

    return filteredModelPaths.map(modelPath => {
        const absoluteModelPath = path.join(Model_Directory_Path, modelPath);

        return cv.imread(absoluteModelPath, cv.IMREAD_UNCHANGED);
    });
}

const writeMapIndex = (mapIndexes = [], mapName) => {
    const matchLocations = [];

    for (const {model, modelMatch} of mapIndexes) {
        const result = cv.minMaxLoc(modelMatch);

        const matchLocation = {
            x: result.maxLoc.x,
            y: result.maxLoc.y,
            model
        };

        matchLocations.push(matchLocation);
    }

    const content = JSON.stringify(matchLocations);
    const filePath = path.join(Index_Directory_Path, `${mapName}.json`);

    fs.writeFileSync(filePath, content);
}

const buildMapIndexes = () => {
    const allMaps = getAllMaps();
    const allModels = getAllModels();

    for (const {mapImage, mapName} of allMaps) {
        const mapMatches = [];

        for (const model of allModels) {
            const modelMatch = mapImage.matchTemplate(model, 5);

            mapMatches.push({
                model,
                modelMatch
            });
        }

        writeMapIndex(mapMatches, mapName);
    }
}


export {
    buildMapIndexes,
}
