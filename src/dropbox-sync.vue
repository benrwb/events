<template>
   <div>
        <!-- <div v-show="dropboxSyncStatus">
            Dropbox sync status: {{ dropboxSyncStatus }}
        </div> -->
        
        <div v-show="!dropboxAccessToken">
            Dropbox <a target="_blank" href="https://dropbox.github.io/dropbox-api-v2-explorer/#files_list_folder">access token</a>
            <input type="text" v-model="editAccessToken" class="form-control" />
            <button class="btn btn-default" v-on:click="saveAccessToken">Set</button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { AppItem } from './types/app';

type MergeCompleteCallback = (mergedItems: AppItem[]) => void;

export default defineComponent({
    props: {
        filename: String, // user needs to create this file manually, initial contents should be an empty array []
    },
    setup: function (props, context) {

        const editAccessToken = ref("");
        const dropboxAccessToken = ref(localStorage["dropboxAccessToken"] || "");
        const dropboxSyncStatus = ref("");
        //const dropboxLastSyncTimestamp = ref(null);

        function setSyncStatus(newStatus: string) {
            dropboxSyncStatus.value = newStatus;
            context.emit("sync-status-change", newStatus);
        }

        function saveAccessToken() {
            localStorage["dropboxAccessToken"] = editAccessToken.value;
            dropboxAccessToken.value = editAccessToken.value; // hide "enter access token" controls
            setSyncStatus("Please refresh the page to continue");
        }


        async function syncWithDropbox(dataToSync: readonly AppItem[], mergeCompleteCallback: MergeCompleteCallback) { // called by parent component
            if (!dropboxAccessToken.value) return;
            setSyncStatus("Loading");
            try {
                // See https://dropbox.github.io/dropbox-sdk-js/Dropbox.html#filesDownload__anchor
                const dbx = new Dropbox.Dropbox({ accessToken: dropboxAccessToken.value });

                // STAGE 1: Download existing data from Dropbox
                const downloadRes = await dbx.filesDownload({ path: '/' + props.filename });
                const jsonText = await downloadRes.fileBlob.text();
                // ^ Note: If I switch to a newer version of the Dropbox API in future,
                //   (currently using version 4), the above line will need to change to
                //   const jsonText = await downloadRes.result.fileBlob.text();
                //                                      ^^^^^^
                const dropboxData = JSON.parse(jsonText);
                
                // STAGE 2: Merge local data with remote data
                setSyncStatus("Merging");
                const mergedData = mergeEventsData(dataToSync, dropboxData);

                // Send merged data back to parent component
                if (mergeCompleteCallback)
                    mergeCompleteCallback(mergedData);

                // STAGE 3: Save merged data back to Dropbox
                // See https://github.com/dropbox/dropbox-sdk-js/blob/master/examples/javascript/upload/index.html
                setSyncStatus("Saving");
                await dbx.filesUpload({
                    path: '/' + props.filename,
                    contents: JSON.stringify(mergedData, null, 2), // pretty print JSON (2 spaces)
                    mode: { '.tag': 'overwrite' },
                });
                setSyncStatus("");

            } catch (error/*: any*/) {
                console.error('Dropbox sync failed:', error);
                alert(`Dropbox sync failed for ${props.filename} - ${error?.message || error}`);
                setSyncStatus("Error");
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
        
        
        return { 
            editAccessToken, dropboxAccessToken, saveAccessToken,
            syncWithDropbox
        }; // `syncWithDropbox` is called by parent component
    }
});
</script>