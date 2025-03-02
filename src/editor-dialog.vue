<style>
    .no-bottom-margin {
        margin-bottom: 0;
    }
</style>
<template>
<div class="editor-dialog">
    <!-- <div class="modal fade" tabindex="-1" role="dialog" data-backdrop="static">
        <div class="modal-dialog" role="document">
            <div class="modal-content"> -->
                <div class="modal-header"
                     style="border-bottom: none; padding: 0; background-color: #ddd">

                    <h4 class="modal-title">
                        <ul class="nav nav-tabs">
                            <bootstrap-nav code="details" v-model="activeTab">Event details</bootstrap-nav> 
                            <bootstrap-nav code="notes"   v-model="activeTab">
                                <span v-if="!dbitem.notes">+</span>
                                <span v-if="!!dbitem.notes">Notes</span>
                            </bootstrap-nav> 
                            <!-- <bootstrap-nav v-show="!!dbitem.notes"
                                           code="markdown" v-model="activeTab">
                                                M<span style="font-size: smaller" class="glyphicon glyphicon-arrow-down"></span>
                            </bootstrap-nav> -->
                        </ul>
                    </h4>
                </div><!-- /modal-header -->
                <div>
                    <!-- class="modal-body" style="padding-bottom: 0" -->

                    <!-- Need to use v-if instead of v-show to avoid the error
                         "easymde.min.js:7 Uncaught TypeError: Cannot read properties of undefined (reading 'map')" -->
                    <div v-if="activeTab == 'notes'">
                        <simple-mde v-model="dbitem.notes"
                                    ref="simplemde"
                        ></simple-mde><!-- style="height: 200px" -->
                        <!--<textarea class="form-control" 
                                  style="height: 200px"
                                  ref="textarea"
                                  v-model="dbitem.notes"></textarea>-->
                    </div>
                    <!-- 200px = smaller notes box (for use on mobile devices
                         where the keyboard takes up half the screen) -->

                    <!-- <div v-show="activeTab == 'markdown'"
                         class="well"
                         style="height: 400px; overflow-y: scroll; margin: 0">
                        <div v-html="markdownHtml"></div>
                    </div> -->

                    <div v-show="activeTab == 'details'"
                         class="form-horizontal"
                         style="padding: 30px 30px 15px 30px">

                        <div class="form-group">
                            <label class="col-xs-3 control-label">Type</label>
                            <div class="col-xs-8">
                                <select class="form-control" v-model="dbitem.type">
                                    <option v-for="(value, key) in store.eventTypes"
                                            v-bind:value="key">{{ value }} {{ key }}</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group"
                             v-bind:class="{ 'no-bottom-margin': locationIncludesName }">
                            <label class="col-xs-3 control-label">
                                Name {{ locationIncludesName ? "/" : "" }}
                            </label>
                            <div class="col-xs-9">
                                <input type="text" class="form-control" v-model.trim="dbitem.name">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="col-xs-3 control-label">Location</label>
                            <div class="col-xs-9">
                                <div v-bind:class="{ 'input-group': !!dbitem.location }">
                                    <input type="text" class="form-control" v-model.trim="dbitem.location">
    
                                    <a v-show="!!dbitem.location"
                                       v-bind:href="mapUrl"
                                       v-bind:target="store.openLinksInNewWindow ? '_blank' : null"
                                       class="input-group-addon emoji"
                                       ><span class="glyphicon glyphicon-map-marker"></span></a>
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="col-xs-3 control-label">Date</label>
                            <div class="col-xs-8">
                                <div class="input-group">
                                    <bootstrap-datepicker v-model="dbitem.date"
                                                          format="D dd/mm/yyyy"
                                    ></bootstrap-datepicker>
                                    <span class="input-group-btn">
                                        <button class="btn btn-default" v-on:click="clearDate">x</button>
                                    </span>
                                </div><!-- /input-group -->
                                <label style="font-weight: normal"
                                       v-bind:class="{ 'text-muted': !dbitem.schoolHolidays }">
                                    <input type="checkbox" 
                                           v-model="dbitem.schoolHolidays" /> School holidays
                                </label>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="col-xs-3 control-label">Status</label>
                            <div class="col-xs-7">
                                <select class="form-control" v-model="dbitem.status">
                                    <option v-for="(value, key) in store.statusList"
                                            v-bind:value="key">{{ value }} {{ key }}</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="col-xs-3 control-label">Link</label>
                            <div class="col-xs-9">
                                <div v-bind:class="{ 'input-group': !!dbitem.link }">
                                    <input type="text" class="form-control" v-model="dbitem.link">
    
                                    <a v-show="!!dbitem.link"
                                       v-bind:href="dbitem.link"
                                       v-bind:target="store.openLinksInNewWindow ? '_blank' : null"
                                       class="input-group-addon emoji"
                                       ><span class="glyphicon glyphicon-new-window"></span></a>
                                </div>
                            </div>
                        </div>


                    </div><!-- /activeTab == 'details' -->

                    <div v-if="activeTab == 'notes'"
                         class="checkbox">
                        <label title="Tip: To only show *some* of the Notes on the timeline, insert a horizontal line (---) to indicate where the timeline notes end.">
                            <input type="checkbox" v-model="dbitem.showNotesOnTimeline" />
                            Show Notes on Timeline
                        </label>
                    </div>

                </div><!-- /"modal-body" -->
                <div class="modal-footer">
                    <!--<div v-show="activeTab == 'notes'"
                         style="float: left">
                        <button type="button" class="btn btn-default" v-on:click="insertTodo">⏹</button>
                        <button type="button" class="btn btn-default" v-on:click="insertDone">✅</button>
                    </div>-->
                    <button type="button" class="btn btn-default" data-dismiss="modal"
                            v-on:click="close">Close</button>
                    <button type="button" 
                            class="btn btn-primary"
                            v-on:click="save">Save changes</button>
                </div>
            <!-- </div>
        </div>
    </div> -->
