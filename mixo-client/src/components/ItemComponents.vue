<template>
  <div class="container" style="margin-top: 128px">
      <div class="col-12">
        <div class="card" v-for="cocktail in cocktails" style="width: 14rem;">
          <img :src="'/'+cocktail.name+'.jpg'" class="card-img-top" width="14rem" alt="cocktail" @click="details(cocktail.id)">
          <div class="card-body">
            <div class="card-title-container">
              <h4 class="card-title" @click="details(cocktail.id)">{{cocktail.name}}</h4>
              <img v-if="auth" class="fav-icon" @click="changeFav(cocktail.id)" :src="user.favs.includes(cocktail.id) ? '/fav.png' : '/not-fav.png'" alt="Fav icon">
            </div>
            <a :href="'/cocktails/category/'+cocktail.category" class="card-link" v-if="auth && cocktail.category != 'No category provided'">{{ cocktail.category }}</a>
            <p class="card-text" v-if="!auth && cocktail.category != 'No category provided'">{{ cocktail.category }}</p>
          </div>
        </div>
      </div>
  </div>
</template>
<script>
import axios from 'axios';
export default {
  data() {
    return {
      cocktails: [],
      category: '',
      ingredient: '',
      auth: false,
      user: {},
      token: ''
    }
  },
  methods: {
    details(id) {
      this.$router.push("/cocktail/"+id);
    },
    async changeFav(cocktail) {
      if(this.user.favs.includes(cocktail)){
        console.log('Remove fav')
        const index = this.user.favs.indexOf(cocktail)
        if(index > -1){
          this.user.favs.splice(index, 1)
          await axios
          .delete('http://localhost:3000/api/user/'+this.user.username+'/favs/'+cocktail,  {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}`}})
          .then(response => {
            console.log(response.data)
          })
          .catch(error => {
            console.log(error)
          })
        }else{
          console.log('Elemento a eliminar de favoritos no está en favoritos', index)
        }
      }else{
        console.log('Add fav')
        this.user.favs.push(cocktail)
        localStorage.removeItem('user')
        localStorage.setItem('user', JSON.stringify(this.user))
        await axios
        .post('http://localhost:3000/api/user/'+this.user.username+'/favs/'+cocktail, {}, {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}`}})
        .then(response => {
          console.log(response.data)
        })
        .catch(error => {
          console.log(error)
        })
      }
    },
    async getCocktails() {
      this.cocktails.length = 0
      if(localStorage.getItem('token') != null){
        this.auth = true
        this.user = JSON.parse(localStorage.getItem('user'))
        this.token = localStorage.getItem('token')
        console.log(this.token)
      }else{
        this.auth = false
      }
      console.log(localStorage.getItem('user'))
      if(!this.auth || (!this.$route.params.category && !this.$route.params.ingredient)){
        console.log('No category')
        await axios
        .get('http://localhost:3000/api/cocktails',  {headers: {'Content-Type': 'application/json'}})
        .then(response => {
          var c = response.data.data 
          c.forEach(cocktail => {
            this.cocktails.push(cocktail)
          });
        })
        .catch(error => {
          console.log(error)
        })
      }else if(this.$route.params.category){
        console.log('Category')
        var cat = this.$route.params.category
        await axios
        .get('http://localhost:3000/api/cocktails/category/'+cat,  {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}`}})
        .then(response => {
          var c = response.data.data 
          c.forEach(cocktail => {
            this.cocktails.push(cocktail)
          });
        })
        .catch(error => {
          console.log(error)
        })
      }else if(this.$route.params.ingredient){
        console.log('Ingredient')
        const ing = this.$route.params.ingredient
        await axios
        .get('http://localhost:3000/api/cocktails/ingredients/'+ing,  {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}`}})
        .then(response => {
          var c = response.data.data 
          c.forEach(cocktail => {
            this.cocktails.push(cocktail)
          });
        })
        .catch(error => {
          console.log(error)
        })
      }
    }
  },
  async mounted() {
    this.getCocktails()    
  },
  created() {
    this.$watch(
      () => this.$route.params,
      (toParams, prevParams) => {
        this.getCocktails()
      }
    )
  },
}
</script>
<style scoped>
  .col-12 {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
  }
  
  .card {
    margin-bottom: 32px;
    cursor: pointer;
    border-radius: 15px;
  }

  .card-img-top {
    border-radius: 15px 15px 0 0;
    max-height: 400px;
  }

  .card-title-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .card-title {
    margin: 0;
  }

  .fav-icon {
    max-height: 40px;
  }

  .card-link {
    padding: 6px;
    background-image: url("/header.png");
    color: white;
    font-size: 14px;
    border-radius: 10px;
  }

  .card-text {
    width: fit-content;
    padding: 6px;
    background-image: url("/header.png");
    color: white;
    font-size: 14px;
    border-radius: 10px;
  }
</style>