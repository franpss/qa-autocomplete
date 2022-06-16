const $source = document.querySelector('#source');
const $result = document.querySelector('#result');
const typeHandler = function(e) {
    $result.innerHTML = e.target.value;
    console.log(e.target.value);
    
    $.ajax({
        url: "/pipe",
        type : 'POST',
        cache: false,
        data:{'data': e.target.value},
        success: function(html)
        {
            var myList = [];
            for(var i = 0; i < html.search.length; i++)
            {
                myList.push({"label": html.search[i].label,
                "value": html.search[i].id})
            }
            $("#source").autocomplete({
                source: myList,
                "focus": function (event, ui) {
                    $(event.target).val(ui.item.label);
                    return false;
                },
                "select": function( event, ui ) { 
                    $(event.target).val(ui.item.label);
                    window.location = "/wikibase_results/" + ui.item.value;
                    return false;
                }
            })
        }
     })
    }
    
    
$source.addEventListener('input', typeHandler) // register for oninput
$source.addEventListener('propertychange', typeHandler) // for IE8

