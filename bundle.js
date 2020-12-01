

    // import dropboxSync from './dropbox-sync.vue'
    // import timelinePage from './timeline-page.vue'
    // import linksPage from './links-page.js'
    
    Vue.component('app-main', {
        template: "<div>"
+""
+"    <div v-show=\"!!dropboxSyncStatus\""
+"        class=\"alert alert-warning syncdiv\">Dropbox sync: {{ dropboxSyncStatus }}</div>"
+""
+"    <dropbox-sync ref=\"dropbox\""
+"                  filename=\"json/events.json\""
+"                  v-on:sync-status-change=\"dropboxSyncStatus = $event\">"
+"    </dropbox-sync>"
+""
+"    <div v-show=\"connectedToDropbox\">"
+""
+"        <nav v-show=\"activeTab != 'editor'\""
+"             class=\"navbar navbar-default\">"
+"            <div class=\"container-fluid\">"
+"                <p class=\"navbar-text pull-right\">"
+"                    {{ currentTime | formatDate('dddd D MMMM') }}"
+"                </p>"
+"                <div class=\"navbar-header\">"
+"                    <a class=\"navbar-brand\" href=\"#\">"
+"                        <span class=\"glyphicon glyphicon-home\"></span>"
+"                        <span class=\"glyphicon glyphicon-arrow-right\"></span>"
+"                        Events"
+"                    </a>"
+"                    <!-- <button class=\"btn btn-success navbar-btn\" "
+"                            v-on:click=\"addEvent\">"
+"                        Add Event"
+"                    </button> -->"
+"                </div>"
+"            </div><!-- /.container-fluid -->"
+"        </nav>"
+""
+""
+"        <ul v-show=\"activeTab != 'editor'\""
+"            class=\"nav nav-tabs\">"
+"            <bootstrap-nav value=\"timeline\" v-model=\"activeTab\">Timeline</bootstrap-nav>"
+"            <bootstrap-nav value=\"links\"    v-model=\"activeTab\">Links</bootstrap-nav>"
+"            <bootstrap-nav value=\"ideas\"    v-model=\"activeTab\">Ideas</bootstrap-nav>"
+"        </ul>"
+""
+"        <timeline-page v-show=\"activeTab == 'timeline' || activeTab == 'ideas'\""
+"                       v-bind:ideas-only=\"activeTab == 'ideas'\""
+"                       v-bind:timeline=\"dropboxData\""
+"                       v-bind:item-being-updated=\"itemBeingUpdated\""
+"                       v-bind:event-types=\"eventTypes\""
+"                       v-bind:status-list=\"statusList\""
+"                       v-on:open-editor=\"openEditor\">"
+"        </timeline-page>"
+""
+"        <links-page v-show=\"activeTab == 'links'\""
+"                    v-bind:dropbox-data=\"dropboxData\""
+"                    v-on:update-item=\"updateItem($event, false)\""
+"                    v-bind:item-being-updated=\"itemBeingUpdated\">"
+"        </links-page>"
+""
+"        <editor-dialog v-show=\"activeTab == 'editor'\""
+"                ref=\"editor\""
+"                v-bind:event-types=\"eventTypes\""
+"                v-bind:status-list=\"statusList\""
+"                v-on:save=\"updateItem($event, true)\""
+"                v-on:close=\"closeEditor\">"
+"        </editor-dialog>"
+""
+"    </div><!-- v-show=\"connectedToDropbox\"-->"
+""
+"</div>",
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
                currentTime: new Date(),
                itemBeingUpdated: '', // id (guid) of item currently being saved

                eventTypes: {
                    "Birthday": "🎂",
                    "Restaurent": "🍽️",
                    "Film": "🎬",
                    "Live Entertainment": "🎭",
                    "Music": "🎵",
                    "Excursion": "🚶‍",
                    "Holiday": "🌞"
                },
                statusList: {
                    "Going": "✔",
                    "Interested": "⭐",
                    "Need to book": "🎟",
                    "Went":"🙂",
                    "Didn't go": "🙁"
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
                self.currentTime = new Date()
            }, 60000); // update currentTime every minute
        },
        methods: {
            openEditor: function (item) {
                this.previousTab = this.activeTab;
                this.previousScrollPosition = document.documentElement.scrollTop;
                this.activeTab = "editor";
                this.$refs.editor.openDialog(item);
            },
            updateItem: function (item, shouldCloseEditor) {
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
            }
        }
    });




