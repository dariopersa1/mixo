<template>
  <header id="mixo-header">
    <img alt="Mixo logo" class="logo" @click="this.$router.push('/')" src="/logo.png" width="150" height="50" style="cursor: pointer"/>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink v-if="token == ''" to="/login">Login</RouterLink>
      <RouterLink v-if="token == ''" to="/register">Registro</RouterLink>
      <a href="/admin" v-if="admin">Administración</a>
      <a href="/" v-if="token != ''" @click="logout">Cerrar sesión</a>
    </nav>
  </header>
</template>
<script>
import { watch } from 'vue';
export default {
  data() {
    return {
      token: '',
      admin: false
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('admin')
      this.token = ''
      this.admin = false
    },
    getAdmin(){
      this.$router.push("/admin")
    }
  },
  watch: {
    '$route' (to, from) {
      if(to.name == 'register' || to.name == 'login'){
        document.getElementById('mixo-header').style.display = "none";
      }else{
        document.getElementById('mixo-header').style.display = "flex";
      }
      if(localStorage.getItem('token') !== null){
        this.token = localStorage.getItem('token')
        this.admin = localStorage.getItem('admin')
      }
    }
  }
}
</script>
<style scoped>
  header {
    position: fixed;
    width: 100%;
    z-index: 1;
    display: flex;
    align-items: center;
    background-image: url("/header.png");
    padding: 16px;
  }
  nav {
    margin-left: 32px;
    display: flex;
  }
  nav a {
    color: white;
    margin: 0 16px;
  }
</style>