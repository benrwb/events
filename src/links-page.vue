<template>
    <div>
        <button class="btn btn-success" 
                v-on:click="addLink">
            Add Link
        </button>

        <div v-for="item in linksList"
            v-bind:key="item.id"
            class="panel panel-default"
            v-bind:class="{ 'faded': item.id == itemBeingUpdated }">
            <div class="panel-heading">
                <div style="font-weight: bold">
                    
                    <span v-on:click="editEvent(item.id)"
                            style="cursor: pointer">
                        {{ item.name}}
                    </span>

                    <a v-if="item.link"
                        v-bind:href="item.link"
                        class="emoji"
                        style="text-decoration: none"
                        target="_blank">&nbsp;<span class="glyphicon glyphicon-new-window"></span></a>
                </div>
                <div v-show="!!item.notes"
                     class="text-muted">
                    {{ item.notes }}
                </div>
            </div><!-- /panel-heading -->
        </div>

        <link-editor ref="editor"
                v-on:save="editorSave"></link-editor>
    </div>
</template>

<script lang="ts">

import linkEditor from './link-editor.vue'
import Vue from './@types/vue'
import * as moment from './@types/moment';

export default Vue.extend({
    components: {
        linkEditor
    },
    props: {
        dropboxData: Array,
        itemBeingUpdated: String // id (guid) of item currently being saved
    },
    methods: {
        addLink: function () {
            this.$refs.editor.openDialog();
        },
        editEvent: function(itemId) {
            var idx = this.dropboxData.findIndex(z => z.id === itemId);
            var copy = Object.assign({}, this.dropboxData[idx]); // create a copy of the item for the editor to work with
            this.$refs.editor.openDialog(copy);
        },
        editorSave: function(item) {
            this.$emit('update-item', item);
        }
    },
    computed: {
        linksList: function() {
            return this.dropboxData.filter(function(item) {
                return item.type == "Link"
            });
        }
    }
});