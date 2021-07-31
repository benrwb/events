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
+"                    v-bind:link-types=\"linkTypes\""
+"                    v-bind:dropbox-data=\"dropboxData\""
+"                    v-on:update-item=\"updateItem($event, false)\""
+"                    v-bind:item-being-updated=\"itemBeingUpdated\">"
+"        </links-page>"
+""
+"        <editor-dialog v-show=\"activeTab == 'editor'\""
+"                       ref=\"editor\""
+"                       v-bind:event-types=\"eventTypes\""
+"                       v-bind:status-list=\"statusList\""
+"                       v-on:save=\"updateItem($event, true)\""
+"                       v-on:close=\"closeEditor\">"
+"        </editor-dialog>"
+""
+"    </div><!-- v-show=\"connectedToDropbox\"-->"
+""
+"</div>",
        data: function() {
            return {
                activeTab: "timeline",
                previousTab: "",
                previousScrollPosition: 0,
                connectedToDropbox: false,
                dropboxSyncStatus: "",
                dropboxData: [],
                currentTime: new Date(),
                itemBeingUpdated: '',
                eventTypes: {
                    "Birthday": "🎂",
                    "Restaurant": "🍽️",
                    "Film": "🎬",
                    "Live Entertainment": "🎭",
                    "Music": "🎵",
                    "Excursion": "🚶‍",
                    "Holiday - Abroad": "🌞",
                    "Holiday - UK": "🇬🇧"
                },
                statusList: {
                    "Going": "✔",
                    "Interested": "⭐",
                    "Need to book": "🎟",
                    "Went":"🙂",
                    "Didn't go": "🙁"
                },
                linkTypes: {
                    "Ticket sales": "🎫",
                    "Event listings": "📜",
                    "Venue": "🏛️",
                    "Holidays": "🌞",
                    "Other": "❓"
                }
            }
        },
        mounted: function() {
            var self = this;
            this.$refs.dropbox.loadData(function(dropboxData) {
                self.connectedToDropbox = true;
                self.dropboxData = dropboxData;
            });
            setInterval(function() {
                self.currentTime = new Date()
            }, 60000);
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
    template: "    <input class='form-control' type='text' />",
    props: {
        value: String
    },
    mounted: function () {
        var modate = !this.value ? null : moment(this.value);
        if (modate != null && modate.isValid()) {
            $(this.$el).val(modate.format("DD/MM/YYYY"));
        }
        $(this.$el).datepicker({
            format: "dd/mm/yyyy",
            autoclose: true,
            todayHighlight: true,
            disableTouchKeyboard: true,
            weekStart: 1
        });
        var self = this;
        $(this.$el).datepicker().on("hide", function (e) {
            self.updateValue();
        });
    },
    watch: {
        value: function (newValue) {
            var modate = newValue == null ? null : moment(newValue);
            if (modate != null && modate.isValid())
                $(this.$el).datepicker("setDate", modate.toDate());
            else
                $(this.$el).datepicker("setDate", null);
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
    template: "    <li role=\"presentation\""
+"        v-bind:class=\"{ 'active': value == groupValue }\">"
+"        <a href=\"#\" v-on:click=\"navClick($event)\">"
+"            <slot></slot>"
+"        </a>"
+"    </li>",
    model: { 
        prop: 'groupValue',
        event: 'input'
    },
    props: {
        "groupValue": String,
        "value": String
    },
    methods: {
        navClick: function(event) {
            this.$emit('input', this.value);
            event.preventDefault();
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
        'filename': String,
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
            this.dropboxAccessToken = this.editAccessToken;
            this.setSyncStatus("Please refresh the page to continue");
        },
        loadData: function(onComplete) {
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
                self.saveData(dropboxData, onComplete);
            });
        },
        editItem: function(itemToEdit, onComplete) {
            var self = this;
            this.loadData(function(dropboxData) {
                var idx = dropboxData.findIndex(z => z.id === itemToEdit.id);
                dropboxData[idx] = itemToEdit;
                self.saveData(dropboxData, onComplete);
            });
        },
        saveData: function(dropboxData, onComplete) {
            if (!this.dropboxAccessToken ) return;
            this.setSyncStatus("Saving");
            var dbx = new Dropbox.Dropbox({ accessToken: this.dropboxAccessToken });
            var self = this;
            dbx.filesUpload({ 
                path: '/' + this.filename, 
                contents: JSON.stringify(dropboxData, null, 2),
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
    template: "<div class=\"editor-dialog\">"
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
+"                            <div class=\"col-xs-7\">"
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
+"                                <div v-bind:class=\"{ 'input-group': !!dbitem.location }\">"
+"                                    <input type=\"text\" class=\"form-control\" v-model=\"dbitem.location\">"
+"    "
+"                                    <a v-show=\"!!dbitem.location\""
+"                                        v-bind:href=\"'https://www.google.com/maps/search/' + dbitem.location\""
+"                                        class=\"input-group-addon emoji\""
+"                                        target=\"_blank\"><span class=\"glyphicon glyphicon-map-marker\"></span></a>"
+"                                </div>"
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
        eventTypes: Object,
        statusList: Object
    },
    data: function() {
        return {
            dbitem: new_timelineItem(),
            activeTab: 'details'
        }
    },
    methods: {
        openDialog: function (item) {
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
    watch: {
        activeTab: function (newValue) {
            if (newValue == "notes") { 
                var self = this;
                Vue.nextTick(function() {
                    self.$refs.simplemde.refresh(); 
                });
            }
        }
    }
});
function new_timelineItem() {
    return {
        id: '',
        category: 'Event',
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
+""
+"                        <div class=\"form-group\">"
+"                            <label class=\"col-xs-3 control-label\">Type</label>"
+"                            <div class=\"col-xs-7\">"
+"                                <select class=\"form-control\" v-model=\"item.type\">"
+"                                    <option v-for=\"(value, key) in linkTypes\""
+"                                            v-bind:value=\"key\">{{ value }} {{ key }}</option>"
+"                                </select>"
+"                            </div>"
+"                        </div>"
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
    props: {
        linkTypes: Object
    },
    data: function() {
        return {
            item: new_linkItem()
        }
    },
    methods: {
        openDialog: function (item) {
            if (!item) {
                this.item = new_linkItem();
            } else {
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
        id: '',
        category: 'Link',
        type: '',
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
+"        <div v-for=\"(items, heading) in groupedLinks\""
+"             v-bind:key=\"heading\">"
+""
+"            <h1>{{ heading }}</h1>"
+""
+"            <div v-for=\"item in items\""
+"                v-bind:key=\"item.id\""
+"                class=\"panel panel-default\""
+"                v-on:click=\"editEvent(item.id)\""
+"                style=\"cursor: pointer\""
+"                v-bind:class=\"{ 'faded': item.id == itemBeingUpdated }\">"
+"                <div class=\"panel-heading\">"
+"                    <div style=\"font-weight: bold\">"
+"                        "
+"                        {{ linkTypes[item.type] }} {{ item.name }}"
+""
+"                        <a v-if=\"item.link\""
+"                            v-bind:href=\"item.link\""
+"                            class=\"emoji\""
+"                            style=\"text-decoration: none\""
+"                            target=\"_blank\">&nbsp;<span class=\"glyphicon glyphicon-new-window\"></span></a>"
+"                    </div>"
+"                    <div v-show=\"!!item.notes\""
+"                        class=\"text-muted\">"
+"                        {{ item.notes }}"
+"                    </div>"
+"                </div>"
+"            </div><!-- /panel-heading -->"
+"        </div>"
+""
+"        <link-editor ref=\"editor\""
+"                     v-bind:link-types=\"linkTypes\""
+"                     v-on:save=\"editorSave\"></link-editor>"
+"    </div>",
    props: {
        dropboxData: Array,
        itemBeingUpdated: String,
        linkTypes: Object
    },
    methods: {
        addLink: function () {
            this.$refs.editor.openDialog();
        },
        editEvent: function(itemId) {
            var idx = this.dropboxData.findIndex(z => z.id === itemId);
            var copy = Object.assign({}, this.dropboxData[idx]);
            this.$refs.editor.openDialog(copy);
        },
        editorSave: function(item) {
            this.$emit('update-item', item);
        }
    },
    computed: {
        groupedLinks: function () {
            var filtered = this.dropboxData.filter(item => item.category == "Link");
            var ordered = _.sortBy(filtered, ["type", "name"]);
            return _.groupBy(ordered, 'type');
        }
    }
});
Vue.component('simple-mde', {
    template: "    <textarea></textarea>",
    props: {
        value: String
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
            status: false,
            autofocus: true,
            toolbar: ["bold", "italic", "heading", "|", 
                      "preview", "side-by-side", "fullscreen", "|", 
                      ],
            minHeight: '100px'
        });
        var self = this;
        this.mde.codemirror.on("change", function() {
            var newValue = self.mde.value();
            self.changesToIgnore.push(newValue);
            self.$emit("input", newValue);
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
                this.changesToIgnore.splice(0, this.changesToIgnore.length);
            } else {
                this.changesToIgnore.splice(ignoreIdx, 1);
            }
        }
    },
    methods: {
        refresh: function() {
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
+"        <div v-for=\"(items, heading) in orderedTimeline\""
+"             v-bind:key=\"heading\">"
+"            "
+"            <h1 v-if=\"heading != 'N/A'\">{{ heading }}</h1>"
+"            "
+"            <div v-for=\"item in items\""
+"                 v-bind:key=\"item.id\""
+"                 class=\"panel\""
+"                 v-on:click=\"editEvent(item.id)\""
+"                 style=\"cursor: pointer\""
+"                 v-bind:class=\"{ 'panel-success': item.status == 'Going',"
+"                                 'panel-default': item.status == 'Interested',"
+"                                 'panel-danger': item.status == 'Need to book',"
+"                                 'panel-warning': !item.status,"
+"                                 'faded': item.id == itemBeingUpdated }\">"
+"                <div class=\"panel-heading\">"
+"                    <div v-if=\"isCollapsed(item) && item.date\""
+"                         class=\"pull-right\">"
+"                        <span class=\"text-muted\">{{ item.date | formatDate('D/MMM') }}</span>"
+"                        <span v-bind:class=\"{ 'text-danger': dateIsInPast(item.date) }\">({{ howSoon(item.date) }})</span>"
+"                    </div>"
+"                    <div style=\"font-weight: bold\""
+"                         v-bind:class=\"{ 'text-muted': isCollapsed(item) }\">"
+"                        "
+"                        {{ eventTypes[item.type] }} {{ item.name }}"
+"                        "
+"                        <a v-if=\"item.link\""
+"                            v-bind:href=\"item.link\""
+"                            class=\"emoji\""
+"                            style=\"text-decoration: none\""
+"                            target=\"_blank\">&nbsp;<span class=\"glyphicon glyphicon-new-window\"></span></a>"
+"                    </div>"
+"                    <div v-show=\"!isCollapsed(item)\">"
+"                        <div v-if=\"item.date\">"
+"                            <span class=\"text-muted\">{{ item.date | formatDate('dddd D MMMM YYYY') }}</span>"
+"                            <span v-bind:class=\"{ 'text-danger': dateIsInPast(item.date),"
+"                                                  'text-dark':  !dateIsInPast(item.date) && item.status == 'Need to book' }\">"
+"                                                <!-- ^^ change colour from red to dark gray, as red is reserved for dates in the past. -->"
+"                                ({{ howSoon(item.date) }})"
+"                            </span>"
+"                        </div>"
+"                        <div v-if=\"item.location\""
+"                             class=\"text-muted\">{{ item.location }}</div>"
+"                        <div>"
+"                            <span class=\"emoji\">"
+"                                {{ statusList[item.status] }}"
+"                            </span>"
+"                            <span class=\"text-muted\">"
+"                                {{ item.status }}"
+"                            </span>"
+"                        </div>"
+"                    </div>"
+"                </div><!-- /panel-heading -->"
+"            </div>"
+"        </div>"
+""
+"        "
+"    </div>",
    props: {
        timeline: Array,
        itemBeingUpdated: String,
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
            var copy = Object.assign({}, this.timeline[idx]);
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
                var orderedTimeline = _.sortBy(filteredTimeline, ["type", "name"]);
                return _.groupBy(orderedTimeline, 'type');
            } else {
                var filteredTimeline = this.timeline.filter(item =>
                    item.category != "Link" && item.status != "Went" && item.status != "Didn't go"
                    && !!item.date);
                var orderedTimeline = _.orderBy(filteredTimeline, ["date"]);
                return { 'N/A': orderedTimeline };
            }
        }
    }
});
