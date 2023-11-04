<template>
    <div v-bind:class="{ 'input-group': !!modelValue }">
        <input type="text" class="form-control" placeholder="Search" 
               v-bind:value="modelValue"
               v-on:input="$emit('update:modelValue', $event.target.value)"
        />
        <span v-if="!!modelValue"
              class="input-group-btn">
            <button type="button" class="btn btn-danger" 
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