Vue.component('bootstrap-datepicker', {
    template: "    <input class='form-control' type='text' />",
    props: {
        value: String // accept a value prop (for use with v-model)
    },
    mounted: function () {
        // Set initial value of the input to 'value'
        // (This will be picked up by the datepicker and used as the initial date)
        var modate = !this.value ? null : moment(this.value);
        if (modate != null && modate.isValid()) {
            $(this.$el).val(modate.format("DD/MM/YYYY"));
        }
        
        // Attach the datepicker control to the input         
        $(this.$el).datepicker({
            format: "dd/mm/yyyy", // UK date format
            autoclose: true,
            todayHighlight: true,
            disableTouchKeyboard: true, //  hide keyboard on mobile devices
            weekStart: 1 // week starts on Monday
        });
        
        // Register event
        var self = this;
        $(this.$el).datepicker().on("hide", function (e) {
            // Update the date when the datepicker is closed ("hide" event)
            // (which will happen either when a date is picked or when the field loses focus)
            self.updateValue();
        });
    },
    watch: {
        // watch the 'value' prop for changes and update the control accordingly
        value: function (newValue) {
            var modate = newValue == null ? null : moment(newValue); // handle null/undefined values
            if (modate != null && modate.isValid())
                $(this.$el).datepicker("setDate", modate.toDate());
            else
                $(this.$el).datepicker("setDate", null); // clear the selected date
        }
    },
    methods: {
        // Emit an input event with the new value
        // (To produce side effects in the parent scope, a component needs to explicitly emit an event)
        updateValue: function () {
            var jsDate = $(this.$el).datepicker("getDate");
            var dateVal = jsDate == null ? null : moment(jsDate).format('YYYY-MM-DD');
            this.$emit('input', dateVal);
        },
    }
});


//  Can be either tab or pill depending on container                           
//      e.g. <ul class="nav nav-tabs"> versus <ul class="nav nav-pills">       
//  Usage:                                                                     
//      <bootstrap-nav value="tab1" v-model="activeTab">Page 1</bootstrap-nav> 


Vue.component('bootstrap-nav', {
    template: "    <li role=\"presentation\""
+"        v-bind:class=\"{ 'active': value == groupValue }\">"
+"        <a href=\"#\" v-on:click=\"navClick($event)\">"
+"            <slot></slot>"
+"        </a>"
+"    </li>",
    model: { 
        // custom options for v-model
        prop: 'groupValue',
        event: 'input'
    },
    props: {
        "groupValue": String, // value of the currently-selected tab in the group (via v-model)
        "value": String // value for *this* tab
    },
    methods: {
        navClick: function(event) {
            this.$emit('input', this.value); // for use with v-model
            event.preventDefault(); // don't jump to top of page
        }
    }
});


Vue.component('dropbox-sync', {
    template: "   <div>"
+"        <!-- <div v-show=\"dropboxSyncStatus\">"
+"            Dropbox sync status: {{ dropboxSyncStatus }}"
+"        </div> -->"
+"        "
+"        <div v-show=\"!dropboxAccessToken\">"
+"            Dropbox <a target=\"_blank\" href=\"https://dropbox.github.io/dropbox-api-v2-explorer/#files_list_folder\">access token</a>"
+"            <input type=\"text\" v-model=\"editAccessToken\" class=\"form-control\" />"
+"            <button class=\"btn btn-default\" v-on:click=\"saveAccessToken\">Set</button>"
+"        </div>"
+"    </div>",
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
                    alert("Failed to download " + self.filename + " from Dropbox - " + error.message);
                    self.setSyncStatus("Error");
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
                    alert("Failed to upload " + self.filename + " to Dropbox - " + error.message);
                    self.setSyncStatus("Error");
                    self.dropboxLastSyncTimestamp = "";
                });
        }
    }
});


