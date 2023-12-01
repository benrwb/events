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

    // NOTE: Don't use `v-model.trim` with this component, otherwise you won't be able to type a space!
    //       e.g. <expanding-textarea v-model.trim="someField"
    //                                       ^^^^^ <-- WRONG

    import { defineComponent, nextTick, computed, onMounted, onBeforeUnmount, watch, ref, Ref } from 'vue';

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
            minHeight: [Number, String]
        },
        setup: function (props, context) {

            const theValue = computed({
                // Jan'22: Added computed property with getter/setter
                //         This fixes an issue with the previous approach
                //         where if the field didn't exist on the parent dbitem object
                //         then the <expanding-textarea> would not automatically resize
                //         in response to changes. 
                //         e.g. dbitem: {} as PersonDetails
                //              <expanding-textarea v-model="dbitem.Forename">
                //              ^ would not resize because dbitem.Forename is undefined (non-reactive)
                get: function (): string {
                    return props.modelValue;
                },
                set: function (newValue: string) {
                    context.emit("update:modelValue", newValue); // for use with v-model
                }
            });

            const txtarea = ref(null) as Ref<HTMLTextAreaElement>;
            const hiddenTextarea = ref(null) as Ref<HTMLTextAreaElement>;

            function autoResize() {
                var minHeight = props.minHeight ? Number(props.minHeight) : 54;
                nextTick(() => { // wait for hiddenTextarea to update
                    txtarea.value.style.height = Math.max(minHeight, (hiddenTextarea.value.scrollHeight + 2)) + "px";
                });
            }

            watch(() => props.modelValue, () => { // when value is changed (either through user input, or viewmodel change)
                autoResize();
            });

            //OLD//isVisible: function () {
            //OLD//    if (!this.$el) {
            //OLD//        return false; // Element doesn't exist, therefore isn't visible
            //OLD//    }
            //OLD//    if (!this.$el.checkVisibility) {
            //OLD//        // new checkVisibility() API not supported, so use old method (https://stackoverflow.com/a/19808107)
            //OLD//        return this.$el.offsetWidth > 0 && this.$el.offsetHeight > 0;
            //OLD//    } else {
            //OLD//        // use new checkVisibility() API
            //OLD//        return this.$el.checkVisibility();
            //OLD//    }
            //OLD//},
            //OLD//deferredResize: function () {
            //OLD//    // Fix for when the textarea is in a Bootstrap modal
            //OLD//    // (element is not made visible immediately, because there is an
            //OLD//    //  animation while the modal is shown. So if the element isn't
            //OLD//    //  visible, then wait 200ms before trying to resize the control)
            //OLD//    nextTick(() => { // nextTick: wait for other changes to settle before checking visibility
            //OLD//        if (this.isVisible())
            //OLD//            this.autoResize(); // element *is* visible, resize immediately
            //OLD//        else
            //OLD//            setTimeout(this.autoResize, 200); // *not* visible, try again in 200ms
            //OLD//    });
            //OLD//}

            let firstTime = true;

            // Set up IntersectionObserver to detect when the element first becomes visible (added Nov'23)
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    let visible = entry.intersectionRatio > 0;
                    //console.log(visible ? 'visible' : 'invisible');
                    if (visible && firstTime) {
                        // resize textarea when element first becomes visible on screen
                        // (there could be a delay of several seconds (or even minutes)
                        //  between the component being mounted and the element becoming visible
                        //  on-screen, for example (a) if it's on a tabbed page which is initially 
                        //  hidden with v-show, or (b) if it's part of a Bootstrap modal and there
                        //  is a short delay caused by the animation when the modal is shown)
                        //console.log("resize");
                        autoResize();
                        firstTime = false; // only needs to be done once
                    }
                });
            });

            onMounted(() => {
                window.addEventListener("resize", autoResize); // listen for window resize events
                observer.observe(txtarea.value); // activate IntersectionObserver
            });

            onBeforeUnmount(() => { // clean up
                window.removeEventListener("resize", autoResize);
                observer.disconnect();
            });


            function focus() { // can be called by parent component
                txtarea.value.focus();
            }
            
            return {
                theValue, hiddenTextarea, txtarea,
                focus // can be called by parent component
            };
        }
    });

</script>
