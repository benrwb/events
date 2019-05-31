<template>
<div>

    <div v-show="!!dropboxSyncStatus"
        class="alert alert-warning syncdiv">Dropbox sync: {{ dropboxSyncStatus }}</div>

    <dropbox-sync ref="dropbox"
                  filename="json/events.json"
                  v-on:sync-status-change="dropboxSyncStatus = $event">
    </dropbox-sync>

    <div v-show="connectedToDropbox">

        <nav class="navbar navbar-default">
            <div class="container-fluid">
                <p class="navbar-text pull-right">
                    {{ currentTime | formatDate('dddd D MMMM') }}
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
        </ul>

        <timeline-page v-show="activeTab == 'timeline'"
                       v-bind:timeline="dropboxData"
                       v-on:update-item="updateItem($event)"
                       v-bind:item-being-updated="itemBeingUpdated">
        </timeline-page>

        <links-page v-show="activeTab == 'links'"
                    v-bind:dropbox-data="dropboxData"
                    v-on:update-item="updateItem($event)"
                    v-bind:item-being-updated="itemBeingUpdated">
        </links-page>


    </div><!-- v-show="connectedToDropbox"-->

</div>
</template>

<script lang="ts">
    import Vue from './@types/vue'
    import * as moment from './@types/moment';

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
                connectedToDropbox: false,
                dropboxSyncStatus: "",
                dropboxData: [],
                currentTime: new Date(),
                itemBeingUpdated: '' // id (guid) of item currently being saved
            }
        },
        mounted: function() {
            var self = this;
            this.$refs.dropbox.loadData(function(dropboxData) {
                self.connectedToDropbox = true; // show navbar & "Add event" button
                self.dropboxData = dropboxData;
            });
            setInterval(function() {
                self.currentTime = new Date()
            }, 60000); // update currentTime every minute
        },
        methods: {
            updateItem: function(item) {
                var self = this;
                if (item.id == -1) {
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
            },
            uuidv4: function () {
                // from https://stackoverflow.com/a/2117523
                return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
                );
            }
        }
    });

</script>
