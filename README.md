# Mixo app

Mi aplicación es una web de recetas de coctelería. Puedes acceder a la información general sin loguearte, pero si quieres acceder a más funcionalidades debes iniciar sesión.

## Partes optativas y consideraciones
- Single file component y create-vue: He utilizado componenetes independientes para después poder reutilizarlos. Los principales son el componente de listas, que permite listar cócteles independientemente del filtro, y la vista de formulario que permite rellenar formularios de edición y creación de todas las entidades del sistema.
- Listado de entidades: Al loguearse con un usuario administrador (username: otto, password: 123), podemos acceder al listado de administración que nos permite ver todos los elementos del sistema, editarlos, eliminarlos y crear nuevos.
- Bootstrap-vue: Intenté utilizar bootstrap-vue para algunas funcionalidades, pero al no ser compatible con Vue 3 tuve que recurrir a Bootstrap.
- Vue router: La aplicación utiliza Vue Router para la navegación entre páginas. También, se realiza un seguimiento de los parámetros en los componentes reutilizables en caso de que cambien los parámetros de la misma url.
- Funcionalidad favoritos: Los usuarios tienen la posibilidad de señalar los cócteles deseados como favoritos con un botón que aparece solo cuando estás logueado. La pantalla para gestionar los cócteles favoritos no está implementada pero funciona correctamente por detrás.