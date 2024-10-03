import {readdirSync} from "fs";
import path from "path";
import cv from "@u4/opencv4nodejs";
import {Map_Directory_Path, Model_Directory_Path} from "./paths.js";

const getAllMaps = () => {
    const mapPaths = readdirSync(Map_Directory_Path);
    const filteredMapPaths = mapPaths.filter(mapPath => mapPath.endsWith(".jpg"));

    return filteredMapPaths.map(mapName => {
        const absoluteMapPath = path.join(Map_Directory_Path, mapName);
        const mapImage = cv.imread(absoluteMapPath, cv.IMREAD_UNCHANGED);

        return {
            mapImage,
            mapName
        }
    });
}

const getAllModels = () => {
    const modelPaths = readdirSync(Model_Directory_Path);
    const filteredModelPaths = modelPaths.filter(modelPath => modelPath.endsWith(".jpg"));

    return filteredModelPaths.map(modelPath => {
        const absoluteModelPath = path.join(Model_Directory_Path, modelPath);

        return cv.imread(absoluteModelPath, cv.IMREAD_UNCHANGED)
    });
}

const writeMatches = (matches = [], method, mapImage, mapName) => {
    const resultImage = mapImage.copy();

    matches.forEach((match) => {
        const {model, modelMatch} = match;

        const result = cv.minMaxLoc(modelMatch);
        let matchRectangle;

        if (method === 0 || method === 1 || method === 2) {
            matchRectangle = new cv.Rect(result.minLoc.x, result.minLoc.y, model.cols, model.rows);
        } else {
            matchRectangle = new cv.Rect(result.maxLoc.x, result.maxLoc.y, model.cols, model.rows);
        }

        resultImage.drawRectangle(matchRectangle, new cv.Vec3(255, 0, 0), 2);
    })

    cv.imwrite(`./matches/${method}-${mapName}`, resultImage);
}

const match = () => {
    const allMaps = getAllMaps();
    const allModels = getAllModels();

    for (const {mapImage, mapName} of allMaps) {
        for (const method of [4, 5]) {
            const allModelsMatchInfo = [];

            for (const model of allModels) {
                const modelMatch = mapImage.matchTemplate(model, method);

                allModelsMatchInfo.push({
                    model,
                    mapName,
                    method,
                    modelMatch
                });
            }

            writeMatches(allModelsMatchInfo, method, mapImage, mapName);
        }
    }
}

export {
    match
}