Vue.component('editor-dialog', {
    template: "<div style=\"margin-left: -15px; margin-right: -15px\">"
+"    <!-- -15px margin to counteract the 15px margin added by div class=\"container\" on parent."
+"          This means that content (e.g. the markdown edit box) will go all the way "
+"          to the sides of the screen. -->"
+""
+"    <!-- <div class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" data-backdrop=\"static\">"
+"        <div class=\"modal-dialog\" role=\"document\">"
+"            <div class=\"modal-content\"> -->"
+"                <div class=\"modal-header\""
+"                     style=\"border-bottom: none; padding: 0; background-color: #ddd\">"
+""
+"                    <h4 class=\"modal-title\">"
+"                        <ul class=\"nav nav-tabs\">       "
+"                            <bootstrap-nav value=\"details\" v-model=\"activeTab\">Event details</bootstrap-nav> "
+"                            <bootstrap-nav value=\"notes\"   v-model=\"activeTab\">"
+"                                <span v-if=\"!dbitem.notes\">+</span>"
+"                                <span v-if=\"!!dbitem.notes\">Notes</span>"
+"                            </bootstrap-nav> "
+"                            <!-- <bootstrap-nav v-show=\"!!dbitem.notes\""
+"                                           value=\"markdown\" v-model=\"activeTab\">"
+"                                                M<span style=\"font-size: smaller\" class=\"glyphicon glyphicon-arrow-down\"></span>"
+"                            </bootstrap-nav> -->"
+"                        </ul>"
+"                    </h4>"
+"                </div>"
+"                <div>"
+"                    <!-- class=\"modal-body\" style=\"padding-bottom: 0\" -->"
+"                    <div v-show=\"activeTab == 'notes'\">"
+"                        <simple-mde v-model=\"dbitem.notes\""
+"                                    ref=\"simplemde\""
+"                        ></simple-mde><!-- style=\"height: 200px\" -->"
+"                        <!--<textarea class=\"form-control\" "
+"                                  style=\"height: 200px\""
+"                                  ref=\"textarea\""
+"                                  v-model=\"dbitem.notes\"></textarea>-->"
+"                    </div>"
+"                    <!-- 200px = smaller notes box (for use on mobile devices"
+"                         where the keyboard takes up half the screen) -->"
+""
+"                    <!-- <div v-show=\"activeTab == 'markdown'\""
+"                         class=\"well\""
+"                         style=\"height: 400px; overflow-y: scroll; margin: 0\">"
+"                        <div v-html=\"markdownHtml\"></div>"
+"                    </div> -->"
+""
+"                    <div v-show=\"activeTab == 'details'\""
+"                         class=\"form-horizontal\""
+"                         style=\"padding: 30px 30px 15px 30px\">"
+""
+"                        <div class=\"form-group\">"
+"                            <label class=\"col-xs-3 control-label\">Type</label>"
+"                            <div class=\"col-xs-6\">"
+"                                <select class=\"form-control\" v-model=\"dbitem.type\">"
+"                                    <option v-for=\"(value, key) in eventTypes\""
+"                                            v-bind:value=\"key\">{{ value }} {{ key }}</option>"
+"                                </select>"
+"                            </div>"
+"                        </div>"
+"                        "
+"                        <div class=\"form-group\">"
+"                            <label class=\"col-xs-3 control-label\">Name</label>"
+"                            <div class=\"col-xs-9\">"
+"                                <input type=\"text\" class=\"form-control\" v-model=\"dbitem.name\">"
+"                            </div>"
+"                        </div>"
+""
+"                        <div class=\"form-group\">"
+"                            <label class=\"col-xs-3 control-label\">Location</label>"
+"                            <div class=\"col-xs-9\">"
+"                                <input type=\"text\" class=\"form-control\" v-model=\"dbitem.location\">"
+"                            </div>"
+"                        </div>"
+""
+"                        <div class=\"form-group\">"
+"                            <label class=\"col-xs-3 control-label\">Date</label>"
+"                            <div class=\"col-xs-6\">"
+"                                <div class=\"input-group\">"
+"                                    <bootstrap-datepicker v-model=\"dbitem.date\"></bootstrap-datepicker>"
+"                                    <span class=\"input-group-btn\">"
+"                                        <button class=\"btn btn-default\" v-on:click=\"clearDate\">x</button>"
+"                                    </span>"
+"                                </div><!-- /input-group -->"
+"                            </div> "
+"                        </div>"
+""
+"                        <div class=\"form-group\">"
+"                            <label class=\"col-xs-3 control-label\">Status</label>"
+"                            <div class=\"col-xs-7\">"
+"                                <select class=\"form-control\" v-model=\"dbitem.status\">"
+"                                    <option v-for=\"(value, key) in statusList\""
+"                                            v-bind:value=\"key\">{{ value }} {{ key }}</option>"
+"                                </select>"
+"                            </div>"
+"                        </div>"
+""
+"                        <div class=\"form-group\">"
+"                            <label class=\"col-xs-3 control-label\">Link</label>"
+"                            <div class=\"col-xs-9\">"
+"                                <div v-bind:class=\"{ 'input-group': !!dbitem.link }\">"
+"                                    <input type=\"text\" class=\"form-control\" v-model=\"dbitem.link\">"
+"    "
+"                                    <a v-show=\"!!dbitem.link\""
+"                                        v-bind:href=\"dbitem.link\""
+"                                        class=\"input-group-addon emoji\""
+"                                        target=\"_blank\"><span class=\"glyphicon glyphicon-new-window\"></span></a>"
+"                                </div>"
+"                            </div>"
+"                        </div>"
+""
+"                        "
+""
+"                    </div>"
+"                </div>"
+"                <div class=\"modal-footer\">"
+"                    <!--<div v-show=\"activeTab == 'notes'\""
+"                         style=\"float: left\">"
+"                        <button type=\"button\" class=\"btn btn-default\" v-on:click=\"insertTodo\">⏹</button>"
+"                        <button type=\"button\" class=\"btn btn-default\" v-on:click=\"insertDone\">✅</button>"
+"                    </div>-->"
+"                    <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\""
+"                            v-on:click=\"close\">Close</button>"
+"                    <button type=\"button\" "
+"                            class=\"btn btn-primary\""
+"                            v-on:click=\"save\">Save changes</button>"
+"                </div>"
+"            <!-- </div>"
+"        </div>"
+"    </div> -->"
+"</div>",
    props: {
        'eventTypes': Object,
        'statusList': Object
    },
    data: function() {
        return {
            dbitem: new_timelineItem(),
            activeTab: 'details' // 'details' or 'notes'
        }
    },
    methods: {
        openDialog: function (item) { // called by parent via $refs
            if (!item) {
                // create new item
                this.dbitem = new_timelineItem();
            } else {
                // edit existing item
                this.dbitem = item;
            }
            this.activeTab = 'details';
            // $(this.$el).modal('show');
        },
        save: function () {
            this.$emit('save', this.dbitem);
            // $(this.$el).modal('hide');
        },
        close: function () {
            this.$emit('close');
        },
        clearDate: function() {
            //if (confirm("Clear the date?")) {
                this.dbitem.date = null;
            //}
        },
        //insertAtCursor: function (textToInsert) {
        //    const input = this.$refs.textarea;
        //
        //    // see https://www.everythingfrontend.com/posts/insert-text-into-textarea-at-cursor-position.html
        //    // get current text of the input
        //    const value = this.dbitem.notes;
        //
        //    // save selection start and end position
        //    const start = input.selectionStart;
        //    const end = input.selectionEnd;
        //
        //    // update the value with our text inserted
        //    this.dbitem.notes = value.slice(0, start) + textToInsert + value.slice(end);
        //
        //    // update cursor to be at the end of insertion
        //    Vue.nextTick(function() {
        //        setTimeout(function() { // without setTimeout input.selectionStart often gets reset to 1 
        //            input.selectionStart = input.selectionEnd = start + textToInsert.length;
        //            input.focus();
        //        }, 0);
        //    });
        //},
        //insertTodo: function() {
        //    this.insertAtCursor("⏹ ");
        //},
        //insertDone: function() {
        //    this.insertAtCursor("✅ ");
        //}
    },
    // computed: {
    //     markdownHtml: function() {
    //         if (!this.dbitem.notes) return "";
    //         var reader = new commonmark.Parser();
    //         var parsed = reader.parse(this.dbitem.notes);
    //         var writer = new commonmark.HtmlRenderer({softbreak: "<br />"}); // make soft breaks render as hard breaks in HTML
    //         return writer.render(parsed);
    //     }
    // },
    watch: {
        activeTab: function (newValue) {
            if (newValue == "notes") { 
                // tell SimpleMDE to refresh 
                // (otherwise the contents won't update until the control is focussed/clicked!)
                var self = this;
                Vue.nextTick(function() { // wait for tab to become visible
                    self.$refs.simplemde.refresh(); 
                });
            }
        }
    }
});

