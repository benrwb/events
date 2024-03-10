import { reactive } from "vue";

export const store = reactive({

    search: "",
    
    eventTypes: {
        "Special occasion": "🎂",
        "Restaurant": "🍽️",
        "Film": "🎬",
        "Live Entertainment": "🎭",
        "Music": "🎵",
        "Excursion": "🚶‍",
        "Holiday - Abroad": "🌞",
        "Holiday - UK": "🇬🇧"
    },
    statusList: {
        "": "",
        "Going": "✔",
        "Interested": "⭐",
        "Need to book": "🎟",
        "Went":"🙂",
        "Didn't go": "🙁"
    },

    linkTypes: {
        "Ticket sales": "🎫",
        "Event listings": "📰",
        "Venue": "🏛",
        "Restaurants": "🍽️",
        "Holidays": "🌞",
        "Transport": "🚇",
        //"Information": "ℹ",
        //"Other": "💡"
    }

});