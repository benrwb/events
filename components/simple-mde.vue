<template>
    <textarea></textarea>
</template>

<script lang="ts">
import Vue from './@types/vue'

export default Vue.extend({
    props: {
        value: String // for use with v-model
    },
    data: function() {
        return { 
            mde: null,
            lastValue: null
        }
    },
    mounted: function() {
        this.mde = new SimpleMDE({ 
            element: this.$el,
            spellChecker: false,
            initialValue: this.value,
            status: false, // hide the status bar
            autofocus: true
            // set height of control with .CodeMirror CSS class
        });
        
        var self = this;
        this.mde.codemirror.on("change", function() {
            self.lastValue = self.mde.value();
            self.$emit("input", self.lastValue); // for use with v-model
        });

        this.mde.codemirror.on('refresh', function () {
            // Fix fullscreen when in Bootstrap modal
            // see https://github.com/sparksuite/simplemde-markdown-editor/issues/263#issuecomment-262591099
            if (self.mde.isFullscreenActive()) {
                $('body').addClass('simplemde-fullscreen');
            } else {
                $('body').removeClass('simplemde-fullscreen');
            }
        });
    },
    beforeDestroy: function() {
        // Remove SimpleMDE from textarea 
        this.mde.toTextArea();
        this.mde = null;
    },
    watch: {
        value: function (newValue) {
            // Update when value changes
            if (newValue != this.lastValue) {
                this.mde.value(newValue);
            }
        }
    },
    methods: {
        refresh: function() { // NOTE: This function is called by parent (via $refs) so its name must not be changed!
            // Useful for Bootstrap modal/tabs, 
            // where the contents don't update until the control is focussed/clicked,
            // so triggering a manual refresh is necessary.
            // See https://github.com/F-loat/vue-simplemde/issues/20#issuecomment-326799643
            this.mde.codemirror.refresh();
        }
    }
});
</script>