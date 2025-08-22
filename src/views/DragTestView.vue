<script setup lang="ts">
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { ref, onMounted } from 'vue';
import draggable from 'vuedraggable';

const isEnabled = ref('extern');
const updateType = ref('eintritt');

const sourceList = ref([
    { id: 1, name: 'Item A' },
    { id: 2, name: 'Item B' },
    { id: 3, name: 'Item C' }
]);

const targetList = ref([
    { id: 4, name: 'Item D' },
    { id: 5, name: 'Item E' }
]);

const selectedDate = ref(null);

const sortLists = () => {
    sourceList.value.sort((a, b) => a.id - b.id);
    /*targetList.value.sort((a, b) => a.id - b.id);*/
};

onMounted(sortLists);

const deleteItem = (index: number) => {
    if (index > -1) {
        const [movedItem] = targetList.value.splice(index, 1);
        sourceList.value.push(movedItem);
        sortLists();
    }
};

const onListChange = (event: any) => {
    sortLists();
    if (event.added) {
        console.log(`Neues Item hinzugefügt: ${event.added.element.name}`);
    }
    if (event.removed) {
        console.log(`Item entfernt: ${event.removed.element.name}`);
    }
};

const customFormat = (date) => {
    return date ? format(date, 'dd.MM.yyyy', { locale: de }) : '';
}
</script>

<template>
    <div class="main-container">
        <div class="container">
            <div class="toggle-container">
                <Toggle
                    v-model="isEnabled"
                    on-label="Intern"
                    off-label="Extern"
                    true-value="intern"
                    false-value="extern"
                    class="full-width-toggle"
                />
            </div>
            <Transition name="slide-fade">
                <div id="intern" v-if="isEnabled === 'intern'">
                    <!--<h2>Mitarbeiter*in</h2>-->
                    <div>
                    <form>
                        <fieldset style="display: flex; flex-wrap: wrap; gap: 1rem; border-color: var(--color-border); border-radius: 0.4rem;">
                            <legend>Mitarbeiter*in</legend>
                            <div style="flex: 1 1 15rem;">
                                <label>Vorname</label><br />
                                <input type="text" id="vorname" name="vorname">
                            </div>
                            <div style="flex: 1 1 15rem;">
                                <label>Nachname</label><br />
                                <input type="text" id="nachname" name="nachname">
                            </div>
                        </fieldset>
                    </form>
                </div>

            <div class="datepick">
                <h2>Befristet bis:</h2>
                <VueDatePicker v-model="selectedDate" locale="de" cancelText="abbrechen" selectText="auswählen" vertical :format="customFormat" :enable-time-picker="false"/>
            </div>
            
            <h2>Verfügbare Software</h2>
            <draggable class="list-group" :list="sourceList" group="items" item-key="id">
                <template #item="{ element }">
                    <div class="list-group-item">
                        {{ element.name }}
                    </div>
                </template>
            </draggable>
    
            <hr class="shadow-line">
    
            <h2>Ausgewählte Software</h2>
            <draggable class="list-group target-list" :list="targetList" group="items" @change="onListChange" item-key="id">
                <template #item="{ element, index }">
                    <div class="list-group-item">
                        <span>{{ element.name }}</span>
                        <button @click="deleteItem(index)" class="delete-button fa">&#xf014;</button>
                    </div>
                </template>
            </draggable>
        </div>
        </Transition>
        </div>
    </div>
</template>

<!-- Globale Styles für externe Bibliotheken -->
<style>
    @import '@vueform/toggle/themes/default.css';
</style>

<!-- Gekapselte Styles nur für diese Komponente -->
<style scoped>
    .slide-fade-enter-active, .slide-fade-leave-active {
        transition: all 0.5s ease;
        overflow: hidden;
    }
    .slide-fade-enter-from, .slide-fade-leave-to {
        max-height: 0;
        opacity: 0;
    }
    .slide-fade-enter-to, .slide-fade-leave-from {
        max-height: 1000px;
        opacity: 1;
    }
    input {
        width: 100%; 
        height: 2rem; 
        border: 0.1rem solid var(--color-border);
        border-radius: 0.2rem;
    }
    .toggle-container {
        width: 100%;
        margin-bottom: 20px;
    }

    .full-width-toggle {
        --toggle-bg-on: #007a8c;
        --toggle-bg-off: #78c6bf;
        --toggle-border-on: #007a8c;
        --toggle-border-off: #78c6bf;
        --toggle-font-size: 1rem !important;
    }

    .full-width-toggle:focus {
        outline: none !important;
        box-shadow: none !important;
    }

    .list-group-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: var(--color-button);
        border-radius: 0.2rem;
        margin: 0.2rem;
        padding: 0.4rem;
    }

    .list-group {
        user-select: none;
    }
    .delete-button {
        background: none !important;
        border: none;
        cursor: pointer;
        font-size: 1.2rem;
        padding: 0;
        margin-left: 10px;
    }
    /* Portrait */
@media screen and (orientation: portrait) {
  ::v-deep(.full-width-toggle) {
    --toggle-width: 40vw !important;  /* fast ganze Breite im Portrait */
    --toggle-height: 2.5rem !important;
  }
}

/* Landscape */
@media screen and (orientation: landscape) and (pointer: fine) {
  ::v-deep(.full-width-toggle) {
    --toggle-width: 20vw !important;  /* etwas schmaler im Landscape */
    --toggle-height: 2rem !important;
  }


  ::v-deep(.toggle-container) {
    max-width: fit-content;
    margin-inline: auto !important;
  }
}

@media screen and (orientation: landscape) and (pointer: coarse) {
  ::v-deep(.full-width-toggle) {
    --toggle-width: 20vw !important;  /* etwas schmaler im Landscape */
    --toggle-height: 2rem !important;
  }
}

</style>