$(function() {
  // clear input errors on focus
  $("#locator input[type=text]").focus(function() {
    $(this).parent().removeClass("error");
    $(this).next().css("display", "none");
  });

  // validation
  var latitude = new RegExp('^-?(?:90(?:(?:\\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\\.[0-9]{1,6})?))$');
  var longitude = new RegExp('^-?(?:180(?:(?:\\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\\.[0-9]{1,6})?))$');

  $("#locator input[type=text]").blur(function() {
    var errorCount = 0;

    if ($(this).hasClass("required")) {
      if ($(this).val() == "" || $(this).val().length == 0 || $(this).val().length == null) {
        $(this).parent().addClass("error");
        $(this).next(".help").css("display", "inline-block");
        $(this).next(".help").text("Required");
      } else {
        if ($(this).hasClass("latitude")) {
          if (latitude.exec($(this).val()) == null) {
            $(this).parent().addClass("error");
            $(this).next(".help").css("display", "inline-block");
            $(this).next(".help").text("-90.000000 to 90.000000");
          }
        }

        if ($(this).hasClass("longitude")) {
          if (longitude.exec($(this).val()) == null) {
            $(this).parent().addClass("error");
            $(this).next(".help").css("display", "inline-block");
            $(this).next(".help").text("-180.000000 to 180.000000");
          }
        }

        if ($(this).hasClass("num")) {
          if (isNaN($(this).val())) {
            $(this).parent().addClass("error");
            $(this).next(".help").css("display", "inline-block");
            $(this).next(".help").text("Must be a Number");
          }
        }
      }
    }

    // loop through inputs to see if there are errors
    $("#locator input[type=text]").each(function() {
      if ($(this).parent().hasClass("error") || $(this).val() == "" || $(this).val().length == 0 || $(this).val().length == null) {
        errorCount++;
      }
    });

    // if no errors enable button, else disable it
    if (errorCount == 0) {
      $('button[type="submit"]').removeAttr('disabled');
      $('button[type="submit"]').prop('disabled', false);
    } else {
      $('button[type="submit"]').prop('disabled', true);
    }
  });
});