</div>
</template>

<script lang="ts">
import bootstrapDatepicker from './bootstrap-datepicker.vue'
import { defineComponent, nextTick } from 'vue';
import * as $ from "jquery";
import { TimelineItem } from './types/app';
import SimpleMde from './simple-mde.vue';
import { store } from "./store";

export default defineComponent({
    components: {
        bootstrapDatepicker
    },
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
    computed: {
        // markdownHtml: function() {
        //     if (!this.dbitem.notes) return "";
        //     var reader = new commonmark.Parser();
        //     var parsed = reader.parse(this.dbitem.notes);
        //     var writer = new commonmark.HtmlRenderer({softbreak: "<br />"}); // make soft breaks render as hard breaks in HTML
        //     return writer.render(parsed);
        // }
        locationIncludesName: function (): boolean {
            return (this.dbitem.type || "").startsWith("Holiday")
                || this.dbitem.type == "Excursion"
                || this.dbitem.type == "Restaurant";
        },
        mapUrl: function (): string {
            // Sometimes "Name" should be included as part of the location - for example
            // for "Holiday" types, where "Name" is the name of the hotel or destination.
            // Whereas with other types of event the "Name" should *not* be included,
            // for example Film, Music or Live Entertainment, where "Name" contains the
            // the film/band/show, which is not part of the location.

            function tidyName (text: string) {
                // Remove anything in parenthesis
                var openBracketIdx = text.indexOf(" (");
                if (openBracketIdx != -1) {
                    text = text.substring(0, openBracketIdx);
                }
                // Remove emoji (https://stackoverflow.com/a/41543705)
                return text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
            }

            return "https://www.google.com/maps/search/"
                + (this.locationIncludesName ? tidyName(this.dbitem.name).trim() + ", " : "") 
                + this.dbitem.location;
        }
    },
    // May'23: `simplemde.refresh()` method not used anymore;
    //         instead simplemde component is deleted and re-created using `v-if`
    //         (`v-if="activeTab == 'notes'`)
    // watch: {
    //     activeTab: function (newValue) {
    //         if (newValue == "notes") { 
    //             // tell SimpleMDE to refresh 
    //             // (otherwise the contents won't update until the control is focussed/clicked!)
    //             var simplemde = this.$refs.simplemde as InstanceType<typeof SimpleMde>;
    //             nextTick(function() { // wait for tab to become visible
    //                 simplemde.refresh(); 
    //             });
    //         }
    //     }
    // }
});

function new_timelineItem(): TimelineItem {
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
</script>