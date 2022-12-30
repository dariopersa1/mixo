<template>
  <div class="container" style="margin-top: 128px">
      <div class="col-12">
        <div class="card" v-for="cocktail in cocktails" style="width: 14rem;" @click="details(cocktail.id)">
          <img src="/sophia-sideri-kW6_hPluON0-unsplash.jpg" class="card-img-top" width="14rem" alt="cocktail">
          <div class="card-body">
            <h4 class="card-title">{{cocktail.name}}</h4>
            <a :href="'/cocktails/category/'+cocktail.category" class="card-link" v-if="cocktail.category != 'No category provided'">{{ cocktail.category }}</a>
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
      ingredient: ''
    }
  },
  methods: {
    details(id) {
      this.$router.push("/cocktail/"+id);
    }
  },
  async mounted() {
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
  },
  created() {
    this.$watch(
      () => this.$route.params,
      (toParams, prevParams) => {
        console.log(toParams, prevParams)
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
</style>