<template>
  <div class="container">
    <h1>Administración</h1>
    <ul class="nav nav-tabs">
      <li class="nav-item">
        <p class="nav-link active" id="cocktails" aria-current="page" @click="getData('cocktails')">Cocktails</p>
      </li>
      <li class="nav-item">
        <p class="nav-link" id="categories" @click="getData('categories')">Categories</p>
      </li>
      <li class="nav-item">
        <p class="nav-link" id="users" @click="getData('users')">Users</p>
      </li>
      <li class="nav-item">
        <p class="nav-link" id="glass" @click="getData('glass')">Glass</p>
      </li>
      <li class="nav-item">
        <p class="nav-link" id="ingredients" @click="getData('ingredients')">Ingredients</p>
      </li>
    </ul>
    <table class="table">
      <thead>
        <tr>
          <th scope="col" v-for="c in columns">{{c}}</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="element in data">
          <td v-if="currentTab == 'glass' || currentTab == 'categories'" scope="row">{{ element.name }}</td>
          <td v-if="currentTab == 'users'">{{ element.username }}</td>
          <td v-if="currentTab == 'users'">{{ element.email }}</td>
          <td v-if="currentTab == 'users'">{{ element.isAdmin }}</td>
          <td v-if="currentTab == 'ingredients'">{{ element.name }}</td>
          <td v-if="currentTab == 'ingredients'">{{ element.type }}</td>
          <td v-if="currentTab == 'ingredients'" class="long-text">{{ element.description }}</td>
          <td v-if="currentTab == 'ingredients'">{{ element.alcohol }}</td>
          <td v-if="currentTab == 'ingredients'">{{ element.abv }}</td>
          <th v-if="currentTab == 'cocktails'" scope="row">{{ element.id }}</th>
          <td v-if="currentTab == 'cocktails'">{{ element.name }}</td>
          <td v-if="currentTab == 'cocktails'" class="long-text">{{ element.preparation }}</td>
          <td v-if="currentTab == 'cocktails'">{{ element.ingredientes?.length }}</td>
          <td v-if="currentTab == 'cocktails'">{{ element.category }}</td>
          <td v-if="currentTab == 'cocktails'">{{ element.glass }}</td>
          <td style="display: flex"><button @click="this.$router.push('/admin/new/'+currentTab)" class="btn btn-success" style="margin-right: 8px">Añadir</button> <button @click="editItem(element)" class="btn btn-outline-primary" style="margin-right: 8px">Editar</button> <button @click="deleteItem(element)" class="btn btn-danger">Borrar</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import axios from 'axios';
export default {
  data() {
    return {
      currentTab: null,
      columns: [],
      data: [],
      modalShow: false
    }
  },
  methods: {
    editItem(element) {
      if(this.currentTab == 'categories' || this.currentTab == 'glass' || this.currentTab == 'ingredients'){
        this.$router.push('/admin/edit/'+this.currentTab+'/'+element.name)
      }else if(this.currentTab == 'users'){
        this.$router.push('/admin/edit/'+this.currentTab+'/'+element.username)
      }else if(this.currentTab == 'cocktails'){
        this.$router.push('/admin/edit/'+this.currentTab+'/'+element.id)
      }
    },
    async deleteItem(element) {
      var url = 'http://localhost:3000/api/'+this.currentTab+'/'
      if(this.currentTab == 'categories' || this.currentTab == 'glass' || this.currentTab == 'ingredients'){
        url = url+element.name
      }else if(this.currentTab == 'users'){
        url = url+element.username
      }else if(this.currentTab == 'cocktails'){
        url = url+element.id
      }

      await axios
      .delete(url, {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}`}})
      .then(response => {
        console.log(response.data)
      })
      .catch(error => {
        console.log(error)
      })
      .finally(() => this.getData(this.currentTab))
    },
    async getData(tab) {
      if(this.currentTab != tab){
        var current = document.getElementById(this.currentTab)
        var newTab = document.getElementById(tab)
        current.classList.remove("active")
        newTab.classList.add("active")
        this.currentTab = tab
      }
      
      await axios
      .get('http://localhost:3000/api/admin/'+tab,  {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}`}})
      .then(response => {
        var d = response.data.data
        this.columns = []
        switch(tab) {
          case 'categories':
            this.columns.push('Name')
            break;
          case 'glass':
            this.columns.push('Name')
            break;
          case 'users':
            this.columns.push('Username')
            this.columns.push('Email')
            this.columns.push('Admin')
            break;
          case 'ingredients':
            this.columns.push('Name')
            this.columns.push('Type')
            this.columns.push('Description')
            this.columns.push('Alcohol')
            this.columns.push('ABV')
            break;
          case 'cocktails': 
            this.columns.push('Id')
            this.columns.push('Name')
            this.columns.push('Preparation')
            this.columns.push('Ingredients')
            this.columns.push('Category')
            this.columns.push('Glass')
        }
        this.data = []
        d.forEach(element => {
          this.data.push(element)
        });
      })
      .catch(error => {
        console.log(error)
      })
    }
  },
  mounted() {
    this.currentTab = 'cocktails'
    this.getData('cocktails')
  },
}
</script>
<style scoped>
  .container {
    margin-top: 128px;
  }

  .nav-tabs {
    margin-top: 32px;
  }

  .nav-item {
    cursor: pointer;
  }

  .long-text {
    display: block;
    width: 300px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
</style>