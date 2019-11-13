/***Code pour l'apparition du sticky navigation**/
$(document).ready(function(){
 $('.js--section-features').waypoint(function(direction){
     if(direction == "down"){
         $('nav').addClass('sticky');
     }
     else{
         $('nav').removeClass('sticky');
     }
 },{
     offset:'560px' // on peut donner en pixel
     //offset:'90%'
 });
 //** code pour rediriger la page lorsqu'on clique sur les boutons*/
    $(".js--scroll-to-plans").click(function(){
        alert("essai");
    });
});