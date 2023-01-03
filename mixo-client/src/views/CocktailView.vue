<template>
  <Loading v-if="loading"/>
  <div v-if="!loading" class="container" style="margin-top: 128px">
    <div class="row">
      <div class="col-5 details-left">
        <img class="details-img" :src="'/'+cocktail.name+'.jpg'" :alt="cocktail.name">
        <a class="details-category" :href="'/cocktails/category/'+cocktail.category">{{ cocktail.category }}</a>
      </div>
      <div class="col-7">
        <h1>{{ cocktail.name }}</h1>
        <div class="row">
          <div class="col-7">
            <p>{{ cocktail.preparation }}</p>
          </div>
          <div class="col-5">
            <div class="ingredientes">
              <h3>Ingredientes</h3>
              <ul>
                <li v-for="ing in cocktail.ingredientes">
                  {{ ing.ingredient }} {{ ing.label }} {{ ing.amount }}  {{ ing.unit }} {{ ing.special }}
                </li>
              </ul>
              <h3>Garnish</h3>
              <p>{{ cocktail.garnish }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios';
import Loading from '../components/Loading.vue'
export default {
  data() {
    return {
      cocktail: {},
      loading: true
    }
  },
  components: {
    Loading
  },
  async mounted() {
    const id = this.$route.params.id;
    await axios
    .get('http://localhost:3000/api/cocktails/'+id,  {headers: {'Content-Type': 'application/json'}})
    .then(response => {
      this.cocktail = response.data.cocktail
    })
    .catch(error => {
      console.log(error)
    });
    console.log(this.cocktail)
    this.loading = false
  },
}
</script>
<style scoped>
  .details-left{
    display: flex;
    flex-direction: column;
  }
  .details-img{
    max-width: 450px;
    max-height: 600px;
    margin-bottom: 32px;
  }
  .details-category {
    width: fit-content;
    padding: 8px;
    background-image: url("/header.png");
    color: white;
    border-radius: 10px;
  }
</style>