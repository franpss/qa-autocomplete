function checkform()
{
    let lang =  $("#lang-select").val();
    let validInput = false;
    if ($('form#template-form').find('*[id*=entity]').length == 0) {
        validInput = true;
    }
    $('form#template-form').find('*[id*=entity]').each(function() {
        if ($(this).data("uiAutocomplete") == null || 
        $(this).data("uiAutocomplete").selectedItem == null)  {
            validInput = false;
            $(this).addClass("error");
            showError(this, lang);
            $(this).focus();
        }

        else if ($(this).data("uiAutocomplete").selectedItem.value != null){
            validInput = true;
            hideError(this)
        }

    })
    if (validInput){
        getResults();
    }
    return validInput
 
}

function hideError(input){
    $(input).removeClass("error"); 
    $(input).popover('hide');
}

function showError(input, lang){
    $(input).addClass("error");
    $(input).popover({
        content: messagesData["missing-input-error"][lang], 
        placement: "top"}).popover('show');
}