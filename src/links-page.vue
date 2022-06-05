<template>
    <div>
        <button class="btn btn-success" 
                v-on:click="addLink">
            Add Link
        </button>

        <div v-for="(items, heading) in groupedLinks"
             v-bind:key="heading">

            <h1>{{ heading }}</h1>

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
                         >{{ item.notes }}</div>
                         <!-- style="white-space: pre-line" -->
                </div>
            </div><!-- /panel-heading -->
        </div>

        <link-editor ref="editor"
                     v-bind:link-types="linkTypes"
                     v-on:save="editorSave"></link-editor>
    </div>
</template>

<script lang="ts">

import linkEditor from './link-editor.vue'
import Vue, { PropType } from './@types/vue'
import { LinkItem, LinksWithHeadings } from './@types/app';
import * as _ from './@types/lodash';

export default Vue.extend({
    components: {
        linkEditor
    },
    props: {
        dropboxData: Array as PropType<LinkItem[]>,
        itemBeingUpdated: String, // id (guid) of item currently being saved
        linkTypes: Object
    },
    methods: {
        addLink: function () {
            this.$refs.editor.openDialog();
        },
        editEvent: function(itemId, event) {
            if (event.target.classList.contains("glyphicon-new-window")) {
                return; // don't open the editor if the link was clicked
            }
            var idx = this.dropboxData.findIndex(z => z.id === itemId);
            var copy = Object.assign({}, this.dropboxData[idx]); // create a copy of the item for the editor to work with
            this.$refs.editor.openDialog(copy);
        },
        editorSave: function(item) {
            this.$emit('update-item', item);
        }
    },
    computed: {
        groupedLinks: function (): LinksWithHeadings {
            var filtered = this.dropboxData.filter(item => item.category == "Link");
            var ordered = _.sortBy(filtered, ["type", "name"]); // alphabetical order
            return _.groupBy(ordered, 'type');
        }
    }
});