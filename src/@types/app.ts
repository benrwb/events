export interface BaseItem {
    id: string; // uuid
    category: "Event" | "Link";
    type: string;
    name: string;
    link: string;
    notes: string;
};

export interface LinkItem extends BaseItem {
}

export interface TimelineItem extends BaseItem {
    location: string;
    date: string;
    status: string;
}

export interface TimelineWithHeadings {
    [key: string]: TimelineItem[];
}

export interface LinksWithHeadings {
    [key: string]: LinkItem[];
}