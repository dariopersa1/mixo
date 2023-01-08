<template>
  <div class="login-background">
    <div class="row col-login-form">
      <div class="form-login">
        <div class="logo-div">
          <h1>Register in</h1>
          <a href="/"><img src="/logo.png" alt="Logo mixo"/></a> 
        </div>
        <div class="form-login-form">
          <div class="mb-3">
            <label for="username" class="form-label">Username</label>
            <input type="text" v-model="username" class="form-control" id="username" placeholder="Name">
          </div>
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input type="text" v-model="email" class="form-control" id="email" placeholder="name@example.com">
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input type="password" v-model="password" class="form-control" id="password">
          </div>
          <div class="mb-3">
            <label for="confirmPassword" class="form-label">Confirm password</label>
            <input type="password" v-model="confirmPassword" class="form-control" id="confirmPassword" >
          </div>
          <p class="errors" v-if="error != ''">{{ this.error }}</p>
          <a href="/login" class="btn btn-link">¿Ya tienes cuenta? Login</a>
          <button type="submit" @click="register" :disabled="username == '' || email == '' || password == '' || confirmPassword == ''" class="btn btn-primary" id="register-button">Registro</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios'
export default {
  data() {
    return {
      username: '',
      email: '',
      password: '', 
      confirmPassword: '',
      error: '',
      publicPath: import.meta.env.BASE_URL,
    }
  },
  methods: {
    async register() {
      const button = document.getElementById('register-button')
      button.disabled = true

      if(this.password == this.confirmPassword && this.email.includes('@')){
        await axios
        .post('http://localhost:3000/api/register', {username: this.username, email: this.email, password: this.password},{headers: {'Content-Type': 'application/json'}})
        .then(response => {
          console.log(response.data)
          this.$router.push('/login')
        })
        .catch(error => console.log(error))
      }else{
        this.error = 'Los datos introducidos no coinciden con los requisitos'
        this.password = ''
        this.confirmPassword = ''
      }
    }
  },
}
</script>
<style scoped>
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

  .errors {
    color: red;
    font-weight: bold;
    margin: 0;
  }

  .btn-primary {
    background-color: #104911;
    border: 1px solid #104911;
  }
</style>