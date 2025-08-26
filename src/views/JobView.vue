<template>
    <div class="cell-wide">
        <h1 :class="{ 'fade-in': showHeadLine }">Job-Update</h1>
         <p>Erfasse hier &Auml;nderungen zu Rolle, Team oder Software und Hardware von Mitarbeitenden.</p>
    </div>
    
    <div :class="{ 'fade-in': showWorkArea }" class="new-div">
        <BaseData v-if="activeComponent === 'BaseData'" @show-equip="activeComponent = 'EquipData'" />
        <EquipData v-else />
    </div>
</template>

<script setup>
    import { onMounted, ref } from 'vue';
    import BaseData from './JobView/BaseData.vue';
    import EquipData from './JobView/EquipData.vue';

    const activeComponent = ref('BaseData');

    const showHeadLine = ref(false);
    const showWorkArea = ref(false);
    onMounted(() => {
        setTimeout(() => {
            showHeadLine.value = true;
        }, 100);
        setTimeout(() => {
            showWorkArea.value = true;
        }, 200);
    });

</script>

<style scoped>
.cell-wide {
    grid-column: 1 / 3;
    grid-row: 1 / 2;
}

.new-div {
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
    grid-column: 1 / 3;
    grid-row: 2 / 3;
}
.new-div.fade-in {
    opacity: 1;
}
</style>