<script setup>
import RouterView from 'vue-router'
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
  a, p, body, h1, h2, h3, h4, h5, h6{
    font-family: "Prata", sans-serif;
  }
</style>
