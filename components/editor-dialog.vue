<template>
    <div class="modal fade" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header"
                     style="border-bottom: none">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span
                            aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title">
                        <ul class="nav nav-tabs">       
                            <bootstrap-nav value="details" v-model="activeTab">Event details</bootstrap-nav> 
                            <bootstrap-nav value="notes"   v-model="activeTab">Notes</bootstrap-nav> 
                        </ul>
                    </h4>
                </div>
                <div class="modal-body" style="padding-bottom: 0">
    
                    <div v-show="activeTab == 'notes'">
                        <div class="form-horizontal">
                            <div class="form-group">
                                <label class="col-xs-3 control-label">Notes</label>
                                <div class="col-xs-9">
                                    <textarea class="form-control" rows="13"
                                              v-model="dbitem.notes"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-show="activeTab == 'details'"
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
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    <button type="button" 
                            class="btn btn-primary"
                            v-on:click="save">Save changes</button>
                </div>
            </div>
        </div>
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
</script>