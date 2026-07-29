import { reactive, watch } from "vue";

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
        "Holiday - UK": "🇬🇧",
        "Tech": "💻",
    },
    statusList: {
        "": "",
        "Going": "✔",
        "Interested": "⭐",
        "Unlikely": "⬇️",
        "Need to book": "🎟",
        "Went":"🙂",
        "Didn't go": "🙁"
    },

    linkTypes: {
        //"Ticket sales": "🎫",
        "Event listings": "📰",
        "Venue": "🏛",
        "Restaurants": "🍽️",
        "Holidays": "🌞",
        "Transport": "🚇",
        //"Information": "ℹ",
        //"Other": "💡"
    },

    convertMarkdownToHtml: function (text) {
        // https://github.com/showdownjs/showdown/wiki/Showdown-options
        var converter = new showdown.Converter({ 
            tables: true, // enable support for tables
            openLinksInNewWindow: store.openLinksInNewWindow,
            simpleLineBreaks: true,
            // KNOWN ISSUE: Some line breaks aren't preserved,
            //              e.g. inside of ~~strikethough~~ or ***bold+italic***
            strikethrough: true,
            simplifiedAutoLink: true
        });
        return converter.makeHtml(text);
    },

    openLinksInNewWindow: !localStorage.getItem("events_openLinksInSameWindow") // note opposite name ('Same' vs 'New')
});

watch(() => store.openLinksInNewWindow, (newVal) => {
    // Note the checkbox value and localStorage are opposites ('New' vs 'Same').
    // This is because the default localStorage value is `false` (missing value)
    // whereas we want the default checkbox value to be `true` (open in new).
    if (newVal)
        localStorage.removeItem("events_openLinksInSameWindow");
    else 
        localStorage.setItem("events_openLinksInSameWindow", "yes");
});