"use strict";(self.webpackChunksakai=self.webpackChunksakai||[]).push([[854],{3854:(je,f,o)=>{o.r(f),o.d(f,{GestionarAsignaturaPostgradoModule:()=>ke});var i=o(6019),l=o(9870),e=o(3668),Z=o(5835);let h=(()=>{class t{constructor(){this.activeIndex=1}ngOnInit(){this.items=[{label:"Cargar Datos Asignaturas",routerLink:"cargar"},{label:"Registrar Docentes",routerLink:"crearDocentes"},{label:"Registar Plantillas",routerLink:"crearPlantillas"},{label:"Registar Paralelos",routerLink:"crearParalelos"},{label:"Asignar Docentes Paralelos",routerLink:"asignarDocentes"}]}}return t.\u0275fac=function(a){return new(a||t)},t.\u0275cmp=e.Xpm({type:t,selectors:[["app-ga-asignaturas"]],decls:3,vars:2,consts:[[1,"card"],[3,"model","readonly"]],template:function(a,r){1&a&&(e.TgZ(0,"div",0),e._UZ(1,"p-steps",1),e.qZA(),e._UZ(2,"router-outlet")),2&a&&(e.xp6(1),e.Q6J("model",r.items)("readonly",!0))},directives:[Z.R,l.lC],styles:[""]}),t})();var T=o(7525),d=o(2017),p=o(7031),g=o(481),v=o(5286),_=o(8344),A=o(3414),x=o(7537),D=o(7345),m=o(1070),u=o(4750);function b(t,s){1&t&&e._uU(0," Cargar Datos Asignaturas Postgrado ")}function G(t,s){1&t&&e._uU(0," Debe subir un archivo Excel con una hoja que debe contener la lista de paralelos de la gesti\xf3n correspondiente. Luego debe seleccionar el semestre correspondiente y proceder con el cargado de datos. ")}function P(t,s){if(1&t){const a=e.EpF();e.TgZ(0,"div",11),e.TgZ(1,"div",12),e.TgZ(2,"h5"),e._uU(3,"Seleccione el Semestre"),e.qZA(),e.TgZ(4,"p-selectButton",13),e.NdJ("onChange",function(n){return e.CHM(a),e.oxw(2).selectSemestre(n)})("ngModelChange",function(n){return e.CHM(a),e.oxw(2).valSelect1=n}),e.qZA(),e.qZA(),e.TgZ(5,"div",12),e.TgZ(6,"h5"),e._uU(7,"Subir Archivo"),e.qZA(),e.TgZ(8,"p-fileUpload",14),e.NdJ("uploadHandler",function(n){return e.CHM(a),e.oxw(2).subir(n)}),e.qZA(),e.qZA(),e.qZA()}if(2&t){const a=e.oxw(2);e.xp6(4),e.Q6J("options",a.listSemestres)("ngModel",a.valSelect1)}}function q(t,s){1&t&&(e.TgZ(0,"div"),e._UZ(1,"p-progressSpinner",10),e.TgZ(2,"p",10),e._uU(3," Cargando... "),e.qZA(),e.qZA())}function N(t,s){if(1&t&&(e.TgZ(0,"p"),e._uU(1),e.ALo(2,"json"),e.qZA()),2&t){const a=e.oxw(4);e.xp6(1),e.hij(" ",e.lcZ(2,1,a.error.error.error)," ")}}function Y(t,s){if(1&t&&(e._UZ(0,"i",17),e.TgZ(1,"div",18),e.TgZ(2,"p"),e._uU(3),e.qZA(),e.YNc(4,N,3,3,"p",6),e.qZA()),2&t){const a=e.oxw(3);e.xp6(3),e.Oqu(a.error.error.msg),e.xp6(1),e.Q6J("ngIf",null!=a.error.error.error)}}function U(t,s){1&t&&(e.TgZ(0,"p-messages",15),e.YNc(1,Y,5,2,"ng-template",16),e.qZA())}function y(t,s){if(1&t&&(e._UZ(0,"i",17),e.TgZ(1,"div",18),e.TgZ(2,"p"),e._uU(3),e.qZA(),e.TgZ(4,"p"),e._uU(5),e.ALo(6,"json"),e.qZA(),e.qZA()),2&t){const a=e.oxw(3);e.xp6(3),e.Oqu(a.success.data.msg),e.xp6(2),e.Oqu(e.lcZ(6,2,a.success.data.data))}}function J(t,s){1&t&&(e.TgZ(0,"p-messages",19),e.YNc(1,y,7,4,"ng-template",16),e.qZA())}const I=function(){return{width:"30vw"}},S=function(){return{"960px":"75vw"}};function k(t,s){if(1&t){const a=e.EpF();e.YNc(0,P,9,2,"div",5),e.YNc(1,q,4,0,"div",6),e.YNc(2,U,2,0,"p-messages",7),e.YNc(3,J,2,0,"p-messages",8),e.TgZ(4,"p-dialog",9),e.NdJ("visibleChange",function(n){return e.CHM(a),e.oxw().display=n}),e.TgZ(5,"div"),e._UZ(6,"p-progressSpinner",10),e.TgZ(7,"p",10),e._uU(8," Cargando... "),e.qZA(),e.qZA(),e.qZA()}if(2&t){const a=e.oxw();e.Q6J("ngIf",!a.loading&&!a.errorDatos),e.xp6(1),e.Q6J("ngIf",a.loading),e.xp6(1),e.Q6J("ngIf",a.errorDatos),e.xp6(1),e.Q6J("ngIf",a.successDatos),e.xp6(1),e.Akn(e.DdM(8,I)),e.Q6J("visible",a.display)("breakpoints",e.DdM(9,S))}}function j(t,s){if(1&t){const a=e.EpF();e.TgZ(0,"div",20),e.TgZ(1,"p-button",21),e.NdJ("onClick",function(){return e.CHM(a),e.oxw().nextPage()}),e.qZA(),e.qZA()}if(2&t){const a=e.oxw();e.xp6(1),e.Q6J("disabled",a.btnActive)}}let w=(()=>{class t{constructor(a,r,n){this.router=a,this.semestresService=r,this.cursosService=n,this.error={ok:!1,error:{msg:"No existen datos para agregar",err:null}},this.successDatos=!1,this.loading=!0,this.errorDatos=!1,this.btnActive=!0,this.display=!1}ngOnInit(){this.getSemestres()}getSemestres(){this.semestresService.getSemestresActivos().subscribe(a=>{this.loading=!1,this.listSemestres=this.transformarDatosSemestre(a.data)},a=>{this.errorDatos=!0,this.loading=!1,this.error=a})}transformarDatosSemestre(a){let r=[];return a.forEach(n=>{2==n.tipo&&r.push({id_periodo_academico:n.id_periodo_academico,resumido:n.resumido,id_regional:n.id_regional,sigla_regional:n.sigla_regional,nombre_regional:n.nombre_regional,name:`[${n.resumido} - ${n.descripcion}] - ${n.nombre_regional}`})}),r}selectSemestre(a){this.asemestre=a.value,this.btnActive=!1}nextPage(){localStorage.setItem("semestre",JSON.stringify(this.asemestre)),this.router.navigate(["index/gestionarAsignaturas/postgrado/crearDocentes"])}subir(a){this.display=!0;const r=a.files[0];console.log(r);let n=new FormData;n.append("archivo",r,r.name),this.cursosService.subirArchivoPostgrado(n).subscribe(c=>{this.success=c,this.successDatos=!0,this.display=!1},c=>{this.errorDatos=!0,this.loading=!1,this.error=c,this.display=!1})}}return t.\u0275fac=function(a){return new(a||t)(e.Y36(l.F0),e.Y36(T.j),e.Y36(d.Z))},t.\u0275cmp=e.Xpm({type:t,selectors:[["app-ga-cargar"]],decls:6,vars:0,consts:[[1,"steps-curso-content"],["pTemplate","title"],["pTemplate","subtitle"],["pTemplate","content"],["pTemplate","footer"],["class","grid",4,"ngIf"],[4,"ngIf"],["severity","error",4,"ngIf"],["severity","success",4,"ngIf"],["header","Dialog","modal","modal","closable","false","closeOnEscape","false","showEffect","fade",3,"visible","breakpoints","visibleChange"],[1,"grid","grid-nogutter","justify-content-center"],[1,"grid"],[1,"col-12"],["optionLabel","name",3,"options","ngModel","onChange","ngModelChange"],["name","fileData","customUpload","true","fileLimit","1","multiple","multiple","accept",".xlsx,.xls","chooseLabel","Buscar Archivo","uploadLabel","Subir Archivo","cancelLabel","Cancelar",3,"uploadHandler"],["severity","error"],["pTemplate",""],[1,"pi","pi-times-circle",2,"font-size","1.5rem"],[1,"ml-2"],["severity","success"],[1,"grid","grid-nogutter","justify-content-end"],["label","Next","icon","pi pi-angle-right","iconPos","right",3,"disabled","onClick"]],template:function(a,r){1&a&&(e.TgZ(0,"div",0),e.TgZ(1,"p-card"),e.YNc(2,b,1,0,"ng-template",1),e.YNc(3,G,1,0,"ng-template",2),e.YNc(4,k,9,10,"ng-template",3),e.YNc(5,j,2,1,"ng-template",4),e.qZA(),e.qZA())},directives:[p.Z,g.jx,i.O5,v.V,_.G,A.UN,x.JJ,x.On,D.p,m.V,u.zx],pipes:[i.Ts],styles:[""]}),t})();var C=o(6744);function Q(t,s){1&t&&e._uU(0," Registrar Docentes ")}function O(t,s){1&t&&e._uU(0," Este apartado permite crear docentes en la plataforma NEO en el caso de no existir la cuenta. ")}function B(t,s){1&t&&(e.TgZ(0,"div"),e._UZ(1,"p-progressSpinner",8),e.TgZ(2,"p",8),e._uU(3," Registrando Datos Espere... "),e.qZA(),e.qZA())}function M(t,s){if(1&t&&(e.TgZ(0,"p"),e._uU(1),e.ALo(2,"json"),e.qZA()),2&t){const a=e.oxw(4);e.xp6(1),e.hij(" ",e.lcZ(2,1,a.error.error.err)," ")}}function L(t,s){if(1&t&&(e.TgZ(0,"p"),e._uU(1),e.ALo(2,"json"),e.qZA()),2&t){const a=e.oxw(4);e.xp6(1),e.hij(" ",e.lcZ(2,1,a.error.error.error)," ")}}function F(t,s){if(1&t&&(e._UZ(0,"i",11),e.TgZ(1,"div",12),e.TgZ(2,"p"),e._uU(3),e.qZA(),e.YNc(4,M,3,3,"p",5),e.YNc(5,L,3,3,"p",5),e.qZA()),2&t){const a=e.oxw(3);e.xp6(3),e.Oqu(a.error.error.msg),e.xp6(1),e.Q6J("ngIf",null!=a.error.error.err),e.xp6(1),e.Q6J("ngIf",null!=a.error.error.error)}}function E(t,s){1&t&&(e.TgZ(0,"p-messages",9),e.YNc(1,F,6,3,"ng-template",10),e.qZA())}function H(t,s){if(1&t&&(e._UZ(0,"i",11),e.TgZ(1,"div",12),e.TgZ(2,"p"),e._uU(3),e.qZA(),e.TgZ(4,"p"),e._uU(5),e.ALo(6,"json"),e.qZA(),e.qZA()),2&t){const a=e.oxw(3);e.xp6(3),e.Oqu(a.success.data.msg),e.xp6(2),e.Oqu(e.lcZ(6,2,a.success.data))}}function R(t,s){1&t&&(e.TgZ(0,"p-messages",13),e.YNc(1,H,7,4,"ng-template",10),e.qZA())}function z(t,s){if(1&t&&(e.YNc(0,B,4,0,"div",5),e.YNc(1,E,2,0,"p-messages",6),e.YNc(2,R,2,0,"p-messages",7)),2&t){const a=e.oxw();e.Q6J("ngIf",a.loading),e.xp6(1),e.Q6J("ngIf",a.errorDatos),e.xp6(1),e.Q6J("ngIf",a.successDatos)}}function V(t,s){if(1&t){const a=e.EpF();e.TgZ(0,"div",14),e.TgZ(1,"p-button",15),e.NdJ("onClick",function(){return e.CHM(a),e.oxw().prevPage()}),e.qZA(),e.TgZ(2,"p-button",16),e.NdJ("onClick",function(){return e.CHM(a),e.oxw().nextPage()}),e.qZA(),e.qZA()}if(2&t){const a=e.oxw();e.xp6(1),e.Q6J("disabled",a.btnActiveBack),e.xp6(1),e.Q6J("disabled",a.btnActive)}}function $(t,s){1&t&&e._uU(0," Registar Plantillas ")}function K(t,s){1&t&&e._uU(0," Este apartado permite crear plantillas faltantes para las diferentes asignaturas cargadas en al principio del proceso. ")}function W(t,s){1&t&&(e.TgZ(0,"div"),e._UZ(1,"p-progressSpinner",8),e.TgZ(2,"p",8),e._uU(3," Registrando Datos Espere... "),e.qZA(),e.qZA())}function ee(t,s){if(1&t&&(e.TgZ(0,"p"),e._uU(1),e.ALo(2,"json"),e.qZA()),2&t){const a=e.oxw(4);e.xp6(1),e.hij(" ",e.lcZ(2,1,a.error.error.err)," ")}}function te(t,s){if(1&t&&(e.TgZ(0,"p"),e._uU(1),e.ALo(2,"json"),e.qZA()),2&t){const a=e.oxw(4);e.xp6(1),e.hij(" ",e.lcZ(2,1,a.error.error.error)," ")}}function ae(t,s){if(1&t&&(e._UZ(0,"i",11),e.TgZ(1,"div",12),e.TgZ(2,"p"),e._uU(3),e.qZA(),e.YNc(4,ee,3,3,"p",5),e.YNc(5,te,3,3,"p",5),e.qZA()),2&t){const a=e.oxw(3);e.xp6(3),e.Oqu(a.error.error.msg),e.xp6(1),e.Q6J("ngIf",null!=a.error.error.err),e.xp6(1),e.Q6J("ngIf",null!=a.error.error.error)}}function se(t,s){1&t&&(e.TgZ(0,"p-messages",9),e.YNc(1,ae,6,3,"ng-template",10),e.qZA())}function re(t,s){if(1&t&&(e._UZ(0,"i",11),e.TgZ(1,"div",12),e.TgZ(2,"p"),e._uU(3),e.qZA(),e.TgZ(4,"p"),e._uU(5),e.ALo(6,"json"),e.qZA(),e.qZA()),2&t){const a=e.oxw(3);e.xp6(3),e.Oqu(a.success.data.msg),e.xp6(2),e.Oqu(e.lcZ(6,2,a.success.data))}}function ne(t,s){1&t&&(e.TgZ(0,"p-messages",13),e.YNc(1,re,7,4,"ng-template",10),e.qZA())}function oe(t,s){if(1&t&&(e.YNc(0,W,4,0,"div",5),e.YNc(1,se,2,0,"p-messages",6),e.YNc(2,ne,2,0,"p-messages",7)),2&t){const a=e.oxw();e.Q6J("ngIf",a.loading),e.xp6(1),e.Q6J("ngIf",a.errorDatos),e.xp6(1),e.Q6J("ngIf",a.successDatos)}}function ie(t,s){if(1&t){const a=e.EpF();e.TgZ(0,"div",14),e.TgZ(1,"p-button",15),e.NdJ("onClick",function(){return e.CHM(a),e.oxw().prevPage()}),e.qZA(),e.TgZ(2,"p-button",16),e.NdJ("onClick",function(){return e.CHM(a),e.oxw().nextPage()}),e.qZA(),e.qZA()}if(2&t){const a=e.oxw();e.xp6(1),e.Q6J("disabled",a.btnActiveBack),e.xp6(1),e.Q6J("disabled",a.btnActive)}}function le(t,s){1&t&&e._uU(0," Registar Paralelos ")}function pe(t,s){1&t&&e._uU(0," Este apartado permite crear los diferentes paralelos cargadas en al principio del proceso esta es en la que se inscribiran a los estudiantes. ")}function ge(t,s){1&t&&(e.TgZ(0,"div"),e._UZ(1,"p-progressSpinner",8),e.TgZ(2,"p",8),e._uU(3," Registrando Datos Espere... "),e.qZA(),e.qZA())}function _e(t,s){if(1&t&&(e.TgZ(0,"p"),e._uU(1),e.ALo(2,"json"),e.qZA()),2&t){const a=e.oxw(4);e.xp6(1),e.hij(" ",e.lcZ(2,1,a.error.error.err)," ")}}function me(t,s){if(1&t&&(e.TgZ(0,"p"),e._uU(1),e.ALo(2,"json"),e.qZA()),2&t){const a=e.oxw(4);e.xp6(1),e.hij(" ",e.lcZ(2,1,a.error.error.error)," ")}}function ue(t,s){if(1&t&&(e._UZ(0,"i",11),e.TgZ(1,"div",12),e.TgZ(2,"p"),e._uU(3),e.qZA(),e.YNc(4,_e,3,3,"p",5),e.YNc(5,me,3,3,"p",5),e.qZA()),2&t){const a=e.oxw(3);e.xp6(3),e.Oqu(a.error.error.msg),e.xp6(1),e.Q6J("ngIf",null!=a.error.error.err),e.xp6(1),e.Q6J("ngIf",null!=a.error.error.error)}}function de(t,s){1&t&&(e.TgZ(0,"p-messages",9),e.YNc(1,ue,6,3,"ng-template",10),e.qZA())}function fe(t,s){if(1&t&&(e._UZ(0,"i",11),e.TgZ(1,"div",12),e.TgZ(2,"p"),e._uU(3),e.qZA(),e.TgZ(4,"p"),e._uU(5),e.ALo(6,"json"),e.qZA(),e.qZA()),2&t){const a=e.oxw(3);e.xp6(3),e.Oqu(a.success.data.msg),e.xp6(2),e.Oqu(e.lcZ(6,2,a.success.data))}}function xe(t,s){1&t&&(e.TgZ(0,"p-messages",13),e.YNc(1,fe,7,4,"ng-template",10),e.qZA())}function Ce(t,s){if(1&t&&(e.YNc(0,ge,4,0,"div",5),e.YNc(1,de,2,0,"p-messages",6),e.YNc(2,xe,2,0,"p-messages",7)),2&t){const a=e.oxw();e.Q6J("ngIf",a.loading),e.xp6(1),e.Q6J("ngIf",a.errorDatos),e.xp6(1),e.Q6J("ngIf",a.successDatos)}}function Ze(t,s){if(1&t){const a=e.EpF();e.TgZ(0,"div",14),e.TgZ(1,"p-button",15),e.NdJ("onClick",function(){return e.CHM(a),e.oxw().prevPage()}),e.qZA(),e.TgZ(2,"p-button",16),e.NdJ("onClick",function(){return e.CHM(a),e.oxw().nextPage()}),e.qZA(),e.qZA()}if(2&t){const a=e.oxw();e.xp6(1),e.Q6J("disabled",a.btnActiveBack),e.xp6(1),e.Q6J("disabled",a.btnActive)}}function Te(t,s){1&t&&e._uU(0," Asignar Docentes Paralelos ")}function ve(t,s){1&t&&e._uU(0," Este apartado permite asignar docentes a sus diferentes paralelos creados en el anterior paso. ")}function Ae(t,s){1&t&&(e.TgZ(0,"div"),e._UZ(1,"p-progressSpinner",8),e.TgZ(2,"p",8),e._uU(3," Registrando Datos Espere... "),e.qZA(),e.qZA())}function De(t,s){if(1&t&&(e.TgZ(0,"p"),e._uU(1),e.ALo(2,"json"),e.qZA()),2&t){const a=e.oxw(4);e.xp6(1),e.hij(" ",e.lcZ(2,1,a.error.error.err)," ")}}function be(t,s){if(1&t&&(e.TgZ(0,"p"),e._uU(1),e.ALo(2,"json"),e.qZA()),2&t){const a=e.oxw(4);e.xp6(1),e.hij(" ",e.lcZ(2,1,a.error.error.error)," ")}}function Ge(t,s){if(1&t&&(e._UZ(0,"i",11),e.TgZ(1,"div",12),e.TgZ(2,"p"),e._uU(3),e.qZA(),e.YNc(4,De,3,3,"p",5),e.YNc(5,be,3,3,"p",5),e.qZA()),2&t){const a=e.oxw(3);e.xp6(3),e.Oqu(a.error.error.msg),e.xp6(1),e.Q6J("ngIf",null!=a.error.error.err),e.xp6(1),e.Q6J("ngIf",null!=a.error.error.error)}}function Pe(t,s){1&t&&(e.TgZ(0,"p-messages",9),e.YNc(1,Ge,6,3,"ng-template",10),e.qZA())}function qe(t,s){if(1&t&&(e._UZ(0,"i",11),e.TgZ(1,"div",12),e.TgZ(2,"p"),e._uU(3),e.qZA(),e.TgZ(4,"p"),e._uU(5),e.ALo(6,"json"),e.qZA(),e.qZA()),2&t){const a=e.oxw(3);e.xp6(3),e.Oqu(a.success.data.msg),e.xp6(2),e.Oqu(e.lcZ(6,2,a.success.data))}}function Ne(t,s){1&t&&(e.TgZ(0,"p-messages",13),e.YNc(1,qe,7,4,"ng-template",10),e.qZA())}function Ye(t,s){if(1&t&&(e.YNc(0,Ae,4,0,"div",5),e.YNc(1,Pe,2,0,"p-messages",6),e.YNc(2,Ne,2,0,"p-messages",7)),2&t){const a=e.oxw();e.Q6J("ngIf",a.loading),e.xp6(1),e.Q6J("ngIf",a.errorDatos),e.xp6(1),e.Q6J("ngIf",a.successDatos)}}function Ue(t,s){if(1&t){const a=e.EpF();e.TgZ(0,"div",14),e.TgZ(1,"p-button",15),e.NdJ("onClick",function(){return e.CHM(a),e.oxw().prevPage()}),e.qZA(),e.TgZ(2,"p-button",16),e.NdJ("onClick",function(){return e.CHM(a),e.oxw().nextPage()}),e.qZA(),e.qZA()}if(2&t){const a=e.oxw();e.xp6(1),e.Q6J("disabled",a.btnActiveBack),e.xp6(1),e.Q6J("disabled",a.btnActive)}}const ye=[{path:"",children:[{path:"postgrado",component:h,children:[{path:"",redirectTo:"cargar",pathMatch:"full"},{path:"cargar",component:w},{path:"crearDocentes",component:(()=>{class t{constructor(a,r){this.router=a,this.usuariosService=r,this.error={ok:!1,error:{msg:"No se selecciono ningun semestre para ejecutar la accion",err:null}},this.loading=!0,this.btnActive=!0,this.errorDatos=!1,this.successDatos=!1,this.btnActiveBack=!0}ngOnInit(){this.verificarDatos()}verificarDatos(){this.asemestre=JSON.parse(localStorage.getItem("semestre")||null),null==this.asemestre?(this.errorDatos=!0,this.loading=!1,this.btnActiveBack=!1):this.registrarDocentes()}registrarDocentes(){this.usuariosService.registrarDocentesPostgrado(this.asemestre.id_periodo_academico,this.asemestre.id_regional).subscribe(a=>{this.success=a,this.loading=!1,this.btnActive=!1,this.successDatos=!0},a=>{this.errorDatos=!0,this.loading=!1,this.error=a,this.btnActiveBack=!1})}prevPage(){this.router.navigate(["index/gestionarAsignaturas/postgrado/cargar"])}nextPage(){this.router.navigate(["index/gestionarAsignaturas/postgrado/crearPlantillas"])}}return t.\u0275fac=function(a){return new(a||t)(e.Y36(l.F0),e.Y36(C.J))},t.\u0275cmp=e.Xpm({type:t,selectors:[["app-ga-crear-docentes"]],decls:6,vars:0,consts:[[1,"steps-curso-content"],["pTemplate","title"],["pTemplate","subtitle"],["pTemplate","content"],["pTemplate","footer"],[4,"ngIf"],["severity","error",4,"ngIf"],["severity","success",4,"ngIf"],[1,"grid","grid-nogutter","justify-content-center"],["severity","error"],["pTemplate",""],[1,"pi","pi-times-circle",2,"font-size","1.5rem"],[1,"ml-2"],["severity","success"],[1,"grid","grid-nogutter","justify-content-end"],["label","Back","icon","pi pi-angle-left",3,"disabled","onClick"],["label","Next","icon","pi pi-angle-right","iconPos","right",3,"disabled","onClick"]],template:function(a,r){1&a&&(e.TgZ(0,"div",0),e.TgZ(1,"p-card"),e.YNc(2,Q,1,0,"ng-template",1),e.YNc(3,O,1,0,"ng-template",2),e.YNc(4,z,3,3,"ng-template",3),e.YNc(5,V,3,2,"ng-template",4),e.qZA(),e.qZA())},directives:[p.Z,g.jx,i.O5,_.G,m.V,u.zx],pipes:[i.Ts],styles:[""]}),t})()},{path:"crearPlantillas",component:(()=>{class t{constructor(a,r){this.router=a,this.cursosService=r,this.error={ok:!1,error:{msg:"No se selecciono ningun semestre para ejecutar la accion",err:null}},this.loading=!0,this.btnActive=!0,this.errorDatos=!1,this.successDatos=!1,this.btnActiveBack=!0}ngOnInit(){this.verificarDatos()}verificarDatos(){this.asemestre=JSON.parse(localStorage.getItem("semestre")||null),null==this.asemestre?(this.errorDatos=!0,this.loading=!1,this.btnActiveBack=!1):this.registrarPlantillas()}registrarPlantillas(){this.cursosService.crearPlantillasPostgrado(this.asemestre.id_periodo_academico,this.asemestre.id_regional).subscribe(a=>{this.success=a,this.loading=!1,this.btnActive=!1,this.successDatos=!0},a=>{this.errorDatos=!0,this.loading=!1,this.error=a,this.btnActiveBack=!1})}prevPage(){this.router.navigate(["index/gestionarAsignaturas/postgrado/cargar"])}nextPage(){this.router.navigate(["index/gestionarAsignaturas/postgrado/crearParalelos"])}}return t.\u0275fac=function(a){return new(a||t)(e.Y36(l.F0),e.Y36(d.Z))},t.\u0275cmp=e.Xpm({type:t,selectors:[["app-ga-crear-plantillas"]],decls:6,vars:0,consts:[[1,"steps-curso-content"],["pTemplate","title"],["pTemplate","subtitle"],["pTemplate","content"],["pTemplate","footer"],[4,"ngIf"],["severity","error",4,"ngIf"],["severity","success",4,"ngIf"],[1,"grid","grid-nogutter","justify-content-center"],["severity","error"],["pTemplate",""],[1,"pi","pi-times-circle",2,"font-size","1.5rem"],[1,"ml-2"],["severity","success"],[1,"grid","grid-nogutter","justify-content-end"],["label","Back","icon","pi pi-angle-left",3,"disabled","onClick"],["label","Next","icon","pi pi-angle-right","iconPos","right",3,"disabled","onClick"]],template:function(a,r){1&a&&(e.TgZ(0,"div",0),e.TgZ(1,"p-card"),e.YNc(2,$,1,0,"ng-template",1),e.YNc(3,K,1,0,"ng-template",2),e.YNc(4,oe,3,3,"ng-template",3),e.YNc(5,ie,3,2,"ng-template",4),e.qZA(),e.qZA())},directives:[p.Z,g.jx,i.O5,_.G,m.V,u.zx],pipes:[i.Ts],styles:[""]}),t})()},{path:"crearParalelos",component:(()=>{class t{constructor(a,r){this.router=a,this.cursosService=r,this.error={ok:!1,error:{msg:"No se selecciono ningun semestre para ejecutar la accion",err:null}},this.loading=!0,this.btnActive=!0,this.errorDatos=!1,this.successDatos=!1,this.btnActiveBack=!0}ngOnInit(){this.verificarDatos()}verificarDatos(){this.asemestre=JSON.parse(localStorage.getItem("semestre")||null),null==this.asemestre?(this.errorDatos=!0,this.loading=!1,this.btnActiveBack=!1):this.registrarParalelos()}registrarParalelos(){this.cursosService.crearParalelosPostgrado(this.asemestre.id_periodo_academico,this.asemestre.id_regional).subscribe(a=>{this.success=a,this.loading=!1,this.btnActive=!1,this.successDatos=!0},a=>{this.errorDatos=!0,this.loading=!1,this.error=a,this.btnActiveBack=!1})}prevPage(){this.router.navigate(["index/gestionarAsignaturas/postgrado/cargar"])}nextPage(){this.router.navigate(["index/gestionarAsignaturas/postgrado/asignarDocentes"])}}return t.\u0275fac=function(a){return new(a||t)(e.Y36(l.F0),e.Y36(d.Z))},t.\u0275cmp=e.Xpm({type:t,selectors:[["app-ga-crear-paralelos"]],decls:6,vars:0,consts:[[1,"steps-curso-content"],["pTemplate","title"],["pTemplate","subtitle"],["pTemplate","content"],["pTemplate","footer"],[4,"ngIf"],["severity","error",4,"ngIf"],["severity","success",4,"ngIf"],[1,"grid","grid-nogutter","justify-content-center"],["severity","error"],["pTemplate",""],[1,"pi","pi-times-circle",2,"font-size","1.5rem"],[1,"ml-2"],["severity","success"],[1,"grid","grid-nogutter","justify-content-end"],["label","Back","icon","pi pi-angle-left",3,"disabled","onClick"],["label","Next","icon","pi pi-angle-right","iconPos","right",3,"disabled","onClick"]],template:function(a,r){1&a&&(e.TgZ(0,"div",0),e.TgZ(1,"p-card"),e.YNc(2,le,1,0,"ng-template",1),e.YNc(3,pe,1,0,"ng-template",2),e.YNc(4,Ce,3,3,"ng-template",3),e.YNc(5,Ze,3,2,"ng-template",4),e.qZA(),e.qZA())},directives:[p.Z,g.jx,i.O5,_.G,m.V,u.zx],pipes:[i.Ts],styles:[""]}),t})()},{path:"asignarDocentes",component:(()=>{class t{constructor(a,r){this.router=a,this.usuariosService=r,this.error={ok:!1,error:{msg:"No se selecciono ningun semestre para ejecutar la accion",err:null}},this.loading=!0,this.btnActive=!0,this.errorDatos=!1,this.successDatos=!1,this.btnActiveBack=!0}ngOnInit(){this.verificarDatos()}verificarDatos(){this.asemestre=JSON.parse(localStorage.getItem("semestre")||null),null==this.asemestre?(this.errorDatos=!0,this.loading=!1,this.btnActiveBack=!1):this.asignarParalelosDocentes()}asignarParalelosDocentes(){this.usuariosService.asignarParalelosDocentesPostgrado(this.asemestre.id_periodo_academico,this.asemestre.id_regional).subscribe(a=>{this.success=a,this.loading=!1,this.btnActive=!1,this.successDatos=!0,localStorage.removeItem("semestre")},a=>{this.errorDatos=!0,this.loading=!1,this.error=a,this.btnActiveBack=!1,localStorage.removeItem("semestre")})}prevPage(){this.router.navigate(["index/gestionarAsignaturas/postgrado/cargar"])}nextPage(){localStorage.removeItem("semestre"),this.router.navigate(["index"])}}return t.\u0275fac=function(a){return new(a||t)(e.Y36(l.F0),e.Y36(C.J))},t.\u0275cmp=e.Xpm({type:t,selectors:[["app-ga-asignar-docente"]],decls:6,vars:0,consts:[[1,"steps-curso-content"],["pTemplate","title"],["pTemplate","subtitle"],["pTemplate","content"],["pTemplate","footer"],[4,"ngIf"],["severity","error",4,"ngIf"],["severity","success",4,"ngIf"],[1,"grid","grid-nogutter","justify-content-center"],["severity","error"],["pTemplate",""],[1,"pi","pi-times-circle",2,"font-size","1.5rem"],[1,"ml-2"],["severity","success"],[1,"grid","grid-nogutter","justify-content-end"],["label","Back","icon","pi pi-angle-left",3,"disabled","onClick"],["label","Salir","icon","pi pi-angle-right","iconPos","right",3,"disabled","onClick"]],template:function(a,r){1&a&&(e.TgZ(0,"div",0),e.TgZ(1,"p-card"),e.YNc(2,Te,1,0,"ng-template",1),e.YNc(3,ve,1,0,"ng-template",2),e.YNc(4,Ye,3,3,"ng-template",3),e.YNc(5,Ue,3,2,"ng-template",4),e.qZA(),e.qZA())},directives:[p.Z,g.jx,i.O5,_.G,m.V,u.zx],pipes:[i.Ts],styles:[""]}),t})()}]}]}];let Je=(()=>{class t{}return t.\u0275fac=function(a){return new(a||t)},t.\u0275mod=e.oAB({type:t}),t.\u0275inj=e.cJS({imports:[[l.Bz.forChild(ye)],l.Bz]}),t})();var Ie=o(9106),Se=o(4331);let ke=(()=>{class t{}return t.\u0275fac=function(a){return new(a||t)},t.\u0275mod=e.oAB({type:t}),t.\u0275inj=e.cJS({imports:[[i.ez,Je,Ie.K,Se.g]]}),t})()}}]);