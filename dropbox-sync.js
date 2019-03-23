Vue.component('dropbox-sync', {
    template: html`
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
    `,
    props: {
        'filename': String, // user needs to create this file manually, initial contents should be an empty array []
    },
    data: function() {
        return {
            'editAccessToken': '',
            'dropboxAccessToken': localStorage['dropboxAccessToken'] || '',
            'dropboxSyncStatus': '',
            'dropboxLastSyncTimestamp': null,
        }
    },
    methods: {
        setSyncStatus: function(newStatus) {
            this.dropboxSyncStatus = newStatus;
            this.$emit("sync-status-change", newStatus);
        },
        saveAccessToken: function() {
            localStorage["dropboxAccessToken"] = this.editAccessToken;
            this.dropboxAccessToken = this.editAccessToken; // hide "enter access token" controls
            this.setSyncStatus("Please refresh the page to continue");
        },
        loadData: function(onComplete) { // called by parent
            // Dropbox sync stage 1 - Load existing data from Dropbox
            if (!this.dropboxAccessToken) return;
            this.setSyncStatus("Loading");

            // See https://dropbox.github.io/dropbox-sdk-js/Dropbox.html#filesDownload__anchor
            var dbx = new Dropbox.Dropbox({ accessToken: this.dropboxAccessToken });
            var self = this;
            dbx.filesDownload({ path: '/' + this.filename })
                .then(function(data) {
                    var reader = new FileReader();
                    reader.addEventListener("loadend", function() {
                        var dropboxData = JSON.parse(reader.result);
                        //self.dropboxSyncStage2(dataToSync, dropboxData);
                        self.setSyncStatus("");
                        if (onComplete)
                            onComplete(dropboxData);
                    });
                    reader.readAsText(data.fileBlob);
                })
                .catch(function(error) {
                    console.error(error);
                    alert("Failed to download " + self.dropboxFilename + " from Dropbox - " + error.message);
                    self.dropboxSyncInProgress = false;
                });
        },
        addItem: function(itemToAdd, onComplete) {
            var self = this;

            // 1. Load data from dropbox
            this.loadData(function(dropboxData) {

                // 2. Add new item to array
                dropboxData.push(itemToAdd);

                // 3. Save updated data back to dropbox
                self.saveData(dropboxData, onComplete); // save updated data
            });
        },
        editItem: function(itemToEdit, onComplete) {
            var self = this;

            // 1. Load data from dropbox
            this.loadData(function(dropboxData) {

                // 2. Replace item in array
                var idx = dropboxData.findIndex(z => z.id === itemToEdit.id);
                dropboxData[idx] = itemToEdit; // replace item

                // 3. Save updated data back to dropbox
                self.saveData(dropboxData, onComplete); // save updated data
            });
        },
        saveData: function(dropboxData, onComplete) {
            // Dropbox sync stage 3 - Save data back to Dropbox
            if (!this.dropboxAccessToken ) return;
            this.setSyncStatus("Saving");
            // See https://github.com/dropbox/dropbox-sdk-js/blob/master/examples/javascript/upload/index.html
            var dbx = new Dropbox.Dropbox({ accessToken: this.dropboxAccessToken });
            var self = this;
            dbx.filesUpload({ 
                    path: '/' + this.filename, 
                    contents: JSON.stringify(dropboxData, null, 2), // pretty print JSON (2 spaces)
                    mode: { '.tag': 'overwrite' }
                })
                .then(function(response) {
                    self.setSyncStatus("");
                    self.dropboxLastSyncTimestamp = new Date();
                    if (onComplete)
                        onComplete(dropboxData);
                })
                .catch(function(error) {
                    console.error(error);
                    alert("Failed to upload " + self.dropboxFilename + " to Dropbox - " + error.message);
                    self.setSyncStatus("Error");
                    self.dropboxLastSyncTimestamp = "";
                });
        }
    }
});