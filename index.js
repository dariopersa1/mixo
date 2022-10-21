var firebase = require('firebase/app')
var firestore = require('firebase/firestore')
var getFirestore = firestore.getFirestore
var collection = firestore.collection
var express = require('express')
var app = express()
app.use(express.json())
const usuarios = [{username: 'dario', pass: '123'}, {username: 'otto', pass: '123'}]
const url = require('url')
var jwt = require('jwt-simple');
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

// Initialize Firebase
const appFirebase = firebase.initializeApp(firebaseConfig);
const db = getFirestore(appFirebase);
const cocktailsRef = collection(db, "cocktails")

app.get('/api/firebase/load',async function(pet, resp) {
  try {
    var cocktail
    for(i = 0; i < cocteles.length-1; i++){
      cocktail = cocteles[i]
      const docRef = await firestore.addDoc(collection(db, "cocktails"), {
        id: i.toString(),
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

app.post('/api/login', async function(pet, resp){
    const queryParams = url.parse(pet.url, true).query
    var user = {username: queryParams.username, password: queryParams.password}
    var found = false
    var q = firestore.query(collection(db, "users"), firestore.where("username", "==", user.username))
    const querySnapshot = await firestore.getDocs(q);
    
    if(querySnapshot.docs[0] != undefined){
      var u = querySnapshot.docs[0].data()
      var dPassword = jwt.decode(u.password, secret)
      if(u.username == user.username && dPassword == user.password){
        resp.status(200)
        resp.send({token: jwt.encode(user.username+user.password, secret)})
      }else{
        resp.status(401)
        resp.send('Las credenciales no coinciden')
      }
    }else{
      resp.status(401)
      resp.send('Usuario no encontrado')
    }
})

app.post('/api/register',async function(pet, resp) {
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
          email: usuario.email
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
    resp.status(403)
    resp.send('Usuario undefined')
  }
})

app.get('/api/cocktails', chekToken, async function(pet,resp) {
  
  var cocktails = []
  var querySnapshot = await firestore.getDocs(cocktailsRef)
  querySnapshot.forEach((doc) => {
    cocktails.push(doc.data())
  })
  resp.status(200)
  resp.send(cocktails)
})

app.get('/api/cocktails/:id', chekToken, async function(pet, resp) {
  var id = pet.params.id
  console.log(id)
  var q = firestore.query(cocktailsRef, firestore.where("id", "==", id))
  const querySnapshot = await firestore.getDocs(q);
  
  if(querySnapshot.docs[0] != undefined){
    var cocktail = querySnapshot.docs[0].data()
    resp.status(200)
    resp.send(cocktail)
  }else{
    resp.status(404)
    resp.send('Cocktail con id: ' + id + ', no encontrado')
  }
})

app.get('/api/cocktail/:name', chekToken, async function(pet, resp) {
  var name = pet.params.name
  console.log(name)
  var q = firestore.query(cocktailsRef, firestore.where("name", "==", name))
  const querySnapshot = await firestore.getDocs(q);
  
  if(querySnapshot.docs[0] != undefined){
    var cocktail = querySnapshot.docs[0].data()
    resp.status(200)
    resp.send(cocktail)
  }else{
    resp.status(404)
    resp.send('Cocktail con nombre: ' + name + ', no encontrado')
  }
})

app.get('/api/cocktails/category/:category', chekToken, async function(pet, resp) {
  var cat = pet.params.category
  console.log(cat)
  var q = firestore.query(cocktailsRef, firestore.where("category", "==", cat))
  const querySnapshot = await firestore.getDocs(q);
  var cocktails = []
  querySnapshot.docs.forEach((doc) => {
    cocktails.push(doc.data())
  })
  console.log(cocktails)
  if(cocktails.length > 0){
    resp.status(200)
    resp.send(cocktails)
  }else{
    resp.status(404)
    resp.send('No hay cocktails en la categoria: ' + cat)
  }
})

app.get('/api/cocktails/ingredients/:ingredient', chekToken, async function(pet, resp) {
  var ing = {ingredient: pet.params.ingredient}
  console.log(ing)
  const querySnapshot = await firestore.getDocs(cocktailsRef);
  var cocktails = []
  querySnapshot.docs.forEach((doc) => {
    var c = doc.data()
    console.log(c)
    if(c.ingredientes.find(i => i.ingredient === ing.ingredient) != undefined)
      cocktails.push(doc.data())
  })
  console.log(cocktails)
  if(cocktails.length > 0){
    resp.status(200)
    resp.send(cocktails)
  }else{
    resp.status(404)
    resp.send('No hay cocktails con el ingrediente ' + ing.ingredient)
  }
})

app.listen(3000, function(){
	console.log("Servidor arrancado!!!")
})

function chekToken(pet, resp, next) {
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

