/***TUTORIAL JQUERY RAPIDE**/
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
});