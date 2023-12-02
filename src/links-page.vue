<template>
    <div>
        <button class="btn btn-success" 
                v-on:click="addLink">
            Add Link
        </button>
        
        <search-box v-model="search"></search-box>

        <template v-if="!search">
            <span v-for="(_, heading) in groupedLinks">
                <a class="btn" v-bind:href="'#' + heading">{{ linkTypes[heading] }} {{ heading }}</a>
            </span>
        </template>

        <br />
        
        <div v-for="(items, heading, idx) in groupedLinks"
             v-bind:key="heading"
             v-bind:id="heading.toString()"><!-- for # links -->

            <template v-if="!search">
                <h1 v-if="!search">
                    {{ heading }}
                    <a v-if="idx > 0"
                       style="float: right" href="#">↑</a><!-- link to go back to top -->
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
                        {{ linkTypes[item.type] }} 
                        <span style="font-weight: bold">{{ item.name }}</span>

                        <a v-if="item.link"
                           v-bind:href="item.link"
                           class="emoji"
                           style="text-decoration: none"
                           target="_blank"><span class="glyphicon glyphicon-new-window"
                                                 style="padding: 0 3px"></span></a>
                    </div>
                    <div v-show="!!item.notes"
                         class="text-muted"
                         >{{ item.notes.substring(0, 100) }}{{ item.notes.length > 100 ? "..." : "" }}</div>
                         <!-- style="white-space: pre-line" -->
                </div>
            </div><!-- /panel-heading -->
        </div>

        
    </div>
</template>

<script lang="ts">

import { defineComponent,PropType, computed, ref } from 'vue';
import { LinkItem, LinksWithHeadings } from './types/app';
import * as _ from "lodash";

export default defineComponent({
    props: {
        dropboxData: Array as PropType<LinkItem[]>,
        itemBeingUpdated: String, // id (guid) of item currently being saved
        linkTypes: Object
    },
    setup: function (props, context) {

        const search = ref("");

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
            if (search.value) {
                filtered = filtered.filter(item => item.name.toLocaleLowerCase().includes(search.value.toLocaleLowerCase()));
            }
            var ordered = _.sortBy(filtered, [ // sort by [type,name]; pinned items first
                item => item.type,
                item => (item.name.includes("📌") ? "!" : "") + item.name
            ]);
            return _.groupBy(ordered, 'type');
        });

        return { addLink, editEvent, groupedLinks, search };
    }
});