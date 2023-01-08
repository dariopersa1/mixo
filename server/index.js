var firebase = require('firebase/app')
var firestore = require('firebase/firestore')
var getFirestore = firestore.getFirestore
var collection = firestore.collection
var express = require('express')
const cors = require('cors')
const request = require('request')
var app = express()
app.use(express.json(), cors({
  origin: '*'
}))
const swaggerUi = require('swagger-ui-express'),
swaggerDocument = require('./swagger.json');
const url = require('url')
var jwt = require('jwt-simple');
const { updateDoc, orderBy, limit, startAfter, endAt, endBefore, startAt } = require('firebase/firestore')
const secret = 'mixo'

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAlurE58TquDuj70aDH-zpmm1HFOrFVo_A",
  authDomain: "mixo-ae50c.firebaseapp.com",
  projectId: "mixo-ae50c",
  storageBucket: "mixo-ae50c.appspot.com",
  messagingSenderId: "706179527888",
  appId: "1:706179527888:web:b668a722cc4f17e9bf5ad5",
  measurementId: "G-ZXY1NS926B"
};

// Swagger documentation
/*app.use(
  '/api-docs',
  swaggerUi.serve, 
  swaggerUi.setup(swaggerDocument)
);*/

// Initialize Firebase
const appFirebase = firebase.initializeApp(firebaseConfig);
const db = getFirestore(appFirebase);
const cocktailsRef = collection(db, "cocktails")

app.get('/api/firebase/load', checkTokenFirebase, async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  try {
    var cocktail;
    for(i = 0; i < cocteles.length-1; i++){
      cocktail = cocteles[i]
      const docRef = await firestore.addDoc(collection(db, "cocktails"), {
        id: i,
        name: cocktail.name,
        glass: cocktail.glass,
        ingredientes: cocktail.ingredients,
        preparation: cocktail.preparation != undefined ? cocktail.preparation : 'No preparation provided',
        category: cocktail.category != undefined ? cocktail.category : 'No category provided',
        garnish: cocktail.garnish != undefined ? cocktail.garnish : 'No garnish provided'
      });
      console.log("Document written with ID: ", docRef.id);
    }
    resp.status(200)
    resp.send('Load database complete')
  } catch (e) {
    console.error("Error adding document: ", e);
    resp.status(404)
    resp.send('Something went wrong')
  }
})

app.get('/api/firebase/load/ingredients', checkTokenFirebase, async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  try {
    var cocktail
    var ingredients = []
    for(var i = 0; i < cocteles.length-1; i++){
      cocktail = cocteles[i]
      request.get('https://www.thecocktaildb.com/api/json/v1/1/search.php?s='+cocktail.name.toLowerCase(), (error, response, body) => {
        if(error){
          console.log(error)
        }
        var c = JSON.parse(body)
        if(c.drinks != null){
          var auxPreparation = c.drinks[0].strInstructions
          var auxCategory = c.drinks[0].strCategory
          cocktail.preparation = auxPreparation
          cocktail.category = auxCategory
          cocteles[i] = cocktail
        }
      })

      cocktail.ingredients.forEach(async (ing) => {
        if(ing.ingredient != undefined){
          if(!ingredients.includes(ing.ingredient)){
            request.get('https://www.thecocktaildb.com/api/json/v1/1/search.php?i='+ing.ingredient, async (error, response, body) => {
              if(error){
                console.log(error)
              }
              var c = JSON.parse(body)
              if(c.ingredients != null){
                var aux = c.ingredients[0]
                const docRef = await firestore.addDoc(collection(db, "ingredients"), {
                  name: ing.ingredient,
                  description: aux.strDescription,
                  type: aux.strType,
                  alcohol: aux.strAlcohol,
                  abv: aux.strABV
                })
                console.log('Ingrediente añadido con éxito: ', docRef.id)
              }else{
                const docRef = firestore.addDoc(collection(db, "ingredients"), {
                  name: ing.ingredient,
                  description: '',
                  type: '',
                  alcohol: '',
                  abv: ''
                })
                console.log('Ingrediente añadido sin datos: ', docRef.id)
              }
            })
          }
          ingredients.push(ing.ingredient)
        }
      })
    }
    resp.status(200)
    resp.send('Load database ingredients complete')
  } catch (e) {
    console.error("Error: ", e);
    resp.status(404)
    resp.send('Something went wrong')
  }
})

app.post('/api/login', async function(pet, resp){
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  const queryParams = pet.body
  var user = {username: queryParams.username, password: queryParams.password}
  
  var q = firestore.query(collection(db, "users"), firestore.where("username", "==", user.username))
  const querySnapshot = await firestore.getDocs(q);
  
  if(querySnapshot.docs[0] != undefined){
    var u = querySnapshot.docs[0].data()
    var dPassword = jwt.decode(u.password, secret)
    if(u.username == user.username && dPassword == user.password){
      var f = firestore.query(collection(db, "users/"+querySnapshot.docs[0].id+"/favs"))
      const favs = await firestore.getDocs(f)
      var userFavs = []
      favs.docs.forEach(doc => {
        userFavs.push(doc.data().cocktail)
      })
      var auxUser = {
        username: u.username,
        email: u.email,
        isAdmin: u.isAdmin != undefined ? u.isAdmin : false,
        favs: userFavs
      }
      resp.status(200)
      resp.send({token: jwt.encode(user.username+user.password, secret), admin: u.isAdmin, user: auxUser})
    }else{
      resp.status(401)
      resp.send('Las credenciales no coinciden')
    }
  }else{
    resp.status(404)
    resp.send('Usuario no encontrado')
  }
})

app.post('/api/register',async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  var obj = pet.body
  var usuario = {username: obj.username, password: obj.password, email: obj.email}
  if(usuario.username != undefined){
    var q = firestore.query(collection(db, "users"), firestore.where("username", "==", usuario.username))
    const querySnapshot = await firestore.getDocs(q);
    
    if(querySnapshot.docs[0] == undefined){
      try{
        const docRef = await firestore.addDoc(collection(db, "users"), {
          username: usuario.username,
          password: jwt.encode(usuario.password, secret),
          email: usuario.email,
          isAdmin: false
        });
        
        resp.status(200)
        resp.send('Usuario registrado con éxito')
      }catch(e) {
        resp.status(403)
        resp.send('Algo salió mal', e)
      }
    }else{
      resp.status(403)
      resp.send('Usuario ya existe')
    }
    
  }else{
    resp.status(404)
    resp.send('Usuario undefined')
  }
})

app.post('/api/user/:username/favs/:cocktail', checkToken, async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const username = pet.params.username
  const cocktail = parseInt(pet.params.cocktail)
  var q = firestore.query(collection(db, "users"), firestore.where("username", "==", username))
  const querySnapshot = await firestore.getDocs(q);
  
  if(querySnapshot.docs[0] != undefined){
    try{
      const docRef = firestore.addDoc(collection(db, "users/"+querySnapshot.docs[0].id+"/favs"), {
        cocktail: cocktail
      });
      resp.status(200)
      resp.send(docRef.id)
    }catch(e) {
      resp.status(403)
      resp.send('Algo salió mal', e)
    }
  }else{
    resp.status(404)
    resp.send('Usuario no encontrado')
  }
})

app.delete('/api/user/:username/favs/:cocktail', checkToken, async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const username = pet.params.username
  const cocktail = parseInt(pet.params.cocktail)
  var q = firestore.query(collection(db, "users"), firestore.where("username", "==", username))
  const querySnapshot = await firestore.getDocs(q);
  
  if(querySnapshot.docs[0] != undefined){
    var f = firestore.query(collection(db, "users/"+querySnapshot.docs[0].id+"/favs"))
    const favs = await firestore.getDocs(f)
    var found = false
    favs.docs.forEach(async doc => {
      if(doc.data().cocktail == cocktail){
        found = true
        const ref = firestore.doc(db, "users/"+querySnapshot.docs[0].id+"/favs", doc.id)
        await firestore.deleteDoc(ref)
      }
    })

    if(found) {
      resp.status(200)
      resp.send("Borrado con éxito")
    }else{
      resp.status(404)
      resp.send("Cocktail " + cocktail + " no existe")
    }
  }else{
    resp.status(404)
    resp.send("Usuario " + username + " no existe")
  }
})

app.get('/api/admin/cocktails', checkToken, async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  var cocktails = []
  var query = firestore.query(collection(db, "cocktails"), orderBy("id"))
  var querySnapshot = await firestore.getDocs(query)
  querySnapshot.forEach((doc) => {
    cocktails.push(doc.data())
  })
  cocktails.sort((a, b) => (a.id > b.id) ? 1 : ((a.id < b.id) ? -1 : 0))
  if(cocktails.length > 0){
    resp.status(200)
    resp.send({data: cocktails})
  }else{
    resp.status(404)
    resp.send("No cocktails found")
  }
})

