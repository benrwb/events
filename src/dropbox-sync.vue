<template>
    <span class="text-muted">Dropbox:</span>&nbsp;{{ message }}
    
    <progress v-if="syncInProgress" style="vertical-align: text-bottom; width: 50px"></progress>

    <span v-show="!accessToken" class="form-inline">
        Missing <a target="_blank" href="https://dropbox.github.io/dropbox-api-v2-explorer/#files_list_folder">access token</a>
        &nbsp;<input type="text" v-model="editAccessToken" class="form-control" />
        <button class="btn btn-default" @click="saveAccessToken">Set</button>
    </span>

    <!-- button is floated so the div height doesn't change 
         when the button is shown/hidden -->
    <button v-if="accessToken && !syncInProgress"
            style="float: right"
            class="btn btn-default btn-xs"
            @click="$emit('start-sync')">🔄️</button>
    
</template>

<script lang="ts">
import { defineComponent, nextTick, ref, watch } from 'vue';
import { AppItem } from './types/app';

type MergeCompleteCallback = (mergedItems: AppItem[]) => void;

export default defineComponent({
    props: {
        filename: String, // user needs to create this file manually, initial contents should be an empty array []
    },
    emits: [
        'start-sync', 
        'sync-in-progress'
    ],
    setup: function (props, context) {

        const editAccessToken = ref("");
        const accessToken = ref(localStorage["dropboxAccessToken"] || "");
        const message = ref("");
        const syncInProgress = ref(false);
        //const dropboxLastSyncTimestamp = ref(null);


        function saveAccessToken() {
            localStorage["dropboxAccessToken"] = editAccessToken.value;
            accessToken.value = editAccessToken.value; // hide "enter access token" controls
            context.emit('start-sync');
        }


        async function syncWithDropbox(dataToSync: readonly AppItem[], mergeCompleteCallback: MergeCompleteCallback) { // called by parent component
            if (!accessToken.value) return;
            if (syncInProgress.value) return; // don't allow multiple simultaneous syncs

            syncInProgress.value = true;
            message.value = "Loading";
            try {
                // See https://dropbox.github.io/dropbox-sdk-js/Dropbox.html#filesDownload__anchor
                const dbx = new Dropbox.Dropbox({ accessToken: accessToken.value });

                // STAGE 1: Download existing data from Dropbox
                const downloadRes = await dbx.filesDownload({ path: '/' + props.filename });
                const jsonText = await downloadRes.fileBlob.text();
                // ^ Note: If I switch to a newer version of the Dropbox API in future,
                //   (currently using version 4), the above line will need to change to
                //   const jsonText = await downloadRes.result.fileBlob.text();
                //                                      ^^^^^^
                const dropboxData = JSON.parse(jsonText);
                
                // STAGE 2: Merge local data with remote data
                const mergedData = mergeEventsData(dataToSync, dropboxData);

                // Send merged data back to parent component
                if (mergeCompleteCallback)
                    mergeCompleteCallback(mergedData);

                // STAGE 3: Save merged data back to Dropbox
                // See https://github.com/dropbox/dropbox-sdk-js/blob/master/examples/javascript/upload/index.html
                message.value = "Saving";
                await dbx.filesUpload({
                    path: '/' + props.filename,
                    contents: JSON.stringify(mergedData, null, 2), // pretty print JSON (2 spaces)
                    mode: { '.tag': 'overwrite' },
                });
                message.value = "";

            } catch (error/*: any*/) {
                console.error('Dropbox sync failed:', error);
                alert(`Dropbox sync failed for ${props.filename} - ${error?.message || error}`);
                message.value = "Error";
            } finally {
                syncInProgress.value = false;
            }
        }

        
        // Isolated function for Stage 2 (Merge Logic)
        function mergeEventsData(localItems: readonly AppItem[], remoteItems: readonly AppItem[]): AppItem[] {
            // Map keyed by UUID string
            const mergedMap = new Map() as Map<string, AppItem>;

            // 1. Load local items into map
            for (const item of localItems) {
                mergedMap.set(item.id, item);
            }

            // 2. Merge remote items based on numeric 'lastUpdate'
            for (const remoteItem of remoteItems) {
                const localItem = mergedMap.get(remoteItem.id);

                if (!localItem) {
                    // New item from remote -> Add to map
                    mergedMap.set(remoteItem.id, remoteItem);
                } else {
                    // Conflict: Item exists in both local and remote
                    // Simply compare numeric seconds since epoch
                    if (remoteItem.lastUpdate >= localItem.lastUpdate) {
                        mergedMap.set(remoteItem.id, remoteItem);
                    }
                    // Otherwise, keep localItem (which is already in the map)
                }
            }

            // 3. Convert back to array
            const mergedArray = Array.from(mergedMap.values());

            return mergedArray;
        }
        
        watch(syncInProgress, newValue => {
            context.emit("sync-in-progress", newValue);
        })
        
        return { 
            editAccessToken, accessToken, saveAccessToken,
            syncWithDropbox, message, syncInProgress
        }; // `syncWithDropbox` is called by parent component
    }
});
</script>