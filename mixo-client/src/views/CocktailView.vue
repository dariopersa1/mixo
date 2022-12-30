<template>
  <div class="container">
    <div class="row">
      <div class="col-5 details-left">
        <img class="details-img" src="/ambitious-creative-co-rick-barrett-Hw7hK-kYA-Q-unsplash.jpg" :alt="cocktail.name">
        <a class="details-category" href="#">{{ cocktail.category }}</a>
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
                <li v-for="ing in cocktail.ingredients">
                  {{ ing.ingredient }} {{ ing.amount }} {{ ing.unit }}
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
export default {
  data() {
    return {
      cocktail: { 
        "name": "Vesper",
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
        "preparation": "Shake and strain into a chilled cocktail glass." 
      }
    }
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