app.get('/api/admin/categories', checkToken, async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  var categories = []
  var query = firestore.query(collection(db, "category"))
  var querySnapshot = await firestore.getDocs(query)
  querySnapshot.forEach((doc) => {
    categories.push(doc.data())
  })
  if(categories.length > 0){
    resp.status(200)
    resp.send({data: categories})
  }else{
    resp.status(404)
    resp.send("No categories found")
  }
})

app.get('/api/admin/category/:name', checkToken, async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  var name = pet.params.name
  var q = firestore.query(collection(db, "categories"), firestore.where("name", "==", name))
  const querySnapshot = await firestore.getDocs(q);
  
  if(querySnapshot.docs[0] != undefined){
    var cocktail = querySnapshot.docs[0].data()
    resp.status(200)
    resp.send({category: cocktail, document: querySnapshot.docs[0].id})
  }else{
    resp.status(404)
    resp.send('Category ' + name + ', no encontrado')
  }
})

app.get('/api/admin/glass/:name', checkToken, async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  var name = pet.params.name
  var q = firestore.query(collection(db, "glass"), firestore.where("name", "==", name))
  const querySnapshot = await firestore.getDocs(q);
  
  if(querySnapshot.docs[0] != undefined){
    var cocktail = querySnapshot.docs[0].data()
    resp.status(200)
    resp.send({glass: cocktail, document: querySnapshot.docs[0].id})
  }else{
    resp.status(404)
    resp.send('Glass ' + name + ', no encontrado')
  }
})

app.get('/api/admin/users/:username', checkToken, async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  var username = pet.params.username
  var q = firestore.query(collection(db, "users"), firestore.where("username", "==", username))
  const querySnapshot = await firestore.getDocs(q);
  
  if(querySnapshot.docs[0] != undefined){
    var cocktail = querySnapshot.docs[0].data()
    resp.status(200)
    resp.send({user: cocktail, document: querySnapshot.docs[0].id})
  }else{
    resp.status(404)
    resp.send('Username ' + username + ', no encontrado')
  }
})

app.get('/api/admin/ingredient/:name', checkToken, async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  var name = pet.params.name
  var q = firestore.query(collection(db, "ingredients"), firestore.where("name", "==", name))
  const querySnapshot = await firestore.getDocs(q);
  
  if(querySnapshot.docs[0] != undefined){
    var cocktail = querySnapshot.docs[0].data()
    resp.status(200)
    resp.send({ingredient: cocktail, document: querySnapshot.docs[0].id})
  }else{
    resp.status(404)
    resp.send('Ingredient ' + name + ', no encontrado')
  }
})

app.post('/api/admin/categories/', checkToken, async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  var category = pet.body.category
  try {
    const docRef = await firestore.addDoc(collection(db, "category"), {
      name: category.name
    });
    resp.status(200)
    resp.send('Category added succesfully: '+docRef.id)
  }catch(e){
    console.error("Error adding document: ", e);
    resp.status(404)
    resp.send('Something went wrong')
  }
})

app.put('/api/admin/categories/:name', checkToken, async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  var name = name
  var category = pet.body.category
  var categorydb
  
  var q = firestore.query(collection(db, "category"), firestore.where("name", "==", name))
  const querySnapshot = await firestore.getDocs(q);
  
  if(querySnapshot.docs[0] != undefined){
    doc = querySnapshot.docs[0].id
    categorydb = querySnapshot.docs[0].data()
  }else{
    resp.status(404)
    resp.send("Category " + name + " no existe")
  }
  
  const ref = firestore.doc(db, "category", doc)
  await updateDoc(ref, {
    name: category.name
  })
  resp.status(200)
  resp.send("Actualizado con éxito")
})

app.post('/api/admin/glass/', checkToken, async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  var glass = pet.body.glass
  try {
    const docRef = await firestore.addDoc(collection(db, "glass"), {
      name: glass.name
    });
    resp.status(200)
    resp.send('Glass added succesfully: '+docRef.id)
  }catch(e){
    console.error("Error adding document: ", e);
    resp.status(404)
    resp.send('Something went wrong')
  }
})

app.put('/api/admin/glass/:name', checkToken, async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  var name = name
  var glass = pet.body.glass
  var glassdb
  
  var q = firestore.query(collection(db, "glass"), firestore.where("name", "==", name))
  const querySnapshot = await firestore.getDocs(q);
  
  if(querySnapshot.docs[0] != undefined){
    doc = querySnapshot.docs[0].id
    glassdb = querySnapshot.docs[0].data()
  }else{
    resp.status(404)
    resp.send("Glass " + name + " no existe")
  }
  
  const ref = firestore.doc(db, "glass", doc)
  await updateDoc(ref, {
    name: glass.name
  })
  resp.status(200)
  resp.send("Actualizado con éxito")
})

app.get('/api/admin/users', checkToken, async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  var users = []
  var query = firestore.query(collection(db, "users"))
  var querySnapshot = await firestore.getDocs(query)
  querySnapshot.forEach((doc) => {
    var auxUser = {
      username: doc.data().username,
      email: doc.data().email,
      isAdmin: doc.data().isAdmin
    }
    users.push(auxUser)
  })
  if(users.length > 0){
    resp.status(200)
    resp.send({data: users})
  }else{
    resp.status(404)
    resp.send("No users found")
  }
})

app.post('/api/admin/users', checkToken, async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  var usuario = pet.body.user
  if(usuario.username != undefined){
    var q = firestore.query(collection(db, "users"), firestore.where("username", "==", usuario.username))
    const querySnapshot = await firestore.getDocs(q);
    
    if(querySnapshot.docs[0] == undefined){
      try{
        const docRef = await firestore.addDoc(collection(db, "users"), {
          username: usuario.username,
          password: jwt.encode(usuario.password, secret),
          email: usuario.email,
          isAdmin: false
        });
        
        resp.status(200)
        resp.send('Usuario registrado con éxito', docRef)
      }catch(e) {
        resp.status(403)
        resp.send('Algo salió mal', e)
      }
    }else{
      resp.status(403)
      resp.send('Usuario ya existe')
    }
    
  }else{
    resp.status(404)
    resp.send('Usuario undefined')
  }
})

app.put('/api/admin/users/:username', checkToken, async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  var username = pet.params.username
  var usuario = pet.body.user
  var userdb
  var q = firestore.query(collection(db, "users"), firestore.where("username", "==", username))
  const querySnapshot = await firestore.getDocs(q);
  
  if(querySnapshot.docs[0] != undefined){
    doc = querySnapshot.docs[0].id
    userdb = querySnapshot.docs[0].data()
  }else{
    resp.status(404)
    resp.send("User " + username + " no existe")
  }
  
  const ref = firestore.doc(db, "users", doc)
  await updateDoc(ref, {
    username: usuario.username,
    email: usuario.email,
    isAdmin: usuario.isAdmin
  })
  resp.status(200)
  resp.send("Actualizado con éxito")
}) 

app.get('/api/admin/glass', checkToken, async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  var glass = []
  var query = firestore.query(collection(db, "glass"))
  var querySnapshot = await firestore.getDocs(query)
  querySnapshot.forEach((doc) => {
    glass.push(doc.data())
  })
  if(glass.length > 0){
    resp.status(200)
    resp.send({data: glass})
  }else{
    resp.status(404)
    resp.send("No glass found")
  }
})

app.get('/api/admin/ingredients', checkToken, async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  var ingredients = []
  var query = firestore.query(collection(db, "ingredients"))
  var querySnapshot = await firestore.getDocs(query)
  if(querySnapshot.docs.length > 0){
    querySnapshot.forEach((doc) => {
      ingredients.push(doc.data())
    })
    resp.status(200)
    resp.send({data: ingredients})
  }else{
    resp.status(404)
    resp.send("No ingredients found")
  }
})

app.post('/api/admin/ingredients', checkToken, async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  var ing = pet.body.ingredient

  try {
    const docRef = await firestore.addDoc(collection(db, "ingredients"), {
      name: ing.ingredient,
      description: ing.escription,
      type: ing.type,
      alcohol: ing.alcohol,
      abv: ing.abv
    })
    resp.status(200)
    resp.send('Ingredient added succesfully: '+docRef.id)
  }catch(e){
    console.error("Error adding document: ", e);
    resp.status(404)
    resp.send('Something went wrong')
  }
})

app.put('/api/admin/ingredients/:name', checkToken, async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  var ing = pet.body.ingredient
  var name = pet.params.name
  var ingdb
  var q = firestore.query(collection(db, "ingredients"), firestore.where("name", "==", name))
  const querySnapshot = await firestore.getDocs(q);
  
  if(querySnapshot.docs[0] != undefined){
    doc = querySnapshot.docs[0].id
    ingdb = querySnapshot.docs[0].data()
  }else{
    resp.status(404)
    resp.send("Ingredient " + name + " no existe")
  }
  
  const ref = firestore.doc(db, "ingredients", doc)
  await updateDoc(ref, {
    name: ing.ingredient,
    description: ing.escription,
    type: ing.type,
    alcohol: ing.alcohol,
    abv: ing.abv
  })
  resp.status(200)
  resp.send("Actualizado con éxito")
})

