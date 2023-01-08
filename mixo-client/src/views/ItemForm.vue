<template>
  <div class="container">
    <h1 v-if="action == 'new'">New {{ title }} </h1>
    <h1 v-if="action == 'edit'">Edit {{ title }} {{ item }}</h1>
    <div class="form" v-if="title == 'cocktails'">
      <div class="mb-3">
        <label for="name" class="form-label">Name</label>
        <input type="text" class="form-control" v-model="name" id="name" placeholder="Name" required>
      </div>
      <div class="mb-3">
        <label for="preparation" class="form-label">Preparation</label>
        <input type="text" class="form-control" v-model="cocktail.preparation" id="preparation" placeholder="For doing this cocktail we need to..." required>
      </div>
      <div class="mb-3" style="display: flex; flex-direction: column">
        <label for="category" class="form-label">Category</label>
        <select v-model="cocktail.category" class="form-select form-select-lg mb-3" id="category" aria-label=".form-select-lg example">
          <option selected>No category provided</option>
          <option v-for="c in categories" :value="c.name">{{ c.name }}</option>
        </select>
      </div>
      <div class="mb-3" style="display: flex; flex-direction: column">
        <label for="glass" class="form-label">Glass</label>
        <select v-model="cocktail.glass" class="form-select form-select-lg mb-3" id="glass" aria-label=".form-select-lg example">
          <option selected>No glass provided</option>
          <option v-for="g in glasses" :value="g.name">{{ g.name }}</option>
        </select>
      </div>
      <div class="mb-3">
        <label for="garnish" class="form-label">Garnish</label>
        <input type="text" class="form-control" v-model="cocktail.garnish" id="garnish" placeholder="Lemon wheel" required>
      </div>
      <div class="mb-3">
        <label for="ingredient" class="form-label">Ingredients</label>
        <div id="ingredients-input">
          <div class="input-group" v-for="(ing, index) in ingredientes" style="margin-bottom: 16px">
            <span class="input-group-text">Ingredient, amount, units</span>
            <input type="text" name="ingredient[]" aria-label="Ingredient" class="form-control" placeholder="Vodka" v-model="ing.ingredient">
            <input type="number" name="ingredient-amount[]" aria-label="Amount" class="form-control" placeholder="5" v-model="ing.amount">
            <input type="text" name="ingredient-units[]" aria-label="Units" class="form-control" placeholder="cl" v-model="ing.unit">
            <span class="input-group-text" id="addon-wrapping" @click="deleteIngredient(index)" style="color: red; background-color: rgb(255, 190, 190); cursor: pointer;">&minus;</span>
          </div>
          <button class="btn btn-outline-primary" @click="addIngredient" id="btn-add-ingredient">Add Ingredient</button>
        </div>
      </div>
    </div>

    <div class="form" v-if="title == 'categories' || title == 'glass'">
      <div class="mb-3">
        <label for="name" class="form-label">Name</label>
        <input type="text" class="form-control" v-model="name" id="name" placeholder="Name" required>
      </div>
    </div>

    <div class="form" v-if="title == 'users'">
      <div class="mb-3">
        <label for="username" class="form-label">Username</label>
        <input type="text" v-model="user.username" class="form-control" id="username" placeholder="Name">
      </div>
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input type="text" v-model="user.email" class="form-control" id="email" placeholder="name@example.com">
      </div>
      <div class="form-check">
        <input v-model="user.isAdmin" class="form-check-input" type="checkbox" value="" id="flexCheckDefault">
        <label class="form-check-label" for="flexCheckDefault">
          Admin
        </label>
      </div>
    </div>

    <div class="form" v-if="title == 'ingredients'">
      <div class="mb-3">
        <label for="name" class="form-label">Name</label>
        <input type="text" class="form-control" v-model="name" id="name" placeholder="Name" required>
      </div>
      <div class="mb-3">
        <label for="type" class="form-label">Type</label>
        <input type="text" class="form-control" v-model="ingredient.type" id="type" placeholder="Spirit" required>
      </div>
      <div class="mb-3">
        <label for="description" class="form-label">Description</label>
        <input type="text" class="form-control" v-model="ingredient.description" id="description" placeholder="This ingredient is..." required>
      </div>
      <div class="form-check">
        <input v-model="ingredient.alcohol" class="form-check-input" type="checkbox" value="" id="flexCheckDefault">
        <label class="form-check-label" for="flexCheckDefault">
          Alcohol
        </label>
      </div>
      <div class="mb-3">
        <label for="abv" class="form-label">ABV</label>
        <input type="number" class="form-control" v-model="name" id="abv" placeholder="40" required>
      </div>
    </div>

    <div class="buttons" style="margin-bottom: 32px">
      <button class="btn btn-primary" style="margin-right: 8px;" @click="save">Guardar</button>
      <button class="btn btn-danger" @click="this.$router.go(-1)">Cancelar</button>
    </div>
  </div>
