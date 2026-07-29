<style>
    .syncdiv {
        position: fixed;
        top: 5px;
        left: 50%;
        transform: translate(-50%, 0);
        z-index: 1; /* display in front of navbar */
    }
</style>
<template>
<div>

    <div v-show="!!dropboxSyncStatus"
        class="alert alert-warning syncdiv">Dropbox sync: {{ dropboxSyncStatus }}</div>

    <dropbox-sync ref="dropboxRef"
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
                       v-bind:timeline="timelineItems"
                       v-bind:item-being-updated="itemBeingUpdated"
                       v-on:open-editor="openEditor">
        </timeline-page>

        <links-page v-show="activeTab == 'links'"
                    v-bind:dropbox-data="timelineItems"
                    v-bind:item-being-updated="itemBeingUpdated"
                    v-on:open-editor="openLinkEditor">
        </links-page>

        <editor-dialog v-show="activeTab == 'editor'"
                       ref="editorRef"
                       v-on:save="updateItem($event, true)"
                       v-on:close="closeEditor">
        </editor-dialog>

        <link-editor v-show="activeTab == 'linkeditor'"
                     ref="linkeditorRef"
                     v-on:save="updateItem($event, true)"
                     v-on:close="closeEditor">
        </link-editor>

    </div><!-- v-show="connectedToDropbox"-->

</div>
</template>

<script lang="ts">
    import { defineComponent, nextTick, ref, onMounted, Ref } from 'vue';
    import { _formatDate } from './common';
    import DropboxSync from './dropbox-sync.vue';
    import EditorDialog from './editor-dialog.vue';
    import LinkEditor from './link-editor.vue';
    import { useTimelineStore } from './store2';
    
    export default defineComponent({
        setup() {
            window.location.hash = ""; // clear hash

            const activeTab = ref("timeline");
            const previousTab = ref(""); // to restore previously-active tab when editor closed
            const previousScrollPosition = ref(0); // to restore scroll position when editor closed
            const connectedToDropbox = ref(false);
            const dropboxSyncStatus = ref("");
            const currentTime = ref(new Date().toISOString());
            const itemBeingUpdated = ref(""); // id (guid) of item currently being saved

            const dropboxRef = ref(null) as Ref<InstanceType<typeof DropboxSync>>;
            const editorRef = ref(null) as Ref<InstanceType<typeof EditorDialog>>;
            const linkeditorRef = ref(null) as Ref<InstanceType<typeof LinkEditor>>;

            const timelineStore = useTimelineStore(); // will automatically save to localStorage
            const timelineItems = timelineStore.items; // passed to template (ref will be unwrapped)

            onMounted(() => {
                dropboxRef.value.loadData(function(initialData) {
                    connectedToDropbox.value = true; // show navbar & "Add event" button
                    timelineStore.replaceTimeline(initialData);
                    //dropboxData.value = initialData;
                });

                setInterval(function() {
                    currentTime.value = new Date().toISOString()
                }, 60000); // update currentTime every minute
            });

            function openEditor(item) {
                previousTab.value = activeTab.value;
                previousScrollPosition.value = document.documentElement.scrollTop;
                activeTab.value = "editor";
                editorRef.value.openDialog(item);
            }

            function openLinkEditor(item) {
                previousTab.value = activeTab.value;
                previousScrollPosition.value = document.documentElement.scrollTop;
                activeTab.value = "linkeditor";
                linkeditorRef.value.openDialog(item);
            }

            function updateItem(item, shouldCloseEditor) {
                if (item.id == "") {
                    // add new item
                    item.id = uuidv4();
                    dropboxRef.value.addItem(item, function(newData) {
                        timelineStore.replaceTimeline(newData);
                        //dropboxData.value = newData;
                    });
                } else {
                    // edit existing item
                    ////Vue.set(this.dropboxData, this.dropboxData.findIndex(z => z.id === item.id), item); // replace item in array
                    itemBeingUpdated.value = item.id; // fade out item
                    dropboxRef.value.editItem(item, function(newData) {
                        timelineStore.replaceTimeline(newData);
                        //dropboxData.value = newData;
                        itemBeingUpdated.value = "";
                    });
                }

                if (shouldCloseEditor) {
                    closeEditor();
                }
            }

            function closeEditor() {
                activeTab.value = previousTab.value;
                nextTick(() => {
                    document.documentElement.scrollTop = previousScrollPosition.value;
                });
            }

            function uuidv4() {
                // from https://stackoverflow.com/a/2117523
                //@ts-ignore
                return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
                );
            }

            return {
                dropboxSyncStatus, connectedToDropbox,
                activeTab, currentTime, 
                itemBeingUpdated, timelineItems, //dropboxData,
                openEditor, openLinkEditor, updateItem, closeEditor,
                dropboxRef, editorRef, linkeditorRef,
                formatDate: _formatDate
            };
        }
    });

</script>
