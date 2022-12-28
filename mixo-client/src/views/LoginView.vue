<template>
  <div class="login-background">
    <div class="row col-login-form">
      <div class="form-login">
        <div class="logo-div">
          <h1>Welcome to</h1>
          <a href="/"><img src="/logo.png" alt="Logo mixo"/></a> 
        </div>
        <form class="form-login-form" action="@login" method="post">
          <div class="mb-3">
            <label for="exampleFormControlInput1" class="form-label">Username or email</label>
            <input type="text" class="form-control" id="exampleFormControlInput1" placeholder="name@example.com">
          </div>
          <div class="mb-3">
            <label for="exampleFormControlInput1" class="form-label">Password</label>
            <input type="password" class="form-control" id="exampleFormControlInput1" >
          </div>
          <a href="/register" class="btn btn-link">¿Aún no tienes cuenta? Registrate</a>
          <button type="submit" class="btn btn-primary">Login</button>
        </form>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      publicPath: import.meta.env.BASE_URL,
    }
  },
}
</script>
<style>
  header {
    display: none !important;
  }

  .logo-div{
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
  }

  .login-background {
    background-image: url("/anastasiia-krutota-EX8UtPjOFhY-unsplash.png");
  }

  .login-image {
    height: 100vh;
    width: 40vw;
  }

  .col-login-form {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .form-login {
    background-color: rgba(255, 255, 255, 0.6);
    padding: 32px;
    border: 1px solid gray;
    border-radius: 25px;
  }

  .form-login-form {
    display: flex;
    flex-direction: column;
  }

  .form-login-form a {
    text-align: start;
    padding: 16px 0;
    color: #104911;
  }

  .btn-primary {
    background-color: #104911;
    border: 1px solid #104911;
  }
</style>