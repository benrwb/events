<template>
<div>
    <!-- <div class="modal fade" tabindex="-1" role="dialog" data-backdrop="static">
        <div class="modal-dialog" role="document">
            <div class="modal-content"> -->
                <div class="modal-header"
                     style="border-bottom: none; padding: 0; background-color: #ddd">

                    <h4 class="modal-title">
                        <ul class="nav nav-tabs">       
                            <bootstrap-nav value="details" v-model="activeTab">Event details</bootstrap-nav> 
                            <bootstrap-nav value="notes"   v-model="activeTab">
                                <span v-if="!dbitem.notes">+</span>
                                <span v-if="!!dbitem.notes">Notes</span>
                            </bootstrap-nav> 
                            <!-- <bootstrap-nav v-show="!!dbitem.notes"
                                           value="markdown" v-model="activeTab">
                                                M<span style="font-size: smaller" class="glyphicon glyphicon-arrow-down"></span>
                            </bootstrap-nav> -->
                        </ul>
                    </h4>
                </div>
                <div>
                    <!-- class="modal-body" style="padding-bottom: 0" -->
                    <div v-show="activeTab == 'notes'">
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
                         style="padding: 15px"
                         class="form-horizontal">

                        <div class="form-group">
                            <label class="col-xs-3 control-label">Type</label>
                            <div class="col-xs-6">
                                <select class="form-control" v-model="dbitem.type">
                                    <option v-for="(value, key) in eventTypes"
                                            v-bind:value="key">{{ value }} {{ key }}</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="col-xs-3 control-label">Name</label>
                            <div class="col-xs-9">
                                <input type="text" class="form-control" v-model="dbitem.name">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="col-xs-3 control-label">Location</label>
                            <div class="col-xs-9">
                                <input type="text" class="form-control" v-model="dbitem.location">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="col-xs-3 control-label">Date</label>
                            <div class="col-xs-6">
                                <div class="input-group">
                                    <bootstrap-datepicker v-model="dbitem.date"></bootstrap-datepicker>
                                    <span class="input-group-btn">
                                        <button class="btn btn-default" v-on:click="clearDate">x</button>
                                    </span>
                                </div><!-- /input-group -->
                            </div> 
                        </div>

                        <div class="form-group">
                            <label class="col-xs-3 control-label">Status</label>
                            <div class="col-xs-7">
                                <select class="form-control" v-model="dbitem.status">
                                    <option v-for="(value, key) in statusList"
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
                                        class="input-group-addon emoji"
                                        target="_blank"><span class="glyphicon glyphicon-new-window"></span></a>
                                </div>
                            </div>
                        </div>

                        

                    </div>
                </div>
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
import Vue from './@types/vue'
import * as $ from './@types/jquery'

export default Vue.extend({
    components: {
        bootstrapDatepicker
    },
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
</script>