function new_timelineItem() {
    return {
        id: -1, // will be set when saved
        type: '',
        name: '',
        location: '',
        date: null,
        status: '',
        link: '',
        notes: ''
    };
}


Vue.component('link-editor', {
    template: "    <div class=\"modal fade\" tabindex=\"-1\" role=\"dialog\">"
+"        <div class=\"modal-dialog\" role=\"document\">"
+"            <div class=\"modal-content\">"
+"                <div class=\"modal-header\">"
+"                    <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span"
+"                            aria-hidden=\"true\">&times;</span></button>"
+"                    <h4 class=\"modal-title\">Link details</h4>"
+"                </div>"
+"                <div class=\"modal-body\" style=\"padding-bottom: 0\">"
+"    "
+"                    <div class=\"form-horizontal\">"
+""
+"                       "
+"                        <div class=\"form-group\">"
+"                            <label class=\"col-xs-3 control-label\">Name</label>"
+"                            <div class=\"col-xs-9\">"
+"                                <input type=\"text\" class=\"form-control\" v-model=\"item.name\">"
+"                            </div>"
+"                        </div>"
+""
+""
+"                        <div class=\"form-group\">"
+"                            <label class=\"col-xs-3 control-label\">Link</label>"
+"                            <div class=\"col-xs-9\">"
+"                                <div v-bind:class=\"{ 'input-group': !!item.link }\">"
+"                                    <input type=\"text\" class=\"form-control\" v-model=\"item.link\">"
+"    "
+"                                    <a v-show=\"!!item.link\""
+"                                        v-bind:href=\"item.link\""
+"                                        class=\"input-group-addon emoji\""
+"                                        target=\"_blank\"><span class=\"glyphicon glyphicon-new-window\"></span></a>"
+"                                </div>"
+"                            </div>"
+"                        </div>"
+""
+"                        <div class=\"form-group\">"
+"                            <label class=\"col-xs-3 control-label\">Notes</label>"
+"                            <div class=\"col-xs-9\">"
+"                                <input type=\"text\" class=\"form-control\" v-model=\"item.notes\" />"
+"                            </div>"
+"                        </div>"
+""
+"                    </div>"
+"                </div>"
+"                <div class=\"modal-footer\">"
+"                    <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Close</button>"
+"                    <button type=\"button\" "
+"                            class=\"btn btn-primary\""
+"                            v-on:click=\"save\">Save changes</button>"
+"                </div>"
+"            </div>"
+"        </div>"
+"    </div>",
    data: function() {
        return {
            item: new_linkItem()
        }
    },
    methods: {
        openDialog: function (item) { // called by parent via $refs
            if (!item) {
                // create new item
                this.item = new_linkItem();
            } else {
                // edit existing item
                this.item = item;
            }
            $(this.$el).modal('show');
        },
        save: function () {
            this.$emit('save', this.item);
            $(this.$el).modal('hide');
        }
    }
});

