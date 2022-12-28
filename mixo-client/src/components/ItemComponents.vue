<template>
  <div class="container">
      <div class="col-12">
        <div class="card" v-for="cocktail in cocktails" style="width: 18rem;" @click="details(cocktail.id)">
          <img src="/sophia-sideri-kW6_hPluON0-unsplash.jpg" class="card-img-top" width="18rem" alt="cocktail">
          <div class="card-body">
            <h5 class="card-title">{{cocktail.name}}</h5>
            <p class="card-text">{{ cocktail.preparation }}</p>
          </div>
          <div class="card-body">
            <a href="#" class="card-link" :if="cocktail.category != 'No category provided'">{{ cocktail.category }}</a>
          </div>
        </div>
      </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      cocktails: [
        { "name": "Vesper",
          "glass": "martini",
          "category": "Before Dinner Cocktail",
          "ingredients": [
            { "unit": "cl",
              "amount": 6,
              "ingredient": "Gin" },
            { "unit": "cl",
              "amount": 1.5,
              "ingredient": "Vodka" },
            { "unit": "cl",
              "amount": 0.75,
              "ingredient": "Lillet Blonde" }
          ],
          "garnish": "Lemon twist",
          "preparation": "Shake and strain into a chilled cocktail glass." },
        { "name": "Bacardi",
          "glass": "martini",
          "category": "Before Dinner Cocktail",
          "ingredients": [
            { "unit": "cl",
              "amount": 4.5,
              "ingredient": "White rum",
              "label": "Bacardi White Rum" },
            { "unit": "cl",
              "amount": 2,
              "ingredient": "Lime juice" },
            { "unit": "cl",
              "amount": 1,
              "ingredient": "Syrup",
              "label": "Grenadine" }
          ],
          "preparation": "Shake with ice cubes. Strain into chilled cocktail glass." },
        { "name": "Negroni",
          "glass": "old-fashioned",
          "category": "Before Dinner Cocktail",
          "ingredients": [
            { "unit": "cl",
              "amount": 3,
              "ingredient": "Gin" },
            { "unit": "cl",
              "amount": 3,
              "ingredient": "Campari" },
            { "unit": "cl",
              "amount": 3,
              "ingredient": "Vermouth",
              "label": "Sweet red vermouth" }
          ],
          "garnish": "Half an orange slice",
          "preparation": "Build into old-fashioned glass filled with ice. Stir gently." },
          { "name": "Vesper",
          "glass": "martini",
          "category": "Before Dinner Cocktail",
          "ingredients": [
            { "unit": "cl",
              "amount": 6,
              "ingredient": "Gin" },
            { "unit": "cl",
              "amount": 1.5,
              "ingredient": "Vodka" },
            { "unit": "cl",
              "amount": 0.75,
              "ingredient": "Lillet Blonde" }
          ],
          "garnish": "Lemon twist",
          "preparation": "Shake and strain into a chilled cocktail glass." },
        { "name": "Bacardi",
          "glass": "martini",
          "category": "Before Dinner Cocktail",
          "ingredients": [
            { "unit": "cl",
              "amount": 4.5,
              "ingredient": "White rum",
              "label": "Bacardi White Rum" },
            { "unit": "cl",
              "amount": 2,
              "ingredient": "Lime juice" },
            { "unit": "cl",
              "amount": 1,
              "ingredient": "Syrup",
              "label": "Grenadine" }
          ],
          "preparation": "Shake with ice cubes. Strain into chilled cocktail glass." },
        { "name": "Negroni",
          "glass": "old-fashioned",
          "category": "Before Dinner Cocktail",
          "ingredients": [
            { "unit": "cl",
              "amount": 3,
              "ingredient": "Gin" },
            { "unit": "cl",
              "amount": 3,
              "ingredient": "Campari" },
            { "unit": "cl",
              "amount": 3,
              "ingredient": "Vermouth",
              "label": "Sweet red vermouth" }
          ],
          "garnish": "Half an orange slice",
          "preparation": "Build into old-fashioned glass filled with ice. Stir gently." },

          { "name": "Vesper",
          "glass": "martini",
          "category": "Before Dinner Cocktail",
          "ingredients": [
            { "unit": "cl",
              "amount": 6,
              "ingredient": "Gin" },
            { "unit": "cl",
              "amount": 1.5,
              "ingredient": "Vodka" },
            { "unit": "cl",
              "amount": 0.75,
              "ingredient": "Lillet Blonde" }
          ],
          "garnish": "Lemon twist",
          "preparation": "Shake and strain into a chilled cocktail glass." },
        { "name": "Bacardi",
          "glass": "martini",
          "category": "Before Dinner Cocktail",
          "ingredients": [
            { "unit": "cl",
              "amount": 4.5,
              "ingredient": "White rum",
              "label": "Bacardi White Rum" },
            { "unit": "cl",
              "amount": 2,
              "ingredient": "Lime juice" },
            { "unit": "cl",
              "amount": 1,
              "ingredient": "Syrup",
              "label": "Grenadine" }
          ],
          "preparation": "Shake with ice cubes. Strain into chilled cocktail glass." },
        { "name": "Negroni",
          "glass": "old-fashioned",
          "category": "Before Dinner Cocktail",
          "ingredients": [
            { "unit": "cl",
              "amount": 3,
              "ingredient": "Gin" },
            { "unit": "cl",
              "amount": 3,
              "ingredient": "Campari" },
            { "unit": "cl",
              "amount": 3,
              "ingredient": "Vermouth",
              "label": "Sweet red vermouth" }
          ],
          "garnish": "Half an orange slice",
          "preparation": "Build into old-fashioned glass filled with ice. Stir gently." }
      ]
    }
  },
  methods: {
    details(id) {
      this.$router.push("/cocktail/"+id);
    }
  }
}
</script>
<style scoped>
  .col-12 {
    margin: 32px 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
  }
  
  .card {
    margin-bottom: 32px;
  }

  .card-link {
    padding: 8px;
    background-color: #104911;
    color: white;
    border-radius: 10px;
  }
</style>