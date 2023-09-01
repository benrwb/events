<template>
    <div class="editor-dialog">
    <!-- <div class="modal fade" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
            <div class="modal-content"> -->
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"
                            v-on:click="close"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title">Link details</h4>
                </div>
                <div class="modal-body" style="padding-bottom: 0">
    
                    <div class="form-horizontal">


                        <div class="form-group">
                            <label class="col-xs-3 control-label">Type</label>
                            <div class="col-xs-7">
                                <select class="form-control" v-model="item.type">
                                    <option v-for="(value, key) in linkTypes"
                                            v-bind:value="key">{{ value }} {{ key }}</option>
                                </select>
                            </div>
                        </div>
                       
                        <div class="form-group">
                            <label class="col-xs-3 control-label">Name</label>
                            <div class="col-xs-9">
                                <input type="text" class="form-control" v-model="item.name">
                            </div>
                        </div>


                        <div class="form-group">
                            <label class="col-xs-3 control-label">Link</label>
                            <div class="col-xs-9">
                                <div v-bind:class="{ 'input-group': !!item.link }">
                                    <input type="text" class="form-control" v-model="item.link">
    
                                    <a v-show="!!item.link"
                                        v-bind:href="item.link"
                                        class="input-group-addon emoji"
                                        target="_blank"><span class="glyphicon glyphicon-new-window"></span></a>
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="col-xs-3 control-label">Notes</label>
                            <div class="col-xs-9">
                                <expanding-textarea v-model="item.notes" 
                                                    min-height="34"
                                                    ref="textarea" />
                                <!-- <input type="text" class="form-control" v-model="item.notes" /> -->
                            </div>
                        </div>

                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal"
                            v-on:click="close">Close</button>
                    <button type="button" 
                            class="btn btn-primary"
                            v-on:click="save">Save changes</button>
                </div>
            <!-- </div>
        </div> -->
    </div> 
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import * as $ from "jquery";
import { LinkItem } from './types/app';

export default defineComponent({
    props: {
        linkTypes: Object
    },
    data: function() {
        return {
            item: new_linkItem()
        }
    },
    // mounted: function () {
    //     var self = this;
    //     $(this.$el).on('shown.bs.modal', function () {
    //         // resize textarea when modal is shown
    //         self.$refs.textarea.autoResize();
    //     });
    // },
    // beforeDestroy: function () {
    //     $(this.$el).off('shown.bs.modal'); // remove event listener
    // },
    methods: {
        openDialog: function (item) { // called by parent via $refs
            // Note that `this.item` is set to `new_linkItem`
            // regardless of whether we are creating a new item
            // or opening an existing one.
            // The reason for this is because we want to trigger
            // the <expanding-textarea> to auto-resize, 
            // even if opening the same item twice in a row.
            this.item = new_linkItem(); // reset the form
            if (item) {
                // editing an existing item
                this.item = item;
            }
            //$(this.$el).modal('show');
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

function new_linkItem(): LinkItem {
    return {
        id: '', // will be set when saved
        category: 'Link',
        type: '',
        name: '',
        link: '',
        notes: ''
    };
}
</script>