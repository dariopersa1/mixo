<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="50" height="50" />
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
    display: flex;
    align-items: center;
    background-color: #104911;
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