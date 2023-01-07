<template>
  <div class="login-background">
    <div class="row col-login-form">
      <div class="form-login">
        <div class="logo-div">
          <h1>Welcome to</h1>
          <a href="/"><img src="/logo.png" alt="Logo mixo"/></a> 
        </div>
        <div class="form-login-form">
          <div class="mb-3">
            <label for="username" class="form-label">Username</label>
            <input type="text" class="form-control" v-model="username" id="username" placeholder="username" required>
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input type="password" v-model="password" class="form-control" id="password" required>
          </div>
          <p class="errors" v-if="error != ''">{{ this.error }}</p>
          <a href="/register" class="btn btn-link">¿Aún no tienes cuenta? Registrate</a>
          <button type="submit" :disabled="username == '' || password == ''" @click="login" class="btn btn-primary" style="cursor: pointer">Login</button>
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
      password: '',
      error: '',
      publicPath: import.meta.env.BASE_URL,
    }
  },
  methods: {
    async login() {
      await axios
      .post('http://localhost:3000/api/login?username='+this.username+'&password='+this.password, {headers: {'Content-Type': 'application/json'}})
      .then(response => {
        if(response.status == 200){
          var token = response.data.token
          var admin = response.data.admin
          var user = response.data.user
          console.log(user)
          localStorage.setItem('token', token)
          localStorage.setItem('admin', admin)
          localStorage.setItem('user', JSON.stringify(user))
          this.$router.push("/");
        }else{
          this.error = response.data
        }
      }).catch(error => {
        this.error = error.response.data
        var password = document.getElementById("password");
        password.value = '';
      })
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

  .errors {
    color: red;
    font-weight: bold;
    margin: 0;
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