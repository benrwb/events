<template>
    <li role="presentation"
        v-bind:class="{ 'active': value == groupValue }">
        <a href="#" v-on:click="navClick($event)">
            <slot></slot>
        </a>
    </li>
</template>

<script lang="ts">

//  Can be either tab or pill depending on container                           
//      e.g. <ul class="nav nav-tabs"> versus <ul class="nav nav-pills">       
//  Usage:                                                                     
//      <bootstrap-nav value="tab1" v-model="activeTab">Page 1</bootstrap-nav> 

import Vue from './types/vue'

export default Vue.extend({
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
</script>