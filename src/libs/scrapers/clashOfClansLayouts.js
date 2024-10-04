import fetch from "node-fetch";
import {parse} from "node-html-parser";
import {writeFileSync} from "fs";

const baseUrl = 'https://clashofclans-layouts.com';
const pageBaseUrl = `${baseUrl}/plans/th_16/`;

const fetchMapUrl = async (relativeMapPageUrl) => {
    if (!relativeMapPageUrl) {
        throw new Error("Missing relativeMapPageUrl");
    }

    const mapPageUrl = `${baseUrl}${relativeMapPageUrl}`;
    const response = await fetch(mapPageUrl);

    if (!response.ok) {
        console.error(response.statusText, mapPageUrl);
    }

    const html = await response.text();
    const root = parse(html);

    const mapUrlElement = root.querySelector("a[data-fancybox='images']");
    const relativeMapUrl = mapUrlElement.getAttribute("href");

    return `${baseUrl}${relativeMapUrl}`;
}

const fetchPage = async (pageUrl) => {
    if (!pageUrl) {
        throw new Error("Missing pageUrl");
    }

    console.info(`Fetching page: ${pageUrl}`);
    const response = await fetch(pageUrl);

    if (!response.ok) {
        throw new Error(response.statusText);
    }
    const html = await response.text();
    const root = parse(html);

    const mapElements = root.querySelectorAll(".base_grid_item > a");
    const mapPageLinks = mapElements.map(mapElement => mapElement.getAttribute("href"));
    const mapLinks = [];

    for (const mapPageLink of mapPageLinks) {
        const mapLink = await fetchMapUrl(mapPageLink);

        mapLinks.push(mapLink);
    }

    return mapLinks;
}

const fetchPages = async (pageBaseUrl) => {
    if (!pageBaseUrl) {
        throw new Error("Missing pageBaseUrl");
    }

    console.info(`Fetching homepage: ${pageBaseUrl}`);
    const response = await fetch(pageBaseUrl);

    if (!response.ok) {
        throw new Error(response.statusText);
    }
    const html = await response.text();
    const root = parse(html);

    const paginationElements = root.querySelectorAll(".pagination_pages > .pages > a");
    const relativePageLinks = paginationElements.map(paginationElement => paginationElement.getAttribute("href"));

    return relativePageLinks.map(pageLink => `${baseUrl}${pageLink}`);
}

const getMapUrls = async () => {
    const pageUrls = await fetchPages(pageBaseUrl);
    let allMapUrls = [];

    for (const pageUrl of pageUrls) {
        const mapUrls = await fetchPage(pageUrl);

        allMapUrls = [
            ...allMapUrls,
            ...mapUrls
        ];
    }

    return allMapUrls;
}

const scrap = async () => {
    const allMapUrls = await getMapUrls();

    for (const mapUrl of allMapUrls) {
        try {
            console.info(mapUrl);

            const response = await fetch(mapUrl);
            const content = await response.buffer();

            const fileName = Date.now();
            writeFileSync(`./maps/${fileName}.jpg`, content);
        } catch (error) {
            console.error(error)
        }

    }
}

export {
    scrap
}
