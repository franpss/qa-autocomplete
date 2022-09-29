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
        }

        else if ($(this).data("uiAutocomplete").selectedItem.value != null){
            validInput = true;
            hideError(this)
        }

    })
    if (validInput){
        getResults();
    }
 
}

function hideError(input){
    $(input).removeClass("error"); 
    $(input).popover('hide');
}

function showError(input, lang){
    $(input).addClass("error");
    $(input).popover({
        content: messagesData["missing-input-error"][lang], 
        placement: "bottom", 
        trigger: 'focus'}).popover('show');
}