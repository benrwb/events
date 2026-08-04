export interface BaseItem {
    id: string; // uuid
    lastUpdate: number; // added when saving
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
    schoolHolidays: boolean;
    status: string;
    showNotesOnTimeline: boolean;
}

export interface TimelineWithHeadings {
    [key: string]: TimelineItem[];
}

export interface LinksWithHeadings {
    [key: string]: LinkItem[];
}

// Union type for items handled by the store
export type AppItem = TimelineItem | LinkItem;