app.get('/api/cocktails', async function(pet,resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  var limit = pet.body.limit != undefined ? pet.body.limit : 32
  var before = pet.body.before
  var after = pet.body.after
  const last = await getLastId()
  var cocktails = []
  var query = firestore.query(collection(db, "cocktails"), orderBy("id"), firestore.limit(limit))
  if(after != undefined && after != last.toString()){
    query = firestore.query(collection(db, "cocktails"), orderBy("id"), firestore.limit(limit), startAfter(after)) //pagination
  }else if(before != undefined && before != '0'){
    query = firestore.query(collection(db, "cocktails"), orderBy("id"), firestore.limitToLast(limit), endBefore(before)) //pagination
  }
  var querySnapshot = await firestore.getDocs(query)
  querySnapshot.forEach((doc) => {
    cocktails.push(doc.data())
  })
  cocktails.sort((a, b) => (a.id > b.id) ? 1 : ((a.id < b.id) ? -1 : 0))
  const firstVisible = querySnapshot.docs[0];
  const size = querySnapshot.docs.length
  const lastVisible = querySnapshot.docs[querySnapshot.docs.length-1];
  if(size > 0){
    resp.status(200)
    resp.send({data: cocktails, limit: size, after: lastVisible.data().id < last ? lastVisible.data().id : -1, before: firstVisible.data().id > 0 ? firstVisible.data().id : -1})
  }else{
    resp.status(404)
    resp.send("No cocktails found")
  }
})

app.post('/api/cocktails', checkToken, async function(pet,resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  var cocktail = pet.body.cocktail
  var user = pet.body.user
  var last = await getLastId()
  try {
    const docRef = await firestore.addDoc(collection(db, "cocktails"), {
      id: last+1,
      name: cocktail.name,
      user: user,
      glass: cocktail.glass,
      ingredientes: cocktail.ingredients,
      preparation: cocktail.preparation != undefined ? cocktail.preparation : 'No preparation provided',
      category: cocktail.category != undefined ? cocktail.category : 'No category provided',
      garnish: cocktail.garnish != undefined ? cocktail.garnish : 'No garnish provided'
    });
    resp.status(200)
    resp.send('Cocktail added succesfully: '+docRef.id)
  }catch(e){
    console.error("Error adding document: ", e);
    resp.status(404)
    resp.send('Something went wrong')
  }
})

app.get('/api/categories', async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  var categories = []
  var query = firestore.query(collection(db, "category"), orderBy("name"))
  var querySnapshot = await firestore.getDocs(query)

  if(querySnapshot.docs.length > 0){
    querySnapshot.forEach(doc => {
      categories.push(doc.data())
    })
    resp.status(200)
    resp.send({data: categories})
  }else{
    resp.status(404)
    resp.send("No categories found")
  }
})

app.get('/api/ingredients', async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  var ingredients = []
  var query = firestore.query(collection(db, "ingredients"))
  var querySnapshot = await firestore.getDocs(query)
  if(querySnapshot.docs.length > 0){
    querySnapshot.forEach((doc) => {
      ingredients.push(doc.data())
    })
    resp.status(200)
    resp.send({data: ingredients})
  }else{
    resp.status(404)
    resp.send("No ingredients found")
  }
})

app.get('/api/glass', async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  var glass = []
  var query = firestore.query(collection(db, "glass"))
  var querySnapshot = await firestore.getDocs(query)
  if(querySnapshot.docs.length > 0){
    querySnapshot.forEach((doc) => {
      glass.push(doc.data())
    })
    resp.status(200)
    resp.send({data: glass})
  }else{
    resp.status(404)
    resp.send("No glasses found")
  }
})

app.get('/api/cocktails/:id', async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  var id = Number(pet.params.id)
  var q = firestore.query(cocktailsRef, firestore.where("id", "==", id))
  const querySnapshot = await firestore.getDocs(q);
  
  if(querySnapshot.docs[0] != undefined){
    var cocktail = querySnapshot.docs[0].data()
    resp.status(200)
    resp.send({cocktail: cocktail, document: querySnapshot.docs[0].id})
  }else{
    resp.status(404)
    resp.send('Cocktail con id: ' + id + ', no encontrado')
  }
})

app.put('/api/cocktails/:id', checkToken, async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  var id = Number(pet.params.id)
  var doc = pet.body.document
  var cocktail = pet.body.cocktail
  var cocktaildb
  if(doc == undefined) {
    var q = firestore.query(cocktailsRef, firestore.where("id", "==", id))
    const querySnapshot = await firestore.getDocs(q);
    
    if(querySnapshot.docs[0] != undefined){
      doc = querySnapshot.docs[0].id
      cocktaildb = querySnapshot.docs[0].data()
    }else{
      resp.status(404)
      resp.send("Cocktail " + id + " no existe")
    }
  }

  const ref = firestore.doc(db, "cocktails", doc)
  await updateDoc(ref, {
    id: cocktail.id != undefined && cocktail.id != '' ? Number(cocktail.id) : cocktaildb.id,
    name: cocktail.name != undefined && cocktail.name != '' ? cocktail.name : cocktaildb.name,
    glass: cocktail.glass != undefined && cocktail.glass != '' ? cocktail.glass : cocktaildb.glass,
    ingredientes: cocktail.ingredientes != undefined && cocktail.ingredientes.length > 0 ? cocktail.ingredientes : cocktaildb.ingredientes,
    preparation: cocktail.preparation != undefined && cocktail.preparation != '' ? cocktail.preparation : cocktaildb.preparation,
    category: cocktail.category != undefined && cocktail.category != '' ? cocktail.category : cocktaildb.category,
    garnish: cocktail.garnish != undefined && cocktail.garnish != '' ? cocktail.garnish : cocktaildb.garnish
  })
  resp.status(200)
  resp.send("Actualizado con éxito")
})

app.delete('/api/cocktails/:id', checkToken, async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  var id = Number(pet.params.id)
  var doc

  var q = firestore.query(cocktailsRef, firestore.where("id", "==", id))
  const querySnapshot = await firestore.getDocs(q);
  
  if(querySnapshot.docs[0] != undefined){
    doc = querySnapshot.docs[0].id
  }else{
    resp.status(404)
    resp.send("Cocktail " + id + " no existe")
  }
  
  const ref = firestore.doc(db, "cocktails", doc)
  await firestore.deleteDoc(ref)
  
  const docSnap = await firestore.getDoc(ref)
  if(docSnap.exists()){
    resp.status(404)
    resp.send("Borrado fallido")
  }else {
    resp.status(200)
    resp.send("Borrado con éxito")
    resp.end()
  }
})

app.delete('/api/ingredients/:name', checkToken, async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  var name = pet.params.name
  var doc = null

  var q = firestore.query(collection(db, "ingredients"), firestore.where("name", "==", name))
  const querySnapshot = await firestore.getDocs(q);
  
  if(querySnapshot.docs[0] != undefined){
    doc = querySnapshot.docs[0].id
  }else{
    resp.status(404)
    resp.send("Ingredient " + name + " no existe")
  }
  
  const ref = firestore.doc(db, "ingredients", doc)
  await firestore.deleteDoc(ref)
  
  const docSnap = await firestore.getDoc(ref)
  if(docSnap.exists()){
    resp.status(404)
    resp.send("Borrado fallido")
  }else {
    resp.status(200)
    resp.send("Borrado con éxito")
    resp.end()
  }
})

app.delete('/api/categories/:name', checkToken, async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  var name = pet.params.name
  var doc = null

  var q = firestore.query(collection(db, "category"), firestore.where("name", "==", name))
  const querySnapshot = await firestore.getDocs(q);
  
  if(querySnapshot.docs[0] != undefined){
    doc = querySnapshot.docs[0].id
  }else{
    resp.status(404)
    resp.send("Category " + name + " no existe")
  }
  
  const ref = firestore.doc(db, "category", doc)
  await firestore.deleteDoc(ref)
  
  const docSnap = await firestore.getDoc(ref)
  if(docSnap.exists()){
    resp.status(404)
    resp.send("Borrado fallido")
  }else {
    resp.status(200)
    resp.send("Borrado con éxito")
    resp.end()
  }
})

app.delete('/api/glass/:name', checkToken, async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  var name = pet.params.name
  var doc = null

  var q = firestore.query(collection(db, "glass"), firestore.where("name", "==", name))
  const querySnapshot = await firestore.getDocs(q);
  
  if(querySnapshot.docs[0] != undefined){
    doc = querySnapshot.docs[0].id
  }else{
    resp.status(404)
    resp.send("Glass " + name + " no existe")
  }
  
  const ref = firestore.doc(db, "glass", doc)
  await firestore.deleteDoc(ref)
  
  const docSnap = await firestore.getDoc(ref)
  if(docSnap.exists()){
    resp.status(404)
    resp.send("Borrado fallido")
  }else {
    resp.status(200)
    resp.send("Borrado con éxito")
    resp.end()
  }
})

