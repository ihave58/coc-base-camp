import { remote } from 'webdriverio';
import { writeFileSync } from 'fs';
import { Map_Directory_Path } from '../../utils/paths.js';
import path from 'path';

const capabilities = {
    'platformName': 'Android',
    'browserName': 'Chrome',
    'appium:noReset': true,
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': 'adb-KR85YXUOQCTK4LZT-RoK5aQ._adb-tls-connect._tcp',
    'appium:platformVersion': '14.0',
    // 'appium:appPackage': 'com.supercell.clashofclans',
    // 'appium:appActivity': 'com.supercell.titan.GameApp',
};

const options = {
    hostname: '127.0.0.1',
    port: 4723,
    logLevel: 'info',
    capabilities,
};

const tapElement = async (driver, element) => {
    const elCoordinates = await element.getLocation();
    const elSize = await element.getSize();

    const x = Math.floor(elCoordinates.x) + elSize.width / 2;
    const y = Math.floor(elCoordinates.y) + elSize.height / 2;

    await tapLocation(driver, x, y);
}

const tapLocation = async (driver, x, y) => {
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

const checkAndAcceptCookies = async (driver) => {
    const el = await driver.$('//*[@id="onetrust-accept-btn-handler"]');

    if (!el.error) {
        await tapElement(driver, el);
        await driver.pause(10000);
    }
}

const scrap = async () => {
    const driver = await remote(options);

    try {
        if (await driver.isLocked()) {
            await driver.unlock();
        }

        await driver.navigateTo('https://link.clashofclans.com/en/?action=OpenLayout&id=TH16%3AWB%3AAAAAUAAAAAG0vN1DRc6zoJMdJ8GTJLPw');

        await driver.pause(1000);
        await checkAndAcceptCookies(driver);

        await driver.pause(1000);
        const linkEl = await driver.$('//*[@id="open-game-button"]');
        await linkEl.click();

        await driver.pause(5000);
        await tapLocation(driver, 1234, 567);

        // const rootEl = await driver.$('//*');
        //
        // const mapPath = path.join(Map_Directory_Path, `game.png`);
        // await rootEl.saveScreenshot(mapPath);
        // await linkEl.click();
        // await driver.pause(5000);
        //
        // console.dir(await driver.getActiveElement());
        // await driver.activateApp('com.supercell.clashofclans');
        // console.dir(await driver.getActiveElement());

        // console.dir(await driver.$('//*[@id="open-game-button"]'));

        // await testEl.click();
        // const mapName = Date.now();
        // const mapPath = path.join(Map_Directory_Path, `${mapName}.png`);
        //
        // await driver.pause(5000);
        // await driver.saveScreenshot(mapPath);
    } finally {
        await driver.pause(5000);
        await driver.deleteSession();
    }
}

export {
    scrap
}
