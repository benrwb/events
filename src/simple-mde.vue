<template>
    <textarea></textarea>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { store } from "./store";

export default defineComponent({
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
                      //"quote", "unordered-list", "ordered-list", "|", 
                      //"link", "image", "|", 
                      "preview", "side-by-side", "fullscreen", "|", 
                      //"guide" 
                      ],
            minHeight: '100px',
            // set height of control with .CodeMirror CSS class
            
            // RENDERING:
            // * By default, EasyMDE uses "marked" to convert markdown to HTML
            //   (see `EasyMDE.prototype.markdown` function)
            // * As part of this, links are changed to always open in new tabs
            //   (using `addAnchorTargetBlank` function)
            // * This default rendering can be overriden using `previewRender` option:
            previewRender: store.convertMarkdownToHtml
            // ^^^ override the default renderer to allow switching on/off 
            //     "links open in new tab" feature 
            //     (based on `store.openLinksInNewWindow` setting)
        });
        
        var self = this;
        this.mde.codemirror.on("change", function () {
            var newValue = self.mde.value();
            self.changesToIgnore.push(newValue); // save this internal change so it can be ignored later
            self.$emit("update:modelValue", newValue); // for use with v-model
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
    beforeUnmount: function () {
        // Remove SimpleMDE from textarea 
        this.mde.toTextArea();
        this.mde = null;
    },
    watch: {
        modelValue: function (newValue) {
            // Update when value changes
            var ignoreIdx = this.changesToIgnore.indexOf(newValue);
            if (ignoreIdx == -1) {
                // External change - update control with new value
                this.mde.value(newValue);
                this.changesToIgnore.splice(0, this.changesToIgnore.length); // remove all items from array
            } else {
                // Internal change (caused by self.$emit) - ignore 
                this.changesToIgnore.splice(ignoreIdx, 1); // remove item from array
            }
        }
    },
    // May'23: `refresh()` method not used anymore;
    //         instead component is deleted and re-created using `v-if`
    //         in parent component (`v-if="activeTab == 'notes'`)
    // methods: {
    //     refresh: function () { // NOTE: This function is called by parent (via $refs) so its name must not be changed!
    //         // Useful for Bootstrap modal/tabs, 
    //         // where the contents don't update until the control is focussed/clicked,
    //         // so triggering a manual refresh is necessary.
    //         // See https://github.com/F-loat/vue-simplemde/issues/20#issuecomment-326799643
    //         this.mde.codemirror.refresh();
    //     }
    // }
});
</script>