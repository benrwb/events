Vue.component('dropbox-sync', {
    template: `
    
    <div v-show="dropboxSyncStatus">
        Dropbox sync status: {{ dropboxSyncStatus }}
    </div>
    
    `,
    props: {
        'filename': String, // user needs to create this file manually, initial contents should be an empty array []
    },
    data: function() {
        return {
            'dropboxAccessToken': localStorage['dropboxAccessToken'] || '',
            'dropboxSyncStatus': '',
            'dropboxLastSyncTimestamp': null,
        }
    },
    methods: {
        loadData: function(onComplete) { // called by parent
            // Dropbox sync stage 1 - Load existing data from Dropbox
            if (!this.dropboxAccessToken) return;
            this.dropboxSyncStatus = "Loading";

            // See https://dropbox.github.io/dropbox-sdk-js/Dropbox.html#filesDownload__anchor
            var dbx = new Dropbox.Dropbox({ accessToken: this.dropboxAccessToken });
            var self = this;
            dbx.filesDownload({ path: '/' + this.filename })
                .then(function(data) {
                    var reader = new FileReader();
                    reader.addEventListener("loadend", function() {
                        var dropboxData = JSON.parse(reader.result);
                        //self.dropboxSyncStage2(dataToSync, dropboxData);
                        self.dropboxSyncStatus = "";
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
            this.dropboxSyncStatus = "Saving";
            // See https://github.com/dropbox/dropbox-sdk-js/blob/master/examples/javascript/upload/index.html
            var dbx = new Dropbox.Dropbox({ accessToken: this.dropboxAccessToken });
            var self = this;
            dbx.filesUpload({ 
                    path: '/' + this.filename, 
                    contents: JSON.stringify(dropboxData, null, 2), // pretty print JSON (2 spaces)
                    mode: { '.tag': 'overwrite' }
                })
                .then(function(response) {
                    localStorage["dropboxAccessToken"] = self.dropboxAccessToken;
                    self.dropboxSyncStatus = "";
                    self.dropboxLastSyncTimestamp = new Date();
                    if (onComplete)
                        onComplete(dropboxData);
                })
                .catch(function(error) {
                    console.error(error);
                    alert("Failed to upload " + self.dropboxFilename + " to Dropbox - " + error.message);
                    self.dropboxSyncStatus = "Error";
                    self.dropboxLastSyncTimestamp = "";
                });
        }
    }
});