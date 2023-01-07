<template>
  <Header></Header>
  <RouterView />
</template>

<script>
import { RouterLink, RouterView } from 'vue-router'
import Header from '../src/components/Header.vue'
export default{
  components:{
    Header
  }
}

</script>
<style scoped>
</style>
