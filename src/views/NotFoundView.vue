<template>
  <div class="navigation-buttons-fixed">
    <router-link to="/home"><button>Zurück zur Startseite</button></router-link>
  </div>
  <div>
    <h1 :class="{ 'fade-in': showHeadLine }">Oops - 404</h1>
    <p>Du scheinst dich verlaufen zu haben. Oben rechts geht es zur&uuml;ck</p>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const showHeadLine = ref(false)
onMounted(() => {
  setTimeout(() => {
    showHeadLine.value = true
  }, 100)
})
</script>
