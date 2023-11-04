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

export default defineComponent({
    props: {
        filename: String, // user needs to create this file manually, initial contents should be an empty array []
    },
    setup: function (props, context) {

        const editAccessToken = ref("");
        const dropboxAccessToken = ref(localStorage["dropboxAccessToken"] || "");
        const dropboxSyncStatus = ref("");
        const dropboxLastSyncTimestamp = ref(null);

        function setSyncStatus(newStatus) {
            dropboxSyncStatus.value = newStatus;
            context.emit("sync-status-change", newStatus);
        }

        function saveAccessToken() {
            localStorage["dropboxAccessToken"] = editAccessToken.value;
            dropboxAccessToken.value = editAccessToken.value; // hide "enter access token" controls
            setSyncStatus("Please refresh the page to continue");
        }

        function loadData(onComplete) { // called by parent component
            // Dropbox sync stage 1 - Load existing data from Dropbox
            if (!dropboxAccessToken.value) return;
            setSyncStatus("Loading");

            // See https://dropbox.github.io/dropbox-sdk-js/Dropbox.html#filesDownload__anchor
            var dbx = new Dropbox.Dropbox({ accessToken: dropboxAccessToken.value });
            dbx.filesDownload({ path: '/' + props.filename })
                .then(function(data) {
                    var reader = new FileReader();
                    reader.addEventListener("loadend", function() {
                        var dropboxData = JSON.parse(reader.result);
                        //self.dropboxSyncStage2(dataToSync, dropboxData);
                        setSyncStatus("");
                        if (onComplete)
                            onComplete(dropboxData);
                    });
                    reader.readAsText(data.fileBlob);
                })
                .catch(function(error) {
                    console.error(error);
                    alert("Failed to download " + props.filename + " from Dropbox - " + error.message);
                    setSyncStatus("Error");
                });
        }

        function saveData(dropboxData, onComplete) {
            // Dropbox sync stage 3 - Save data back to Dropbox
            if (!dropboxAccessToken.value) return;
            setSyncStatus("Saving");
            // See https://github.com/dropbox/dropbox-sdk-js/blob/master/examples/javascript/upload/index.html
            var dbx = new Dropbox.Dropbox({ accessToken: dropboxAccessToken.value });
            dbx.filesUpload({ 
                path: '/' + props.filename, 
                contents: JSON.stringify(dropboxData, null, 2), // pretty print JSON (2 spaces)
                mode: { '.tag': 'overwrite' }
            })
            .then(function(response) {
                setSyncStatus("");
                dropboxLastSyncTimestamp.value = new Date();
                if (onComplete)
                    onComplete(dropboxData);
            })
            .catch(function(error) {
                console.error(error);
                alert("Failed to upload " + props.filename + " to Dropbox - " + error.message);
                setSyncStatus("Error");
                dropboxLastSyncTimestamp.value = "";
            });
        }

        function addItem(itemToAdd, onComplete) { // called by parent component
            // 1. Load data from dropbox
            loadData(function(dropboxData) {

                // 2. Add new item to array
                dropboxData.push(itemToAdd);

                // 3. Save updated data back to dropbox
                saveData(dropboxData, onComplete); // save updated data
            });
        }

        function editItem(itemToEdit, onComplete) { // called by parent component
            // 1. Load data from dropbox
            loadData(function(dropboxData) {

                // 2. Replace item in array
                var idx = dropboxData.findIndex(z => z.id === itemToEdit.id);
                dropboxData[idx] = itemToEdit; // replace item

                // 3. Save updated data back to dropbox
                saveData(dropboxData, onComplete); // save updated data
            });
        }

        
        return { editAccessToken, dropboxAccessToken, saveAccessToken,
            loadData, addItem, editItem }; // `loadData`, `addItem`, and `editItem` are called by parent component
    }
});
</script>