app.delete('/api/users/:username', checkToken, async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  var name = pet.params.username
  var doc = null

  var q = firestore.query(collection(db, "users"), firestore.where("username", "==", name))
  const querySnapshot = await firestore.getDocs(q);
  
  if(querySnapshot.docs[0] != undefined){
    doc = querySnapshot.docs[0].id
  }else{
    resp.status(404)
    resp.send("User " + name + " no existe")
  }
  
  const ref = firestore.doc(db, "users", doc)
  await firestore.deleteDoc(ref)
  
  const docSnap = await firestore.getDoc(ref)
  if(docSnap.exists()){
    resp.status(404)
    resp.send("Borrado fallido")
  }else {
    resp.status(200)
    resp.send("Borrado con éxito")
    resp.end()
  }
})

app.get('/api/cocktail/:name', checkToken, async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  var name = pet.params.name
  var q = firestore.query(cocktailsRef, firestore.where("name", "==", name))
  const querySnapshot = await firestore.getDocs(q);
  
  if(querySnapshot.docs[0] != undefined){
    var cocktail = querySnapshot.docs[0].data()
    resp.status(200)
    resp.send({cocktail: cocktail, document: querySnapshot.docs[0].id})
  }else{
    resp.status(404)
    resp.send('Cocktail con nombre: ' + name + ', no encontrado')
  }
})

app.put('/api/cocktail/:name', checkToken, async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  var name = pet.params.name
  var doc = pet.body.document
  var cocktail = pet.body.cocktail
  var cocktaildb
  if(doc == undefined) {
    var q = firestore.query(cocktailsRef, firestore.where("name", "==", name))
    const querySnapshot = await firestore.getDocs(q);
    
    if(querySnapshot.docs[0] != undefined){
      doc = querySnapshot.docs[0].id
      cocktaildb = querySnapshot.docs[0].data()
    }else{
      resp.status(404)
      resp.send("Cocktail " + name + " no existe")
    }
  }

  const ref = firestore.doc(db, "cocktails", doc)
  await updateDoc(ref, {
    id: cocktail.id != undefined && cocktail.id != '' ? cocktail.id : cocktaildb.id,
    name: cocktail.name != undefined && cocktail.name != '' ? cocktail.name : cocktaildb.name,
    glass: cocktail.glass != undefined && cocktail.glass != '' ? cocktail.glass : cocktaildb.glass,
    ingredientes: cocktail.ingredientes != undefined && cocktail.ingredientes.length > 0 ? cocktail.ingredientes : cocktaildb.ingredientes,
    preparation: cocktail.preparation != undefined && cocktail.preparation != '' ? cocktail.preparation : cocktaildb.preparation,
    category: cocktail.category != undefined && cocktail.category != '' ? cocktail.category : cocktaildb.category,
    garnish: cocktail.garnish != undefined && cocktail.garnish != '' ? cocktail.garnish : cocktaildb.garnish
  })
  resp.status(200)
  resp.send("Actualizado con éxito")
})

app.delete('/api/cocktail/:name', checkToken, async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  var name = pet.params.name
  var q = firestore.query(cocktailsRef, firestore.where("name", "==", name))
  const querySnapshot = await firestore.getDocs(q);
  
  if(querySnapshot.docs[0] != undefined){
    doc = querySnapshot.docs[0].id
  }else{
    resp.status(404)
    resp.send("Cocktail " + name + " no existe")
  }
  
  const ref = firestore.doc(db, "cocktails", doc)
  await firestore.deleteDoc(ref)
  
  const docSnap = await firestore.getDoc(ref)
  if(docSnap.exists()){
    resp.status(404)
    resp.send("Borrado fallido")
  }else {
    resp.status(200)
    resp.send("Borrado con éxito")
    resp.end()
  }
})

app.get('/api/cocktails/category/:category', checkToken, async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  var cat = pet.params.category
  var limit = pet.body.limit != undefined ? pet.body.limit : 30
  console.log(pet.body.limit)
  var before = pet.body.before
  var after = pet.body.after
  const last = await getLastId()
  var q = firestore.query(cocktailsRef, firestore.where("category", "==", cat), firestore.limit(limit)) //Pagination
  if(after != undefined && after != last.toString()){
    query = firestore.query(collection(db, "cocktails"), firestore.where("category", "==", cat), firestore.limit(limit), startAfter(after)) //pagination
  }else if(before != undefined && before != '0'){
    query = firestore.query(collection(db, "cocktails"), firestore.where("category", "==", cat), firestore.limitToLast(limit), endBefore(before)) //pagination
  }
  const querySnapshot = await firestore.getDocs(q);
  var cocktails = []
  querySnapshot.docs.forEach((doc) => {
    cocktails.push(doc.data())
  })
  cocktails.sort((a, b) => (a.id > b.id) ? 1 : ((a.id < b.id) ? -1 : 0))
  const firstVisible = querySnapshot.docs[0];
  const size = querySnapshot.docs.length
  const lastVisible = querySnapshot.docs[querySnapshot.docs.length-1];
  if(cocktails.length > 0){
    resp.status(200)
    resp.send({data: cocktails, limit: size, after: lastVisible.data().id < last ? lastVisible.data().id : -1, before: firstVisible.data().id < 0 ? firstVisible.data().id : -1})
  }else{
    resp.status(404)
    resp.send('No hay cocktails en la categoria: ' + cat)
  }
})

app.get('/api/cocktails/ingredients/:ingredient', checkToken, async function(pet, resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  var ing = {ingredient: pet.params.ingredient}
  var limit = pet.body.limit != undefined ? pet.body.limit : 30
  var before = pet.body.before
  var after = pet.body.after
  const last = await getLastId()
  var query = firestore.query(cocktailsRef, orderBy("id"))
  if(after != undefined && after != last.toString()){
    query = firestore.query(collection(db, "cocktails"), orderBy("id"), startAfter(after)) //pagination
  }else if(before != undefined && before != '0'){
    query = firestore.query(collection(db, "cocktails"), orderBy("id"), endBefore(before)) //pagination
  }
  const querySnapshot = await firestore.getDocs(query);
  var cocktails = []
  querySnapshot.docs.forEach((doc) => {
    var c = doc.data()
    if(c.ingredientes.find(i => i.ingredient === ing.ingredient) != undefined)
      cocktails.push(doc.data())

    if(cocktails.length >= limit)
      return
  })
  cocktails.sort((a, b) => (a.id > b.id) ? 1 : ((a.id < b.id) ? -1 : 0))
  const firstVisible = querySnapshot.docs[0];
  const size = cocktails.length
  const lastVisible = querySnapshot.docs[querySnapshot.docs.length-1];
  if(size > 0){
    resp.status(200)
    resp.send({data: cocktails, limit: size, after: lastVisible.data().id < last ? lastVisible.data().id : -1, before: firstVisible.data().id < 0 ? firstVisible.data().id : -1})
  }else{
    resp.status(404)
    resp.send('No hay cocktails con el ingrediente ' + ing.ingredient)
  }
})

app.listen(3000, function(){
	console.log("Servidor arrancado!!!")
})

function checkToken(pet, resp, next) {
  var token = getAuthenticationToken(pet)
  try{
    //si el token no fuera válido esto generaría una excepción
    var decoded = jwt.decode(token, secret);
    if(decoded != undefined)
      next()
  }catch(e){
    resp.status(403)
    resp.send("No tienes permiso " + e)
  }
}

function checkTokenFirebase(pet, resp, next) {
  var token = getAuthenticationToken(pet)
  if(token == firebaseConfig.apiKey){
      next()
  }else{
    resp.status(403)
    resp.send("No tienes permiso")
  }
}

function getAuthenticationToken(pet){
  var cabecera = pet.header('Authorization')
  if(cabecera) {
    var campos = cabecera.split(' ')
    if(campos.length > 1 && cabecera.startsWith('Bearer')){
      return campos[1]
    }
  }
  return undefined
}

async function getLastId() {
  var query = firestore.query(cocktailsRef, orderBy('id', 'desc'), limit(1))
  var querySnapshot = await firestore.getDocs(query)
  return querySnapshot.docs[0].data().id
}

