<style>

/* === STYLES FOR DROPBOX SYNC DIV === */
/* DEFAULT (Desktop): Float right and align text */
.dropbox-container-div {
    text-align: right;
    float: right;
}
/* CONDITIONAL (Mobile: 768px and under): Remove the float */
@media (max-width: 768px) {
    .dropbox-container-div {
        float: none; /* Reverts the float so it stacks normally on mobile */
    }
    .navbar.reduce-bottom-margin-on-mobile {
        margin-bottom: 5px; /* Reduce spacing between navbar and dropbox sync div */
    }
}
</style>

<template>
<div>

    <div v-show="activeTab != 'editor' && activeTab != 'linkeditor'">
        <nav class="navbar navbar-default reduce-bottom-margin-on-mobile">
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

        <div class="dropbox-container-div">
            <dropbox-sync ref="dropboxRef"
                          filename="json/events.json"
                          @sync-in-progress="dropboxSyncInProgress = $event"
                          @start-sync="startDropboxSync">
            </dropbox-sync>
        </div>

        <ul class="nav nav-tabs">
            <bootstrap-nav code="timeline" v-model="activeTab">Timeline</bootstrap-nav>
            <bootstrap-nav code="links"    v-model="activeTab">Links</bootstrap-nav>
            <bootstrap-nav code="ideas"    v-model="activeTab">Ideas</bootstrap-nav>
        </ul>
    </div>

    <timeline-page v-show="activeTab == 'timeline' || activeTab == 'ideas'"
                   :ideas-only="activeTab == 'ideas'"
                   :timeline="timelineItems"
                   @open-editor="openEditor">
    </timeline-page>

    <links-page v-show="activeTab == 'links'"
                :dropbox-data="timelineItems"
                @open-editor="openLinkEditor">
    </links-page>

    <editor-dialog v-show="activeTab == 'editor'"
                   ref="editorRef"
                   @save="updateItem($event)"
                   @close="closeEditor"
                   @delete="deleteItem($event)"
                   :dropbox-sync-in-progress >
    </editor-dialog>

    <link-editor v-show="activeTab == 'linkeditor'"
                 ref="linkeditorRef"
                 @save="updateItem($event)"
                 @close="closeEditor"
                 :dropbox-sync-in-progress >
    </link-editor>


</div>
</template>

<script lang="ts">
    import { defineComponent, nextTick, ref, onMounted, Ref } from 'vue';
    import { _formatDate, _secondsSinceEpoch } from './common';
    import DropboxSync from './dropbox-sync.vue';
    import EditorDialog from './editor-dialog.vue';
    import LinkEditor from './link-editor.vue';
    import { useTimelineStore } from './store2';
    import { AppItem } from './types/app';
    
    export default defineComponent({
        setup() {
            window.location.hash = ""; // clear hash

            const activeTab = ref("timeline");
            const previousTab = ref(""); // to restore previously-active tab when editor closed
            const previousScrollPosition = ref(0); // to restore scroll position when editor closed
            const dropboxSyncInProgress = ref(false);
            const currentTime = ref(new Date().toISOString());

            const dropboxRef = ref(null) as Ref<InstanceType<typeof DropboxSync>>;
            const editorRef = ref(null) as Ref<InstanceType<typeof EditorDialog>>;
            const linkeditorRef = ref(null) as Ref<InstanceType<typeof LinkEditor>>;

            const timelineStore = useTimelineStore(); // will automatically save to localStorage
            const timelineItems = timelineStore.items; // passed to template (ref will be unwrapped)

            function startDropboxSync() {
                dropboxRef.value.syncWithDropbox(timelineItems.value, mergedData => {
                    timelineStore.replaceTimeline(mergedData);
                });
            }

            onMounted(() => {
                startDropboxSync();
                
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

            function updateItem(item: AppItem) {
                item.lastUpdate = _secondsSinceEpoch(); // used when syncing
                if (item.id == "") {
                    // add new item
                    item.id = crypto.randomUUID();
                    timelineStore.addItem(item);
                } else {
                    // edit existing item
                    timelineStore.updateItem(item);
                }
                startDropboxSync();
                closeEditor();
            }

            function deleteItem(id: string) {
                timelineStore.deleteItem(id);
                startDropboxSync();
                closeEditor();
            }

            function closeEditor() {
                activeTab.value = previousTab.value;
                nextTick(() => {
                    document.documentElement.scrollTop = previousScrollPosition.value;
                });
            }

            return {
                dropboxSyncInProgress,
                activeTab, currentTime, 
                timelineItems, //dropboxData,
                openEditor, openLinkEditor, updateItem, closeEditor,
                dropboxRef, editorRef, linkeditorRef,
                formatDate: _formatDate,
                startDropboxSync,
                deleteItem
            };
        }
    });

</script>
