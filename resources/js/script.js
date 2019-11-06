/***TUTORIAL JQUERY RAPIDE**/
jQuery(document).ready(function(){
   /*fonction à appeler quand la page est chargé $(document) est notre page*/ 
    $('h1').click(function(){
    /*$(this) ici est l'élément selectionné juste avant*/
    /*on peut appeler un css à partir de jquery et changer le css à la volée*/
    $(this).css('background-color','#FF0000')
    })
    
});