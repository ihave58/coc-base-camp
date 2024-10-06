import {readdirSync} from "fs";
import path from "path";
import fs from "fs";
import cv from "@u4/opencv4nodejs";
import get from "lodash/get.js";

import {Map_Directory_Path, Model_Directory_Path, Match_Directory_Path} from "../utils/paths.js";

const Accuracy_Distance = 100;

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
    });
}

const getAllModels = () => {
    const modelPaths = readdirSync(Model_Directory_Path);
    const filteredModelPaths = modelPaths.filter(modelPath => modelPath.endsWith(".jpg"));

    return filteredModelPaths.map(modelPath => {
        const absoluteModelPath = path.join(Model_Directory_Path, modelPath);
        const modelImage = cv.imread(absoluteModelPath, cv.IMREAD_UNCHANGED);

        return {
            modelImage,
            modelPath
        };
    });
}

const getAllMatches = () => {
    const matchFileNames = readdirSync(Match_Directory_Path);
    const filteredMatchFileNames = matchFileNames.filter(matchFileName => matchFileName.endsWith(".json"));
    const allMatches = {}

    filteredMatchFileNames.forEach(matchFileName => {
        const absoluteMatchFilePath = path.join(Match_Directory_Path, matchFileName);
        const content = fs.readFileSync(absoluteMatchFilePath);

        allMatches[matchFileName] = JSON.parse(content.toString());
    });

    return allMatches;
}

const writeMapMatches = (mapMatches = {}, mapName) => {
    const content = JSON.stringify(mapMatches);
    const filePath = path.join(Match_Directory_Path, `${mapName}.json`);

    fs.writeFileSync(filePath, content);
}

const findMapMatches = (mapImage, models = getAllModels()) => {
    const mapMatches = {};

    for (const model of models) {
        const modelMatch = mapImage.matchTemplate(model.modelImage, 5);
        const result = cv.minMaxLoc(modelMatch);

        mapMatches[model.modelPath] = {
            x: result.maxLoc.x,
            y: result.maxLoc.y,
        };
    }

    return mapMatches;
}

const compareMatches = (sourceMapMatches, targetMapMatches) => {
    const matchingResult = [];

    for (const modelPath in sourceMapMatches) {
        const sourceMapLocation = get(sourceMapMatches, modelPath);
        const targetMapLocation = get(targetMapMatches, modelPath);

        const sourceMapX = get(sourceMapLocation, 'x', Number.NaN);
        const sourceMapY = get(sourceMapLocation, 'y', Number.NaN);

        const targetMapX = get(targetMapLocation, 'x', Number.NaN);
        const targetMapY = get(targetMapLocation, 'y', Number.NaN);

        const distanceX = Math.abs(sourceMapX - targetMapX);
        const distanceY = Math.abs(sourceMapY - targetMapY);

        if (distanceX <= Accuracy_Distance && distanceY <= Accuracy_Distance) {
            matchingResult.push(modelPath);
        }
    }

    return matchingResult;
}

const buildMapMatches = () => {
    const allMaps = getAllMaps();

    for (const map of allMaps) {
        const mapMatches = findMapMatches(map.mapImage);

        writeMapMatches(mapMatches, map.mapName);
    }
}

const searchMap = (searchMapImage) => {
    const searchMapMatches = findMapMatches(searchMapImage);
    const allMatchesMap = getAllMatches();

    for (const matchFileName in allMatchesMap) {
        const matches = allMatchesMap[matchFileName];

        if (Object.entries(searchMapMatches).length === Object.entries(matches).length) {
            const matchingModels = compareMatches(matches, searchMapMatches);

            if (matchingModels.length === Object.entries(searchMapMatches).length) {
                return {
                    matchFileName,
                    matches
                };
            }
        }
    }

    return false;
}

export {
    buildMapMatches,
    searchMap
}
