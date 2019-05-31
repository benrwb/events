<template>
    <div class="modal fade" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span
                            aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title">Event details</h4>
                </div>
                <div class="modal-body" style="padding-bottom: 0">
    
                    <div class="form-horizontal">

                       
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
import Vue from './@types/vue'
import * as $ from './@types/jquery'

export default Vue.extend({
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
    };
}
</script>