function new_linkItem() {
    return {
        id: -1, // will be set when saved
        type: 'Link',
        name: '',
        link: '',
        notes: ''
    };
}



Vue.component('links-page', {
    template: "    <div>"
+"        <button class=\"btn btn-success\" "
+"                v-on:click=\"addLink\">"
+"            Add Link"
+"        </button>"
+""
+"        <div v-for=\"item in linksList\""
+"            v-bind:key=\"item.id\""
+"            class=\"panel panel-default\""
+"            v-bind:class=\"{ 'faded': item.id == itemBeingUpdated }\">"
+"            <div class=\"panel-heading\">"
+"                <div style=\"font-weight: bold\">"
+"                    "
+"                    <span v-on:click=\"editEvent(item.id)\""
+"                            style=\"cursor: pointer\">"
+"                        {{ item.name}}"
+"                    </span>"
+""
+"                    <a v-if=\"item.link\""
+"                        v-bind:href=\"item.link\""
+"                        class=\"emoji\""
+"                        style=\"text-decoration: none\""
+"                        target=\"_blank\">&nbsp;<span class=\"glyphicon glyphicon-new-window\"></span></a>"
+"                </div>"
+"                <div v-show=\"!!item.notes\""
+"                     class=\"text-muted\">"
+"                    {{ item.notes }}"
+"                </div>"
+"            </div><!-- /panel-heading -->"
+"        </div>"
+""
+"        <link-editor ref=\"editor\""
+"                v-on:save=\"editorSave\"></link-editor>"
+"    </div>",
    props: {
        dropboxData: Array,
        itemBeingUpdated: String // id (guid) of item currently being saved
    },
    methods: {
        addLink: function () {
            this.$refs.editor.openDialog();
        },
        editEvent: function(itemId) {
            var idx = this.dropboxData.findIndex(z => z.id === itemId);
            var copy = Object.assign({}, this.dropboxData[idx]); // create a copy of the item for the editor to work with
            this.$refs.editor.openDialog(copy);
        },
        editorSave: function(item) {
            this.$emit('update-item', item);
        }
    },
    computed: {
        linksList: function() {
            return this.dropboxData.filter(function(item) {
                return item.type == "Link"
            });
        }
    }
});


