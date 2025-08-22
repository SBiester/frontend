<template>
    <div>
        <h1 :class="{ 'fade-in': showHeadLine }">Mitarbeitendenportal</h1>
        <p>Hier kannst du dein Passwort zurücksetzen, deinen Stellentitel anpassen oder Software beantragen.</p>
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