

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
+"        <nav class=\"navbar navbar-default\">"
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
+"        <ul class=\"nav nav-tabs\">"
+"            <bootstrap-nav value=\"timeline\" v-model=\"activeTab\">Timeline</bootstrap-nav>"
+"            <bootstrap-nav value=\"links\"    v-model=\"activeTab\">Links</bootstrap-nav>"
+"        </ul>"
+""
+"        <timeline-page v-show=\"activeTab == 'timeline'\""
+"                       v-bind:timeline=\"dropboxData\""
+"                       v-on:update-item=\"updateItem($event)\""
+"                       v-bind:item-being-updated=\"itemBeingUpdated\">"
+"        </timeline-page>"
+""
+"        <links-page v-show=\"activeTab == 'links'\""
+"                    v-bind:dropbox-data=\"dropboxData\""
+"                    v-on:update-item=\"updateItem($event)\""
+"                    v-bind:item-being-updated=\"itemBeingUpdated\">"
+"        </links-page>"
+""
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
    template: "    <div class=\"modal fade\" tabindex=\"-1\" role=\"dialog\">"
+"        <div class=\"modal-dialog\" role=\"document\">"
+"            <div class=\"modal-content\">"
+"                <div class=\"modal-header\""
+"                     style=\"border-bottom: none\">"
+"                    <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span"
+"                            aria-hidden=\"true\">&times;</span></button>"
+"                    <h4 class=\"modal-title\">"
+"                        <ul class=\"nav nav-tabs\">       "
+"                            <bootstrap-nav value=\"details\" v-model=\"activeTab\">Event details</bootstrap-nav> "
+"                            <bootstrap-nav value=\"notes\"   v-model=\"activeTab\">"
+"                                <span v-if=\"!dbitem.notes\">+</span>"
+"                                <span v-if=\"!!dbitem.notes\">Notes</span>"
+"                            </bootstrap-nav> "
+"                        </ul>"
+"                    </h4>"
+"                </div>"
+"                <div class=\"modal-body\" style=\"padding-bottom: 0\">"
+"    "
+"                    <div v-show=\"activeTab == 'notes'\">"
+"                        <textarea class=\"form-control\" rows=\"13\""
+"                                    v-model=\"dbitem.notes\"></textarea>"
+"                    </div>"
+""
+"                    <div v-show=\"activeTab == 'details'\""
+"                         class=\"form-horizontal\">"
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
+"                    <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Close</button>"
+"                    <button type=\"button\" "
+"                            class=\"btn btn-primary\""
+"                            v-on:click=\"save\">Save changes</button>"
+"                </div>"
+"            </div>"
+"        </div>"
+"    </div>",
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
            $(this.$el).modal('show');
        },
        save: function () {
            this.$emit('save', this.dbitem);
            $(this.$el).modal('hide');
        },
        clearDate: function() {
            //if (confirm("Clear the date?")) {
                this.dbitem.date = null;
            //}
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
+"                    <h4 class=\"modal-title\">Event details</h4>"
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
+"                    ({{ howSoon(item.date) }})"
+"                </div>"
+"                <div style=\"font-weight: bold\""
+"                        v-bind:class=\"{ 'text-muted': isCollapsed(item) }\">"
+"                    "
+"                    <span v-on:click=\"editEvent(item.id)\""
+"                            style=\"cursor: pointer\">"
+"                        {{ eventTypes[item.type] }} "
+"                    </span>"
+"                    "
+"                    {{ item.name}}"
+""
+"                    <a v-if=\"item.link\""
+"                        v-bind:href=\"item.link\""
+"                        class=\"emoji\""
+"                        style=\"text-decoration: none\""
+"                        target=\"_blank\">&nbsp;<span class=\"glyphicon glyphicon-new-window\"></span></a>"
+"                </div>"
+"                <div v-show=\"!isCollapsed(item)\">"
+"                    <div v-if=\"item.date\"  >"
+"                        <span class=\"text-muted\">{{ item.date | formatDate('dddd D MMMM YYYY') }}</span>"
+"                        ({{ howSoon(item.date) }})"
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
+"        <editor-dialog ref=\"editor\""
+"                v-bind:event-types=\"eventTypes\""
+"                v-bind:status-list=\"statusList\""
+"                v-on:save=\"editorSave\"></editor-dialog>"
+"    </div>",
    props: {
        timeline: Array,
        itemBeingUpdated: String // id (guid) of item currently being saved
    },
    data: function() {
        return {
            eventTypes: {
                "Birthday": "🎂",
                "Restaurent": "🍽️",
                "Film": "🎬",
                "Comedy": "🎭",
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
    methods: {
        addEvent: function () {
            this.$refs.editor.openDialog();
        },
        editEvent: function(itemId) {
            var idx = this.timeline.findIndex(z => z.id === itemId);
            var copy = Object.assign({}, this.timeline[idx]); // create a copy of the item for the editor to work with
            this.$refs.editor.openDialog(copy);
        },
        editorSave: function(item) {
            this.$emit('update-item', item);
        },
        isCollapsed: function(item) { 
            return item.status == "Interested";
        },
        howSoon: function(date) {
            var eventDate = moment(date);
            var nowDate = moment().startOf('day');
            var duration = moment.duration(eventDate.diff(nowDate));
            //return duration.humanize();
            var pluralise = function(number, suffix) {
                return number + " " + suffix + (number == 1 ? "" : "s");
            }
            if (duration.asDays() < 7) {
                if (duration.days() == 0)
                    return "Today";
                else 
                    // Less than a week away - show # days
                    return pluralise(duration.days(), "day");
            } else if (duration.asWeeks() < 10)
                // Less than 10 weeks away - show in weeks/days
                return pluralise(Math.floor(duration.asWeeks()), "week") + " " + pluralise(duration.asDays() % 7, "day");
            else if (duration.asYears() < 1)
                // Less than a year away - show in months
                return pluralise(duration.months(), "month");
            else 
                // More than a year away - show years/months
                return pluralise(duration.years(), "year") + " "  + pluralise(duration.months(), "month");
        }
    },
    computed: {
        orderedTimeline: function() {
            var filteredTimeline = this.timeline.filter(function(item) {
                return item.type != "Link" && item.status != "Went" && item.status != "Didn't go";
            });
            return _.orderBy(filteredTimeline, ["date"]);
        }
    }
});
