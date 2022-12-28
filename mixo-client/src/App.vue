<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <Header></Header>
  <RouterView />
</template>

<script>
import Header from '../src/components/Header.vue'
export default{
  components:{
    Header
  }
}

</script>
<style scoped>
</style>
