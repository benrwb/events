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
                <bootstrap-nav value="timeline" v-model="activeTab">Timeline</bootstrap-nav>
                <bootstrap-nav value="links"    v-model="activeTab">Links</bootstrap-nav>
                <bootstrap-nav value="ideas"    v-model="activeTab">Ideas</bootstrap-nav>
            </ul>
        </div>

        <timeline-page v-show="activeTab == 'timeline' || activeTab == 'ideas'"
                       v-bind:ideas-only="activeTab == 'ideas'"
                       v-bind:timeline="dropboxData"
                       v-bind:item-being-updated="itemBeingUpdated"
                       v-bind:event-types="eventTypes"
                       v-bind:status-list="statusList"
                       v-on:open-editor="openEditor">
        </timeline-page>

        <links-page v-show="activeTab == 'links'"
                    v-bind:link-types="linkTypes"
                    v-bind:dropbox-data="dropboxData"
                    v-bind:item-being-updated="itemBeingUpdated"
                    v-on:open-editor="openLinkEditor">
        </links-page>

        <editor-dialog v-show="activeTab == 'editor'"
                       ref="editor"
                       v-bind:event-types="eventTypes"
                       v-bind:status-list="statusList"
                       v-on:save="updateItem($event, true)"
                       v-on:close="closeEditor">
        </editor-dialog>

        <link-editor v-show="activeTab == 'linkeditor'"
                     ref="linkeditor"
                     v-bind:link-types="linkTypes"
                     v-on:save="updateItem($event, true)"
                     v-on:close="closeEditor">
        </link-editor>

    </div><!-- v-show="connectedToDropbox"-->

</div>
</template>

<script lang="ts">
    import Vue from './@types/vue'
    import * as moment from './@types/moment';
import { _formatDate } from './common';

    // import dropboxSync from './dropbox-sync.vue'
    // import timelinePage from './timeline-page.vue'
    // import linksPage from './links-page.js'
    
    export default Vue.extend({
        // components: {
        //     timelinePage,
        //     linksPage,
        //     dropboxSync
        // },
        data: function() {
            return {
                activeTab: "timeline",
                previousTab: "", // to restore previously-active tab when editor closed
                previousScrollPosition: 0, // to restore scroll position when editor closed
                connectedToDropbox: false,
                dropboxSyncStatus: "",
                dropboxData: [],
                currentTime: new Date().toISOString(),
                itemBeingUpdated: '', // id (guid) of item currently being saved

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
                    "Holidays": "🌞",
                    "Other": "💡",
                    "Information": "ℹ"
                }
            }
        },
        mounted: function() {
            var self = this;
            this.$refs.dropbox.loadData(function(dropboxData) {
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
                this.$refs.editor.openDialog(item);
            },
            openLinkEditor: function (item) {
                this.previousTab = this.activeTab;
                this.previousScrollPosition = document.documentElement.scrollTop;
                this.activeTab = "linkeditor";
                this.$refs.linkeditor.openDialog(item);
            },
            updateItem: function (item, shouldCloseEditor) {
                var self = this;
                if (item.id == "") {
                    // add new item
                    item.id = this.uuidv4();
                    this.$refs.dropbox.addItem(item, function(dropboxData) {
                        self.dropboxData = dropboxData;
                    });
                } else {
                    // edit existing item
                    ////Vue.set(this.dropboxData, this.dropboxData.findIndex(z => z.id === item.id), item); // replace item in array
                    this.itemBeingUpdated = item.id;
                    this.$refs.dropbox.editItem(item, function(dropboxData) {
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
                Vue.nextTick(function () {
                    document.documentElement.scrollTop = self.previousScrollPosition;
                });
            },
            uuidv4: function () {
                // from https://stackoverflow.com/a/2117523
                return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
                );
            },
            formatDate: _formatDate
        }
    });

</script>
