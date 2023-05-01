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
            <textarea v-bind="$attrs" class="form-control screenonly" v-bind:value="modelValue" style="resize: none; position: absolute; z-index: -1" tabindex="-1" rows="1"
                      ref="hiddenTextarea"></textarea>
        </div>

        <!-- visible textarea -->
        <textarea v-bind="$attrs" class="form-control screenonly" v-model="theValue" style="resize: none" 
                  v-on:focus="$emit('focus')" v-on:blur="$emit('blur')"
                  ref="txtarea"></textarea>

        <!-- print div -->
        <div style="white-space: pre-wrap; margin-bottom: 0" class="well well-sm printonly">{{ modelValue }}</div>

    </div>
</template>


<script lang="ts">

    // * Textarea that automatically resizes to fit content:
    //     -> When content is added or deleted
    //     -> When the browser window is resized
    //
    // * When printing, the textarea is substituted with a div, to
    //   ensure that all content appears on printout (no scrollbars).

    import { defineComponent, nextTick } from 'vue';

    export default defineComponent({
        inheritAttrs: false, // e.g. so placeholder="..." is applied to <textarea> not root element
        model: {
            // Vue 2 -> 3 migration (May'23):
            //   * One of the breaking changes in Vue 3 is caused by
            //     the v-model prop changing from `value` to `modelValue`
            //     and the event changing from `input` to `update:modelValue`.
            //   * As a workaround, the `model` component option can be used
            //     to tell Vue 2 to use the new Vue 3 prop and event names.
            //     (AFAIK, the `model` option is ignored by Vue 3)
            //   * This provides a way to make a component compatible with
            //     both Vue 2 and Vue 3.
            prop: "modelValue",
            event: "update:modelValue"
        },
        props: {
            modelValue: String, // for use with v-model
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
                    return this.modelValue;
                },
                set: function (newValue: string) {
                    this.$emit("update:modelValue", newValue); // for use with v-model
                }
            }
        },
        methods: {
            autoResize: function () {
                var minHeight = this.minHeight ? Number(this.minHeight) : 54;
                var textarea = this.$refs.txtarea as HTMLTextAreaElement;
                var hiddenTextarea = this.$refs.hiddenTextarea as HTMLTextAreaElement;
                nextTick(function () { // wait for hiddenTextarea to update
                    textarea.style.height = Math.max(minHeight, (hiddenTextarea.scrollHeight + 2)) + "px";
                });
            },
            isVisible: function () {
                if (!this.$el) { 
                    return false; // Element doesn't exist, therefore isn't visible
                }
                if (!this.$el.checkVisibility) {
                    // new checkVisibility() API not supported, so use old method (https://stackoverflow.com/a/19808107)
                    return this.$el.offsetWidth > 0 && this.$el.offsetHeight > 0;
                } else {
                    // use new checkVisibility() API
                    return this.$el.checkVisibility();
                }
            },
            deferredResize: function () {
                // Fix for when the textarea is in a Bootstrap modal
                // (element is not made visible immediately, because there is an 
                //  animation while the modal is shown. So if the element isn't
                //  visible, then wait 200ms before trying to resize the control)
                if (this.isVisible())
                    this.autoResize(); // element *is* visible, resize immediately
                else
                    setTimeout(this.autoResize, 200); // *not* visible, try again in 200ms
            },
            focus: function () {
                var textarea = this.$refs.txtarea as HTMLTextAreaElement;
                textarea.focus();
            }
        },
        mounted: function () {
            window.addEventListener("resize", this.autoResize);
            this.deferredResize();
        },
        beforeDestroy: function () {
            window.removeEventListener("resize", this.autoResize);
        },
        watch: {
            modelValue: function () { // when value is changed (either through user input, or viewmodel change)
                this.deferredResize();
            }
        }
    });

</script>
