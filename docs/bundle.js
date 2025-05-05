const app = Vue.createApp();

const nextTick = Vue.nextTick;
const ref = Vue.ref;
const watch = Vue.watch;
const computed = Vue.computed;
const reactive = Vue.reactive;
const onMounted = Vue.onMounted;
const onBeforeUnmount = Vue.onBeforeUnmount;
const defineComponent = Vue.defineComponent;
    app.component('app-main', {
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
+"                        {{ formatDate(currentTime, 'dddd D MMMM') }}\n"
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
+"                <bootstrap-nav code=\"timeline\" v-model=\"activeTab\">Timeline</bootstrap-nav>\n"
+"                <bootstrap-nav code=\"links\"    v-model=\"activeTab\">Links</bootstrap-nav>\n"
+"                <bootstrap-nav code=\"ideas\"    v-model=\"activeTab\">Ideas</bootstrap-nav>\n"
+"            </ul>\n"
+"        </div>\n"
+"\n"
+"        <timeline-page v-show=\"activeTab == 'timeline' || activeTab == 'ideas'\"\n"
+"                       v-bind:ideas-only=\"activeTab == 'ideas'\"\n"
+"                       v-bind:timeline=\"dropboxData\"\n"
+"                       v-bind:item-being-updated=\"itemBeingUpdated\"\n"
+"                       v-on:open-editor=\"openEditor\">\n"
+"        </timeline-page>\n"
+"\n"
+"        <links-page v-show=\"activeTab == 'links'\"\n"
+"                    v-bind:dropbox-data=\"dropboxData\"\n"
+"                    v-bind:item-being-updated=\"itemBeingUpdated\"\n"
+"                    v-on:open-editor=\"openLinkEditor\">\n"
+"        </links-page>\n"
+"\n"
+"        <editor-dialog v-show=\"activeTab == 'editor'\"\n"
+"                       ref=\"editor\"\n"
+"                       v-on:save=\"updateItem($event, true)\"\n"
+"                       v-on:close=\"closeEditor\">\n"
+"        </editor-dialog>\n"
+"\n"
+"        <link-editor v-show=\"activeTab == 'linkeditor'\"\n"
+"                     ref=\"linkeditor\"\n"
+"                     v-on:save=\"updateItem($event, true)\"\n"
+"                     v-on:close=\"closeEditor\">\n"
+"        </link-editor>\n"
+"\n"
+"    </div><!-- v-show=\"connectedToDropbox\"-->\n"
+"\n"
+"</div>\n",
        data: function() {
            window.location.hash = ""; // clear hash
            return {
                activeTab: "timeline",
                previousTab: "", // to restore previously-active tab when editor closed
                previousScrollPosition: 0, // to restore scroll position when editor closed
                connectedToDropbox: false,
                dropboxSyncStatus: "",
                dropboxData: [],
                currentTime: new Date().toISOString(),
                itemBeingUpdated: '' // id (guid) of item currently being saved
            }
        },
        mounted: function() {
            var self = this;
            var dropbox = this.$refs.dropbox;
            dropbox.loadData(function(dropboxData) {
                self.connectedToDropbox = true; // show navbar & "Add event" button
                self.dropboxData = dropboxData;
            });
            setInterval(function() {
                self.currentTime = new Date().toISOString()
            }, 60000); // update currentTime every minute
        },
        methods: {
            openEditor: function (item) {
                this.previousTab = this.activeTab;
                this.previousScrollPosition = document.documentElement.scrollTop;
                this.activeTab = "editor";
                var editor = this.$refs.editor;
                editor.openDialog(item);
            },
            openLinkEditor: function (item) {
                this.previousTab = this.activeTab;
                this.previousScrollPosition = document.documentElement.scrollTop;
                this.activeTab = "linkeditor";
                var linkeditor = this.$refs.linkeditor;
                linkeditor.openDialog(item);
            },
            updateItem: function (item, shouldCloseEditor) {
                var self = this;
                var dropbox = this.$refs.dropbox;
                if (item.id == "") {
                    item.id = this.uuidv4();
                    dropbox.addItem(item, function(dropboxData) {
                        self.dropboxData = dropboxData;
                    });
                } else {
                    this.itemBeingUpdated = item.id;
                    dropbox.editItem(item, function(dropboxData) {
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
                nextTick(function () {
                    document.documentElement.scrollTop = self.previousScrollPosition;
                });
            },
            uuidv4: function () {
                return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
                );
            },
            formatDate: _formatDate
        }
    });
                {   // this is wrapped in a block because there might be more than 
                    // one component with styles, in which case we will have 
                    // multiple 'componentStyles' variables and don't want them to clash!
                    const componentStyles = document.createElement('style');
                    componentStyles.textContent = `    .syncdiv {
        position: fixed;
        top: 5px;
        left: 50%;
        transform: translate(-50%, 0);
        z-index: 1; /* display in front of navbar */
    }`;
                    document.head.appendChild(componentStyles);
                }
app.component('bootstrap-datepicker', {
    template: "    <input class='form-control' type='text' />\n",
    props: {
        modelValue: String, // accept a modelValue prop (for use with v-model)
        format: String // custom date format
    },
    mounted: function () {
        var modate = !this.modelValue ? null : moment(this.modelValue);
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
        modelValue: function (newValue) {
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
            this.$emit('update:modelValue', dateVal);
        },
    }
});
app.component('bootstrap-nav', {
    template: "    <li role=\"presentation\"\n"
+"        v-bind:class=\"{ 'active': modelValue == code }\">\n"
+"        <a href=\"#\" v-on:click=\"navClick($event)\">\n"
+"            <slot></slot>\n"
+"        </a>\n"
+"    </li>\n",
    props: {
        "modelValue": String, // value of the currently-selected tab in the group (via v-model)
        "code": String // value for *this* tab
    },
    methods: {
        navClick: function(event) {
            this.$emit('update:modelValue', this.code); // for use with v-model
            event.preventDefault(); // don't jump to top of page
        }
    }
});
function _formatDate(datestr, dateformat) {
    if (!datestr) return "";
    if (!dateformat) dateformat = "DD/MM/YYYY";
    return moment(datestr).format(dateformat);
}

app.component('dropbox-sync', {
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
        filename: String, // user needs to create this file manually, initial contents should be an empty array []
    },
    setup: function (props, context) {
        const editAccessToken = ref("");
        const dropboxAccessToken = ref(localStorage["dropboxAccessToken"] || "");
        const dropboxSyncStatus = ref("");
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
            if (!dropboxAccessToken.value) return;
            setSyncStatus("Loading");
            var dbx = new Dropbox.Dropbox({ accessToken: dropboxAccessToken.value });
            dbx.filesDownload({ path: '/' + props.filename })
                .then(function(data) {
                    var reader = new FileReader();
                    reader.addEventListener("loadend", function() {
                        var dropboxData = JSON.parse(reader.result);
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
            if (!dropboxAccessToken.value) return;
            setSyncStatus("Saving");
            var dbx = new Dropbox.Dropbox({ accessToken: dropboxAccessToken.value });
            dbx.filesUpload({ 
                path: '/' + props.filename, 
                contents: JSON.stringify(dropboxData, null, 2), // pretty print JSON (2 spaces)
                mode: { '.tag': 'overwrite' }
            })
            .then(function(response) {
                setSyncStatus("");
                if (onComplete)
                    onComplete(dropboxData);
            })
            .catch(function(error) {
                console.error(error);
                alert("Failed to upload " + props.filename + " to Dropbox - " + error.message);
                setSyncStatus("Error");
            });
        }
        function secondsSinceEpoch() {
            return Math.round(new Date().getTime() / 1000);
        }
        function addItem(itemToAdd, onComplete) { // called by parent component
            loadData(function(dropboxData) {
                itemToAdd.lastUpdate = secondsSinceEpoch();
                dropboxData.push(itemToAdd);
                saveData(dropboxData, onComplete); // save updated data
            });
        }
        function editItem(itemToEdit, onComplete) { // called by parent component
            loadData(function(dropboxData) {
                itemToEdit.lastUpdate = secondsSinceEpoch();
                var idx = dropboxData.findIndex(z => z.id === itemToEdit.id);
                dropboxData[idx] = itemToEdit; // replace item
                saveData(dropboxData, onComplete); // save updated data
            });
        }
        return { editAccessToken, dropboxAccessToken, saveAccessToken,
            loadData, addItem, editItem }; // `loadData`, `addItem`, and `editItem` are called by parent component
    }
});
app.component('editor-dialog', {
    template: "<div class=\"editor-dialog\">\n"
+"    <!-- <div class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" data-backdrop=\"static\">\n"
+"        <div class=\"modal-dialog\" role=\"document\">\n"
+"            <div class=\"modal-content\"> -->\n"
+"                <div class=\"modal-header\"\n"
+"                     style=\"border-bottom: none; padding: 0; background-color: #ddd\">\n"
+"\n"
+"                    <h4 class=\"modal-title\">\n"
+"                        <ul class=\"nav nav-tabs\">\n"
+"                            <bootstrap-nav code=\"details\" v-model=\"activeTab\">Event details</bootstrap-nav> \n"
+"                            <bootstrap-nav code=\"notes\"   v-model=\"activeTab\">\n"
+"                                <span v-if=\"!dbitem.notes\">+</span>\n"
+"                                <span v-if=\"!!dbitem.notes\">Notes</span>\n"
+"                            </bootstrap-nav> \n"
+"                            <!-- <bootstrap-nav v-show=\"!!dbitem.notes\"\n"
+"                                           code=\"markdown\" v-model=\"activeTab\">\n"
+"                                                M<span style=\"font-size: smaller\" class=\"glyphicon glyphicon-arrow-down\"></span>\n"
+"                            </bootstrap-nav> -->\n"
+"                        </ul>\n"
+"                    </h4>\n"
+"                </div><!-- /modal-header -->\n"
+"                <div>\n"
+"                    <!-- class=\"modal-body\" style=\"padding-bottom: 0\" -->\n"
+"\n"
+"                    <!-- Need to use v-if instead of v-show to avoid the error\n"
+"                         \"easymde.min.js:7 Uncaught TypeError: Cannot read properties of undefined (reading 'map')\" -->\n"
+"                    <div v-if=\"activeTab == 'notes'\">\n"
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
+"                                    <option v-for=\"(value, key) in store.eventTypes\"\n"
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
+"                                <input type=\"text\" class=\"form-control\" v-model.trim=\"dbitem.name\">\n"
+"                            </div>\n"
+"                        </div>\n"
+"\n"
+"                        <div class=\"form-group\">\n"
+"                            <label class=\"col-xs-3 control-label\">Location</label>\n"
+"                            <div class=\"col-xs-9\">\n"
+"                                <div v-bind:class=\"{ 'input-group': !!dbitem.location }\">\n"
+"                                    <input type=\"text\" class=\"form-control\" v-model.trim=\"dbitem.location\">\n"
+"    \n"
+"                                    <a v-show=\"!!dbitem.location\"\n"
+"                                       v-bind:href=\"mapUrl\"\n"
+"                                       v-bind:target=\"store.openLinksInNewWindow ? '_blank' : null\"\n"
+"                                       class=\"input-group-addon emoji\"\n"
+"                                       ><span class=\"glyphicon glyphicon-map-marker\"></span></a>\n"
+"                                </div>\n"
+"                            </div>\n"
+"                        </div>\n"
+"\n"
+"                        <div class=\"form-group\">\n"
+"                            <label class=\"col-xs-3 control-label\">Date</label>\n"
+"                            <div class=\"col-xs-8\">\n"
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
+"                                    <option v-for=\"(value, key) in store.statusList\"\n"
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
+"                                       v-bind:href=\"dbitem.link\"\n"
+"                                       v-bind:target=\"store.openLinksInNewWindow ? '_blank' : null\"\n"
+"                                       class=\"input-group-addon emoji\"\n"
+"                                       ><span class=\"glyphicon glyphicon-new-window\"></span></a>\n"
+"                                </div>\n"
+"                            </div>\n"
+"                        </div>\n"
+"\n"
+"\n"
+"                    </div><!-- /activeTab == 'details' -->\n"
+"\n"
+"                    <div v-if=\"activeTab == 'notes'\"\n"
+"                         class=\"checkbox\">\n"
+"                        <label title=\"Tip: To only show *some* of the Notes on the timeline, insert a horizontal line (---) to indicate where the timeline notes end.\">\n"
+"                            <input type=\"checkbox\" v-model=\"dbitem.showNotesOnTimeline\" />\n"
+"                            Show Notes on Timeline\n"
+"                        </label>\n"
+"                    </div>\n"
+"\n"
+"                </div><!-- /\"modal-body\" -->\n"
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
    data: function() {
        return {
            dbitem: new_timelineItem(),
            activeTab: 'details', // 'details' or 'notes'
            store: store
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
        notes: '',
        showNotesOnTimeline: undefined
    };
}
                {   // this is wrapped in a block because there might be more than 
                    // one component with styles, in which case we will have 
                    // multiple 'componentStyles' variables and don't want them to clash!
                    const componentStyles = document.createElement('style');
                    componentStyles.textContent = `    .no-bottom-margin {
        margin-bottom: 0;
    }`;
                    document.head.appendChild(componentStyles);
                }
app.component('expanding-textarea', {
    template: "    <div>\n"
+"\n"
+"        <!-- \"hidden\" textarea, used to calculate height of text -->\n"
+"        <div style=\"position: relative\">\n"
+"            <textarea v-bind=\"$attrs\" class=\"form-control screenonly\" v-bind:value=\"modelValue\" style=\"resize: none; position: absolute; z-index: -1\" tabindex=\"-1\" rows=\"1\"\n"
+"                      ref=\"hiddenTextarea\"></textarea>\n"
+"        </div>\n"
+"\n"
+"        <!-- visible textarea -->\n"
+"        <textarea v-bind=\"$attrs\" class=\"form-control screenonly\" v-model=\"theValue\" style=\"resize: none\" \n"
+"                  v-on:focus=\"$emit('focus')\" v-on:blur=\"$emit('blur')\"\n"
+"                  ref=\"txtarea\"></textarea>\n"
+"\n"
+"        <!-- print div -->\n"
+"        <div style=\"white-space: pre-wrap; margin-bottom: 0\" class=\"well well-sm printonly\">{{ modelValue }}</div>\n"
+"\n"
+"    </div>\n",
        inheritAttrs: false, // e.g. so placeholder="..." is applied to <textarea> not root element
        model: {
            prop: "modelValue",
            event: "update:modelValue"
        },
        props: {
            modelValue: String, // for use with v-model
            minHeight: [Number, String]
        },
        setup: function (props, context) {
            const theValue = computed({
                get: function () {
                    return props.modelValue;
                },
                set: function (newValue) {
                    context.emit("update:modelValue", newValue); // for use with v-model
                }
            });
            const txtarea = ref(null);
            const hiddenTextarea = ref(null);
            function autoResize() {
                var minHeight = props.minHeight ? Number(props.minHeight) : 54;
                nextTick(() => { // wait for hiddenTextarea to update
                    txtarea.value.style.height = Math.max(minHeight, (hiddenTextarea.value.scrollHeight + 2)) + "px";
                });
            }
            watch(() => props.modelValue, () => { // when value is changed (either through user input, or viewmodel change)
                autoResize();
            });
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    let visible = entry.intersectionRatio > 0;
                    if (visible) {
                        autoResize();
                    }
                });
            });
            onMounted(() => {
                window.addEventListener("resize", autoResize); // listen for window resize events
                observer.observe(txtarea.value); // activate IntersectionObserver
            });
            onBeforeUnmount(() => { // clean up
                window.removeEventListener("resize", autoResize);
                observer.disconnect();
            });
            function focus() { // can be called by parent component
                txtarea.value.focus();
            }
            return {
                theValue, hiddenTextarea, txtarea,
                focus // can be called by parent component
            };
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
app.component('link-editor', {
    template: "    <div class=\"editor-dialog\" ref=\"elementRef\">\n"
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
+"                                    <option v-for=\"(value, key) in store.linkTypes\"\n"
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
+"                                       v-bind:href=\"item.link\"\n"
+"                                       v-bind:target=\"store.openLinksInNewWindow ? '_blank' : null\"\n"
+"                                       class=\"input-group-addon emoji\"\n"
+"                                       ><span class=\"glyphicon glyphicon-new-window\"></span></a>\n"
+"                                </div>\n"
+"                            </div>\n"
+"                        </div>\n"
+"\n"
+"                        <div class=\"form-group\">\n"
+"                            <label class=\"col-sm-3 control-label\">Notes</label>\n"
+"                            <!-- Note: `sm` not `xs` to make notes box wider on mobile -->\n"
+"                            <div class=\"col-sm-9\">\n"
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
    setup: function(props, context) {
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
        const item = ref(new_linkItem());
        function openDialog(itemToOpen) { // called by parent via $refs
            if (!itemToOpen) {
                item.value = new_linkItem(); // reset the form
            } else {
                item.value = itemToOpen;
                document.documentElement.scrollTop = 0;
            }
        }
        function close() {
            context.emit('close');
        }
        const elementRef = ref(null);
        function save() {
            context.emit('save', item.value);
            $(elementRef.value).modal('hide');
        }
        return { item, elementRef, openDialog, save, close, store };
    }
});
app.component('links-page', {
    template: "    <div>\n"
+"        <button class=\"btn btn-success\" \n"
+"                v-on:click=\"addLink\">\n"
+"            Add Link\n"
+"        </button>\n"
+"        \n"
+"        <search-box v-model=\"store.search\"></search-box>\n"
+"\n"
+"        <template v-if=\"!store.search\">\n"
+"            <span v-for=\"(_, heading) in groupedLinks\">\n"
+"                <a class=\"btn\" v-bind:href=\"'#' + heading\">{{ store.linkTypes[heading] }} {{ heading }}</a>\n"
+"            </span>\n"
+"        </template>\n"
+"\n"
+"        <br />\n"
+"        \n"
+"        <div v-for=\"(items, heading, idx) in groupedLinks\"\n"
+"             v-bind:key=\"heading\"\n"
+"             v-bind:id=\"heading.toString()\"><!-- for # links -->\n"
+"\n"
+"            <template v-if=\"!store.search\">\n"
+"                <h1 v-if=\"!store.search\">\n"
+"                    {{ heading }}\n"
+"                    <a v-if=\"idx > 0\"\n"
+"                       style=\"float: right\" href=\"#\">↑</a><!-- link to go back to top -->\n"
+"                    <button v-if=\"heading == 'Event listings' || heading == 'Venue'\"\n"
+"                        @click=\"openRandomLink(items, heading)\"\n"
+"                        v-bind:class=\"allLinksOpened.includes(heading) ? 'btn-default' : 'btn-info'\"\n"
+"                        class=\"btn\">Open random link\n"
+"                    </button>\n"
+"                </h1>\n"
+"                <h5 v-if=\"heading == 'Venue'\"\n"
+"                    class=\"text-muted\">Event listings by venue</h5>\n"
+"                   \n"
+"            </template>\n"
+"\n"
+"                    \n"
+"            \n"
+"        \n"
+"            <div v-for=\"item in items\"\n"
+"                 v-bind:key=\"item.id\"\n"
+"                 class=\"panel panel-default\"\n"
+"                 v-on:click=\"editEvent(item.id, $event)\"\n"
+"                 style=\"cursor: pointer\"\n"
+"                 v-bind:class=\"{ 'faded': item.id == itemBeingUpdated }\">\n"
+"\n"
+"                <div class=\"panel-heading\">\n"
+"                    <div>\n"
+"                        {{ store.linkTypes[item.type] }} \n"
+"                        <span style=\"font-weight: bold\">{{ item.name }}</span>\n"
+"\n"
+"                        <a v-if=\"item.link\"\n"
+"                           v-bind:href=\"item.link\" v-on:click.stop\n"
+"                           v-bind:target=\"store.openLinksInNewWindow ? '_blank' : null\"\n"
+"                           class=\"emoji\" style=\"text-decoration: none\"\n"
+"                           ><span class=\"glyphicon glyphicon-new-window\"\n"
+"                                  style=\"padding: 0 3px\"></span></a>\n"
+"                    </div>\n"
+"                    <div v-show=\"!!item.notes\"\n"
+"                         class=\"text-muted\"\n"
+"                         >{{ item.notes.substring(0, 100) }}{{ item.notes.length > 100 ? \"...\" : \"\" }}</div>\n"
+"                         <!-- style=\"white-space: pre-line\" -->\n"
+"                </div>\n"
+"            </div><!-- /panel-heading -->\n"
+"        </div>\n"
+"\n"
+"        <label>\n"
+"            <input type=\"checkbox\" v-model=\"store.openLinksInNewWindow\"> Open links in new window\n"
+"        </label>\n"
+"        <br /><br />\n"
+"    </div>\n",
    props: {
        dropboxData: Array,
        itemBeingUpdated: String // id (guid) of item currently being saved
    },
    setup: function (props, context) {
        function addLink() {
            context.emit('open-editor', null);
        }
        function editEvent(itemId, event) {
            if (event.target.classList.contains("glyphicon-new-window")) {
                return; // don't open the editor if the link was clicked
            }
            var idx = props.dropboxData.findIndex(z => z.id === itemId);
            var copy = Object.assign({}, props.dropboxData[idx]); // create a copy of the item for the editor to work with
            context.emit('open-editor', copy);
        }
        const groupedLinks = computed(() => { // LinksWithHeadings
            var filtered = props.dropboxData.filter(item => item.category == "Link");
            if (store.search) {
                filtered = filtered.filter(item => item.name.toLocaleLowerCase().includes(store.search.toLocaleLowerCase()));
            }
            var ordered = _.sortBy(filtered, [ // sort by [type,name]; pinned items first
                item => item.type,
                item => !item.name.includes("📌"), // sort pinned items to the top
                item => item.name.includes("🎟️"), // sort ticket websites to the bottom
                item => item.name,
            ]);
            return _.groupBy(ordered, 'type');
        });
        const allLinksOpened = ref([]);
        function openRandomLink(items, heading) {
            if (items.length == 0)
                return; // nothing to do
            let [link, allDone] = pickRandomLink(items, heading);
            if (allDone && !allLinksOpened.value.includes(heading))
                allLinksOpened.value.push(heading); // change colour of button
            if (store.openLinksInNewWindow) {
                window.open(link);    
            } else {
                window.location.href = link;
            }
        }
        watch(() => store.openLinksInNewWindow, (newVal) => {
            if (newVal)
                localStorage.removeItem("events_openLinksInSameWindow");
            else 
                localStorage.setItem("events_openLinksInSameWindow", "yes");
        });
        return { addLink, editEvent, groupedLinks, store, 
            openRandomLink, allLinksOpened };
    }
});
function pickRandomLink(items, heading) {
    let storageKeyName = "linksAlreadyOpened_" + heading;
    let str = sessionStorage.getItem(storageKeyName);
    let alreadyOpened = (str == null) ? [] : JSON.parse(str);
    let allLinks = items.filter(z => !!z.link).map(z => z.link);
    let linksMinusOpened = allLinks.filter(link => !alreadyOpened.includes(link));
    let allDone = false;
    if (linksMinusOpened.length == 0) {
        linksMinusOpened = allLinks;
        alreadyOpened = [];
        allDone = true;
    }
    let index = Math.floor(Math.random() * linksMinusOpened.length);
    let link = linksMinusOpened[index];
    alreadyOpened.push(link);
    sessionStorage.setItem(storageKeyName, JSON.stringify(alreadyOpened));
    return [link, allDone];
}

app.component('search-box', {
    template: "    <div v-bind:class=\"{ 'input-group': !!modelValue }\">\n"
+"        <input type=\"text\" class=\"form-control\" placeholder=\"Search\" \n"
+"               v-bind:value=\"modelValue\"\n"
+"               v-on:input=\"$emit('update:modelValue', $event.target.value)\"\n"
+"        />\n"
+"        <span v-if=\"!!modelValue\"\n"
+"              class=\"input-group-btn\">\n"
+"            <button type=\"button\" class=\"btn btn-danger\" \n"
+"                    v-on:click=\"$emit('update:modelValue', '')\">X</button>\n"
+"        </span>\n"
+"    </div>\n",
        props: {
            modelValue: String
        }
    });
app.component('simple-mde', {
    template: "    <textarea></textarea>\n",
    props: {
        modelValue: String // for use with v-model
    },
    data: function () {
        return { 
            mde: null,
            changesToIgnore: []
        }
    },
    mounted: function () {
        this.mde = new EasyMDE({ 
            element: this.$el,
            spellChecker: false,
            initialValue: this.modelValue,
            status: false, // hide the status bar
            autofocus: true,
            toolbar: ["bold", "italic", "heading", "|", 
                      "preview", "side-by-side", "fullscreen", "|", 
                      ],
            minHeight: '100px',
            previewRender: store.convertMarkdownToHtml
        });
        var self = this;
        this.mde.codemirror.on("change", function () {
            var newValue = self.mde.value();
            self.changesToIgnore.push(newValue); // save this internal change so it can be ignored later
            self.$emit("update:modelValue", newValue); // for use with v-model
        });
        this.mde.codemirror.on('refresh', function () {
            if (self.mde.isFullscreenActive()) {
                $('body').addClass('simplemde-fullscreen');
            } else {
                $('body').removeClass('simplemde-fullscreen');
            }
        });
    },
    beforeUnmount: function () {
        this.mde.toTextArea();
        this.mde = null;
    },
    watch: {
        modelValue: function (newValue) {
            var ignoreIdx = this.changesToIgnore.indexOf(newValue);
            if (ignoreIdx == -1) {
                this.mde.value(newValue);
                this.changesToIgnore.splice(0, this.changesToIgnore.length); // remove all items from array
            } else {
                this.changesToIgnore.splice(ignoreIdx, 1); // remove item from array
            }
        }
    },
});
const store = reactive({
    search: "",
    eventTypes: {
        "Special occasion": "🎂",
        "Restaurant": "🍽️",
        "Film": "🎬",
        "Live Entertainment": "🎭",
        "Music": "🎵",
        "Excursion": "🚶‍",
        "Holiday - Abroad": "🌞",
        "Holiday - UK": "🇬🇧",
        "Tech": "💻",
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
        "Restaurants": "🍽️",
        "Holidays": "🌞",
        "Transport": "🚇",
    },
    openLinksInNewWindow: !localStorage.getItem("events_openLinksInSameWindow"), // note opposite name ('Same' vs 'New')
    convertMarkdownToHtml: function (text) {
        var converter = new showdown.Converter({ 
            tables: true, // enable support for tables
            openLinksInNewWindow: store.openLinksInNewWindow,
            simpleLineBreaks: true,
            strikethrough: true,
            simplifiedAutoLink: true
        });
        return converter.makeHtml(text);
    }
});

app.component('timeline-page', {
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
+"\n"
+"        <search-box v-model=\"store.search\"></search-box>\n"
+"        \n"
+"        <template v-if=\"ideasOnly && !store.search\">\n"
+"            <span v-for=\"(_, heading) in orderedTimeline\">\n"
+"                <a class=\"btn\" v-bind:href=\"'#' + heading\">{{ store.eventTypes[heading] }} {{ heading }}</a>\n"
+"            </span>\n"
+"        </template>\n"
+"\n"
+"        <br />\n"
+"\n"
+"        <div v-for=\"(items, heading, idx) in orderedTimeline\"\n"
+"             v-bind:key=\"heading\"\n"
+"             v-bind:id=\"heading.toString()\"\n"
+"             v-bind:class=\"{ 'school-holidays': items[0].schoolHolidays }\">\n"
+"            \n"
+"            <h1 v-if=\"!heading.startsWith('N/A') && !store.search\">\n"
+"                {{ heading }}\n"
+"                <a v-if=\"idx > 0\"\n"
+"                   style=\"float: right\" href=\"#\">↑</a><!-- link to go back to top -->\n"
+"            </h1>\n"
+"            \n"
+"            <div v-for=\"item in items\"\n"
+"                    v-bind:key=\"item.id\"\n"
+"                    class=\"panel\"\n"
+"                    v-on:click=\"editEvent(item.id, $event)\"\n"
+"                    style=\"cursor: pointer\"\n"
+"                    v-bind:class=\"{ 'panel-success': item.status == 'Going',\n"
+"                                    'panel-default': item.status == 'Interested',\n"
+"                                    'panel-danger': item.status == 'Need to book',\n"
+"                                    'panel-warning': !item.status,\n"
+"                                    'faded': item.id == itemBeingUpdated,\n"
+"                                    'same-date': nextItemIsSameDate(item, items) }\">\n"
+"                <div class=\"panel-heading\">\n"
+"                    <div v-if=\"isCollapsed(item) && item.date\"\n"
+"                        class=\"pull-right\"\n"
+"                        v-bind:class=\"{'cancelled': item.name.includes('❌')}\">\n"
+"                        <span class=\"text-muted\">{{ formatDate(item.date, 'ddd D/MMM') }}</span>\n"
+"                        <span v-bind:class=\"{ 'text-danger': dateIsInPast(item.date) }\">\n"
+"                            ({{ shorten(howSoon(item.date)) }})\n"
+"                        </span>\n"
+"                    </div>\n"
+"                    <div style=\"font-weight: bold\"\n"
+"                        v-bind:class=\"{ 'text-muted': isCollapsed(item),\n"
+"                                        'cancelled': item.name.includes('❌') }\">\n"
+"                        \n"
+"                        {{ store.eventTypes[item.type] }} {{ item.name }}\n"
+"                        \n"
+"                        <a v-if=\"item.link\"\n"
+"                            v-bind:href=\"item.link\" v-on:click.stop\n"
+"                            v-bind:target=\"store.openLinksInNewWindow ? '_blank' : null\"\n"
+"                            class=\"emoji\" style=\"text-decoration: none\"\n"
+"                            ><span class=\"glyphicon glyphicon-new-window\"\n"
+"                                    style=\"padding: 0 3px\"></span></a>\n"
+"                    </div>\n"
+"                    <div v-show=\"!isCollapsed(item)\">\n"
+"                        <div v-if=\"item.date\">\n"
+"                            <span class=\"text-muted\">{{ formatDate(item.date, 'dddd D MMMM YYYY') }}</span>\n"
+"                            <span v-bind:class=\"{ 'text-danger': dateIsInPast(item.date),\n"
+"                                                  'text-dark':  !dateIsInPast(item.date) && item.status == 'Need to book' }\">\n"
+"                                                <!-- ^^ change colour from red to dark gray, as red is reserved for dates in the past. -->\n"
+"                                ({{ howSoon(item.date) }})\n"
+"                            </span>\n"
+"                        </div>\n"
+"                        <div v-if=\"item.location\"\n"
+"                            class=\"text-muted\">{{ item.location }}</div>\n"
+"                        <div v-if=\"item.status\">\n"
+"                            <span class=\"emoji\">\n"
+"                                {{ store.statusList[item.status] }}\n"
+"                            </span>\n"
+"                            <span class=\"text-muted\">\n"
+"                                {{ item.status }}\n"
+"                            </span>\n"
+"                        </div>\n"
+"                    </div>\n"
+"                    <div v-if=\"item.showNotesOnTimeline\"\n"
+"                            v-html=\"getNotesForTimeline(item.notes)\"\n"
+"                            style=\"background: transparent; cursor:auto\"\n"
+"                            v-on:click.stop=\"\"\n"
+"                            class=\"timeline-notes editor-preview\" /><!-- `editor-preview` to get styles from easymde.min.css (e.g. table borders) -->\n"
+"                                                    <!-- `click.stop` so that clicking on the Notes doesn't open the editor \n"
+"                                                        (this is to enable selecting text and clicking links)-->\n"
+"                </div><!-- /panel-heading -->\n"
+"            </div><!-- /panel -->\n"
+"        </div>\n"
+"\n"
+"        \n"
+"    </div>\n",
    props: {
        timeline: Array,
        itemBeingUpdated: String, // id (guid) of item currently being saved
        ideasOnly: Boolean,
    },
    data: function() {
        return {
            showNeedToBookOnly: false,
            store: store
        }
    },
    methods: {
        addEvent: function () {
            this.$emit('open-editor', null);
        },
        editEvent: function (itemId, event) {
            if (event.target.classList.contains("glyphicon-new-window")) {
                return; // don't open the editor if the link icon ↗️ was clicked
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
            } else if (duration.asWeeks() < 8) {
                return pluralise(Math.floor(duration.asWeeks()), "week") + " " 
                     + pluralise(Math.floor(duration.asDays() % 7), "day")
                     + (isNegative ? " ago" : "");
            } else if (duration.asMonths() < 4) {
                return pluralise(duration.months(), "month")
                    + "/" + Math.floor(duration.asWeeks()) + "w " + Math.floor(duration.asDays() % 7) + "d"
                     + (isNegative ? " ago" : "");
            }
            else if (duration.asYears() < 1) {
                return pluralise(duration.months(), "month")
                     + (isNegative ? " ago" : "");
            } else {
                return pluralise(duration.years(), "year") + " "  
                    + pluralise(duration.months(), "month")
                    + (isNegative ? " ago" : "");
            }
        },
        shorten: function (str) {
            str = str.replace(/ week[s]?/,"w")
                     .replace(/ day[s]?/, "d");
            let slashIdx = str.indexOf("/")
            if (slashIdx != -1)
                str = str.substring(0, slashIdx);
            return str;
        },
        dateIsInPast: function (datestr) {
            return moment(datestr).isBefore();
        },
        getNotesForTimeline: function (notes) {
            if (!notes) return "";
            let lineIdx = notes.indexOf("---");
            if (lineIdx != -1)
                notes = notes.substring(0, lineIdx);
            return store.convertMarkdownToHtml(notes);
        },
        nextItemIsSameDate: function (item, items) {
            if (!item.date) return false; // e.g. on "Ideas" tab
            let nextIdx = items.indexOf(item) + 1;
            if (nextIdx < items.length) {
                return item.date == items[nextIdx].date;
            }
            return false;
        },
        groupBySchoolHolidays: function (events) {
            if (!events || events.length == 0) return {};
            let timeline = {};
            let curGroup = [];
            let groupNumber = 1;
            let inSchoolHolidays = events[0].schoolHolidays;
            function newGroup() {
                let groupName = "N/A " + (groupNumber++).toString().padStart(2, '0');
                timeline[groupName] = curGroup; // add current group to timeline
            }
            events.forEach(item => {
                if (inSchoolHolidays == item.schoolHolidays) {
                    curGroup.push(item);
                } else {
                    newGroup();
                    inSchoolHolidays = item.schoolHolidays;
                    curGroup = [item];
                }
            });
            newGroup(); // save last group
            return timeline;
        },
        formatDate: _formatDate
    },
    computed: {
        orderedTimeline: function() {
            let filteredTimeline = this.timeline;
            if (this.store.search) {
                filteredTimeline = filteredTimeline.filter(item => item.name.toLocaleLowerCase().includes(this.store.search.toLocaleLowerCase()));
            }
            if (this.ideasOnly) {
                filteredTimeline = filteredTimeline.filter(item =>
                    item.category != "Link" && item.status != "Went" && item.status != "Didn't go"
                    && !item.date);
                var orderedTimeline = _.sortBy(filteredTimeline, [
                    item => item.type == "Film" ? "!Film" : item.type, // sort by type; Films first
                    item => (item.name.includes("📌") ? "!" : "") + item.name // within each type heading, sort items in alphabetical order; pinned items at top
                ]);
                return _.groupBy(orderedTimeline, "type");
            } else {
                filteredTimeline = filteredTimeline.filter(item =>
                    item.category != "Link" && item.status != "Went" && item.status != "Didn't go"
                    && !!item.date);
                if (this.showNeedToBookOnly) {
                    filteredTimeline = filteredTimeline.filter(item => item.status == "Need to book");
                }
                var orderedTimeline = _.orderBy(filteredTimeline, ["date"]); // date order
                return this.groupBySchoolHolidays(orderedTimeline);
            }
        },
        needToBookCount: function() {
            return this.timeline.filter(item =>
                item.category != "Link" && !!item.date && item.status == "Need to book").length;
        }
    }
});
                {   // this is wrapped in a block because there might be more than 
                    // one component with styles, in which case we will have 
                    // multiple 'componentStyles' variables and don't want them to clash!
                    const componentStyles = document.createElement('style');
                    componentStyles.textContent = `    div.same-date {
        margin-bottom: 0; /* no spacing betweens events taking place on the same date */
    }
    div.school-holidays {
        outline: solid 11px #c0d3e7;
        background-color: #c0d3e7;
    }
    div.school-holidays + div:not(.school-holidays) {
        /* create extra spacing */
        margin-top: 30px;
    }
    div:not(.school-holidays) + div.school-holidays {
        /* create extra spacing */
        margin-top: 30px;
    }
    .cancelled {
        text-decoration: line-through;
    }
    .text-dark {
        color: #444; 
    }
    .timeline-notes>p {
        margin-left: 13px;
        margin-top: -9px;
        margin-bottom: -8px;
        color: dimgray;
    }`;
                    document.head.appendChild(componentStyles);
                }
