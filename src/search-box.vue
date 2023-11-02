<template>
    <div class="input-group">
        <input type="text" class="form-control" placeholder="Search" 
               v-bind:value="modelValue"
               v-on:input="$emit('update:modelValue', $event.target.value)"
        />
        <span class="input-group-btn">
            <button class="btn" type="button"
                    v-bind:class="{ 'btn-danger': !!modelValue }"
                    v-bind:disabled="!modelValue"
                    v-on:click="$emit('update:modelValue', '')">X</button>
        </span>
    </div>
</template>

<script lang="ts">
    import { defineComponent } from 'vue';

    export default defineComponent({
        props: {
            modelValue: String
        }
    });
</script>