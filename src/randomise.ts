import { LinkItem } from "./types/app";

function getStorageKeyName(heading: string) {
    return "linksAlreadyOpened_" + heading;;
}

function getLinksAlreadyOpened(heading: string): string[] {
    let storageKeyName = getStorageKeyName(heading);
    let str = sessionStorage.getItem(storageKeyName);
    let alreadyOpened = (str == null) ? [] : JSON.parse(str);
    return alreadyOpened;
}

export function getNumLinksOpened(heading: string) {
    return getLinksAlreadyOpened(heading).length;
}

export function pickRandomLink(items: LinkItem[], heading: string): [string, number] {

    // Get "links already opened" from sessionStorage
    let alreadyOpened = getLinksAlreadyOpened(heading);

    // Build a list of all the links
    let allLinks = items.filter(z => !!z.link).map(z => z.link);

    // Remove any links which have already been opened
    let linksMinusOpened = allLinks.filter(link => !alreadyOpened.includes(link));

    // If there aren't any links left (i.e. if all links have already been opened)
    // then clear the list and start again
    //let allDone = false;
    if (linksMinusOpened.length == 0) {
        linksMinusOpened = allLinks;
        alreadyOpened = [];
        //allDone = true;
    }

    // Pick an item at random
    let index = Math.floor(Math.random() * linksMinusOpened.length);
    let link = linksMinusOpened[index];

    // Add the item to the "already opened" list
    // and save it back to sessionStorage
    alreadyOpened.push(link);
    let storageKeyName = getStorageKeyName(heading);
    sessionStorage.setItem(storageKeyName, JSON.stringify(alreadyOpened));

    return [link, alreadyOpened.length];
}