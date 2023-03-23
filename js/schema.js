/******************* Basic Rules *******************/
// IF the item will be duplicated it must have an ID that ends in a #
// IF the duplicated item is a sub item of another duplicated item, it must have an ID with a #-# ending
// IF the duplicated item has a class attribute it must also have the same class as the ID
// IF the item has multiple classes, the last class must be the same as the ID because the code checks last class in set
// In the schema section use an empty space between span tags or .unwrap() wont remove the span before 
//  downloading the json schema file as there is no content to .unwrap() and the schema will have html elements in it
//To enable autofill of an element with the input of another element, give the receiving elem a class 
//  name equal to the ID of the sending elem

//Simple show and hide schema types
let checkList = document.getElementById('schema-list');
checkList.getElementsByClassName('anchor')[0].onclick = function(e) {
    e.stopPropagation();
    if (checkList.classList.contains('visible'))
        checkList.classList.remove('visible');
    else
        checkList.classList.add('visible');
}

/* Which schema to show */
$('#schema-list :checkbox')
    .change(function () {
        let boxname = $(this).val();
        $(`.${boxname}`).toggle(this.checked);
});

/* Dynamic schema form population */
$(document).ready(function(){
    $('form input').on("keyup change", function(e) {
        var fieldName = $(this).attr('id');
        var fieldVal = $(this).val();
        $(`.${fieldName}`).text(fieldVal);
        $(`.${fieldName}`).val(fieldVal);
    });
});

/* Clone paired form and schema items*/
$(document).on('click', '.cloneButton', function (e) {
    let formItemId = $(this).attr('data-form');
    let schemaItemId = $(this).attr('data-schema');
    //get the last DIV IDs
    let $elem = $(`span[id^=${formItemId}]:last`);
    let $elem2 = $(`span[id^=${schemaItemId}]:last`);
    //Read the number from that DIV's ID & increment by 1
    let thisNum = parseInt( $elem.prop("id").slice(-1))+1;
    //Clone it and assign the new ID
    let $clone = $elem.clone(true).prop('id', formItemId+thisNum );
    let $clone2 = $elem2.clone(true).prop('id', schemaItemId+thisNum )
    //Insert the cloned obj after the last like obj
    $elem.after( $clone );
    $elem2.after( $clone2 );
    //Change the cloned form attributes to reflect the current iteration number
    $(`#${formItemId}${thisNum}, #${schemaItemId}${thisNum}`).find('input, span, label').each(function(e) { 
        let thisId = $(this).attr('id');
        let thisClass = $(this).attr('class');
        let thisName = $(this).attr('name');
        let thisFor = $(this).attr('for');
        let thisForm = $(this).attr('data-form');
        let thisSchema = $(this).attr('data-schema');
        //Always give the first of the divs to be duplicated an ID ending in a number
        if (thisId && isNaN(thisId.slice(-1))) {
            //Dont do anything if it doenst end in a number
            return;
        } else if ((thisId && thisId.slice(-2,-1) === '-') || (thisClass && thisClass.slice(-2,-1) === '-')) {
            //If there is a - 2 from the end it is a duplicating div
            $(this).prop('value', '');
            if ($(this).hasClass('sub-dup')) {
                //If the item is duplicated within a duplicated object, just get the parent object numbers (thisCompleteNum)
                //Any additional sub-dup items that were added to the dom will be removed below
                let thisCompleteNum = $(this).parent().parent().attr('id').slice(-3);
                (typeof thisId !== 'undefined') && $(this).attr('id', thisId.slice(0,-3)+thisCompleteNum);
                (typeof thisClass !== 'undefined') && $(this).attr('class', thisClass.slice(0,-3)+thisCompleteNum);
                (typeof thisFor !== 'undefined') && $(this).attr('for', thisFor.slice(0,-3)+thisCompleteNum);
                (typeof thisName !== 'undefined') && $(this).attr("name", thisName.slice(0,-3)+thisCompleteNum);
            } else {
                //Otherwise give it iteration number dash 1
                (typeof thisId !== 'undefined') && $(this).attr('id', thisId.slice(0,-3)+thisNum+'-1');
                (typeof thisClass !== 'undefined') && $(this).attr("class", thisClass.slice(0,-3)+thisNum+'-1');
                (typeof thisFor !== 'undefined') && $(this).attr("for", thisFor.slice(0,-3)+thisNum+'-1');
                (typeof thisName !== 'undefined') && $(this).attr("name", thisName.slice(0,-3)+thisNum+'-1');
            }
        } else if ($(this).attr('type') === 'button' && thisForm.slice(-1) === '-') {
            $(this).attr('data-form', thisForm.slice(0,-2)+thisNum+'-');
            $(this).attr('data-schema', thisSchema.slice(0,-2)+thisNum+'-');
        } else {
            //Dasic duplication, just replace the end number with the current iteration
            if ($(this).attr('type') === 'button') {
                $(this).attr('data-form', thisForm.slice(0,-1)+thisNum);
                $(this).attr('data-schema', thisSchema.slice(0,-1)+thisNum);
            } else {
                $(this).prop('value', '');
                (typeof thisId !== 'undefined') && $(this).attr('id', thisId.slice(0,-1)+thisNum);
                (typeof thisClass !== 'undefined') && $(this).attr('class', thisClass.slice(0,-1)+thisNum);
                (typeof thisName !== 'undefined') && $(this).attr('name', thisName.slice(0,-1)+thisNum);
                (typeof thisFor !== 'undefined') && $(this).attr('for', thisFor.slice(0,-1)+thisNum);
            }
        }
        //Remove any duplicate divs
        $('[id="' + this.id + '"]:gt(0)').remove();
    });
    
    //For every duplicated form item there must be a duplicated schema item that is preceeded by a ','
    //  but only add the comma if there isnt one there already
    let obj = $(`#${schemaItemId}${thisNum}`);
    if(obj.html().slice(0,1) !== ',') {
        obj.prepend(',');
    };
    
});

/* Save the json file */
function downloadInnerHtml() {
    var dlHtml = "";
    $('.download').each(function(i, obj) {
        //Get rid of wrapping spans used to place text before downloading
        $('span').contents().unwrap(); 
        //First and last objects dont get commas
        if ($(obj).hasClass('dlnoshow')) {
            //second to last also doesnt get a comma because of static elements 
            if ($(obj).hasClass('final')){ 
                console.log(dlHtml);
                dlHtml = dlHtml.slice(0,-1);
            }
            //add the element to the download object
            dlHtml += $(obj).html();
        } else {
            //Only compile selected (visible) schema types
            if ($(obj).is(':visible')){dlHtml += $(obj).html() + ',';}
        }
    });
    //Basic file creation/download via encodeURIComponent
    document.getElementsByClassName('download').innerHTML;
    var link = document.createElement('a');
    link.setAttribute('download', $('#schema-filename').val() +'.json');
    link.setAttribute('href', 'data:' + 'application/json' + ';charset=utf-8,' + encodeURIComponent(dlHtml));
    link.click();
}
$('.dlicon').click(function() {
    downloadInnerHtml();
});