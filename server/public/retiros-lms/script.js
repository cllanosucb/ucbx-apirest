const site = [
    {
        id: 1,
        url: 'https://lms.ucb.edu.bo',
        token: '4de124cb7039666b29aa170df43864d5'
    },
    {
        id: 2,
        url: 'https://pglms.ucb.edu.bo',
        token: '2d47186ddbf04b8418fb8dbb569844a9'
    }
]

let idCursoLms = null;

let listaRetiros = null;

let cantEstudiantesLMS = null;

const nameFunctionLMS = {
    'obtenerCurso': 'core_course_get_courses_by_field',
    'obtenerEstudiantesPorCurso': 'core_enrol_get_enrolled_users',
    'retirarEstudiantePorCurso': 'enrol_manual_unenrol_users'
}

$("#tipoPrograma").on("change", function () {
    var tipoPrograma = $('#tipoPrograma').val()
    console.log('tipoPrograma', tipoPrograma);
    console.log('data site', site.find(s => s.id === parseInt(tipoPrograma)));
});

async function httpPeticion(typeMethod, url) {
    try {
        const response = await fetch(url, {
            method: typeMethod
        });

        if (!response.ok) {
            throw new Error('Error en la petición');
        }

        const data = await response.json();
        
        return data; // Devolver los datos obtenidos
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

$('#idParalelo').on('change', function () {
    var idParalelo = $('#idParalelo').val().trim();
    console.log('idParalelo', '--'+idParalelo+'--');    
    if(idParalelo === '') {
        invalidStyle('IdParalelo');
    } else {
        validStyle('IdParalelo');
    }
})

function validStyle(id) {
    $("#valid" + id).css({ 'display': 'block' });
    $("#invalid" + id).css({ 'display': 'none' });
}

function invalidStyle(id) {
    $("#valid" + id).css({ 'display': 'none' });
    $("#invalid" + id).css({ 'display': 'block' });
}

function loadingStyle(id, display) {
    $("#loading" + id).css({ 'display': display });
}

function pRetirosStyle(id, display) {
    $("#" + id).css({ 'display': display });
}

async function recuperarCurso() {
    $('#respuestaCurso').html('');
    var tipoPrograma = parseInt($('#tipoPrograma').val());
    var idParalelo = $('#idParalelo').val().trim();
    var tipoParalelo = $('#tipoParalelo').val();
    
    if(idParalelo === '') {
        invalidStyle('IdParalelo');
        return;
    }

    loadingStyle('rCurso', 'block');
    
    const listaCursos = await getCursoLms(idParalelo, tipoPrograma);

    console.log('cursos', listaCursos); 


    const curso = listaCursos.find(c => {
        return c.idnumber === idParalelo && c.customfields.find(cd => cd.name === 'teorico' && cd.value === tipoParalelo);
    });

    console.log('curso', curso);  
    
    if(curso === undefined) {
        $('#respuestaCurso').html(
            '<p class="font-medium">No se encontró ningún curso que coincida con el identificador</p>'
        );
        loadingStyle('rCurso', 'none');
        return;
    }

    idCursoLms = curso.id;
    
    $('#respuestaCurso').html(
        '<p class= "font-medium"><b>DATOS DEL CURSO:</b></p>'+
        '<p class="text-muted-foreground"><b>ID CURSO: </b>' + curso.id + '</p>'+
        '<p class="text-muted-foreground"><b>IDENTIFICADOR NUMÉRICO: </b>' + curso.idnumber + '</p>'+
        '<p class="text-muted-foreground"><b>NOMBRE DE CURSO: </b>' + curso.fullname + '</p>'+
        '<p class="text-muted-foreground"><b>NOMBRE CORTO DE CURSO: </b>' + curso.shortname + '</p>'+
        '<p class="text-muted-foreground"><b>CATEGORÍA DE CURSO: </b>' + curso.categoryname + '</p>'
    );
    
    loadingStyle('rCurso', 'none');

}

async function getCursoLms(idParalelo, tipoPrograma) {
    var siteData = site.find(s => s.id === tipoPrograma);

    const url = new URL(siteData.url + '/webservice/rest/server.php');

    url.searchParams.append('wstoken', siteData.token);
    url.searchParams.append('wsfunction', nameFunctionLMS.obtenerCurso);
    url.searchParams.append('moodlewsrestformat', 'json');
    url.searchParams.append('field', 'idnumber');
    url.searchParams.append('value', idParalelo);

    console.log('url', url);

    const resultado = await httpPeticion('GET', url);

    if (resultado) {
        console.log('Datos recibidos curso:', resultado);
        return resultado.courses;
    } else {
        console.log('No se obtuvieron datos.');
    }
}

async function retirosPorCurso() {
    $('#respuestaRetiro1').html('');
    var tipoPrograma = parseInt($('#tipoPrograma').val());
    var idParalelo = $('#idParalelo').val().trim();
    var tipoParalelo = $('#tipoParalelo').val();
    var listaEstudianteSIAAN = $('#listaEstudiante').val().trim();
    
    if (idParalelo === '') {
        invalidStyle('IdParalelo');
    }
    
    if (listaEstudianteSIAAN === '') {
        invalidStyle('ListaEstudiante');
        return;
    }
    
    //console.log('listaEstudianteSIAAN', listaEstudianteSIAAN);
    console.log('listaEstudianteSIAAN', JSON.parse(listaEstudianteSIAAN).datos[0]);
    console.log('listaEstudianteSIAAN', JSON.parse(listaEstudianteSIAAN).datos[0].emailInstitucional);
    const dataSiaan = JSON.parse(listaEstudianteSIAAN);

    loadingStyle('Retiro', 'block');

    if(idCursoLms === null) {
        const listaCursos = await getCursoLms(idParalelo, tipoPrograma)

        const curso = listaCursos.find(c => {
            return c.idnumber === idParalelo && c.customfields.find(cd => cd.name === 'teorico' && cd.value === tipoParalelo);
        });

        if(curso === undefined) {
            $('#respuestaRetiro1').html(
                '<p class="font-medium">No se encontró ningún curso que coincida con el identificador</p>'
            );
            return;
        }

        idCursoLms = curso.id;
    }

    console.log('idCursoLms', idCursoLms);    
    
    const listaEstudiantesLMS = await getListaEstudiantesPorCursoLms(idParalelo, tipoPrograma, idCursoLms);

    cantEstudiantesLMS = listaEstudiantesLMS.length;

    listaRetiros = estudiantesRetirar(dataSiaan.datos, listaEstudiantesLMS);
    console.log('listaRetiros', listaRetiros);

    var htmlRetiro = '<p class= "font-medium"><b>DATOS DE ESTUDIANTES A RETIRAR:</b></p>'+
        '<p class= "font-medium">Se retirara a '+listaRetiros.length+' estudiante(s).</p>';
    listaRetiros.map(e => {

        let htmlRoles = '';
        e.roles.map(r => {
            htmlRoles = htmlRoles + 
                '<p class="card-text"><b>ROL ID: </b>' + r.roleid + '</p>' +
                '<p class="card-text"><b>ROL: </b>' + r.shortname + '</p>';
        })

        htmlRetiro = htmlRetiro +
                    '<div class="card">'+
                    '<div class="card-body" style="font-size: 12px;">'+
                    '<p class="card-text"><b>ID USUARIO: </b>' +e.id+ '</p>'+
                    '<p class="card-text"><b>IDENTIFICADOR DE USUARIO: </b>' + e.idnumber + '</p>' +
                    '<p class="card-text"><b>NOMBRE COMPLETO: </b>' + e.fullname + '</p>' +
                    '<p class="card-text"><b>EMAIL: </b>' + e.email + '</p>' +
                    '<p class="card-text"><b>USER NAME: </b>' + e.username + '</p>'+ 
                    htmlRoles +
                    '</div>'
    });

    $('#respuestaRetiro1').html(htmlRetiro + '</div>');


    loadingStyle('Retiro', 'none');

    pRetirosStyle('pRetiros', 'inline');

}


async function getListaEstudiantesPorCursoLms(idParalelo, tipoPrograma, idCurso) {
    var siteData = site.find(s => s.id === tipoPrograma);

    const url = new URL(siteData.url + '/webservice/rest/server.php');

    url.searchParams.append('wstoken', siteData.token);
    url.searchParams.append('wsfunction', nameFunctionLMS.obtenerEstudiantesPorCurso);
    url.searchParams.append('moodlewsrestformat', 'json');
    url.searchParams.append('courseid', idCurso);

    console.log('url', url);

    const resultado = await httpPeticion('GET', url);

    if (resultado) {
        console.log('Datos recibidos lista estudiante por curso:', resultado);
        return resultado;
    } else {
        console.log('No se obtuvieron datos.');
    }
}


function estudiantesRetirar(listaSIAAN, listaLMS) {
    // Obtener los emails de la Lista 1
    const emailsListaSIAAN = listaSIAAN.map(item => item.emailInstitucional);

    // Filtrar la Lista 2
    const listaRetiros = listaLMS.filter(item => {
        // Verificar que el email no esté en la Lista 1
        const emailNoEstaEnListaSIAAN = !emailsListaSIAAN.includes(item.email);

        // Verificar que el usuario tenga el rol de "student"
        const tieneRolDeStudent = item.roles.some(role => role.shortname === 'student');

        // Retornar solo si ambas condiciones se cumplen
        return emailNoEstaEnListaSIAAN && tieneRolDeStudent;
    });

    //console.log('listaRetiros', listaRetiros);
    return listaRetiros;
}


async function procesarRetirosPorCurso() {
    var tipoPrograma = parseInt($('#tipoPrograma').val());
    var listaEstudianteSIAAN = $('#listaEstudiante').val().trim();
    const dataSiaan = JSON.parse(listaEstudianteSIAAN);
    console.log('procesarRetirosPorCurso');
    console.log('lista estudiantes a retirar', listaRetiros);
    console.log('identificador curso', idCursoLms);

    const listaRetirosId = listaRetiros.map(r => {
        return r.id;
    })

    console.log('listaRetirosId', listaRetirosId);

    loadingStyle('Retiro', 'block');

    const respuesta = await retirarEstudiantesPorCursoLms(tipoPrograma, idCursoLms, listaRetirosId);

    let cantEst = parseInt(cantEstudiantesLMS) -1;

    const htmlRespuestaRetiro = 
        '<p class= "font-medium">El curso en LMS tenia ' + cantEst + ' estudiante(s).</p>'+
        '<p class= "font-medium">Se retiro a ' + listaRetiros.length + ' estudiante(s).</p>'+
        '<p class= "font-medium">Ahora se tiene ' + dataSiaan.datos.length + ' estudiante(s) en el curso de LMS.</p>';

        
    if(respuesta !== null) {
        console.log('No se pudo realizar el retiro de estudiantes por curso.');
        loadingStyle('Retiro', 'none');
        $('#respuestaRetiro2').html('<p class= "font-medium">No se pudo realizar el retiro de estudiantes.</p>');
        return;
    }
        
    loadingStyle('Retiro', 'none');
    $('#respuestaRetiro2').html(htmlRespuestaRetiro);

}

async function retirarEstudiantesPorCursoLms(tipoPrograma, idCurso, listaRetirosId) {
    var siteData = site.find(s => s.id === tipoPrograma);

    const url = new URL(siteData.url + '/webservice/rest/server.php');

    url.searchParams.append('wstoken', siteData.token);
    url.searchParams.append('wsfunction', nameFunctionLMS.retirarEstudiantePorCurso);
    url.searchParams.append('moodlewsrestformat', 'json');
    for (let i = 0; i < listaRetirosId.length; i++) {
        url.searchParams.append('enrolments['+i+'][courseid]', idCurso);
        url.searchParams.append('enrolments['+i+'][userid]', listaRetirosId[i]);
    }

    console.log('url', url);

    const resultado = await httpPeticion('POST', url);

    console.log('Datos recibidos retiro estudiante por curso:', resultado);

    return resultado;
    /* if (resultado) {
        console.log('Datos recibidos retiro estudiante por curso:', resultado);
        return resultado;
    } else {
        console.log('No se obtuvieron datos.');
    } */
}

function reload() {
    location.reload();
}