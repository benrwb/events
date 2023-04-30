<template>
    <li role="presentation"
        v-bind:class="{ 'active': modelValue == code }">
        <a href="#" v-on:click="navClick($event)">
            <slot></slot>
        </a>
    </li>
</template>

<script lang="ts">

//  Can be either tab or pill depending on container                           
//      e.g. <ul class="nav nav-tabs"> versus <ul class="nav nav-pills">       
//  Usage:                                                                     
//      <bootstrap-nav code="tab1" v-model="activeTab">Page 1</bootstrap-nav> 

import { defineComponent } from 'vue';

export default defineComponent({
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
</script>