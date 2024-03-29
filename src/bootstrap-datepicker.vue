<template>
    <input class='form-control' type='text' />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import * as moment from "moment";
import * as $ from "jquery";

export default defineComponent({
    props: {
        modelValue: String, // accept a modelValue prop (for use with v-model)
        format: String // custom date format
    },
    mounted: function () {
        // Set initial value of the input to 'value'
        // (This will be picked up by the datepicker and used as the initial date)
        var modate = !this.modelValue ? null : moment(this.modelValue);
        if (modate != null && modate.isValid()) {
            $(this.$el).val(modate.format("DD/MM/YYYY"));
        }

        // Attach the datepicker control to the input         
        $(this.$el).datepicker({
            format: this.format || "dd/mm/yyyy", // default to UK date format
            autoclose: true,
            todayHighlight: true,
            disableTouchKeyboard: true, //  hide keyboard on mobile devices
            weekStart: 1 // week starts on Monday
        });
        
        // Register event
        var self = this;
        $(this.$el).datepicker().on("hide", function (e) {
            // Update the date when the datepicker is closed ("hide" event)
            // (which will happen either when a date is picked or when the field loses focus)
            self.updateValue();
        });
    },
    watch: {
        // watch the 'modelValue' prop for changes and update the control accordingly
        modelValue: function (newValue) {
            var modate = newValue == null ? null : moment(newValue); // handle null/undefined values
            if (modate != null && modate.isValid())
                $(this.$el).datepicker("setDate", modate.toDate());
            else
                $(this.$el).datepicker("setDate", null); // clear the selected date
        }
    },
    methods: {
        // Emit an input event with the new value
        // (To produce side effects in the parent scope, a component needs to explicitly emit an event)
        updateValue: function () {
            var jsDate = $(this.$el).datepicker("getDate");
            var dateVal = jsDate == null ? null : moment(jsDate).format('YYYY-MM-DD');
            this.$emit('update:modelValue', dateVal);
        },
    }
});
</script>