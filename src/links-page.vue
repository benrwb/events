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
                    <button v-if="heading == 'Event listings'"
                        @click="openRandomLink(items)"
                        class="btn btn-info">Open random link
                    </button>
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
        <br /><br />
    </div>
</template>

<script lang="ts">

import { defineComponent,PropType, computed, ref, watch } from 'vue';
import { LinkItem, LinksWithHeadings } from './types/app';
import * as _ from "lodash";
import { store } from "./store";

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

        function openRandomLink(items: LinkItem[]) {
            let number = Math.floor(Math.random() * items.length);
            if (store.openLinksInNewWindow) {
                window.open(items[number].link);    
            } else {
                window.location.href = items[number].link;
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

        return { addLink, editEvent, groupedLinks, store, openRandomLink };
    }
});