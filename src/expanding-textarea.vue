<style>
    @media screen {
        .printonly {
            display: none;
        }
    }

    @media print {
        .screenonly {
            display: none !important;
        }
    }
</style>


<template>
    <div>

        <!-- "hidden" textarea, used to calculate height of text -->
        <div style="position: relative">
            <textarea v-bind="$attrs" class="form-control screenonly" v-bind:value="value" style="resize: none; position: absolute; z-index: -1" tabindex="-1" rows="1"
                      ref="hiddenTextarea"></textarea>
        </div>

        <!-- visible textarea -->
        <textarea v-bind="$attrs" class="form-control screenonly" v-model="theValue" style="resize: none" 
                  v-on:focus="$emit('focus')" v-on:blur="$emit('blur')"
                  ref="txtarea"></textarea>

        <!-- print div -->
        <div style="white-space: pre-wrap; margin-bottom: 0" class="well well-sm printonly">{{ value }}</div>

    </div>
</template>


<script lang="ts">

    // * Textarea that automatically resizes to fit content:
    //     -> When content is added or deleted
    //     -> When the browser window is resized
    //
    // * When printing, the textarea is substituted with a div, to
    //   ensure that all content appears on printout (no scrollbars).

    import Vue from './@types/vue'

    export default Vue.extend({
        inheritAttrs: false, // e.g. so placeholder="..." is applied to <textarea> not root element
        props: {
            value: String, // for use with v-model
            minHeight: [Number,String]
        },
        computed: {
            // Jan'22: Added computed property with getter/setter
            //         This fixes an issue with the previous approach
            //         where if the field didn't exist on the parent dbitem object
            //         then the <expanding-textarea> would not automatically resize
            //         in response to changes. 
            //         e.g. dbitem: {} as PersonDetails
            //              <expanding-textarea v-model="dbitem.Forename">
            //              ^ would not resize because dbitem.Forename is undefined (non-reactive)
            theValue: {
                get: function (): string {
                    return this.value;
                },
                set: function (newValue: string) {
                    this.$emit("input", newValue); // for use with v-model
                }
            }
        },
        methods: {
            autoResize: function () {
                var minHeight = this.minHeight ? Number(this.minHeight) : 54;
                var textarea = this.$refs.txtarea as HTMLTextAreaElement;
                var hiddenTextarea = this.$refs.hiddenTextarea as HTMLTextAreaElement;
                Vue.nextTick(function () { // wait for hiddenTextarea to update
                    textarea.style.height = Math.max(minHeight, (hiddenTextarea.scrollHeight + 2)) + "px";
                });
            },
            focus: function () {
                var textarea = this.$refs.txtarea as HTMLTextAreaElement;
                textarea.focus();
            }
        },
        mounted: function () {
            window.addEventListener("resize", this.autoResize);
            this.autoResize();
        },
        beforeDestroy: function () {
            window.removeEventListener("resize", this.autoResize);
        },
        watch: {
            value: function () { // when value is changed (either through user input, or viewmodel change)
                this.autoResize();
            }
        }
    });

</script>
