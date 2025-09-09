<template>
    <div class="navigation-buttons-fixed">
        <!-- <router-link v-if="userStore.role === 'admin' || userStore.role === 'pm'" to="/job"><button>Job Page</button></router-link> -->
        <router-link to="/job"><button>Job-Update</button></router-link>
        <router-link to="/user"><button>Mitarbeitendenportal</button></router-link>
    </div>
    <div>
        <h1 :class="{ 'fade-in': showHeadLine }">Administration</h1>
        <p>Hier kannst du Referenzprofile erstellen, l&ouml;schen sowie Software und Ger&auml;te bei bestehenden Profilen &auml;ndern</p>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

const showHeadLine = ref(false);
onMounted(() => {
    setTimeout(() => {
        showHeadLine.value = true;
    }, 100);
});
</script>