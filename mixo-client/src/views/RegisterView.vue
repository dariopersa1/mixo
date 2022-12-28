<template>
  <div class="login-background">
    <div class="row col-login-form">
      <div class="form-login">
        <div class="logo-div">
          <h1>Register in</h1>
          <a href="/"><img src="/logo.png" alt="Logo mixo"/></a> 
        </div>
        <form class="form-login-form" action="@register" method="post">
          <div class="mb-3">
            <label for="exampleFormControlInput1" class="form-label">Username</label>
            <input type="text" class="form-control" id="exampleFormControlInput1" placeholder="name@example.com">
          </div>
          <div class="mb-3">
            <label for="exampleFormControlInput1" class="form-label">Email</label>
            <input type="text" class="form-control" id="exampleFormControlInput1" placeholder="name@example.com">
          </div>
          <div class="mb-3">
            <label for="exampleFormControlInput1" class="form-label">Password</label>
            <input type="password" class="form-control" id="exampleFormControlInput1" >
          </div>
          <div class="mb-3">
            <label for="exampleFormControlInput1" class="form-label">Confirm assword</label>
            <input type="password" class="form-control" id="exampleFormControlInput1" >
          </div>
          <a href="/login" class="btn btn-link">¿Ya tienes cuenta? Login</a>
          <button type="submit" class="btn btn-primary">Registro</button>
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
    background-image: url("/kim-daniels-P2qImp_Mr2Y-unsplash.png");
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
    background-color: rgba(255, 255, 255, 0.8);
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