(function($){

$(function() {
  var $forms = $('form.signup-form').submit(function() {

    var $this = $(this),
        $signup = $this.closest('.signup'),
        valid = true,
        email = $this.find('.email').val();

    $('.error').empty().removeClass('error');

    if (!$.trim(email) || !email.match('@')) {
      valid = false;
    }

    if (valid) {
      $this.fadeTo(100, 0.5);

      $forms.replaceWith('<p class="thanks">Thanks for signing up -- we&rsquo;ll be in touch!</p>');
      $('.error-msg .inner, .extra-info').fadeOut();
      return true;
    }

    $signup.siblings('.error-msg').find('.inner')
      .text('Please provide your email address')
      .fadeIn();

    return false;
  });
});

}(jQuery));