</template>
<script>
import axios from 'axios'
export default {
  data() {
    return {
      action: '',
      docRef: '',
      title: '',
      item: '',
      name: '',
      user: {
        username: '',
        email: '',
        isAdmin: false,
      },
      ingredient: {
        type: '',
        description: '',
        alcohol: false, 
        abv: 0,
      },
      cocktail: {
        category: '',
        garnish: '',
        glass: '',
        preparation: ''
      },
      glasses: [],
      categories: [],
      ingredientes: [
        {
          ingredient: '',
          label: '',
          amount: 0,
          unit: ''
        }
      ]
    }
  },
  methods: {
    addIngredient() {
      if(this.ingredientes[this.ingredientes.length-1].ingredient == ''){
        return false
      }

      this.ingredientes.push({
        ingredient: '',
        amount: 0,
        units: ''
      })
    },
    deleteIngredient(index) {
      if(this.ingredientes.length > 1){
        this.ingredientes.splice(index, 1)
      }
    },
    save() {
      if(this.title == 'cocktails'){
        if(this.action == 'edit'){
          var cocktail = {
            id: this.item,
            name: this.name,
            preparation: this.cocktail.preparation,
            category: this.cocktail.category,
            garnish: this.cocktail.garnish,
            glass: this.cocktail.glass,
            ingredientes: this.ingredientes
          }
          axios
          .put('http://localhost:3000/api/cocktails/'+this.item, {document: this.docRef, cocktail: cocktail},{headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}`}})
          .then(response => console.log(response))
          .catch(error => console.log(error))
        }else{
          var cocktail = {
            name: this.name,
            preparation: this.cocktail.preparation,
            category: this.cocktail.category,
            garnish: this.cocktail.garnish,
            glass: this.cocktail.glass,
            ingredientes: this.ingredientes
          }
          axios
          .post('http://localhost:3000/api/cocktails/', {user: JSON.parse(localStorage.getItem('user')).username, cocktail: cocktail},{headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}`}})
          .then(response => console.log(response))
          .catch(error => console.log(error))
        }

        this.$router.go(-1)
      }
    },
    async getItem(type, id) {
      this.title = type
      this.item = id
      if(this.title == 'cocktails'){
        await axios
        .get('http://localhost:3000/api/cocktails/'+this.item, {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}`}})
        .then(response => {
          const c = response.data.cocktail
          this.name = c.name
          this.cocktail.preparation = c.preparation
          this.cocktail.category = c.category
          this.cocktail.garnish = c.garnish
          this.cocktail.glass = c.glass
          this.ingredientes = c.ingredientes
          this.docRef = response.data.document
        })
        .catch(error => console.log(error))
      }else if(this.title == 'categories'){
        await axios
        .get('http://localhost:3000/api/admin/category/'+this.item, {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}`}})
        .then(response => {
          const c = response.data.category
          this.name = c.name
          this.docRef = response.data.document
        })
        .catch(error => console.log(error))
      }else if(this.title == 'glass') {
        await axios
        .get('http://localhost:3000/api/admin/glass/'+this.item, {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}`}})
        .then(response => {
          const g = response.data.glass
          this.name = g.name
          this.docRef = response.data.document
        })
        .catch(error => console.log(error))
      }else if(this.title == 'users') {
        await axios
        .get('http://localhost:3000/api/admin/users/'+this.item, {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}`}})
        .then(response => {
          const u = response.data.user
          this.user.username = u.username
          this.user.email = u.email
          this.user.isAdmin = u.isAdmin
          this.docRef = response.data.document
        })
        .catch(error => console.log(error))
      }else if(this.title == 'ingredient'){
        await axios
        .get('http://localhost:3000/api/admin/ingredient/'+this.item, {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}`}})
        .then(response => {
          const ingredient = response.data.ingredient
          this.name = ingredient.name
          this.ingredient.type = ingredient.type
          this.ingredient.description = ingredient.description
          this.ingredient.alcohol = ingredient.alcohol
          this.ingredient.abv = ingredient.abv
          this.docRef = response.data.document
        })
      }else{
        this.$router.push('/')
      }
    },
    async getGlasses(){
      await axios
      .get('http://localhost:3000/api/glass',  {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}`}})
      .then(response => {
        var data = response.data.data
        data.forEach(element => {
          this.glasses.push(element)
        });
      })
      .catch(error => {
        console.log(error)
      })
    },
    async getCategories() {
      await axios
      .get('http://localhost:3000/api/categories',  {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}`}})
      .then(response => {
        var data = response.data.data
        data.forEach(element => {
          this.categories.push(element)
        });
      })
      .catch(error => {
        console.log(error)
      })
    }
  },
  mounted() {
    if(this.$route.name == 'edit'){
      var item = this.$route.params.item
      var type = this.$route.params.type
      this.action = 'edit'
      this.getItem(type, item)
    }else if(this.$route.name == 'newItem'){
      this.action = 'new'
      this.title = this.$route.params.type
    }
    this.getCategories()
    this.getGlasses()
  },
  created() {
    this.$watch(
      () => this.$route.params,
      (toParams, prevParams) => {
        if(this.$route.name == 'edit'){
          var item = toParams.params.item
          var type = toParams.params.type
          this.getItem(type, item)
        }else if(this.$route.name == 'newItem'){
          this.title = toParams.params.type
        }
      }
    )
  },
}
</script>
<style scoped>
  .container {
    margin-top: 128px;
  }
</style>