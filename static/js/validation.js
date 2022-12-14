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
            showError(this, messagesData["missing-input-error"][lang]);
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

function checkUpdateTempInput()
{
    var intRegex = /^\d+$/;
    let lang =  $("#lang-select").val();
    let input = $("#id-input").val()
    if (!intRegex.test(input) || !input) {
        showError($("#id-input"), messagesData["not-num-qid-input-error"][lang]);
        return false;
    }
    else {
        hideError($("#id-input"))
        window.location.href = "/update_template/Q" + input.toString()
        return true;
    }
        

}
function hideError(input){
    $(input).removeClass("error"); 
    $(input).popover('hide');
}

function showError(input, msg){
    $(input).addClass("error");
    $(input).popover({
        content: msg, 
        placement: "top"}).popover('show');
}