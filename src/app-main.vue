<template>
<div>

    <div v-show="!!dropboxSyncStatus"
        class="alert alert-warning syncdiv">Dropbox sync: {{ dropboxSyncStatus }}</div>

    <dropbox-sync ref="dropbox"
                  filename="json/events.json"
                  v-on:sync-status-change="dropboxSyncStatus = $event">
    </dropbox-sync>

    <div v-show="connectedToDropbox">
        
        <div v-show="activeTab != 'editor' && activeTab != 'linkeditor'">
            <nav class="navbar navbar-default">
                <div class="container-fluid">
                    <p class="navbar-text pull-right">
                        {{ formatDate(currentTime, 'dddd D MMMM') }}
                    </p>
                    <div class="navbar-header">
                        <a class="navbar-brand" href="#">
                            <span class="glyphicon glyphicon-home"></span>
                            <span class="glyphicon glyphicon-arrow-right"></span>
                            Events
                        </a>
                        <!-- <button class="btn btn-success navbar-btn" 
                                v-on:click="addEvent">
                            Add Event
                        </button> -->
                    </div>
                </div><!-- /.container-fluid -->
            </nav>
            <ul class="nav nav-tabs">
                <bootstrap-nav code="timeline" v-model="activeTab">Timeline</bootstrap-nav>
                <bootstrap-nav code="links"    v-model="activeTab">Links</bootstrap-nav>
                <bootstrap-nav code="ideas"    v-model="activeTab">Ideas</bootstrap-nav>
            </ul>
        </div>

        <timeline-page v-show="activeTab == 'timeline' || activeTab == 'ideas'"
                       v-bind:ideas-only="activeTab == 'ideas'"
                       v-bind:timeline="dropboxData"
                       v-bind:item-being-updated="itemBeingUpdated"
                       v-on:open-editor="openEditor">
        </timeline-page>

        <links-page v-show="activeTab == 'links'"
                    v-bind:dropbox-data="dropboxData"
                    v-bind:item-being-updated="itemBeingUpdated"
                    v-on:open-editor="openLinkEditor">
        </links-page>

        <editor-dialog v-show="activeTab == 'editor'"
                       ref="editor"
                       v-on:save="updateItem($event, true)"
                       v-on:close="closeEditor">
        </editor-dialog>

        <link-editor v-show="activeTab == 'linkeditor'"
                     ref="linkeditor"
                     v-on:save="updateItem($event, true)"
                     v-on:close="closeEditor">
        </link-editor>

    </div><!-- v-show="connectedToDropbox"-->

</div>
</template>

<script lang="ts">
    import { defineComponent, nextTick } from 'vue';
    import { _formatDate } from './common';
    import DropboxSync from './dropbox-sync.vue';
    import EditorDialog from './editor-dialog.vue';
    import LinkEditor from './link-editor.vue';

    // import dropboxSync from './dropbox-sync.vue'
    // import timelinePage from './timeline-page.vue'
    // import linksPage from './links-page.js'
    
    export default defineComponent({
        // components: {
        //     timelinePage,
        //     linksPage,
        //     dropboxSync
        // },
        data: function() {
            window.location.hash = ""; // clear hash
            return {
                activeTab: "timeline",
                previousTab: "", // to restore previously-active tab when editor closed
                previousScrollPosition: 0, // to restore scroll position when editor closed
                connectedToDropbox: false,
                dropboxSyncStatus: "",
                dropboxData: [],
                currentTime: new Date().toISOString(),
                itemBeingUpdated: '' // id (guid) of item currently being saved
            }
        },
        mounted: function() {
            var self = this;
            var dropbox = this.$refs.dropbox as InstanceType<typeof DropboxSync>;
            dropbox.loadData(function(dropboxData) {
                self.connectedToDropbox = true; // show navbar & "Add event" button
                self.dropboxData = dropboxData;
            });
            setInterval(function() {
                self.currentTime = new Date().toISOString()
            }, 60000); // update currentTime every minute
        },
        methods: {
            openEditor: function (item) {
                this.previousTab = this.activeTab;
                this.previousScrollPosition = document.documentElement.scrollTop;
                this.activeTab = "editor";
                var editor = this.$refs.editor as InstanceType<typeof EditorDialog>;
                editor.openDialog(item);
            },
            openLinkEditor: function (item) {
                this.previousTab = this.activeTab;
                this.previousScrollPosition = document.documentElement.scrollTop;
                this.activeTab = "linkeditor";
                var linkeditor = this.$refs.linkeditor as InstanceType<typeof LinkEditor>;
                linkeditor.openDialog(item);
            },
            updateItem: function (item, shouldCloseEditor) {
                var self = this;
                var dropbox = this.$refs.dropbox as InstanceType<typeof DropboxSync>;
                if (item.id == "") {
                    // add new item
                    item.id = this.uuidv4();
                    dropbox.addItem(item, function(dropboxData) {
                        self.dropboxData = dropboxData;
                    });
                } else {
                    // edit existing item
                    ////Vue.set(this.dropboxData, this.dropboxData.findIndex(z => z.id === item.id), item); // replace item in array
                    this.itemBeingUpdated = item.id;
                    dropbox.editItem(item, function(dropboxData) {
                        self.dropboxData = dropboxData;
                        self.itemBeingUpdated = '';
                    });
                }

                if (shouldCloseEditor) {
                    this.closeEditor();
                }
            },
            closeEditor: function () {
                this.activeTab = this.previousTab;
                var self = this;
                nextTick(function () {
                    document.documentElement.scrollTop = self.previousScrollPosition;
                });
            },
            uuidv4: function () {
                // from https://stackoverflow.com/a/2117523
                //@ts-ignore
                return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
                );
            },
            formatDate: _formatDate
        }
    });

</script>
