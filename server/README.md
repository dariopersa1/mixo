# Mixo API

## Introducción
Esta es la API de la aplicación web Mixo. Aquí se hará un breve resumen de las funcionalidades implementadas y requerimientos adicionales.

## Variaciones respecto al diseño
La única variación destacable es que las funciones de la parte pública (que no requerian autentificación) requieren autentificación. Para ello, como se especifica en el enunciado, he utilizado jwt-simple para devolver un token al usuario después de loguearse. Falta por implementar las funcionalidades de la parte privada en la api. Para la siguiente entrega podré implementarlas mejor con la interacción desde el cliente y así probar mejor los casos de uso.

## Requerimientos adicionales
Como requerimientos adicionales, he conseguido implementar los siguientes:
- **Persistencia en la API con base de datos:** He utilizado `Firebase` para almacenar los datos tanto de cócteles como de usuarios. Debes tener permiso para visualizar Firebase en el correo.
- **Paginación:** Firebase permite un sistema para `paginar por cursores`. La paginación se ha implementado en el listado de cócteles y sus variantes con filtros, en el archivo `index.js`, asociado a las rutas: 
  - **/api/cocktails**
  - **/api/cocktails/category/:category**
  - **/api/cocktails/ingredients/:ingredient**
- **Documentar la API:** He intentado añadir swagger al proyecto. Swagger está instalado y a la hora de ejecutarlo funciona, pero he tenido problemas con la sintaxis y la especificación de las llamadas, ya que swagger no soporta que las peticiones GET/HEAD tengan un body. Esto me limita bastante con las peticiones que sí podría documentar así que la documentación está a medias. El archivo en cuestión es `swagger.json`.