Vue.component('simple-mde', {
    template: "    <textarea></textarea>",
    props: {
        value: String // for use with v-model
    },
    data: function() {
        return { 
            mde: null,
            changesToIgnore: []
        }
    },
    mounted: function() {
        this.mde = new EasyMDE({ 
            element: this.$el,
            spellChecker: false,
            initialValue: this.value,
            status: false, // hide the status bar
            autofocus: true,
            toolbar: ["bold", "italic", "heading", "|", 
                      //"quote", "unordered-list", "ordered-list", "|", 
                      //"link", "image", "|", 
                      "preview", "side-by-side", "fullscreen", "|", 
                      //"guide" 
                      ],
            minHeight: '100px'
            // set height of control with .CodeMirror CSS class
        });
        
        var self = this;
        this.mde.codemirror.on("change", function() {
            var newValue = self.mde.value();
            self.changesToIgnore.push(newValue); // save this internal change so it can be ignored later
            self.$emit("input", newValue); // for use with v-model
        });

        this.mde.codemirror.on('refresh', function () {
            // Fix fullscreen when in Bootstrap modal
            // see https://github.com/sparksuite/simplemde-markdown-editor/issues/263#issuecomment-262591099
            if (self.mde.isFullscreenActive()) {
                $('body').addClass('simplemde-fullscreen');
            } else {
                $('body').removeClass('simplemde-fullscreen');
            }
        });
    },
    beforeDestroy: function() {
        // Remove SimpleMDE from textarea 
        this.mde.toTextArea();
        this.mde = null;
    },
    watch: {
        value: function (newValue) {
            // Update when value changes
            var ignoreIdx = this.changesToIgnore.indexOf(newValue);
            if (ignoreIdx == -1) {
                // External change - update control with new value
                this.mde.value(newValue);
                this.changesToIgnore.splice(0, this.changesToIgnore.length); // remove all items from array
            } else {
                // Internal change (caused by self.$emit) - ignore 
                this.changesToIgnore.splice(ignoreIdx, 1); // remove item from array
            }
        }
    },
    methods: {
        refresh: function() { // NOTE: This function is called by parent (via $refs) so its name must not be changed!
            // Useful for Bootstrap modal/tabs, 
            // where the contents don't update until the control is focussed/clicked,
            // so triggering a manual refresh is necessary.
            // See https://github.com/F-loat/vue-simplemde/issues/20#issuecomment-326799643
            this.mde.codemirror.refresh();
        }
    }
});



