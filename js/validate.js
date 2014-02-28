$(function() {
  // clear errors
  function clearErrors(input) {
    $(input).parent().removeClass("error");
    $(input).next().css("display", "none");
  }

  // clear input errors on focus
  $("#locator input[type=text]").focus(function() {
    clearErrors(this);
  });

  // clear errors on reset
  $("#reset").click(function() {
    $("#locator input[type=text]").each(function() {
      clearErrors(this);
    });
  });

  function setErrors(input, message) {
    $(input).parent().addClass("error");
    $(input).next(".help").css("display", "inline-block");
    $(input).next(".help").text(message);
  }

  // validation on blur
  $("#locator input[type=text]").blur(function() {
    var validateInput = input(this); 
    if (validateInput.message() != null) {
      setErrors(this, validateInput.message());
    }
  });

  // validation on submit
  $("#search").click(function() {
    var errors = false;
    $("#locator input[type=text]").each(function() {
      var validateInput = input(this);
      if (validateInput.message() != null) {
        setErrors(this, validateInput.message());
        errors = true;
      } 
    });
    if (!errors) {
      $("#locator").submit();
    }
  });

  // the input object
  var input = function(theInput) {
    var latitudeExp = new RegExp('^-?(?:90(?:(?:\\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\\.[0-9]{1,6})?))$');
    var longitudeExp = new RegExp('^-?(?:180(?:(?:\\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\\.[0-9]{1,6})?))$');

    var required = function() {
      if ($(theInput).val() == "" || $(theInput).val().length == 0 || $(theInput).val().length == null) {
        return true;
      }
    };

    var num = function() {
      if (isNaN($(theInput).val())) {
        return true;
      }
    };

    var gtzero = function() {
      if (Number($(theInput).val()) <= 0) {
        return true;
      }
    };

    var ltzero = function() {
      if (Number($(theInput).val()) >= 0) {
        return true;
      }
    };

    var latitude = function() {
      if (latitudeExp.exec($(theInput).val()) == null) {
        return true;
      }
    };

    var longitude = function() {
      if (longitudeExp.exec($(theInput).val()) == null) {
        return true;
      }
    };

    var isValid = function() {
      var errorMessage = null;

      if ($(theInput).hasClass("required")) {
        if(required()) {
          errorMessage = 'Required';
          return errorMessage;
        }
      }

      if ($(theInput).hasClass("num")) {
        if(num()) {
          errorMessage = 'Must be a Number';
          return errorMessage;
        }
      }

      if ($(theInput).hasClass("gtzero")) {
        if(gtzero()) {
          errorMessage = 'Must be greater than 0';
          return errorMessage;
        }
      }

      if ($(theInput).hasClass("ltzero")) {
        if(ltzero()) {
          errorMessage = 'Must be a negative number';
          return errorMessage;
        }
      }

      if ($(theInput).hasClass("latitude")) {
        if(latitude()) {
          errorMessage = '-90.000000 to 90.000000';
          return errorMessage;
        }
      }

      if ($(theInput).hasClass("longitude")) {
        if(longitude()) {
          errorMessage = '-180.000000 to 180.000000';
          return errorMessage;
        }
      }

      return errorMessage;
    };

    // public
    return {
      message: isValid
    };
  } 
});