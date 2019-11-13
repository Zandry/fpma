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
        $('html, body').animate({scrollTop: $('.js--section-plans').offset().top}, 1000);
    });
    
    $(".js--scroll-to-start").click(function(){
        $('html, body').animate({scrollTop: $('.js--section-features').offset().top}, 1000);
    });
});