var cocteles = [
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
  { "name": "Rose",
    "glass": "martini",
    "ingredients": [
      { "unit": "cl",
        "amount": 2,
        "ingredient": "Kirsch" },
      { "unit": "cl",
        "amount": 4,
        "ingredient": "Vermouth",
        "label": "Dry vermouth" },
      { "special": "3 dashes Strawberry syrup" }
    ],
    "preparation": "Stir all ingredients with ice and strain into a cocktail glass." },
  { "name": "Old Fashioned",
    "glass": "old-fashioned",
    "category": "Before Dinner Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 4.5,
        "ingredient": "Whiskey",
        "label": "Bourbon or rye whiskey" },
      { "special": "2 dashes Angostura Bitters" },
      { "special": "1 sugar cube" },
      { "special": "Few dashes plain water" }
    ],
    "garnish": "Orange slice and cherry",
    "preparation": "Place sugar cube in old-fashioned glass and saturate with bitters, add a dash of plain water. Muddle until dissolve. Fill the glass with ice cubes and add whisky." },
  { "name": "Tuxedo",
    "glass": "martini",
    "category": "All Day Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 3,
        "ingredient": "Gin",
        "label": "Old Tom Gin" },
      { "unit": "cl",
        "amount": 3,
        "ingredient": "Vermouth",
        "label": "Dry vermouth" },
      { "special": "1/2 bar spoon Maraschino" },
      { "special": "1/4 bar spoon Absinthe" },
      { "special": "3 dashes Orange Bitters" }
    ],
    "garnish": "Cherry and lemon twist",
    "preparation": "Stir all ingredients with ice and strain into cocktail glass." },
  { "name": "Mojito",
    "glass": "collins",
    "category": "Longdrink",
    "ingredients": [
      { "unit": "cl",
        "amount": 4,
        "ingredient": "White rum",
        "label": "White Cuban Rum" },
      { "unit": "cl",
        "amount": 3,
        "ingredient": "Lime juice" },
      { "special": "6 Mint sprigs" },
      { "special": "2 teaspoons white sugar" },
      { "special": "Soda water" }
    ],
    "garnish": "Mint leaves and lemon slice",
    "preparation": "Muddle mint sprigs with sugar and lime juice. Add splash of soda water and fill glass with cracked ice. Pour rum and top with soda water. Serve with straw." },
  { "name": "Horse's Neck",
    "glass": "highball",
    "category": "Longdrink",
    "ingredients": [
      { "unit": "cl",
        "amount": 4,
        "ingredient": "Cognac" },
      { "unit": "cl",
        "amount": 12,
        "ingredient": "Ginger Ale" },
      { "special": "Dash of Angostura bitters (optional)" }
    ],
    "garnish": "Lemon twist",
    "preparation": "Build into highball glass with ice cubes. Stir gently. If required, add dashes of Angostura bitters." },
  { "name": "Planter's Punch",
    "glass": "highball",
    "category": "Longdrink",
    "ingredients": [
      { "unit": "cl",
        "amount": 4.5,
        "ingredient": "Dark rum" },
      { "unit": "cl",
        "amount": 3.5,
        "ingredient": "Orange juice" },
      { "unit": "cl",
        "amount": 3.5,
        "ingredient": "Pineapple juice" },
      { "unit": "cl",
        "amount": 2,
        "ingredient": "Lemon juice" },
      { "unit": "cl",
        "amount": 1,
        "ingredient": "Syrup",
        "label": "Grenadine" },
      { "unit": "cl",
        "amount": 1,
        "ingredient": "Syrup",
        "label": "Sugar syrup" },
      { "special": "3 to 4 dashes Angostura bitters" }
    ],
    "garnish": "Pineapple slice and a cherry",
    "preparation": "Pour all ingredients, except the bitters, into shaker filled with ice. Shake. Pour into large glass, filled with ice. Add Angostura bitters, “on top”." },
  { "name": "Sea Breeze",
    "glass": "highball",
    "category": "Longdrink",
    "ingredients": [
      { "unit": "cl",
        "amount": 4,
        "ingredient": "Vodka" },
      { "unit": "cl",
        "amount": 12,
        "ingredient": "Cranberry juice" },
      { "unit": "cl",
        "amount": 3,
        "ingredient": "Grapefruit juice" }
    ],
    "garnish": "Lime wedge",
    "preparation": "Build all ingredients in a rock glass filled with ice." },
  { "name": "Pisco Sour",
    "glass": "old-fashioned",
    "category": "All Day Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 4.5,
        "ingredient": "Pisco" },
      { "unit": "cl",
        "amount": 3,
        "ingredient": "Lemon juice" },
      { "unit": "cl",
        "amount": 2,
        "ingredient": "Syrup",
        "label": "Sugar syrup" },
      { "special": "1 raw egg white (small egg)" }
    ],
    "preparation": "Shake and strain into a chilled champagne flute. Dash some Angostura bitters on top." },
  { "name": "Long Island Iced Tea",
    "glass": "highball",
    "category": "Longdrink",
    "ingredients": [
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Tequila" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Vodka" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "White rum" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Triple Sec" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Gin" },
      { "unit": "cl",
        "amount": 2.5,
        "ingredient": "Lemon juice" },
      { "unit": "cl",
        "amount": 3.0,
        "ingredient": "Syrup",
        "label": "Gomme syrup" },
      { "special": "1 dash of Cola" }
    ],
    "garnish": "Lemon twist",
    "preparation": "Add all ingredients into highball glass filled with ice. Stir gently. Serve with straw." },
  { "name": "Clover Club",
    "glass": "martini",
    "category": "All Day Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 4.5,
        "ingredient": "Gin" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Syrup",
        "label": "Raspberry syrup" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Lemon juice" },
      { "special": "Few drops of Egg White" }
    ],
    "preparation": "Shake with ice cubes. Strain into cocktail glass." },
  { "name": "Angel Face",
    "glass": "martini",
    "category": "All Day Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 3,
        "ingredient": "Gin" },
      { "unit": "cl",
        "amount": 3,
        "ingredient": "Apricot brandy" },
      { "unit": "cl",
        "amount": 3,
        "ingredient": "Calvados" }
    ],
    "preparation": "Shake with ice cubes. Strain into a cocktail glass." },
  { "name": "Mimosa",
    "glass": "champagne-flute",
    "category": "Sparkling Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 7.5,
        "ingredient": "Champagne" },
      { "unit": "cl",
        "amount": 7.5,
        "ingredient": "Orange juice" }
    ],
    "garnish": "Optional orange twist",
    "preparation": "Pour orange juice into flute and gently pour Champagne. Stir gently. Note: Buck's Fizz is a very similar cocktail but made of two parts champagne to one part orange juice." },
  { "name": "Whiskey Sour",
    "glass": "old-fashioned",
    "category": "Before Dinner Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 4.5,
        "ingredient": "Whiskey",
        "label": "Bourbon whiskey" },
      { "unit": "cl",
        "amount": 3.0,
        "ingredient": "Lemon juice" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Syrup",
        "label": "Sugar syrup" }
    ],
    "garnish": "Half an orange slice and cherry",
    "preparation": "Dash egg white (Optional: if used shake little harder to foam up the egg white). Pour all ingredients into cocktail shaker filled with ice. Shake. Strain into cocktail glass. If served ‘On the rocks’, strain ingredients into old-fashioned glass filled with ice." },
  { "name": "Screwdriver",
    "glass": "highball",
    "category": "All Day Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 5,
        "ingredient": "Vodka" },
      { "unit": "cl",
        "amount": 10,
        "ingredient": "Orange juice" }
    ],
    "garnish": "Orange slice",
    "preparation": "Build into a highball glass filled with ice. Stir gently." },
  { "name": "Cuba Libre",
    "glass": "highball",
    "category": "Longdrink",
    "ingredients": [
      { "unit": "cl",
        "amount": 5,
        "ingredient": "White rum" },
      { "unit": "cl",
        "amount": 12,
        "ingredient": "Cola" },
      { "unit": "cl",
        "amount": 1,
        "ingredient": "Lime juice" }
    ],
    "garnish": "Lime wedge",
    "preparation": "Build all ingredients in a highball glass filled with ice." },
  { "name": "Manhattan",
    "glass": "martini",
    "category": "Before Dinner Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 5,
        "ingredient": "Whiskey",
        "label": "Rye whiskey" },
      { "unit": "cl",
        "amount": 2,
        "ingredient": "Vermouth",
        "label": "Red vermouth" },
      { "special": "1 dash Angostura Bitters" }
    ],
    "garnish": "Cherry",
    "preparation": "Stir in mixing glass with ice cubes. Strain into chilled cocktail glass." },
  { "name": "Porto Flip",
    "glass": "martini",
    "category": "After Dinner Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Cognac" },
      { "unit": "cl",
        "amount": 4.5,
        "ingredient": "Red Port" },
      { "unit": "cl",
        "amount": 1,
        "ingredient": "Egg yolk" }
    ],
    "preparation": "Shake with ice cubes. Strain into cocktail glass. Sprinkle with fresh ground nutmeg." },
  { "name": "Gin Fizz",
    "glass": "highball",
    "category": "Longdrink",
    "ingredients": [
      { "unit": "cl",
        "amount": 4.5,
        "ingredient": "Gin" },
      { "unit": "cl",
        "amount": 3,
        "ingredient": "Lemon juice" },
      { "unit": "cl",
        "amount": 1,
        "ingredient": "Syrup",
        "label": "Sugar syrup" },
      { "unit": "cl",
        "amount": 8,
        "ingredient": "Soda water" }
    ],
    "garnish": "Lemon slice",
    "preparation": "Shake all ingredients with ice cubes, except soda water. Pour into tumbler. Top with soda water." },
  { "name": "Espresso Martini",
    "glass": "martini",
    "category": "After Dinner Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 5,
        "ingredient": "Vodka" },
      { "unit": "cl",
        "amount": 1,
        "ingredient": "Coffee liqueur",
        "label": "Kahlúa" },
      { "special": "Sugar syrup (according to individual preference of sweetness)" },
      { "special": "1 short strong Espresso" }
    ],
    "preparation": "Shake and strain into a chilled cocktail glass." },
  { "name": "Margarita",
    "glass": "margarita",
    "category": "All Day Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 3.5,
        "ingredient": "Tequila" },
      { "unit": "cl",
        "amount": 2,
        "ingredient": "Triple Sec",
        "label": "Cointreau" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Lime juice" }
    ],
    "preparation": "Shake with ice cubes. Strain into cocktail glass rimmed with salt (note:Fruit Margarita - blend selected fruit with the above recipe)." },
  { "name": "French 75",
    "glass": "champagne-tulip",
    "category": "Sparkling Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 3,
        "ingredient": "Gin" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Lemon juice" },
      { "special": "2 dashes Sugar syrup" },
      { "unit": "cl",
        "amount": 6,
        "ingredient": "Champagne" }
    ],
    "preparation": "Shake with ice cubes, except for champagne. Strain into a champagne flute. Top up with champagne. Stir gently." },
  { "name": "Yellow Bird",
    "glass": "martini",
    "category": "All Day Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 3,
        "ingredient": "White rum" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Galliano" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Triple Sec" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Lime juice" }
    ],
    "preparation": "Shake and strain into a chilled cocktail glass." },
  { "name": "Pina Colada",
    "glass": "hurricane",
    "category": "Longdrink",
    "ingredients": [
      { "unit": "cl",
        "amount": 3,
        "ingredient": "White rum" },
      { "unit": "cl",
        "amount": 9,
        "ingredient": "Pineapple juice" },
      { "unit": "cl",
        "amount": 3,
        "ingredient": "Coconut milk" }
    ],
    "garnish": "Pineapple slice and a cherry",
    "preparation": "Blend all the ingredients with ice in a electric blender, pour into a large goblet or Hurricane glass and serve with straws." },
  { "name": "Aviation",
    "glass": "martini",
    "category": "All Day Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 4.5,
        "ingredient": "Gin" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Cherry liqueur",
        "label": "Maraschino" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Lemon juice" }
    ],
    "preparation": "Shake and strain into a chilled cocktail glass." },
  { "name": "Bellini",
    "glass": "champagne-flute",
    "category": "Sparkling Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 10,
        "ingredient": "Prosecco" },
      { "unit": "cl",
        "amount": 5,
        "ingredient": "Peach puree" }
    ],
    "preparation": "Pour peach puree into chilled glass and add sparkling wine. Stir gently. Variations: Puccini (fresh mandarin juice), Rossini (fresh strawberry puree), Tintoretto (fresh pomegranate juice)" },
  { "name": "Grasshopper",
    "glass": "martini",
    "category": "After Dinner Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 3,
        "ingredient": "Créme liqueur",
        "label": "White Créme de Cacao" },
      { "unit": "cl",
        "amount": 3,
        "ingredient": "Créme liqueur",
        "label": "Green Créme de Menthe" },
      { "unit": "cl",
        "amount": 3,
        "ingredient": "Cream" }
    ],
    "preparation": "Shake with ice cubes. Strain into chilled cocktail glass." },
  { "name": "Tequila Sunrise",
    "glass": "highball",
    "category": "Longdrink",
    "ingredients": [
      { "unit": "cl",
        "amount": 4.5,
        "ingredient": "Tequila" },
      { "unit": "cl",
        "amount": 9,
        "ingredient": "Orange juice" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Syrup",
        "label": "Grenadine" }
    ],
    "garnish": "Orange slice and a cherry",
    "preparation": "Build tequila and orange juice into highball with ice cubes. Add a splash of grenadine to create sunrise effect. Do not stir." },
  { "name": "Daiquiri",
    "glass": "martini",
    "category": "Before Dinner Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 4.5,
        "ingredient": "White rum" },
      { "unit": "cl",
        "amount": 2.5,
        "ingredient": "Lime juice" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Syrup",
        "label": "Simple syrup" }
    ],
    "preparation": "Shake and strain into a cocktail glass." },
  { "name": "Rusty Nail",
    "glass": "old-fashioned",
    "category": "After Dinner Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 4.5,
        "ingredient": "Whiskey",
        "label": "Scotch whisky" },
      { "unit": "cl",
        "amount": 2.5,
        "ingredient": "Drambuie" }
    ],
    "garnish": "Lemon twist",
    "preparation": "Build into old-fashioned glass filled with ice. Stir gently." },
  { "name": "B52",
    "glass": "shot",
    "category": "After Dinner Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 2,
        "ingredient": "Coffee liqueur",
        "label": "Kahlúa" },
      { "unit": "cl",
        "amount": 2,
        "ingredient": "Cream liqueur",
        "label": "Baileys Irish Cream" },
      { "unit": "cl",
        "amount": 2,
        "ingredient": "Triple Sec",
        "label": "Grand Marnier" }
    ],
    "preparation": "Layer ingredients one at a time starting with Kahlúa, followed by Baileys Irish Cream and top with Grand Marnier. Flame the Grand Marnier, serve while the flame is still on, accompanied with a straw on side plate." },
  { "name": "Stinger",
    "glass": "martini",
    "category": "After Dinner Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 5,
        "ingredient": "Cognac" },
      { "unit": "cl",
        "amount": 2,
        "ingredient": "Créme liqueur",
        "label": "White Créme de Menthe" }
    ],
    "preparation": "Stir in mixing glass with ice cubes. Strain into a cocktail glass." },
  { "name": "Golden Dream",
    "glass": "martini",
    "category": "After Dinner Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 2,
        "ingredient": "Galliano" },
      { "unit": "cl",
        "amount": 2,
        "ingredient": "Triple Sec" },
      { "unit": "cl",
        "amount": 2,
        "ingredient": "Orange juice" },
      { "unit": "cl",
        "amount": 1,
        "ingredient": "Cream" }
    ],
    "preparation": "Shake with ice cubes. Strain into chilled cocktail glass." },
  { "name": "God Mother",
    "glass": "old-fashioned",
    "ingredients": [
      { "unit": "cl",
        "amount": 3.5,
        "ingredient": "Vodka" },
      { "unit": "cl",
        "amount": 3.5,
        "ingredient": "DiSaronno" }
    ],
    "preparation": "Build into old fashioned glass filled with ice cubes. Stir gently." },
  { "name": "Spritz Veneziano",
    "glass": "old-fashioned",
    "category": "Sparkling Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 6,
        "ingredient": "Prosecco" },
      { "unit": "cl",
        "amount": 4,
        "ingredient": "Aperol" },
      { "special": "Splash of Soda water" }
    ],
    "garnish": "Half an orange slice",
    "preparation": "Build into an old-fashioned glass filled with ice. Top with a splash of soda water." },
  { "name": "Bramble",
    "glass": "old-fashioned",
    "category": "All Day Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 4,
        "ingredient": "Gin" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Lemon juice" },
      { "unit": "cl",
        "amount": 1,
        "ingredient": "Syrup",
        "label": "Sugar syrup" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Blackberry liqueur" }
    ],
    "garnish": "Lemon slice and two blackberries",
    "preparation": "Build over crushed ice, in a rock glass. Stir, then pour the blackberry liqueur over the top of the drink in a circular fashion." },
  { "name": "Alexander",
    "glass": "martini",
    "ingredients": [
      { "unit": "cl",
        "amount": 3,
        "ingredient": "Cognac" },
      { "unit": "cl",
        "amount": 3,
        "ingredient": "Créme liqueur",
        "label": "Brown Créme de Cacao" },
      { "unit": "cl",
        "amount": 3,
        "ingredient": "Cream" }
    ],
    "preparation": "Shake and strain into a chilled cocktail glass. Sprinkle with fresh ground nutmeg." },
  { "name": "Lemon Drop Martini",
    "glass": "martini",
    "category": "All Day Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 2.5,
        "ingredient": "Vodka",
        "label": "Citron Vodka" },
      { "unit": "cl",
        "amount": 2,
        "ingredient": "Triple Sec" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Lemon juice" }
    ],
    "garnish": "Lemon slice",
    "preparation": "Shake and strain into a chilled cocktail glass rimmed with sugar." },
  { "name": "French Martini",
    "glass": "martini",
    "category": "Before Dinner Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 4.5,
        "ingredient": "Vodka" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Raspberry liqueur" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Pineapple juice" }
    ],
    "preparation": "Stir in mixing glass with ice cubes. Strain into chilled cocktail glass. Squeeze oil from lemon peel onto the drink." },
  { "name": "Black Russian",
    "glass": "old-fashioned",
    "category": "After Dinner Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 5,
        "ingredient": "Vodka" },
      { "unit": "cl",
        "amount": 2,
        "ingredient": "Coffee liqueur" }
    ],
    "preparation": "Build into old fashioned glass filled with ice cubes. Stir gently. Note: for White Russian, float fresh cream on the top and stir gently." },
  { "name": "Bloody Mary",
    "glass": "highball",
    "category": "Longdrink",
    "ingredients": [
      { "unit": "cl",
        "amount": 4.5,
        "ingredient": "Vodka" },
      { "unit": "cl",
        "amount": 9,
        "ingredient": "Tomato juice" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Lemon juice" },
      { "special": "2 to 3 dashes of Worcestershire Sauce" },
      { "special": "Tabasco" },
      { "special": "Celery salt" },
      { "special": "Pepper" }
    ],
    "garnish": "Celery and optionally lemon wedge",
    "preparation": "Stir gently, pour all ingredients into highball glass." },
  { "name": "Mai-tai",
    "glass": "highball",
    "category": "Longdrink",
    "ingredients": [
      { "unit": "cl",
        "amount": 4,
        "ingredient": "White rum" },
      { "unit": "cl",
        "amount": 2,
        "ingredient": "Dark rum" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Triple Sec",
        "label": "Orange Curaçao" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Syrup",
        "label": "Orgeat syrup" },
      { "unit": "cl",
        "amount": 1,
        "ingredient": "Lime juice" }
    ],
    "garnish": "Pineapple spear, mint leaves and lime wedge",
    "preparation": "Shake and strain into highball glass. Serve with straw." },
  { "name": "Barracuda",
    "glass": "margarita",
    "category": "Sparkling Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 4.5,
        "ingredient": "Dark rum",
        "label": "Gold rum" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Galliano" },
      { "unit": "cl",
        "amount": 6,
        "ingredient": "Pineapple juice" },
      { "special": "1 dash Lime juice" },
      { "special": "Top with Prosecco" }
    ] },
  { "name": "Sex on the Beach",
    "glass": "highball",
    "category": "Longdrink",
    "ingredients": [
      { "unit": "cl",
        "amount": 4,
        "ingredient": "Vodka" },
      { "unit": "cl",
        "amount": 2,
        "ingredient": "Peach schnapps" },
      { "unit": "cl",
        "amount": 4,
        "ingredient": "Cranberry juice" },
      { "unit": "cl",
        "amount": 4,
        "ingredient": "Orange juice" }
    ],
    "garnish": "Orange slice",
    "preparation": "Build all ingredients in a highball glass filled with ice." },
  { "name": "Monkey Gland",
    "glass": "martini",
    "category": "All Day Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 5,
        "ingredient": "Gin" },
      { "unit": "cl",
        "amount": 3,
        "ingredient": "Orange juice" },
      { "special": "2 drops Absinthe" },
      { "special": "2 drops Grenadine" }
    ],
    "preparation": "Shake and strain into a chilled cocktail glass." },
  { "name": "Derby",
    "glass": "martini",
    "category": "All Day Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 6,
        "ingredient": "Gin" },
      { "special": "2 drops Peach Bitters" },
      { "special": "2 Fresh mint leaves" }
    ],
    "garnish": "Mint leaves",
    "preparation": "Stir in mixing glass with ice cubes. Strain into a cocktail glass." },
  { "name": "Sidecar",
    "glass": "martini",
    "category": "All Day Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 5,
        "ingredient": "Cognac" },
      { "unit": "cl",
        "amount": 2,
        "ingredient": "Triple Sec" },
      { "unit": "cl",
        "amount": 2,
        "ingredient": "Lemon juice" }
    ],
    "preparation": "Shake with ice cubes. Strain into cocktail glass." },
  { "name": "Irish Coffee",
    "glass": "hot-drink",
    "category": "Hot Drink",
    "ingredients": [
      { "unit": "cl",
        "amount": 4,
        "ingredient": "Whiskey",
        "label": "Irish whiskey" },
      { "unit": "cl",
        "amount": 9,
        "ingredient": "Hot coffee" },
      { "unit": "cl",
        "amount": 3,
        "ingredient": "Cream" },
      { "special": "1 teaspoon of brown sugar" }
    ],
    "preparation": "Warm the Irish whiskey over a burner. Pour into the glass (for hot drink) hot coffee, and add a teaspoon of sugar. Float Cream on top." },
  { "name": "Sazerac",
    "glass": "old-fashioned",
    "category": "After Dinner Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 5,
        "ingredient": "Cognac" },
      { "unit": "cl",
        "amount": 1,
        "ingredient": "Absinthe" },
      { "special": "1 sugar cube" },
      { "special": "2 dashes Peychaud’s bitters" }
    ],
    "garnish": "Lemon twist",
    "preparation": "Rinse a chilled old-fashioned glass with the absinthe, add crushed ice and set it aside. Stir the remaining ingredients over ice and set it aside. Discard the ice and any excess absinthe from the prepared glass, and strain the drink into the glass. Note: The original recipe changed after the American Civil War, rye whiskey substituted cognac as it became hard to obtain." },
  { "name": "Americano",
    "glass": "old-fashioned",
    "category": "Before Dinner Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 3,
        "ingredient": "Campari" },
      { "unit": "cl",
        "amount": 3,
        "ingredient": "Vermouth",
        "label": "Red vermouth" },
      { "special": "A splash of soda water" }
    ],
    "garnish": "Half an orange slice",
    "preparation": "Build into old fashioned glass filled with ice cubes. Add a splash of soda water." },
  { "name": "Singapore Sling",
    "glass": "highball",
    "category": "Longdrink",
    "ingredients": [
      { "unit": "cl",
        "amount": 3,
        "ingredient": "Gin" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Cherry liqueur" },
      { "unit": "cl",
        "amount": 0.75,
        "ingredient": "Triple Sec",
        "label": "Cointreau" },
      { "unit": "cl",
        "amount": 0.75,
        "ingredient": "DOM Bénédictine" },
      { "unit": "cl",
        "amount": 12.0,
        "ingredient": "Pineapple juice" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Lime juice" },
      { "unit": "cl",
        "amount": 1,
        "ingredient": "Syrup",
        "label": "Grenadine" },
      { "special": "1 dash Angostura bitters" }
    ],
    "garnish": "Pineapple slice and a cherry",
    "preparation": "Shake with ice cubes. Strain into highball glass." },
  { "name": "French Connection",
    "glass": "old-fashioned",
    "ingredients": [
      { "unit": "cl",
        "amount": 3.5,
        "ingredient": "Cognac" },
      { "unit": "cl",
        "amount": 3.5,
        "ingredient": "DiSaronno" }
    ],
    "preparation": "Build into old fashioned glass filled with ice cubes. Stir gently." },
  { "name": "Moscow Mule",
    "glass": "highball",
    "category": "Longdrink",
    "ingredients": [
      { "unit": "cl",
        "amount": 4.5,
        "ingredient": "Vodka" },
      { "unit": "cl",
        "amount": 12,
        "ingredient": "Ginger beer" },
      { "unit": "cl",
        "amount": 0.5,
        "ingredient": "Lime juice" },
      { "special": "1 slice lime in a highball glass" }
    ],
    "garnish": "Lime slice",
    "preparation": "Combine the vodka and ginger beer. Add lime juice." },
  { "name": "John Collins",
    "glass": "highball",
    "category": "Longdrink",
    "ingredients": [
      { "unit": "cl",
        "amount": 4.5,
        "ingredient": "Gin" },
      { "unit": "cl",
        "amount": 3,
        "ingredient": "Lemon juice" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Syrup",
        "label": "Sugar syrup" },
      { "unit": "cl",
        "amount": 6,
        "ingredient": "Soda water" }
    ],
    "garnish": "Lemon slice and a cherry",
    "preparation": "Build into highball glass filled with ice. Stir gently. Add a dash of Angostura bitters. (Note: Use Old Tom Gin for Tom Collins)" },
  { "name": "Kir",
    "glass": "white-wine",
    "category": "Before Dinner Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 9,
        "ingredient": "Dry White Wine" },
      { "unit": "cl",
        "amount": 1,
        "ingredient": "Créme liqueur",
        "label": "Créme de Cassis" }
    ],
    "preparation": "Pour Créme de Cassis into glass, top up with white wine. For Kir Royal: Use champagne instead of white wine." },
  { "name": "Mint Julep",
    "glass": "highball",
    "category": "Longdrink",
    "ingredients": [
      { "unit": "cl",
        "amount": 6,
        "ingredient": "Whiskey",
        "label": "Bourbon whiskey" },
      { "special": "4 fresh mint sprigs" },
      { "special": "1 teaspoon powdered sugar" },
      { "special": "2 teaspoons water" }
    ],
    "garnish": "Mint sprig",
    "preparation": "In a highball glass gently muddle the mint, sugar and water. Fill the glass with cracked ice, add Bourbon and stir well until the glass is frost." },
  { "name": "Tommy's Margarita",
    "glass": "martini",
    "category": "All Day Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 4.5,
        "ingredient": "Tequila" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Lime juice" },
      { "special": "2 bar spoons of Agave nectar" }
    ],
    "preparation": "Shake and strain into a chilled cocktail glass." },
  { "name": "Paradise",
    "glass": "martini",
    "category": "All Day Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 3.5,
        "ingredient": "Gin" },
      { "unit": "cl",
        "amount": 2,
        "ingredient": "Apricot brandy" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Orange juice" }
    ],
    "preparation": "Shake with ice cubes. Strain into chilled cocktail glass." },
  { "name": "Dirty Martini",
    "glass": "martini",
    "category": "Before Dinner Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 6,
        "ingredient": "Vodka" },
      { "unit": "cl",
        "amount": 1,
        "ingredient": "Vermouth",
        "label": "Dry vermouth" },
      { "unit": "cl",
        "amount": 1,
        "ingredient": "Olive juice" }
    ],
    "garnish": "Green olive",
    "preparation": "Stir in mixing glass with ice cubes. Strain into chilled martini glass." },
  { "name": "Champagne Cocktail",
    "glass": "champagne-flute",
    "category": "Sparkling Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 9,
        "ingredient": "Champagne" },
      { "unit": "cl",
        "amount": 1,
        "ingredient": "Cognac" },
      { "special": "2 dashes Angostura Bitters" },
      { "special": "1 sugar cube" }
    ],
    "garnish": "Orange slice and a cherry",
    "preparation": "Add dash of Angostura bitter onto sugar cube and drop it into champagne flute. Add cognac followed by pouring gently chilled champagne." },
  { "name": "Mary Pickford",
    "glass": "martini",
    "category": "All Day Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 6,
        "ingredient": "White rum" },
      { "unit": "cl",
        "amount": 1,
        "ingredient": "Cherry liqueur",
        "label": "Maraschino" },
      { "unit": "cl",
        "amount": 6,
        "ingredient": "Pineapple juice" },
      { "unit": "cl",
        "amount": 1,
        "ingredient": "Syrup",
        "label": "Grenadine" }
    ],
    "preparation": "Shake and strain into a chilled large cocktail glass." },
  { "name": "Hemingway Special",
    "glass": "martini",
    "category": "All Day Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 6,
        "ingredient": "White rum" },
      { "unit": "cl",
        "amount": 4,
        "ingredient": "Grapefruit juice" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Cherry liqueur",
        "label": "Maraschino" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Lime juice" }
    ],
    "preparation": "Shake with ice cubes. Strain into a double cocktail glass." },
  { "name": "Dark 'n' Stormy",
    "glass": "highball",
    "category": "Longdrink",
    "ingredients": [
      { "unit": "cl",
        "amount": 6,
        "ingredient": "Dark rum" },
      { "unit": "cl",
        "amount": 10,
        "ingredient": "Ginger beer" }
    ],
    "garnish": "Lime wedge",
    "preparation": "Build into highball glass filled with ice. Add rum first and top it with ginger beer." },
  { "name": "Ramos Fizz",
    "glass": "highball",
    "category": "Longdrink",
    "ingredients": [
      { "unit": "cl",
        "amount": 4.5,
        "ingredient": "Gin" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Lime juice" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Lemon juice" },
      { "unit": "cl",
        "amount": 3,
        "ingredient": "Syrup",
        "label": "Sugar syrup" },
      { "unit": "cl",
        "amount": 6,
        "ingredient": "Cream" },
      { "special": "1 Egg white" },
      { "special": "3 dashes Orange flower water" },
      { "special": "2 drops Vanilla extract" },
      { "special": "Soda water" }
    ],
    "preparation": "Pour all ingredients (except soda) in a mixing glass, dry shake (no ice) for two minutes, add ice and hard shake for another minute. Strain into a highball glass without ice, top with soda." },
  { "name": "Russian Spring Punch",
    "glass": "highball",
    "category": "Sparkling Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 2.5,
        "ingredient": "Vodka" },
      { "unit": "cl",
        "amount": 2.5,
        "ingredient": "Lemon juice" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Créme liqueur",
        "label": "Créme de Cassis" },
      { "unit": "cl",
        "amount": 1,
        "ingredient": "Syrup",
        "label": "Sugar syrup" }
    ],
    "garnish": "Lemon slice and a blackberry",
    "preparation": "Shake the ingredients and pour into highball glass. Top with Sparkling wine." },
  { "name": "God Father",
    "glass": "old-fashioned",
    "ingredients": [
      { "unit": "cl",
        "amount": 3.5,
        "ingredient": "Whiskey",
        "label": "Scotch whisky" },
      { "unit": "cl",
        "amount": 3.5,
        "ingredient": "DiSaronno" }
    ],
    "preparation": "Build into old fashioned glass filled with ice cubes. Stir gently." },
  { "name": "Cosmopolitan",
    "glass": "martini",
    "category": "All Day Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 4,
        "ingredient": "Vodka",
        "label": "Citron Vodka" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Triple Sec",
        "label": "Cointreau" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Lime juice" },
      { "unit": "cl",
        "amount": 3,
        "ingredient": "Cranberry juice" }
    ],
    "garnish": "Lime slice",
    "preparation": "Shake with ice cubes. Strain into a large cocktail glass." },
  { "name": "Dry Martini",
    "glass": "martini",
    "category": "Before Dinner Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 6,
        "ingredient": "Gin" },
      { "unit": "cl",
        "amount": 1,
        "ingredient": "Vermouth",
        "label": "Dry vermouth" }
    ],
    "preparation": "Stir in mixing glass with ice cubes. Strain into chilled martini glass. Squeeze oil from lemon peel onto the drink, or garnish with olive." },
  { "name": "Between the Sheets",
    "glass": "martini",
    "category": "All Day Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 3,
        "ingredient": "White rum" },
      { "unit": "cl",
        "amount": 3,
        "ingredient": "Cognac" },
      { "unit": "cl",
        "amount": 3,
        "ingredient": "Triple Sec" },
      { "unit": "cl",
        "amount": 2,
        "ingredient": "Lemon juice" }
    ],
    "preparation": "Shake with ice cubes. Strain into chilled cocktail glass." },
  { "name": "Casino",
    "glass": "martini",
    "category": "All Day Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 4,
        "ingredient": "Gin",
        "label": "Old Tom Gin" },
      { "unit": "cl",
        "amount": 1,
        "ingredient": "Cherry liqueur",
        "label": "Maraschino" },
      { "unit": "cl",
        "amount": 1,
        "ingredient": "Orange Bitters" },
      { "unit": "cl",
        "amount": 1,
        "ingredient": "Lemon juice" }
    ],
    "garnish": "Lemon twist and a cherry",
    "preparation": "Shake with ice cubes. Strain into chilled cocktail glass." },
  { "name": "Caipirinha",
    "glass": "old-fashioned",
    "category": "All Day Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 5,
        "ingredient": "Cachaca" },
      { "special": "half fresh lime cut into 4 wedges" },
      { "special": "2 teaspoon sugar" }
    ],
    "preparation": "Place lime and sugar in old fashion glass and muddle. Fill glass with ice and Cachaca (note:Caipiroska- use Vodka instead of Cachaca)." },
  { "name": "Vampiro",
    "glass": "highball",
    "ingredients": [
      { "unit": "cl",
        "amount": 5,
        "ingredient": "Tequila",
        "label": "Silver Tequila" },
      { "unit": "cl",
        "amount": 7,
        "ingredient": "Tomato juice" },
      { "unit": "cl",
        "amount": 3,
        "ingredient": "Orange juice" },
      { "unit": "cl",
        "amount": 1,
        "ingredient": "Lime juice" },
      { "special": "1 teaspoon clear honey" },
      { "special": "Half slice onion finely chopped" },
      { "special": "Few slices fresh red hot chili peppers" },
      { "special": "Few drops Worcestershire sauce" },
      { "special": "Salt" }
    ],
    "garnish": "Lime wedge and a green or red chili",
    "preparation": "Shake with ice cubes. Strain into a highball glass, filled with ice." },
  { "name": "Kamikaze",
    "glass": "martini",
    "category": "All Day Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 3,
        "ingredient": "Vodka" },
      { "unit": "cl",
        "amount": 3,
        "ingredient": "Triple Sec" },
      { "unit": "cl",
        "amount": 3,
        "ingredient": "Lime juice" }
    ],
    "preparation": "Shake and strain into a chilled cocktail glass." },
  { "name": "White Lady",
    "glass": "martini",
    "category": "All Day Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 4,
        "ingredient": "Gin" },
      { "unit": "cl",
        "amount": 3,
        "ingredient": "Triple Sec" },
      { "unit": "cl",
        "amount": 2,
        "ingredient": "Lemon juice" }
    ],
    "preparation": "Shake with ice cubes. Strain into large cocktail glass." },
  { "name": "Harvey Wallbanger",
    "glass": "highball",
    "category": "All Day Cocktail",
    "ingredients": [
      { "unit": "cl",
        "amount": 4.5,
        "ingredient": "Vodka" },
      { "unit": "cl",
        "amount": 1.5,
        "ingredient": "Galliano" },
      { "unit": "cl",
        "amount": 9,
        "ingredient": "Orange juice" }
    ],
    "garnish": "Orance slice and a cherry",
    "preparation": "Build vodka and orange juice into a highball glass filled with ice. Stir gently and float Galliano on top." }
]