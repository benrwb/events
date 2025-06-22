<template>
    <div>
        <button class="btn btn-success" 
                v-on:click="addLink">
            Add Link
        </button>
        
        <search-box v-model="store.search"></search-box>

        <template v-if="!store.search">
            <span v-for="(_, heading) in groupedLinks">
                <a class="btn" v-bind:href="'#' + heading">{{ store.linkTypes[heading] }} {{ heading }}</a>
            </span>
        </template>

        <br />
        
        <div v-for="(items, heading, idx) in groupedLinks"
             v-bind:key="heading"
             v-bind:id="heading.toString()"><!-- for # links -->

            <template v-if="!store.search">
                <h1 v-if="!store.search">
                    {{ heading }}
                    <a v-if="idx > 0"
                       style="float: right" href="#">↑</a><!-- link to go back to top -->
                    <template v-if="heading == 'Event listings' || heading == 'Venue'">
                        <button @click="openRandomLink(items, heading)"
                                class="btn btn-info">Open random link
                        </button>
                        <progress v-if="numLinksOpened[heading] > 0"
                                  style="width: 100px; vertical-align: middle;"
                                  :max="items.length" :value="numLinksOpened[heading]"></progress>
                    </template>
                </h1>
                <h5 v-if="heading == 'Venue'"
                    class="text-muted">Event listings by venue</h5>
                   
            </template>

                    
            
        
            <div v-for="item in items"
                 v-bind:key="item.id"
                 class="panel panel-default"
                 v-on:click="editEvent(item.id, $event)"
                 style="cursor: pointer"
                 v-bind:class="{ 'faded': item.id == itemBeingUpdated }">

                <div class="panel-heading">
                    <div>
                        {{ store.linkTypes[item.type] }} 
                        <span style="font-weight: bold">{{ item.name }}</span>

                        <a v-if="item.link"
                           v-bind:href="item.link" v-on:click.stop
                           v-bind:target="store.openLinksInNewWindow ? '_blank' : null"
                           class="emoji" style="text-decoration: none"
                           ><span class="glyphicon glyphicon-new-window"
                                  style="padding: 0 3px"></span></a>
                    </div>
                    <div v-show="!!item.notes"
                         class="text-muted"
                         >{{ item.notes.substring(0, 100) }}{{ item.notes.length > 100 ? "..." : "" }}</div>
                         <!-- style="white-space: pre-line" -->
                </div>
            </div><!-- /panel-heading -->
        </div>

        <label>
            <input type="checkbox" v-model="store.openLinksInNewWindow"> Open links in new window
        </label>
        <button class="btn btn-danger btn-sm pull-right" 
                style="margin-left: 10px"
                @click="clearLinks">Clear opened links</button>
        <br /><br />
    </div>
</template>

<script lang="ts">

import { defineComponent,PropType, computed, ref, watch, Ref } from 'vue';
import { LinkItem, LinksWithHeadings } from './types/app';
import * as _ from "lodash";
import { store } from "./store";
import { pickRandomLink, getNumLinksOpened, clearLinksFromStorage } from './randomise';

export default defineComponent({
    props: {
        dropboxData: Array as PropType<LinkItem[]>,
        itemBeingUpdated: String // id (guid) of item currently being saved
    },
    setup: function (props, context) {

        function addLink() {
            context.emit('open-editor', null);
        }

        function editEvent(itemId, event) {
            if (event.target.classList.contains("glyphicon-new-window")) {
                return; // don't open the editor if the link was clicked
            }
            var idx = props.dropboxData.findIndex(z => z.id === itemId);
            var copy = Object.assign({}, props.dropboxData[idx]); // create a copy of the item for the editor to work with
            context.emit('open-editor', copy);
        }

        const groupedLinks = computed(() => { // LinksWithHeadings
            var filtered = props.dropboxData.filter(item => item.category == "Link");
            if (store.search) {
                filtered = filtered.filter(item => item.name.toLocaleLowerCase().includes(store.search.toLocaleLowerCase()));
            }
            var ordered = _.sortBy(filtered, [ // sort by [type,name]; pinned items first
                item => item.type,
                item => !item.name.includes("📌"), // sort pinned items to the top
                item => item.name.includes("🎟️"), // sort ticket websites to the bottom
                item => item.name,
            ]);
            return _.groupBy(ordered, 'type');
        });

        // OLD //let countLookup = {}; // a count of how many times each link has been opened
        // OLD //                      // { key: link (string), value: count (number) }
        // OLD //                      // (this is to avoid opening the same link many times in a row,
        // OLD //                      //  which can happen when using `Math.random()`)

        const numLinksOpened = ref({ // for progress bar
            "Venue": getNumLinksOpened("Venue"),
            "Event listings": getNumLinksOpened("Event listings")
        });

        function openRandomLink(items: LinkItem[], heading: string) {
            if (items.length == 0)
                return; // nothing to do

            // OLD // // Ensure that `countLookup` contains an entry for each link in `items`,
            // OLD // // and find the lowest count.
            // OLD // let lowestCount = 999;
            // OLD // items.forEach(item => {
            // OLD //     if (!countLookup.hasOwnProperty(item.link)) {
            // OLD //         countLookup[item.link] = 0; // add new item
            // OLD //     }
            // OLD //     if (countLookup[item.link] < lowestCount) {
            // OLD //         lowestCount = countLookup[item.link]; // update `lowestCount`
            // OLD //     }
            // OLD // })
            // OLD // 
            // OLD // // Build a list of links which have been used `lowestCount` times,
            // OLD // // and pick one at random
            // OLD // let linksToSelectFrom = items
            // OLD //     .filter(item => countLookup[item.link] == lowestCount)
            // OLD //     .map(item => item.link);
            // OLD // let index = Math.floor(Math.random() * linksToSelectFrom.length);
            // OLD // let link = linksToSelectFrom[index];

            let [link, linksOpenedCount] = pickRandomLink(items, heading);

            numLinksOpened.value[heading] = linksOpenedCount; // update progress bar

            // Open the link
            if (store.openLinksInNewWindow) {
                window.open(link);    
            } else {
                window.location.href = link;
            }

            // Update count
            // OLD //countLookup[link]++;
        }
        
        function clearLinks() {
            if (confirm("Are you sure you want to clear the list of opened links?")) {
                for (let key in numLinksOpened.value) { // for each heading
                    clearLinksFromStorage(key);
                    numLinksOpened.value[key] = 0; // update progress bar
                }
            }
        }

        watch(() => store.openLinksInNewWindow, (newVal) => {
            // Note the checkbox value and localStorage are opposites ('New' vs 'Same').
            // This is because the default localStorage value is `false` (missing value)
            // whereas we want the default checkbox value to be `true` (open in new).
            if (newVal)
                localStorage.removeItem("events_openLinksInSameWindow");
            else 
                localStorage.setItem("events_openLinksInSameWindow", "yes");
        });

        return { addLink, editEvent, groupedLinks, store, 
            openRandomLink, numLinksOpened, clearLinks };
    }
});

</script>