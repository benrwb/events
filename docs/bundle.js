Vue.component('app-main', {
    template: "<div>\n"
+"\n"
+"    <div v-show=\"!!dropboxSyncStatus\"\n"
+"        class=\"alert alert-warning syncdiv\">Dropbox sync: {{ dropboxSyncStatus }}</div>\n"
+"\n"
+"    <dropbox-sync ref=\"dropbox\"\n"
+"                  filename=\"json/events.json\"\n"
+"                  v-on:sync-status-change=\"dropboxSyncStatus = $event\">\n"
+"    </dropbox-sync>\n"
+"\n"
+"    <div v-show=\"connectedToDropbox\">\n"
+"        \n"
+"        <div v-show=\"activeTab != 'editor' && activeTab != 'linkeditor'\">\n"
+"            <nav class=\"navbar navbar-default\">\n"
+"                <div class=\"container-fluid\">\n"
+"                    <p class=\"navbar-text pull-right\">\n"
+"                        {{ currentTime | formatDate('dddd D MMMM') }}\n"
+"                    </p>\n"
+"                    <div class=\"navbar-header\">\n"
+"                        <a class=\"navbar-brand\" href=\"#\">\n"
+"                            <span class=\"glyphicon glyphicon-home\"></span>\n"
+"                            <span class=\"glyphicon glyphicon-arrow-right\"></span>\n"
+"                            Events\n"
+"                        </a>\n"
+"                        <!-- <button class=\"btn btn-success navbar-btn\" \n"
+"                                v-on:click=\"addEvent\">\n"
+"                            Add Event\n"
+"                        </button> -->\n"
+"                    </div>\n"
+"                </div><!-- /.container-fluid -->\n"
+"            </nav>\n"
+"            <ul class=\"nav nav-tabs\">\n"
+"                <bootstrap-nav value=\"timeline\" v-model=\"activeTab\">Timeline</bootstrap-nav>\n"
+"                <bootstrap-nav value=\"links\"    v-model=\"activeTab\">Links</bootstrap-nav>\n"
+"                <bootstrap-nav value=\"ideas\"    v-model=\"activeTab\">Ideas</bootstrap-nav>\n"
+"            </ul>\n"
+"        </div>\n"
+"\n"
+"        <timeline-page v-show=\"activeTab == 'timeline' || activeTab == 'ideas'\"\n"
+"                       v-bind:ideas-only=\"activeTab == 'ideas'\"\n"
+"                       v-bind:timeline=\"dropboxData\"\n"
+"                       v-bind:item-being-updated=\"itemBeingUpdated\"\n"
+"                       v-bind:event-types=\"eventTypes\"\n"
+"                       v-bind:status-list=\"statusList\"\n"
+"                       v-on:open-editor=\"openEditor\">\n"
+"        </timeline-page>\n"
+"\n"
+"        <links-page v-show=\"activeTab == 'links'\"\n"
+"                    v-bind:link-types=\"linkTypes\"\n"
+"                    v-bind:dropbox-data=\"dropboxData\"\n"
+"                    v-bind:item-being-updated=\"itemBeingUpdated\"\n"
+"                    v-on:open-editor=\"openLinkEditor\">\n"
+"        </links-page>\n"
+"\n"
+"        <editor-dialog v-show=\"activeTab == 'editor'\"\n"
+"                       ref=\"editor\"\n"
+"                       v-bind:event-types=\"eventTypes\"\n"
+"                       v-bind:status-list=\"statusList\"\n"
+"                       v-on:save=\"updateItem($event, true)\"\n"
+"                       v-on:close=\"closeEditor\">\n"
+"        </editor-dialog>\n"
+"\n"
+"        <link-editor v-show=\"activeTab == 'linkeditor'\"\n"
+"                     ref=\"linkeditor\"\n"
+"                     v-bind:link-types=\"linkTypes\"\n"
+"                     v-on:save=\"updateItem($event, true)\"\n"
+"                     v-on:close=\"closeEditor\">\n"
+"        </link-editor>\n"
+"\n"
+"    </div><!-- v-show=\"connectedToDropbox\"-->\n"
+"\n"
+"</div>\n",
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
                    "Special occasion": "🎂",
                    "Restaurant": "🍽️",
                    "Film": "🎬",
                    "Live Entertainment": "🎭",
                    "Music": "🎵",
                    "Excursion": "🚶‍",
                    "Holiday - Abroad": "🌞",
                    "Holiday - UK": "🇬🇧"
                },
                statusList: {
                    "": "",
                    "Going": "✔",
                    "Interested": "⭐",
                    "Need to book": "🎟",
                    "Went":"🙂",
                    "Didn't go": "🙁"
                },
                linkTypes: {
                    "Ticket sales": "🎫",
                    "Event listings": "📰",
                    "Venue": "🏛",
                    "Holidays": "🌞",
                    "Other": "💡",
                    "Information": "ℹ"
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
            openLinkEditor: function (item) {
                this.previousTab = this.activeTab;
                this.previousScrollPosition = document.documentElement.scrollTop;
                this.activeTab = "linkeditor";
                this.$refs.linkeditor.openDialog(item);
            },
            updateItem: function (item, shouldCloseEditor) {
                var self = this;
                if (item.id == "") {
                    item.id = this.uuidv4();
                    this.$refs.dropbox.addItem(item, function(dropboxData) {
                        self.dropboxData = dropboxData;
                    });
                } else {
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
                return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
                );
            }
        }
    });
