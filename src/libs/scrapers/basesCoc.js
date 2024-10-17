import { remote } from 'webdriverio';
import { writeFileSync, readFileSync } from 'fs';
import { Map_Directory_Path, Layout_Editor_Path } from '../../utils/paths.js';
import path from 'path';

const capabilities = {
    'platformName': 'Android',
    'appium:noReset': true,
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': 'adb-KR85YXUOQCTK4LZT-RoK5aQ._adb-tls-connect._tcp',
    'appium:platformVersion': '14.0',
    'appium:appPackage': 'com.supercell.clashofclans',
    'appium:appActivity': 'com.supercell.titan.GameApp',
};

const options = {
    hostname: '127.0.0.1', port: 4723, logLevel: 'info', capabilities,
};

const tapByElement = async (driver, element) => {
    const elCoordinates = await element.getLocation();
    const elSize = await element.getSize();

    const x = Math.floor(elCoordinates.x) + elSize.width / 2;
    const y = Math.floor(elCoordinates.y) + elSize.height / 2;

    await tapByLocation(driver, x, y);
}

const tapByLocation = async (driver, x, y) => {
    const xInt = Math.floor(x);
    const yInt = Math.floor(y);

    await driver.action('pointer', {
        parameters: {
            pointerType: 'touch',
        }
    }).move({ x: xInt, y: yInt })
        .down()
        .pause(500)
        .up()
        .perform();
}

const drag = async (driver, x1, y1, x2, y2) => {
    await driver.action('pointer', {
        parameters: {
            pointerType: 'touch',
        }
    }).move({ x: x1, y: y1 })
        .down()
        .pause(500)
        .move({ x: x2, y: y2 })
        .pause(500)
        .up()
        .perform()
}

const getMapName = (encodedUrl) => {
    const url = decodeURIComponent(encodedUrl);

    const idString = url.match(/id=.*:.*:(.*)/gm)[0];
    const details = idString.split(':');

    return details[details.length - 1];
}

const waitUntilLoaded = async (driver, statusCheckCallback, pollTime = 4000) => {
    return new Promise(async (resolve) => {
        let hasLoaded = false;

        while (!hasLoaded) {
            await driver.pause(pollTime);

            hasLoaded = await statusCheckCallback(driver);
        }

        resolve(true);
    });
}

const layoutEditorLoadStatusChecker = async (driver) => {
    try {
        const image = readFileSync(Layout_Editor_Path, 'base64');
        const elRef = await driver.findElement('-image', image);

        return !elRef.error;
    } catch {
        return false;
    }
}

const scrap = async () => {
    const driver = await remote(options);

    const mapUrl = 'clashofclans://action=OpenLayout&id=TH16%3AWB%3AAAAAUAAAAAG0vN1DRc6zoJMdJ8GTJLPw';

    try {
        await driver.navigateTo(mapUrl);

        console.log('Testing Layout editor automation...');
        await waitUntilLoaded(driver, layoutEditorLoadStatusChecker);

        console.log('Starting Layout editor automation!');
        await tapByLocation(driver, 1234, 567);

        // Dialog window Okay
        await driver.pause(1000);
        await tapByLocation(driver, 1200, 700);

        // Photo mode view
        await driver.pause(1000);
        await tapByLocation(driver, 2100, 550);

        await driver.pause(1000);
        await drag(driver, 2200, 500, 2200, 600);

        const mapName = getMapName(mapUrl);
        const mapPath = path.join(Map_Directory_Path, `${mapName}.png`);

        await driver.pause(1000);
        await driver.saveScreenshot(mapPath);
    } finally {
        await driver.pause(5000);
        await driver.deleteSession();
    }
}

export {
    scrap
}
