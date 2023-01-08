<template>
  <div class="container">
    <h1 v-if="action == 'new'">{{ this.action }} {{ title }} </h1>
    <h1 v-if="action == 'edit'">{{ this.action }} {{ title }} {{ item }}</h1>
    <div class="form">
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
          <option v-for="c in categories" :value="c">{{ c.name }}</option>
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
          <div class="input-group" style="margin-bottom: 16px">
            <span class="input-group-text">Ingredient, amount, units</span>
            <input type="text" name="ingredient[]" aria-label="Ingredient" class="form-control" placeholder="Vodka">
            <input type="number" name="ingredient-amount[]" aria-label="Amount" class="form-control" placeholder="5">
            <input type="text" name="ingredient-units[]" aria-label="Units" class="form-control" placeholder="cl">
            <span class="input-group-text" id="addon-wrapping" @click="deleteIngredient(this)" style="color: red; background-color: rgb(255, 190, 190);">&minus;</span>
          </div>
          <button class="btn btn-outline-primary" @click="addIngredient" id="btn-add-ingredient">Add Ingredient</button>
        </div>
      </div>
      <div class="buttons">
        <button class="btn btn-primary" style="margin-right: 8px;" @click="save">Guardar</button>
        <button class="btn btn-danger">Cancelar</button>
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios'
export default {
  data() {
    return {
      action: '',
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
        ingredients: [],
        preparation: ''
      },
      glasses: [],
      categories: []
    }
  },
  methods: {
    addIngredient() {
      var ingredientes = document.getElementsByName('ingredient[]')
      var parentIngredientes = document.getElementById('ingredients-input')
      var addButton = document.getElementById('btn-add-ingredient')
      if(ingredientes[ingredientes.length-1].value == ''){
        return false
      }

      let div = document.createElement("div")
      div.setAttribute("class", 'input-group')
      div.setAttribute("style", 'margin-bottom: 16px')

      let description = document.createElement("span")
      description.setAttribute("class", "input-group-text")
      let descText = document.createTextNode("Ingredient, amount, units")
      description.appendChild(descText)

      let ing = document.createElement("input")
      ing.setAttribute("class", "form-control")
      ing.setAttribute("type", "text")
      ing.setAttribute("name", "ingredient[]")
      ing.setAttribute("placeholder", "Vodka")

      let amount = document.createElement("input")
      amount.setAttribute("class", "form-control")
      amount.setAttribute("type", "number")
      amount.setAttribute("name", "ingredient-amount[]")
      amount.setAttribute("placeholder", "5")

      let units = document.createElement("input")
      units.setAttribute("class", "form-control")
      units.setAttribute("type", "text")
      units.setAttribute("name", "ingredient-units[]")
      units.setAttribute("placeholder", "cl")

      let minus = document.createElement("span");
      minus.setAttribute("onclick", "deleteIngredient(this)");
      minus.setAttribute("class", "input-group-text")
      minus.setAttribute("style", "color: red; background-color: rgb(255, 190, 190);")
      let minusText = document.createTextNode("-");
      minus.appendChild(minusText)

      parentIngredientes.insertBefore(div, addButton)

      div.appendChild(description)
      div.appendChild(ing)
      div.appendChild(amount)
      div.appendChild(units)
      div.appendChild(minus)
    },
    deleteIngredient(element) {
      var ingredientes = document.getElementsByName('ingredient[]')

      if(ingredientes.length > 1){
        element.parentElement.remove()
      }
    },
    save() {
      if(this.title == 'cocktails'){

        var cocktail = {
          id: this.item,
          name: this.name,
          preparation: this.cocktail.preparation,
          category: this.cocktail.category,
          garnish: this.cocktail.garnish,
          glass: this.cocktail.glass,
          ingredients: this.cocktail.ingredients
        }
      }
    },
    getItem(type, id) {
      this.title = type
      this.item = id
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