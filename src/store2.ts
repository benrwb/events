import { ref, readonly, watch } from 'vue';


const STORAGE_KEY = 'eventsTimelineData';

// Module-scoped state: persistent across the app lifetime
const _timeline_items = ref(loadInitialData());

function loadInitialData(): [] {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (err) {
        console.error('Error loading timeline from localStorage:', err);
        return [];
    }
}

// Persist automatically whenever items change
watch(
    _timeline_items,
    (newItems) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
        } catch (err) {
            console.error('Error saving timeline to localStorage:', err);
        }
    },
    { deep: true }
);

export function useTimelineStore() {
    // Actions
    // function addItem(newItem) {
    //     _timeline_items.value.push(newItem);
    // }

    // function updateItem(updatedItem) {
    //     const index = _timeline_items.value.findIndex((i) => i.id === updatedItem.id);
    //     if (index !== -1) {
    //         _timeline_items.value[index] = updatedItem;
    //     }
    // }

    // Called by Dropbox sync after merging remote and local data
    function replaceTimeline(newItems) {
        _timeline_items.value = newItems;
    }

    return {
        // Read-only state to prevent components mutating array without actions
        items: readonly(_timeline_items),
        // addItem,
        // updateItem,
        replaceTimeline,
    };
}