Vue.component('timeline-page', {
    template: "    <div>"
+"        <button class=\"btn btn-success\" "
+"                v-on:click=\"addEvent\">"
+"            Add Event"
+"        </button>"
+""
+"        <div v-for=\"item in orderedTimeline\""
+"            v-bind:key=\"item.id\""
+"            class=\"panel\""
+"            v-bind:class=\"{ 'panel-success': item.status == 'Going',"
+"                            'panel-default': item.status == 'Interested',"
+"                            'panel-danger': item.status == 'Need to book',"
+"                            'panel-warning': !item.status,"
+"                            'faded': item.id == itemBeingUpdated }\">"
+"            <div class=\"panel-heading\">"
+"                <div v-if=\"isCollapsed(item) && item.date\""
+"                     class=\"pull-right\">"
+"                    <span class=\"text-muted\">{{ item.date | formatDate('D/MMM') }}</span>"
+"                    <span v-bind:class=\"{ 'text-danger': dateIsInPast(item.date) }\">({{ howSoon(item.date) }})</span>"
+"                </div>"
+"                <div style=\"font-weight: bold\""
+"                        v-bind:class=\"{ 'text-muted': isCollapsed(item) }\">"
+"                    "
+"                    <span v-on:click=\"editEvent(item.id)\""
+"                            style=\"cursor: pointer\">"
+"                        {{ eventTypes[item.type] }} "
+"                        {{ item.name }}"
+"                    </span>"
+"                    "
+"                    <a v-if=\"item.link\""
+"                        v-bind:href=\"item.link\""
+"                        class=\"emoji\""
+"                        style=\"text-decoration: none\""
+"                        target=\"_blank\">&nbsp;<span class=\"glyphicon glyphicon-new-window\"></span></a>"
+"                </div>"
+"                <div v-show=\"!isCollapsed(item)\">"
+"                    <div v-if=\"item.date\">"
+"                        <span class=\"text-muted\">{{ item.date | formatDate('dddd D MMMM YYYY') }}</span>"
+"                        <span v-bind:class=\"{ 'text-danger': dateIsInPast(item.date),"
+"                                              'text-dark':  !dateIsInPast(item.date) && item.status == 'Need to book' }\">"
+"                                              <!-- ^^ change colour from red to dark gray, as red is reserved for dates in the past. -->"
+"                            ({{ howSoon(item.date) }})"
+"                        </span>"
+"                    </div>"
+"                    <div class=\"text-muted\" v-if=\"item.location\">{{ item.location }}</div>"
+"                    <div>"
+"                        <span class=\"emoji\">"
+"                            {{ statusList[item.status] }}"
+"                        </span>"
+"                        <span class=\"text-muted\">"
+"                            {{ item.status }}"
+"                        </span>"
+"                    </div>"
+"                    "
+"                    <button class=\"btn btn-sm btn-default\""
+"                            v-bind:disabled=\"item.id == itemBeingUpdated\""
+"                            v-on:click=\"editEvent(item.id)\">Edit</button>"
+"                </div>"
+"            </div><!-- /panel-heading -->"
+"        </div>"
+""
+"        "
+"    </div>",
    props: {
        timeline: Array,
        itemBeingUpdated: String, // id (guid) of item currently being saved
        ideasOnly: Boolean,
        eventTypes: Object,
        statusList: Object
    },
    methods: {
        addEvent: function () {
            this.$emit('open-editor', null);
        },
        editEvent: function(itemId) {
            var idx = this.timeline.findIndex(z => z.id === itemId);
            var copy = Object.assign({}, this.timeline[idx]); // create a copy of the item for the editor to work with
            this.$emit('open-editor', copy);
        },
        isCollapsed: function(item) { 
            return item.status == "Interested";
        },
        howSoon: function(date) {
            // NOTE: Using UTC for date comparisons, to avoid problems caused by 
            //       comparing dates from different timezones (due to daylight savings):
            // EXAMPLE (LOCAL TIME):    
            //        Today's date = "Sun Mar 15 2020 00:00:00 GMT+0000"
            //          Event date = "Mon Mar 30 2020 00:00:00 GMT+0100"
            //   duration.asDays() = 14.958333333333334 (1 hour short, due to clocks going forward)
            //    Result displayed = "2 weeks 0 days" ❌ (should be 2 weeks 1 day) 
            // EXAMPLE (UTC):
            //       Todays's date = "Sun Mar 15 2020 00:00:00 GMT+0000"
            //          Event date = "Mon Mar 30 2020 00:00:00 GMT+0000"
            //   duration.asDays() = 15
            //    Result displayed = "2 weeks 1 day" ✅
            var eventDate = moment.utc(date);
            var nowDate = moment.utc(moment().format("YYYY-MM-DD"));
            var duration = moment.duration(eventDate.diff(nowDate));
            //return duration.humanize();

            var pluralise = function(number, suffix) {
                return number + " " + suffix 
                    + (number == 1 ? "" : "s");
            }

            // Handle dates in the past
            var isNegative = false;
            if (duration.asMilliseconds() < 0) {
                duration = moment.duration(0 - duration.asMilliseconds(), 'milliseconds');
                isNegative = true;
            }

            if (duration.asDays() < 7) {
                if (duration.days() == 0)
                    return "Today";
                else 
                    // Less than a week away - show # days
                    return pluralise(duration.days(), "day") 
                         + (isNegative ? " ago" : "");
            } else if (duration.asWeeks() < 10)
                // Less than 10 weeks away - show in weeks/days
                return pluralise(Math.floor(duration.asWeeks()), "week") + " " 
                     + pluralise(Math.floor(duration.asDays() % 7), "day")
                     + (isNegative ? " ago" : "");
            else if (duration.asYears() < 1)
                // Less than a year away - show in months
                return pluralise(duration.months(), "month")
                     + (isNegative ? " ago" : "");
            else 
                // More than a year away - show years/months
                return pluralise(duration.years(), "year") + " "  
                     + pluralise(duration.months(), "month")
                     + (isNegative ? " ago" : "");
        },
        dateIsInPast: function (datestr) {
            return moment(datestr).isBefore();
        }
    },
    computed: {
        orderedTimeline: function() {
            var self = this;
            var filteredTimeline = this.timeline.filter(function(item) {
                return item.type != "Link" && item.status != "Went" && item.status != "Didn't go"
                && ((self.ideasOnly == true && !item.date) || (self.ideasOnly == false && item.date))
            });
            return _.orderBy(filteredTimeline, ["date"]);
        }
    }
});
