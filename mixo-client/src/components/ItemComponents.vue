<template>
  <div class="container" style="margin-top: 128px">
      <div class="col-12">
        <div class="card" v-for="cocktail in cocktails" style="width: 14rem;">
          <img :src="'/'+cocktail.name+'.jpg'" class="card-img-top" width="14rem" alt="cocktail" @click="details(cocktail.id)">
          <div class="card-body">
            <h4 class="card-title" @click="details(cocktail.id)">{{cocktail.name}}</h4>
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
      auth: false
    }
  },
  methods: {
    details(id) {
      this.$router.push("/cocktail/"+id);
    },
    async getCocktails() {
      this.cocktails.length = 0
      if(localStorage.getItem('token') != null){
      this.auth = true
      }else{
        this.auth = false
      }
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

  .card-title {
    margin-bottom: 16px;
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