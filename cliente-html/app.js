const URL_API = 'http://127.0.0.1:8000/api';

const seccionLogin = document.getElementById('seccion-login');
const seccionCrud = document.getElementById('seccion-crud');
const formLogin = document.getElementById('form-login');
const mensajeLogin = document.getElementById('mensaje-login');
const infoUsuario = document.getElementById('info-usuario');
const btnLogout = document.getElementById('btn-logout');

const formPersona = document.getElementById('form-persona');
const inputId = document.getElementById('persona-id');
const inputCi = document.getElementById('persona-ci');
const inputNombres = document.getElementById('persona-nombres');
const inputApellidos = document.getElementById('persona-apellidos');
const inputFecha = document.getElementById('persona-fecha');
const inputTelefono = document.getElementById('persona-telefono');
const tablaPersonas = document.getElementById('tabla-personas');
const tituloFormulario = document.getElementById('titulo-formulario');
const btnCancelar = document.getElementById('btn-cancelar');

let listaPersonas = [];

document.addEventListener('DOMContentLoaded', verificarSesion);
formLogin.addEventListener('submit', iniciarSesion);
btnLogout.addEventListener('click', cerrarSesion);
formPersona.addEventListener('submit', guardarPersona);
btnCancelar.addEventListener('click', cancelarEdicion);

function verificarSesion() {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    if (token && usuario) {
        seccionLogin.style.display = 'none';
        seccionCrud.style.display = 'block';
        infoUsuario.textContent = 'Conectado como: ' + usuario.name + ' (' + usuario.role + ')';
        cargarPersonas();
    } else {
        seccionLogin.style.display = 'block';
        seccionCrud.style.display = 'none';
    }
}

async function iniciarSesion(e) {
    e.preventDefault();
    mensajeLogin.textContent = '';

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const respuesta = await fetch(URL_API + '/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email: email, password: password })
        });

        const datos = await respuesta.json();

        if (respuesta.ok) {
            localStorage.setItem('token', datos.token);
            localStorage.setItem('usuario', JSON.stringify(datos.usuario));
            formLogin.reset();
            verificarSesion();
        } else {
            mensajeLogin.textContent = datos.mensaje || 'Error al iniciar sesión';
        }
    } catch (error) {
        mensajeLogin.textContent = 'No se pudo conectar con el servidor';
    }
}

function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    cancelarEdicion();
    verificarSesion();
}

async function cargarPersonas() {
    const token = localStorage.getItem('token');

    try {
        const respuesta = await fetch(URL_API + '/personas', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Accept': 'application/json'
            }
        });

        if (respuesta.status === 401) {
            cerrarSesion();
            return;
        }

        listaPersonas = await respuesta.json();
        tablaPersonas.innerHTML = '';

        listaPersonas.forEach(function (persona) {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${persona.id}</td>
                <td>${persona.ci}</td>
                <td>${persona.nombres}</td>
                <td>${persona.apellidos}</td>
                <td>${persona.fecha_nacimiento}</td>
                <td>${persona.telefono || '-'}</td>
                <td>
                    <button class="btn-editar" onclick="editarPersona(${persona.id})">Editar</button>
                    <button class="btn-peligro" onclick="eliminarPersona(${persona.id})">Eliminar</button>
                </td>
            `;
            tablaPersonas.appendChild(fila);
        });
    } catch (error) {
        alert('Error al cargar la lista de personas');
    }
}

function editarPersona(id) {
    const persona = listaPersonas.find(function (p) {
        return p.id === id;
    });

    if (persona) {
        inputId.value = persona.id;
        inputCi.value = persona.ci;
        inputNombres.value = persona.nombres;
        inputApellidos.value = persona.apellidos;
        inputFecha.value = persona.fecha_nacimiento;
        inputTelefono.value = persona.telefono || '';

        tituloFormulario.textContent = 'Editar Persona (ID: ' + persona.id + ')';
        btnCancelar.style.display = 'inline-block';
        formPersona.scrollIntoView({ behavior: 'smooth' });
    }
}

function cancelarEdicion() {
    inputId.value = '';
    formPersona.reset();
    tituloFormulario.textContent = 'Registrar Persona';
    btnCancelar.style.display = 'none';
}

async function guardarPersona(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const id = inputId.value;

    const datosPersona = {
        ci: inputCi.value,
        nombres: inputNombres.value,
        apellidos: inputApellidos.value,
        fecha_nacimiento: inputFecha.value,
        telefono: inputTelefono.value || null
    };

    const metodo = id ? 'PUT' : 'POST';
    const url = id ? URL_API + '/personas/' + id : URL_API + '/personas';

    try {
        const respuesta = await fetch(url, {
            method: metodo,
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(datosPersona)
        });

        const resultado = await respuesta.json();

        if (respuesta.ok) {
            cancelarEdicion();
            cargarPersonas();
            alert('Datos guardados correctamente');
        } else {
            alert(resultado.message || 'Error al guardar los datos');
        }
    } catch (error) {
        alert('Error en la petición al servidor');
    }
}

async function eliminarPersona(id) {
    const confirmar = confirm('¿Está seguro de eliminar esta persona?');
    if (!confirmar) {
        return;
    }

    const token = localStorage.getItem('token');

    try {
        const respuesta = await fetch(URL_API + '/personas/' + id, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Accept': 'application/json'
            }
        });

        const resultado = await respuesta.json();

        if (respuesta.ok) {
            cargarPersonas();
        } else {
            alert(resultado.message || 'Error al eliminar');
        }
    } catch (error) {
        alert('Error al conectar con el servidor');
    }
}