Vue.component('bootstrap-datepicker', {
    template: "    <input class='form-control' type='text' />\n",
    props: {
        value: String, // accept a value prop (for use with v-model)
        format: String // custom date format
    },
    mounted: function () {
        var modate = !this.value ? null : moment(this.value);
        if (modate != null && modate.isValid()) {
            $(this.$el).val(modate.format("DD/MM/YYYY"));
        }
        $(this.$el).datepicker({
            format: this.format || "dd/mm/yyyy", // default to UK date format
            autoclose: true,
            todayHighlight: true,
            disableTouchKeyboard: true, //  hide keyboard on mobile devices
            weekStart: 1 // week starts on Monday
        });
        var self = this;
        $(this.$el).datepicker().on("hide", function (e) {
            self.updateValue();
        });
    },
    watch: {
        value: function (newValue) {
            var modate = newValue == null ? null : moment(newValue); // handle null/undefined values
            if (modate != null && modate.isValid())
                $(this.$el).datepicker("setDate", modate.toDate());
            else
                $(this.$el).datepicker("setDate", null); // clear the selected date
        }
    },
    methods: {
        updateValue: function () {
            var jsDate = $(this.$el).datepicker("getDate");
            var dateVal = jsDate == null ? null : moment(jsDate).format('YYYY-MM-DD');
            this.$emit('input', dateVal);
        },
    }
});
Vue.component('bootstrap-nav', {
    template: "    <li role=\"presentation\"\n"
+"        v-bind:class=\"{ 'active': value == groupValue }\">\n"
+"        <a href=\"#\" v-on:click=\"navClick($event)\">\n"
+"            <slot></slot>\n"
+"        </a>\n"
+"    </li>\n",
    model: { 
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
    template: "   <div>\n"
+"        <!-- <div v-show=\"dropboxSyncStatus\">\n"
+"            Dropbox sync status: {{ dropboxSyncStatus }}\n"
+"        </div> -->\n"
+"        \n"
+"        <div v-show=\"!dropboxAccessToken\">\n"
+"            Dropbox <a target=\"_blank\" href=\"https://dropbox.github.io/dropbox-api-v2-explorer/#files_list_folder\">access token</a>\n"
+"            <input type=\"text\" v-model=\"editAccessToken\" class=\"form-control\" />\n"
+"            <button class=\"btn btn-default\" v-on:click=\"saveAccessToken\">Set</button>\n"
+"        </div>\n"
+"    </div>\n",
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
            if (!this.dropboxAccessToken) return;
            this.setSyncStatus("Loading");
            var dbx = new Dropbox.Dropbox({ accessToken: this.dropboxAccessToken });
            var self = this;
            dbx.filesDownload({ path: '/' + this.filename })
                .then(function(data) {
                    var reader = new FileReader();
                    reader.addEventListener("loadend", function() {
                        var dropboxData = JSON.parse(reader.result);
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
            this.loadData(function(dropboxData) {
                dropboxData.push(itemToAdd);
                self.saveData(dropboxData, onComplete); // save updated data
            });
        },
        editItem: function(itemToEdit, onComplete) {
            var self = this;
            this.loadData(function(dropboxData) {
                var idx = dropboxData.findIndex(z => z.id === itemToEdit.id);
                dropboxData[idx] = itemToEdit; // replace item
                self.saveData(dropboxData, onComplete); // save updated data
            });
        },
        saveData: function(dropboxData, onComplete) {
            if (!this.dropboxAccessToken ) return;
            this.setSyncStatus("Saving");
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
    template: "<div class=\"editor-dialog\">\n"
+"    <!-- <div class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" data-backdrop=\"static\">\n"
+"        <div class=\"modal-dialog\" role=\"document\">\n"
+"            <div class=\"modal-content\"> -->\n"
+"                <div class=\"modal-header\"\n"
+"                     style=\"border-bottom: none; padding: 0; background-color: #ddd\">\n"
+"\n"
+"                    <h4 class=\"modal-title\">\n"
+"                        <ul class=\"nav nav-tabs\">       \n"
+"                            <bootstrap-nav value=\"details\" v-model=\"activeTab\">Event details</bootstrap-nav> \n"
+"                            <bootstrap-nav value=\"notes\"   v-model=\"activeTab\">\n"
+"                                <span v-if=\"!dbitem.notes\">+</span>\n"
+"                                <span v-if=\"!!dbitem.notes\">Notes</span>\n"
+"                            </bootstrap-nav> \n"
+"                            <!-- <bootstrap-nav v-show=\"!!dbitem.notes\"\n"
+"                                           value=\"markdown\" v-model=\"activeTab\">\n"
+"                                                M<span style=\"font-size: smaller\" class=\"glyphicon glyphicon-arrow-down\"></span>\n"
+"                            </bootstrap-nav> -->\n"
+"                        </ul>\n"
+"                    </h4>\n"
+"                </div>\n"
+"                <div>\n"
+"                    <!-- class=\"modal-body\" style=\"padding-bottom: 0\" -->\n"
+"                    <div v-show=\"activeTab == 'notes'\">\n"
+"                        <simple-mde v-model=\"dbitem.notes\"\n"
+"                                    ref=\"simplemde\"\n"
+"                        ></simple-mde><!-- style=\"height: 200px\" -->\n"
+"                        <!--<textarea class=\"form-control\" \n"
+"                                  style=\"height: 200px\"\n"
+"                                  ref=\"textarea\"\n"
+"                                  v-model=\"dbitem.notes\"></textarea>-->\n"
+"                    </div>\n"
+"                    <!-- 200px = smaller notes box (for use on mobile devices\n"
+"                         where the keyboard takes up half the screen) -->\n"
+"\n"
+"                    <!-- <div v-show=\"activeTab == 'markdown'\"\n"
+"                         class=\"well\"\n"
+"                         style=\"height: 400px; overflow-y: scroll; margin: 0\">\n"
+"                        <div v-html=\"markdownHtml\"></div>\n"
+"                    </div> -->\n"
+"\n"
+"                    <div v-show=\"activeTab == 'details'\"\n"
+"                         class=\"form-horizontal\"\n"
+"                         style=\"padding: 30px 30px 15px 30px\">\n"
+"\n"
+"                        <div class=\"form-group\">\n"
+"                            <label class=\"col-xs-3 control-label\">Type</label>\n"
+"                            <div class=\"col-xs-8\">\n"
+"                                <select class=\"form-control\" v-model=\"dbitem.type\">\n"
+"                                    <option v-for=\"(value, key) in eventTypes\"\n"
+"                                            v-bind:value=\"key\">{{ value }} {{ key }}</option>\n"
+"                                </select>\n"
+"                            </div>\n"
+"                        </div>\n"
+"                        \n"
+"                        <div class=\"form-group\"\n"
+"                             v-bind:class=\"{ 'no-bottom-margin': locationIncludesName }\">\n"
+"                            <label class=\"col-xs-3 control-label\">\n"
+"                                Name {{ locationIncludesName ? \"/\" : \"\" }}\n"
+"                            </label>\n"
+"                            <div class=\"col-xs-9\">\n"
+"                                <input type=\"text\" class=\"form-control\" v-model=\"dbitem.name\">\n"
+"                            </div>\n"
+"                        </div>\n"
+"\n"
+"                        <div class=\"form-group\">\n"
+"                            <label class=\"col-xs-3 control-label\">Location</label>\n"
+"                            <div class=\"col-xs-9\">\n"
+"                                <div v-bind:class=\"{ 'input-group': !!dbitem.location }\">\n"
+"                                    <input type=\"text\" class=\"form-control\" v-model=\"dbitem.location\">\n"
+"    \n"
+"                                    <a v-show=\"!!dbitem.location\"\n"
+"                                        v-bind:href=\"mapUrl\"\n"
+"                                        class=\"input-group-addon emoji\"\n"
+"                                        target=\"_blank\"><span class=\"glyphicon glyphicon-map-marker\"></span></a>\n"
+"                                </div>\n"
+"                            </div>\n"
+"                        </div>\n"
+"\n"
+"                        <div class=\"form-group\">\n"
+"                            <label class=\"col-xs-3 control-label\">Date</label>\n"
+"                            <div class=\"col-xs-7\">\n"
+"                                <div class=\"input-group\">\n"
+"                                    <bootstrap-datepicker v-model=\"dbitem.date\"\n"
+"                                                          format=\"D dd/mm/yyyy\"\n"
+"                                    ></bootstrap-datepicker>\n"
+"                                    <span class=\"input-group-btn\">\n"
+"                                        <button class=\"btn btn-default\" v-on:click=\"clearDate\">x</button>\n"
+"                                    </span>\n"
+"                                </div><!-- /input-group -->\n"
+"                                <label style=\"font-weight: normal\"\n"
+"                                       v-bind:class=\"{ 'text-muted': !dbitem.schoolHolidays }\">\n"
+"                                    <input type=\"checkbox\" \n"
+"                                           v-model=\"dbitem.schoolHolidays\" /> School holidays\n"
+"                                </label>\n"
+"                            </div>\n"
+"                        </div>\n"
+"\n"
+"                        <div class=\"form-group\">\n"
+"                            <label class=\"col-xs-3 control-label\">Status</label>\n"
+"                            <div class=\"col-xs-7\">\n"
+"                                <select class=\"form-control\" v-model=\"dbitem.status\">\n"
+"                                    <option v-for=\"(value, key) in statusList\"\n"
+"                                            v-bind:value=\"key\">{{ value }} {{ key }}</option>\n"
+"                                </select>\n"
+"                            </div>\n"
+"                        </div>\n"
+"\n"
+"                        <div class=\"form-group\">\n"
+"                            <label class=\"col-xs-3 control-label\">Link</label>\n"
+"                            <div class=\"col-xs-9\">\n"
+"                                <div v-bind:class=\"{ 'input-group': !!dbitem.link }\">\n"
+"                                    <input type=\"text\" class=\"form-control\" v-model=\"dbitem.link\">\n"
+"    \n"
+"                                    <a v-show=\"!!dbitem.link\"\n"
+"                                        v-bind:href=\"dbitem.link\"\n"
+"                                        class=\"input-group-addon emoji\"\n"
+"                                        target=\"_blank\"><span class=\"glyphicon glyphicon-new-window\"></span></a>\n"
+"                                </div>\n"
+"                            </div>\n"
+"                        </div>\n"
+"\n"
+"                        \n"
+"\n"
+"                    </div>\n"
+"                </div>\n"
+"                <div class=\"modal-footer\">\n"
+"                    <!--<div v-show=\"activeTab == 'notes'\"\n"
+"                         style=\"float: left\">\n"
+"                        <button type=\"button\" class=\"btn btn-default\" v-on:click=\"insertTodo\">⏹</button>\n"
+"                        <button type=\"button\" class=\"btn btn-default\" v-on:click=\"insertDone\">✅</button>\n"
+"                    </div>-->\n"
+"                    <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\"\n"
+"                            v-on:click=\"close\">Close</button>\n"
+"                    <button type=\"button\" \n"
+"                            class=\"btn btn-primary\"\n"
+"                            v-on:click=\"save\">Save changes</button>\n"
+"                </div>\n"
+"            <!-- </div>\n"
+"        </div>\n"
+"    </div> -->\n"
+"</div>\n",
    props: {
        eventTypes: Object,
        statusList: Object
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
                this.dbitem = new_timelineItem();
            } else {
                this.dbitem = item;
            }
            this.activeTab = 'details';
        },
        save: function () {
            this.$emit('save', this.dbitem);
        },
        close: function () {
            this.$emit('close');
        },
        clearDate: function() {
                this.dbitem.date = null;
        },
    },
    computed: {
        locationIncludesName: function () {
            return (this.dbitem.type || "").startsWith("Holiday")
                || this.dbitem.type == "Excursion"
                || this.dbitem.type == "Restaurant";
        },
        mapUrl: function () {
            function tidyName (text) {
                var openBracketIdx = text.indexOf(" (");
                if (openBracketIdx != -1) {
                    text = text.substring(0, openBracketIdx);
                }
                return text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
            }
            return "https://www.google.com/maps/search/"
                + (this.locationIncludesName ? tidyName(this.dbitem.name).trim() + ", " : "") 
                + this.dbitem.location;
        }
    },
    watch: {
        activeTab: function (newValue) {
            if (newValue == "notes") { 
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
        id: '', // will be set when saved
        category: 'Event',
        type: '',
        name: '',
        location: '',
        date: null,
        schoolHolidays: false,
        status: '',
        link: '',
        notes: ''
    };
}
Vue.component('expanding-textarea', {
    template: "    <div>\n"
+"\n"
+"        <!-- \"hidden\" textarea, used to calculate height of text -->\n"
+"        <div style=\"position: relative\">\n"
+"            <textarea v-bind=\"$attrs\" class=\"form-control screenonly\" v-bind:value=\"value\" style=\"resize: none; position: absolute; z-index: -1\" tabindex=\"-1\" rows=\"1\"\n"
+"                      ref=\"hiddenTextarea\"></textarea>\n"
+"        </div>\n"
+"\n"
+"        <!-- visible textarea -->\n"
+"        <textarea v-bind=\"$attrs\" class=\"form-control screenonly\" v-model=\"theValue\" style=\"resize: none\" \n"
+"                  v-on:focus=\"$emit('focus')\" v-on:blur=\"$emit('blur')\"\n"
+"                  ref=\"txtarea\"></textarea>\n"
+"\n"
+"        <!-- print div -->\n"
+"        <div style=\"white-space: pre-wrap; margin-bottom: 0\" class=\"well well-sm printonly\">{{ value }}</div>\n"
+"\n"
+"    </div>\n",
        inheritAttrs: false, // e.g. so placeholder="..." is applied to <textarea> not root element
        props: {
            value: String, // for use with v-model
            minHeight: [Number,String]
        },
        computed: {
            theValue: {
                get: function () {
                    return this.value;
                },
                set: function (newValue) {
                    this.$emit("input", newValue); // for use with v-model
                }
            }
        },
        methods: {
            autoResize: function () {
                var minHeight = this.minHeight ? Number(this.minHeight) : 54;
                var textarea = this.$refs.txtarea;
                var hiddenTextarea = this.$refs.hiddenTextarea;
                Vue.nextTick(function () { // wait for hiddenTextarea to update
                    textarea.style.height = Math.max(minHeight, (hiddenTextarea.scrollHeight + 2)) + "px";
                });
            },
            focus: function () {
                var textarea = this.$refs.txtarea;
                textarea.focus();
            }
        },
        mounted: function () {
            window.addEventListener("resize", this.autoResize);
            this.autoResize();
        },
        beforeDestroy: function () {
            window.removeEventListener("resize", this.autoResize);
        },
        watch: {
            value: function () { // when value is changed (either through user input, or viewmodel change)
                this.autoResize();
            }
        }
    });
                {   // this is wrapped in a block because there might be more than 
                    // one component with styles, in which case we will have 
                    // multiple 'componentStyles' variables and don't want them to clash!
                    const componentStyles = document.createElement('style');
                    componentStyles.textContent = `    @media screen {
        .printonly {
            display: none;
        }
    }

    @media print {
        .screenonly {
            display: none !important;
        }
    }`;
                    document.head.appendChild(componentStyles);
                }
Vue.component('link-editor', {
    template: "    <div class=\"editor-dialog\">\n"
+"    <!-- <div class=\"modal fade\" tabindex=\"-1\" role=\"dialog\">\n"
+"        <div class=\"modal-dialog\" role=\"document\">\n"
+"            <div class=\"modal-content\"> -->\n"
+"                <div class=\"modal-header\">\n"
+"                    <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"\n"
+"                            v-on:click=\"close\"><span aria-hidden=\"true\">&times;</span></button>\n"
+"                    <h4 class=\"modal-title\">Link details</h4>\n"
+"                </div>\n"
+"                <div class=\"modal-body\" style=\"padding-bottom: 0\">\n"
+"    \n"
+"                    <div class=\"form-horizontal\">\n"
+"\n"
+"\n"
+"                        <div class=\"form-group\">\n"
+"                            <label class=\"col-xs-3 control-label\">Type</label>\n"
+"                            <div class=\"col-xs-7\">\n"
+"                                <select class=\"form-control\" v-model=\"item.type\">\n"
+"                                    <option v-for=\"(value, key) in linkTypes\"\n"
+"                                            v-bind:value=\"key\">{{ value }} {{ key }}</option>\n"
+"                                </select>\n"
+"                            </div>\n"
+"                        </div>\n"
+"                       \n"
+"                        <div class=\"form-group\">\n"
+"                            <label class=\"col-xs-3 control-label\">Name</label>\n"
+"                            <div class=\"col-xs-9\">\n"
+"                                <input type=\"text\" class=\"form-control\" v-model=\"item.name\">\n"
+"                            </div>\n"
+"                        </div>\n"
+"\n"
+"\n"
+"                        <div class=\"form-group\">\n"
+"                            <label class=\"col-xs-3 control-label\">Link</label>\n"
+"                            <div class=\"col-xs-9\">\n"
+"                                <div v-bind:class=\"{ 'input-group': !!item.link }\">\n"
+"                                    <input type=\"text\" class=\"form-control\" v-model=\"item.link\">\n"
+"    \n"
+"                                    <a v-show=\"!!item.link\"\n"
+"                                        v-bind:href=\"item.link\"\n"
+"                                        class=\"input-group-addon emoji\"\n"
+"                                        target=\"_blank\"><span class=\"glyphicon glyphicon-new-window\"></span></a>\n"
+"                                </div>\n"
+"                            </div>\n"
+"                        </div>\n"
+"\n"
+"                        <div class=\"form-group\">\n"
+"                            <label class=\"col-xs-3 control-label\">Notes</label>\n"
+"                            <div class=\"col-xs-9\">\n"
+"                                <expanding-textarea v-model=\"item.notes\" \n"
+"                                                    min-height=\"34\"\n"
+"                                                    ref=\"textarea\" />\n"
+"                                <!-- <input type=\"text\" class=\"form-control\" v-model=\"item.notes\" /> -->\n"
+"                            </div>\n"
+"                        </div>\n"
+"\n"
+"                    </div>\n"
+"                </div>\n"
+"                <div class=\"modal-footer\">\n"
+"                    <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\"\n"
+"                            v-on:click=\"close\">Close</button>\n"
+"                    <button type=\"button\" \n"
+"                            class=\"btn btn-primary\"\n"
+"                            v-on:click=\"save\">Save changes</button>\n"
+"                </div>\n"
+"            <!-- </div>\n"
+"        </div> -->\n"
+"    </div> \n",
    props: {
        linkTypes: Object
    },
    data: function() {
        return {
            item: new_linkItem()
        }
    },
    methods: {
        openDialog: function (item) { // called by parent via $refs
            if (!item) {
                this.item = new_linkItem();
            } else {
                this.item = item;
            }
        },
        close: function () {
            this.$emit('close');
        },
        save: function () {
            this.$emit('save', this.item);
            $(this.$el).modal('hide');
        }
    }
});
function new_linkItem() {
    return {
        id: '', // will be set when saved
        category: 'Link',
        type: '',
        name: '',
        link: '',
        notes: ''
    };
}
Vue.component('links-page', {
    template: "    <div>\n"
+"        <button class=\"btn btn-success\" \n"
+"                v-on:click=\"addLink\">\n"
+"            Add Link\n"
+"        </button>\n"
+"\n"
+"        <div v-for=\"(items, heading) in groupedLinks\"\n"
+"             v-bind:key=\"heading\">\n"
+"\n"
+"            <h1>{{ heading }}</h1>\n"
+"\n"
+"            <h5 v-if=\"heading == 'Venue'\"\n"
+"                class=\"text-muted\">Event listings by venue</h5>\n"
+"\n"
+"            <div v-for=\"item in items\"\n"
+"                 v-bind:key=\"item.id\"\n"
+"                 class=\"panel panel-default\"\n"
+"                 v-on:click=\"editEvent(item.id, $event)\"\n"
+"                 style=\"cursor: pointer\"\n"
+"                 v-bind:class=\"{ 'faded': item.id == itemBeingUpdated }\">\n"
+"\n"
+"                <div class=\"panel-heading\">\n"
+"                    <div>\n"
+"                        {{ linkTypes[item.type] }} \n"
+"                        <span style=\"font-weight: bold\">{{ item.name }}</span>\n"
+"\n"
+"                        <a v-if=\"item.link\"\n"
+"                           v-bind:href=\"item.link\"\n"
+"                           class=\"emoji\"\n"
+"                           style=\"text-decoration: none\"\n"
+"                           target=\"_blank\"><span class=\"glyphicon glyphicon-new-window\"\n"
+"                                                 style=\"padding: 0 3px\"></span></a>\n"
+"                    </div>\n"
+"                    <div v-show=\"!!item.notes\"\n"
+"                         class=\"text-muted\"\n"
+"                         >{{ item.notes.substring(0, 100) }}{{ item.notes.length > 100 ? \"...\" : \"\" }}</div>\n"
+"                         <!-- style=\"white-space: pre-line\" -->\n"
+"                </div>\n"
+"            </div><!-- /panel-heading -->\n"
+"        </div>\n"
+"\n"
+"        \n"
+"    </div>\n",
    props: {
        dropboxData: Array,
        itemBeingUpdated: String, // id (guid) of item currently being saved
        linkTypes: Object
    },
    methods: {
        addLink: function () {
            this.$emit('open-editor', null);
        },
        editEvent: function(itemId, event) {
            if (event.target.classList.contains("glyphicon-new-window")) {
                return; // don't open the editor if the link was clicked
            }
            var idx = this.dropboxData.findIndex(z => z.id === itemId);
            var copy = Object.assign({}, this.dropboxData[idx]); // create a copy of the item for the editor to work with
            this.$emit('open-editor', copy);
        }
    },
    computed: {
        groupedLinks: function () {
            var filtered = this.dropboxData.filter(item => item.category == "Link");
            var ordered = _.sortBy(filtered, [ // sort by [type,name]; pinned items first
                item => item.type,
                item => (item.name.includes("📌") ? "!" : "") + item.name
            ]);
            return _.groupBy(ordered, 'type');
        }
    }
});
Vue.component('simple-mde', {
    template: "    <textarea></textarea>\n",
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
                      "preview", "side-by-side", "fullscreen", "|", 
                      ],
            minHeight: '100px'
        });
        var self = this;
        this.mde.codemirror.on("change", function() {
            var newValue = self.mde.value();
            self.changesToIgnore.push(newValue); // save this internal change so it can be ignored later
            self.$emit("input", newValue); // for use with v-model
        });
        this.mde.codemirror.on('refresh', function () {
            if (self.mde.isFullscreenActive()) {
                $('body').addClass('simplemde-fullscreen');
            } else {
                $('body').removeClass('simplemde-fullscreen');
            }
        });
    },
    beforeDestroy: function() {
        this.mde.toTextArea();
        this.mde = null;
    },
    watch: {
        value: function (newValue) {
            var ignoreIdx = this.changesToIgnore.indexOf(newValue);
            if (ignoreIdx == -1) {
                this.mde.value(newValue);
                this.changesToIgnore.splice(0, this.changesToIgnore.length); // remove all items from array
            } else {
                this.changesToIgnore.splice(ignoreIdx, 1); // remove item from array
            }
        }
    },
    methods: {
        refresh: function() { // NOTE: This function is called by parent (via $refs) so its name must not be changed!
            this.mde.codemirror.refresh();
        }
    }
});
Vue.component('timeline-page', {
    template: "    <div>\n"
+"        <label v-if=\"!ideasOnly && needToBookCount > 0\"\n"
+"              class=\"pull-right\">\n"
+"              <input type=\"checkbox\" v-model=\"showNeedToBookOnly\" />\n"
+"            Need to book <span class=\"badge\">{{ needToBookCount }}</span>\n"
+"        </label>\n"
+"        <button class=\"btn btn-success\" \n"
+"                v-on:click=\"addEvent\">\n"
+"            Add Event\n"
+"        </button>\n"
+"        <br /><br />\n"
+"\n"
+"        <div v-for=\"(items, heading) in orderedTimeline\"\n"
+"             v-bind:key=\"heading\">\n"
+"            \n"
+"            <h1 v-if=\"heading != 'N/A'\">{{ heading }}</h1>\n"
+"            \n"
+"            <div v-for=\"item in items\"\n"
+"                 v-bind:key=\"item.id\"\n"
+"                 v-bind:class=\"{ 'glow': item.schoolHolidays }\">\n"
+"                 <!-- ^^^ `glow` class is applied to *parent* div (above)\n"
+"                          as opposed to panel (below); this allows the \n"
+"                          panel below to keep its rounded corners (border-radius),\n"
+"                          which we would otherwise have to remove\n"
+"                          to ensure that the `glow` outline was rectangular. -->\n"
+"                <div class=\"panel\"\n"
+"                    v-on:click=\"editEvent(item.id, $event)\"\n"
+"                    style=\"cursor: pointer\"\n"
+"                    v-bind:class=\"{ 'panel-success': item.status == 'Going',\n"
+"                                    'panel-default': item.status == 'Interested',\n"
+"                                    'panel-danger': item.status == 'Need to book',\n"
+"                                    'panel-warning': !item.status,\n"
+"                                    'faded': item.id == itemBeingUpdated }\">\n"
+"                    <div class=\"panel-heading\">\n"
+"                        <div v-if=\"isCollapsed(item) && item.date\"\n"
+"                            class=\"pull-right\"\n"
+"                            v-bind:class=\"{'cancelled': item.name.includes('❌')}\">\n"
+"                            <span class=\"text-muted\">{{ item.date | formatDate('ddd D/MMM') }}</span>\n"
+"                            <span v-bind:class=\"{ 'text-danger': dateIsInPast(item.date) }\">({{ shorten(howSoon(item.date)) }})</span>\n"
+"                        </div>\n"
+"                        <div style=\"font-weight: bold\"\n"
+"                            v-bind:class=\"{ 'text-muted': isCollapsed(item),\n"
+"                                            'cancelled': item.name.includes('❌') }\">\n"
+"                            \n"
+"                            {{ eventTypes[item.type] }} {{ item.name }}\n"
+"                            \n"
+"                            <a v-if=\"item.link\"\n"
+"                            v-bind:href=\"item.link\"\n"
+"                            class=\"emoji\"\n"
+"                            style=\"text-decoration: none\"\n"
+"                            target=\"_blank\"><span class=\"glyphicon glyphicon-new-window\"\n"
+"                                                    style=\"padding: 0 3px\"></span></a>\n"
+"                        </div>\n"
+"                        <div v-show=\"!isCollapsed(item)\">\n"
+"                            <div v-if=\"item.date\">\n"
+"                                <span class=\"text-muted\">{{ item.date | formatDate('dddd D MMMM YYYY') }}</span>\n"
+"                                <span v-bind:class=\"{ 'text-danger': dateIsInPast(item.date),\n"
+"                                                    'text-dark':  !dateIsInPast(item.date) && item.status == 'Need to book' }\">\n"
+"                                                    <!-- ^^ change colour from red to dark gray, as red is reserved for dates in the past. -->\n"
+"                                    ({{ howSoon(item.date) }})\n"
+"                                </span>\n"
+"                            </div>\n"
+"                            <div v-if=\"item.location\"\n"
+"                                class=\"text-muted\">{{ item.location }}</div>\n"
+"                            <div v-if=\"item.status\">\n"
+"                                <span class=\"emoji\">\n"
+"                                    {{ statusList[item.status] }}\n"
+"                                </span>\n"
+"                                <span class=\"text-muted\">\n"
+"                                    {{ item.status }}\n"
+"                                </span>\n"
+"                            </div>\n"
+"                        </div>\n"
+"                    </div><!-- /panel-heading -->\n"
+"                </div>\n"
+"            </div>\n"
+"        </div>\n"
+"\n"
+"        \n"
+"    </div>\n",
    props: {
        timeline: Array,
        itemBeingUpdated: String, // id (guid) of item currently being saved
        ideasOnly: Boolean,
        eventTypes: Object,
        statusList: Object
    },
    data: function() {
        return {
            showNeedToBookOnly: false
        }
    },
    methods: {
        addEvent: function () {
            this.$emit('open-editor', null);
        },
        editEvent: function (itemId, event) {
            if (event.target.classList.contains("glyphicon-new-window")) {
                return; // don't open the editor if the link was clicked
            }
            var idx = this.timeline.findIndex(z => z.id === itemId);
            var copy = Object.assign({}, this.timeline[idx]); // create a copy of the item for the editor to work with
            this.$emit('open-editor', copy);
        },
        isCollapsed: function(item) { 
            return item.status == "Interested";
        },
        howSoon: function(date) {
            var eventDate = moment.utc(date);
            var nowDate = moment.utc(moment().format("YYYY-MM-DD"));
            var duration = moment.duration(eventDate.diff(nowDate));
            var pluralise = function(number, suffix) {
                return number + " " + suffix 
                    + (number == 1 ? "" : "s");
            }
            var isNegative = false;
            if (duration.asMilliseconds() < 0) {
                duration = moment.duration(0 - duration.asMilliseconds(), 'milliseconds');
                isNegative = true;
            }
            if (duration.asDays() < 7) {
                if (duration.days() == 0)
                    return "Today";
                else 
                    return pluralise(duration.days(), "day") 
                         + (isNegative ? " ago" : "");
            } else if (duration.asWeeks() < 10)
                return pluralise(Math.floor(duration.asWeeks()), "week") + " " 
                     + pluralise(Math.floor(duration.asDays() % 7), "day")
                     + (isNegative ? " ago" : "");
            else if (duration.asYears() < 1)
                return pluralise(duration.months(), "month")
                     + (isNegative ? " ago" : "");
            else 
                return pluralise(duration.years(), "year") + " "  
                     + pluralise(duration.months(), "month")
                     + (isNegative ? " ago" : "");
        },
        shorten: function (str) {
            return str.replace(/ week[s]?/,"w").replace(/ day[s]?/, "d");
        },
        dateIsInPast: function (datestr) {
            return moment(datestr).isBefore();
        }
    },
    computed: {
        orderedTimeline: function() {
            if (this.ideasOnly) {
                var filteredTimeline = this.timeline.filter(item =>
                    item.category != "Link" && item.status != "Went" && item.status != "Didn't go"
                    && !item.date);
                var orderedTimeline = _.sortBy(filteredTimeline, [
                    item => item.type == "Film" ? "!Film" : item.type, // sort by type; Films first
                    item => (item.name.includes("📌") ? "!" : "") + item.name // within each type heading, sort items in alphabetical order; pinned items at top
                ]);
                return _.groupBy(orderedTimeline, "type");
            } else {
                var filteredTimeline = this.timeline.filter(item =>
                    item.category != "Link" && item.status != "Went" && item.status != "Didn't go"
                    && !!item.date);
                if (this.showNeedToBookOnly) {
                    filteredTimeline = filteredTimeline.filter(item => item.status == "Need to book");
                }
                var orderedTimeline = _.orderBy(filteredTimeline, ["date"]); // date order
                return { 'N/A': orderedTimeline };
            }
        },
        needToBookCount: function() {
            return this.timeline.filter(item =>
                item.category != "Link" && !!item.date && item.status == "Need to book").length;
        }
    }
});
