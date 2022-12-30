<template>
  <header>
    <img alt="Mixo logo" class="logo" src="/logo.png" width="150" height="50" />
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/login">Login</RouterLink>
      <RouterLink to="/register">Registro</RouterLink>
    </nav>
  </header>
</template>
<script>
export default {
  
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
    margin-bottom: 64px;  
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