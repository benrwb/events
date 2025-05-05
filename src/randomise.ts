import { LinkItem } from "./types/app";

export function pickRandomLink(items: LinkItem[], heading: string): string {

    let storageKeyName = "linksAlreadyOpened_" + heading;

    // Get "links already opened" from sessionStorage
    let str = sessionStorage.getItem(storageKeyName);
    let alreadyOpened = (str == null) ? [] : JSON.parse(str);

    // Build a list of all the links
    let allLinks = items.filter(z => !!z.link).map(z => z.link);

    // Remove any links which have already been opened
    let linksMinusOpened = allLinks.filter(link => !alreadyOpened.includes(link));

    // If there aren't any links left (i.e. if all links have already been opened)
    // then clear the list and start again
    if (linksMinusOpened.length == 0) {
        linksMinusOpened = allLinks;
        alreadyOpened = [];
    }

    // Pick an item at random
    let index = Math.floor(Math.random() * linksMinusOpened.length);
    let link = linksMinusOpened[index];

    // Add the item to the "already opened" list
    // and save it back to sessionStorage
    alreadyOpened.push(link);
    sessionStorage.setItem(storageKeyName, JSON.stringify(alreadyOpened));

    return link;
}