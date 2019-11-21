/***Code pour l'apparition du sticky navigation**/
$(document).ready(function(){
 
    //**sticky navigation**/
 $('.js--section-features').waypoint(
     function(direction){
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
    
    // Select all links with hashes
$('a[href*="#"]')
  // Remove links that don't actually link to anything
  .not('[href="#"]')
  .not('[href="#0"]')
  .click(function(event) {
    // On-page links
    if (
      location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') 
      && 
      location.hostname == this.hostname
    ) {
      // Figure out element to scroll to
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      // Does a scroll target exist?
      if (target.length) {
        // Only prevent default if animation is actually gonna happen
        event.preventDefault();
        $('html, body').animate({
          scrollTop: target.offset().top
        }, 1000, function() {
          // Callback after animation
          // Must change focus!
          var $target = $(target);
          $target.focus();
          if ($target.is(":focus")) { // Checking if the target was focused
            return false;
          } else {
            $target.attr('tabindex','-1'); // Adding tabindex for elements not focusable
            $target.focus(); // Set focus again
          };
        });
      }
    }
  });
    
/** animate box*/
$('.js--wp-featurebox').waypoint(
    function(direction){
        $('.js--wp-featurebox').addClass('animated fadeIn');
    },
    {
        offset:'50%'
    }
);

/*step box formation*/
$('.js--wp-step-box').waypoint(
    function(direction){
        $('.js--wp-step-box').addClass('animated fadeInUp');
    },
    {
        offset:'50%'
    }
);
    
/**step box responsable**/
$('.js--responsable-images').waypoint(
    function(direction){
        $('.js--responsable-images').addClass('animated fadeIn');
    },
    {
        offset:'50%'
    }
);
});