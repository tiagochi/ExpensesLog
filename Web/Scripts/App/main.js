

var tokenKey = 'accessToken';


function StartApplication() {
        
    

    $("#btnLoadExpenses").click(LoadExpensesStore);
    $("#btnLoadExpenses2").click(LoadExpensesStore);
    $("#btnAddExpenses").click(ShowModalExpense);
    $("#btnModalExpenseSave").click(ModalExpenseSave);

    $("#btnEraseFilters").click(EraseFilters);
    

    $("#btnPrintExpenses").click(PrintExpenses);
    $("#btnClosePrintExpenses").click(ClosePrintExpenses);
    

    $("#PrintHeader").hide();

    

    $("#barRegisterLink").click(ShowModalRegister);
    $("#barLoginLink").click(ShowModalLogin);
    $("#barUserNameLink").click(ShowModalSettings);
    $("#barLogoffLink").click(DoModalLogout);

    $("#btnModalLogin").click(DoModalLogin);
    $("#btnModalRegister").click(DoModalRegister);
    
    $("#btnModalSettings").click(DoModalSettings);



    $("#barExpensesLink").click(ShowExpensesCRUD);
    $("#barUsersLink").click(ShowUsersCRUD);

    $("#btnLoadUsers").click(LoadUsersStore);
    $("#btnAddUser").click(ShowEditUserRecord);
    $("#btnModalUserSave").click(ModalUserSave);
    

    if (sessionStorage.getItem(tokenKey) == null)
    {
        // show login
        EraseAllLoginData();
    } else {
        // get username, expenses count and revalidate token
        GetUserInfo();
        ShowExpensesCRUD();


    }


    


}


function GetUserInfo() {
    startLoading();
    $.ajax({
        type: 'GET',
        url: BASE_ROOT + 'api/Account/UserInfo',
        headers: { Authorization: 'Bearer ' + sessionStorage.getItem(tokenKey) },
        data: {}
    }).done(function (data) {

        // login ok
        $("#barDivLogin").hide();
        $("#barDivLogout").show();
        $("#barUserNameLink").html(data.Email);
        $("#barDivExpenses").show();

        isAdmin = data.UserType == "Admin";
        if (isAdmin) {
            $("#thUser").show();
            $("#barDivUser").show();
            $("#divSearchUsers").show();
            
        }
        else {
            $("#thUser").hide();
            $("#barDivUser").hide();
            $("#divSearchUsers").hide();
        }

        finishLoading();
        
    }).fail(ajaxError);
}

function ajaxError(jqXHR) {

    finishLoading();
    $('#errorAlert').show();
    var errorMessage = 'There was an error.'
    
    if (this.url != null)
        console.log(this.url + ' > ' + jqXHR.status + ': ' + jqXHR.statusText);
    else
        console.log(jqXHR.status + ': ' + jqXHR.statusText);

    if (jqXHR.status == 401) {
        EraseAllLoginData();
    }

    if (jqXHR.responseJSON != null) {
        console.log(errorMessage =  jqXHR.responseJSON.Message);
        for (var model in jqXHR.responseJSON.ModelState)
            for (var i = 0; i < jqXHR.responseJSON.ModelState[model].length; i++)
                console.log('> ' + model + '[' + i + ']: ' + (errorMessage= jqXHR.responseJSON.ModelState[model][i]));


        $('#errorText').html(errorMessage);

        return;
    }
}


function ShowError(message) {
    $('#errorAlert').show();

    $('#errorText').html(message || 'There was an error.');
}

function ShowExpensesCRUD() {

    $("#pnIntro").hide();
    $("#pnUsers").hide();
    $("#pnExpenses").show();

    LoadExpensesStore();

    if (isAdmin)
    {
        LoadUsersStore();
    }
  
}

function ShowUsersCRUD() {

    $("#pnIntro").hide();
    $("#pnExpenses").hide();
    $("#pnUsers").show();


    LoadUsersStore();
}

var loadedExpensesStore = [];

function FillUsersDropdown()
{
    var output = '';
    output += '<option value="">&nbsp;</option>'
    for (var i = 0; i < loadedUsersStore.length; i++) {
        output+='<option value="'+loadedUsersStore[i].Id+'">'+loadedUsersStore[i].Email+'</option>'
    }

   
    $("#inputSearchUser").html(output);
    
}

function LoadExpensesStore() {



    var $btn = $('#btnLoadExpenses').button('');

    var $btn2 = $('#btnLoadExpenses2').button('');
    
    $('#successAlert').hide();
    $('#errorAlert').hide();

    var startDate = $("#inputStartDate").val() +' 00:00' ,
        endDate = $("#inputEndDate").val() + ' 23:59',
        amount = $("#inputSearchAmount").val(),
        amountOp = $("#inputSearchAmountOperator").val()
    desc = $("#inputSearchDesc").val(),
    userId = $("#inputSearchUser").val();
   
        if (amount == "") 
        {
            amount = -1;
        }
        startLoading();
    $.ajax({
        type: 'GET',
        url: BASE_ROOT + 'api/Expenses',
        headers: { Authorization: 'Bearer ' + sessionStorage.getItem(tokenKey) },
        data: {
            startDate: startDate,
            endDate: endDate,
            Amount: amount,
            AmountOperator: amountOp,
            Description: desc,
            SearchUserId: userId
        }
    }).done(function (data) {

        //$('tbExpenseBody').append('<div id="resutlDiv"><pre>' + JSON.stringify(data) + '<pre></div>');
        loadedExpensesStore = data;

        var weekAmount = 0;
        var grandAmount = 0;

        var output = '';

        
        var startTime = $("#inputStartTime").val(),
            endTime = $("#inputEndTime").val();

        var startDate = $("#inputStartDate").val() + ' 00:00',
        endDate = $("#inputEndDate").val() + ' 23:59';
        var isFirstweek=true;

        for (var i=0; i < data.length; i++) {
            var date = new Date(data[i].Date);
            var momentDate = moment(date);//.subtract(new Date().getTimezoneOffset(), 'minutes');
         
            output += "<tr><td class=\"actionCol\">";
           output += "<a title=\"Delete Expense\"  recordid=\"" + i + "\" id=\"btn" + i + "_DeleteExpensesRecord\" href=\"javascript:void(0)\" class=\"btn btn-danger btn-fab btn-fab-mini\"><i class=\"material-icons\">clear</i><div class=\"ripple-container\"></div></a>";

            output += "&nbsp; <a title=\"Edit Expense\"  recordid=\"" + i + "\" id=\"btn" + i + "_EditExpensesRecord\" href=\"javascript:void(0)\" class=\"btn btn-primary btn-fab btn-fab-mini\"><i class=\"material-icons\">mode_edit</i><div class=\"ripple-container\"></div></a>";

            output += "</td>";
            output += "<td class=\"text-left\">" + 
momentDate.format('l') + " " + momentDate.format('LT') + "</td>";
            output += "<td class=\"text-right\"> U$ " + formatExpenses(data[i].Amount) + "</td>";
            output += "<td class=\"\">";
            if (data[i].Comment != null && data[i].Comment != "") {
                output += " <span data-container=\"body\" data-toggle=\"popover\" data-trigger=\"hover\" data-placement=\"top\" data-content=\" " + data[i].Comment.replace(new RegExp('"', 'g'),  '&rdquo;') + "\" data-original-title=\"\" title=\"\"   class=\"btn btn-warning btn-fab-mini\"><i class=\"material-icons\">textsms</i><div class=\"ripple-container\"></div></span>";
            }

            output += HtmlEncode(data[i].Description) + "</td>";
            if (isAdmin) {
                output += "<td class=\"\">" + data[i].UserName + "</td>";
            } 
            output += "</tr>";
            weekAmount += data[i].Amount;
            grandAmount += data[i].Amount;

            if ((i >= data.length - 1) || moment((new Date(data[i + 1].Date))).subtract(new Date().getTimezoneOffset(), 'minutes').format('ggggww') != momentDate.format('ggggww')) {
                 
                var days=6;
                
                //for last week calculate the number of days withhim the period
                if (isFirstweek)  //TODO: for first week calculate the number of days withhim the period
                {
                    var endOfWeek = moment(startDate).endOf('week');
                    if (endOfWeek > momentDate)
                    {
                        days = moment(startDate).diff(endOfWeek, 'days');
                    }
                    firstWeek = false;
                }
                if (i >= data.length - 1) //Last week
                {
                    var startOfWeek = moment(endDate).startOf('week');
                    days = moment(endDate).diff(startOfWeek, 'days');
                }
                days = Math.abs(days)+1;

                output += "<tr class=\"active text-info\">";
                output += "<td class=\"text-right\" colspan=\"2\"> Week " + momentDate.format('ww') + "/" + momentDate.format('gggg') + " Day Average</td>";
                output += "<td class=\"text-right\"> U$ " + formatExpenses(weekAmount / days) + "</td>";
                output += "<td class=\"actionCol\"></td>";
                if (isAdmin)
                    output += "<td></td>";
                output += "</tr>";

                output += "<tr class=\"active text-info\">";
                output += "<td class=\"text-right\" colspan=\"2\">Week " + momentDate.format('ww') + "/" + momentDate.format('gggg') + " Total</td>";
                output += "<td class=\"text-right\"> U$ " + formatExpenses(weekAmount) + "</td>";
                output += "<td class=\"actionCol\"></td>";
                if (isAdmin)
                    output += "<td></td>";
                output += "</tr>";

                weekAmount = 0;
            }

        }

        var grandDayCounter = moment(endDate).diff(moment(startDate), 'days'); // get number of days on the perios
        grandDayCounter = Math.abs(grandDayCounter) + 1;

        var grandWeekCounter = moment(endDate).diff(moment(startDate), 'weeks'); // get number of days on the period
        grandWeekCounter = Math.abs(grandWeekCounter) + 1;

        output += "<tr class=\"active text-primary\">";
            output += "<td class=\"\"></td>";
            output += "<td class=\"text-right\">Period Total (" + grandDayCounter + " days)</td>";
            output += "<td class=\"text-right\"> U$ " + formatExpenses(grandAmount) + "</td>";
            output += "<td class=\"actionCol\"></td>";
            if (isAdmin)
                output += "<td></td>";
            output += "</tr>";

            output += "<tr class=\"active text-primary\">";
            output += "<td class=\"\"></td>";
            output += "<td class=\"text-right\">Period Day Average</td>";
           
            output += "<td class=\"text-right\"> U$ " + formatExpenses(grandAmount / grandDayCounter) + "</td>";
            output += "<td class=\"actionCol\"></td>";
            if (isAdmin)
                output += "<td></td>";
            output += "</tr>";

            output += "<tr class=\"active text-primary\">";
            output += "<td class=\"\"></td>";
            output += "<td class=\"text-right\">Period Week Average</td>";

            output += "<td class=\"text-right\"> U$ " + formatExpenses(grandAmount / grandWeekCounter) + "</td>";
            output += "<td class=\"actionCol\"></td>";
            if (isAdmin)
                output += "<td></td>";
            output += "</tr>";

        $("#tbExpenseBody").html(output);


        $("[id$='EditExpensesRecord']").click(ShowModalExpense);
        $("[id$='DeleteExpensesRecord']").click(ModalExpenseDelete);

        var overPopup = false;
        $('[data-toggle="popover"]').popover();
        
        $btn.button('reset')
        $btn.blur();

        $btn2.button('reset')
        $btn2.blur();

        finishLoading();

    }).fail(function (data) {

        finishLoading();
        $btn.button('reset');
        $btn.blur();
        $btn2.button('reset')
        $btn2.blur();
        ajaxError(data)
    });

}

function hideUnhideFilters(){
    if (!$('#panelFilters').hasClass('hide'))
    { $('#panelFilters').addClass('hide'); }
    else { $('#panelFilters').removeClass('hide'); }
}

function startLoading() {
    $('#spinning').removeClass('hide');
}

function finishLoading() {
    $('#spinning').addClass('hide'); 
}

function HtmlEncode(value) {
    return $('<div/>').text(value).html().replace('<', '&gt;').replace('>', '&lt;');
}

var modalExpenseRecord = null;
var myModalUserRecord = null;
function ShowModalExpense(ev) {



    $('#successAlert').hide();
    $('#errorAlert').hide();


    var recordid = $(ev.currentTarget).attr('recordid');


    var modal = $('#myModalExpenseRecord');
    if (recordid  == undefined ||  recordid <0) {
        modalExpenseRecord = null;

        modal.find('.modal-title').text('New Expense');

        var date = new Date();
      
        $("#inputDate").val(moment(date).format("YYYY-MM-DD"));
        $("#inputTime").val(moment(date).format("HH:mm"));
        $("#inputExpenses").val('');
        $("#inputDescription").val('');
        $("#inputComment").val('');

    } else {

        modalExpenseRecord = loadedExpensesStore[recordid];

        modal.find('.modal-title').text('Expense #' + modalExpenseRecord.Id);

        var date = new Date(modalExpenseRecord.Date);
        var momentDate = moment(date).subtract(new Date().getTimezoneOffset(), 'minutes');

        $("#inputDate").val(momentDate.format("YYYY-MM-DD"));
        $("#inputTime").val(momentDate.format("HH:mm"));
        $("#inputExpenses").val(modalExpenseRecord.Amount);
        $("#inputDescription").val(modalExpenseRecord.Description);
        $("#inputComment").val(modalExpenseRecord.Comment);
        


    }
    modal.modal('show');
}

function ModalExpenseSave() {

    if ($("#inputExpenses").val() == '')
        ShowError('Expenses can not be empty.');
    if ($("#inputDate").val() == '')
        ShowError('Date can not be empty.');
    if ($("#inputTime").val() == '')
        ShowError('Time can not be empty.');


    var date = $("#inputDate").val() + ' ' + $("#inputTime").val();
    try {
        function pad(number, length) {
            var str = "" + number
            while (str.length < length) {
                str = '0' + str
            }
            return str
        }

        var offset = new Date().getTimezoneOffset()
        offset = ((offset < 0 ? '+' : '-') + // Note the reversed sign!
                  pad(parseInt(Math.abs(offset / 60)), 2) +
                  pad(Math.abs(offset % 60), 2));
        date = new Date($("#inputDate").val() + 'T' + $("#inputTime").val() + offset).toISOString();
    } catch (ex) { }

    startLoading();
    $.ajax({
        type: (modalExpenseRecord != null) ? 'PUT' : 'POST',
        url: BASE_ROOT + 'api/Expenses',
        headers: { Authorization: 'Bearer ' + sessionStorage.getItem(tokenKey) },
        data: {
            Id: (modalExpenseRecord != null) ?modalExpenseRecord.Id:null,
            Date: date,
            Amount: $("#inputExpenses").val(),
            Description: $("#inputDescription").val(),
            Comment: $("#inputComment").val(),
            UserName: ''

        }
    }).done(function (data) {
        finishLoading();
        $('#successAlert').show();
        LoadExpensesStore();

    }).fail(function (data) {
        finishLoading();
        ajaxError(data)
    });
}


function ModalExpenseDelete(ev) {


    $('#successAlert').hide();
    $('#errorAlert').hide();


    var recordid = $(ev.currentTarget).attr('recordid');

    startLoading();
    $.ajax({
        type: 'DELETE',
        url: BASE_ROOT + 'api/Expenses/'+ loadedExpensesStore[recordid].Id,
        headers: { Authorization: 'Bearer ' + sessionStorage.getItem(tokenKey) }/*,
        data: { Id: loadedExpensesStore[recordid].Id  }*/
    }).done(function (data) {
        finishLoading();
        $('#successAlert').show();
        LoadExpensesStore();

    }).fail(function (data) {
        finishLoading();
        ajaxError(data)
    });


}
function formatExpenses(value) {
    return value.toFixed(2);
}









//////////////////////////////////////////////////////////////



function ShowModalLogin(ev) {


    $('#successAlert').hide();
    $('#errorAlert').hide();

    $('#myModalLogin').modal('show');
}



function DoModalLogin() {

    startLoading();
    $.ajax({
        type: 'POST',
        url: BASE_ROOT + 'Token',
        data: {
            grant_type: 'password',
            username: $("#inputLoginUser").val(),
            password: $("#inputLoginPassword").val()
        }
    }).done(function (data) {
        
        // Cache the access token in session storage.
        sessionStorage.setItem(tokenKey, data.access_token);

        console.log('access_token: ' + data.access_token);


        $.ajax({
            type: 'GET',
            url: BASE_ROOT + 'api/Account/UserInfo',
            headers: { Authorization: 'Bearer ' + sessionStorage.getItem(tokenKey) },
            data: {}
        }).done(function (data) {
            finishLoading();
            // login ok
            $("#barDivLogin").hide();
            $("#barDivLogout").show();
            $("#barUserNameLink").html(data.Email);
            $("#barDivExpenses").show();

            isAdmin = data.UserType == "Admin";
            if (isAdmin) {
                $("#thUser").show();
                $("#barDivUser").show();
                $("#divSearchUsers").show();

            }
            else {
                $("#thUser").hide();
                $("#barDivUser").hide();
                $("#divSearchUsers").hide();
            }

            ShowExpensesCRUD();

        }).fail(function (data) {
            ajaxError(data);
            finishLoading();
        });


    }).fail(function (data) {
        ajaxError(data);
        finishLoading();
    });
  
}


function EraseAllLoginData() {
    // login ok
    $("#barDivLogin").show();
    $("#barDivLogout").hide();
    $("#barUserNameLink").html('');
    $("#tbExpenseBody").html('');
    $("#inputLoginUser").val('');
    $("#inputLoginPassword").val('');

    isAdmin = false;
    $("#thUser").hide();

    $("#pnExpenses").hide();
    $("#pnUsers").hide();
    $("#pnIntro").show();

   
    $("#barDivExpenses").hide();
    $("#barDivUser").hide();
    $("#divSearchUsers").hide();
    

    sessionStorage.removeItem(tokenKey);
}


function DoModalLogout() {
    startLoading();
    $.ajax({
        type: 'POST',
        url: BASE_ROOT + 'api/Account/Logout',
        headers: { Authorization: 'Bearer ' + sessionStorage.getItem(tokenKey) },
        data: {}
    }).done(function (data) {
        finishLoading();
        console.log('logout');
    }).fail(function (data) {
        finishLoading();
        ajaxError(data);
    });

    EraseAllLoginData();
    
}



function ShowModalRegister(ev) {


    $('#successAlert').hide();
    $('#errorAlert').hide();

    $('#myModalRegister').modal('show');
}



function DoModalRegister() {

    startLoading();

    $.ajax({
        type: 'POST',
        url: BASE_ROOT + 'api/Account/Register',
        data: {
            Email: $("#inputRegisterUser").val(),
            Password: $("#inputRegisterPassword").val(),
            ConfirmPassword: $("#inputRegisterConfirmPassword").val()
        }
    }).done(function (data) {

        finishLoading();
        $("#inputLoginUser").val($("#inputRegisterUser").val());
        $("#inputLoginPassword").val($("#inputRegisterPassword").val());

        $("#inputRegisterUser").val('');
        $("#inputRegisterPassword").val('');
        $("#inputRegisterConfirmPassword").val('');
        DoModalLogin();

    }).fail(function (data) {
        finishLoading();
        ajaxError(data);
    });

}




function ShowModalSettings(ev) {


    $('#successAlert').hide();
    $('#errorAlert').hide();
    $('#myModalSettings').modal('show');
}



function DoModalSettings() {

    $("#inputOldPassword").val("");
    $("#inputNewPassword").val("");
    $("#inputRepeatPassword").val("");

    startLoading();
    $.ajax({
        type: 'POST',
        url: BASE_ROOT + 'api/Account/ChangePassword',
        headers: { Authorization: 'Bearer ' + sessionStorage.getItem(tokenKey) },
        data: {
            OldPassword: $("#inputOldPassword").val(),
            NewPassword: $("#inputNewPassword").val(),
            ConfirmPassword: $("#inputRepeatPassword").val()
        }
    }).done(function (data) {
        finishLoading();
        LoadExpensesStore();
        $('#successAlert').show();

    }).fail(function (data) {
        finishLoading();
        ajaxError(data);
    });

}


var loadedUsersStore = [];

function LoadUsersStore() {


    startLoading();

    $('#successAlert').hide();
    $('#errorAlert').hide();

    $.ajax({
        type: 'GET',
        url: BASE_ROOT + 'api/Account/ListUsers',
        headers: { Authorization: 'Bearer ' + sessionStorage.getItem(tokenKey) }
        
    }).done(function (data) {
        
        //$('tbExpenseBody').append('<div id="resutlDiv"><pre>' + JSON.stringify(data) + '<pre></div>');
        loadedUsersStore = data;
        FillUsersDropdown();
        var output = '';

        for (var i = 0; i < data.length; i++) {


            output += "<tr><td class=\"col-sm-1\">";
            output += "<a title=\"Delete User\"  recordid=\"" + i + "\" id=\"btn" + i + "_DeleteUserRecord\" href=\"javascript:void(0)\" class=\"btn btn-danger btn-fab btn-fab-mini\"><i class=\"material-icons\">clear</i><div class=\"ripple-container\"></div></a>";
            output += "&nbsp;<a title=\"Edit User\"  recordid=\"" + i + "\" id=\"btn" + i + "_EditUserRecord\" href=\"javascript:void(0)\" class=\"btn btn-primary btn-fab btn-fab-mini\"><i class=\"material-icons\">mode_edit</i><div class=\"ripple-container\"></div></a>";

            output += "</td>";
            output += "<td class=\"col-sm-6\">" + data[i].Email + "</td>";

            output += "<td class=\"col-sm-6\">" + data[i].Admin + "</td>";
            output += "</tr>";

        }

        $("#tbUsersBody").html(output);


        $("[id$='DeleteUserRecord']").click(DeleteUserRecord);

        $("[id$='EditUserRecord']").click(ShowEditUserRecord);
        

        finishLoading();

    }).fail(function (data) {
        finishLoading();

        ajaxError(data)
    });

}

function DeleteUserRecord(ev) {


    $('#successAlert').hide();
    $('#errorAlert').hide();


    var recordid = $(ev.currentTarget).attr('recordid');

    startLoading();
    $.ajax({
        type: 'DELETE',
        url: BASE_ROOT + 'api/Account/' + loadedUsersStore[recordid].Id,
        headers: { Authorization: 'Bearer ' + sessionStorage.getItem(tokenKey) }/*,
        data: { Id: loadedExpensesStore[recordid].Id  }*/
    }).done(function (data) {
        finishLoading();
        $('#successAlert').show();
        LoadUsersStore();

    }).fail(function (data) {
        finishLoading();
        ajaxError(data)
    });


}

function ShowEditUserRecord(ev)
{
    $('#successAlert').hide();
    $('#errorAlert').hide();


    var recordid = $(ev.currentTarget).attr('recordid');


    var modal = $('#myModalUserRecord');
    if (recordid  == undefined ||  recordid <0) {
        myModalUserRecord = null;

        modal.find('.modal-title').html('<b>New User</b>');

        var date = new Date();
      
        $("#inputUserEmail").val('');
        $("#inputUserPassword").val('');
        $("#inputUserConfirmPassword").val('');
        $("#checkboxAdmin").prop('checked', false);


        

    } else {

        myModalUserRecord = loadedUsersStore[recordid];

        modal.find('.modal-title').html('<b>Edit user ' + myModalUserRecord.Email+'</b>');

        $("#inputUserEmail").val(myModalUserRecord.Email);
        $("#inputUserPassword").val('');
        $("#inputUserConfirmPassword").val('');
        $("#checkboxAdmin").prop('checked', myModalUserRecord.Admin);
        


    }
    modal.modal('show');
}


function ModalUserSave() {
    if ($("#inputUserEmail").val() == '')
        ShowError('Email can not be empty.');

    startLoading();
    $.ajax({
        type: (myModalUserRecord != null) ? 'PUT' : 'POST',
        url: BASE_ROOT + 'api/Account/AddUser',
        headers: { Authorization: 'Bearer ' + sessionStorage.getItem(tokenKey) },
        data: {
            Email: $("#inputUserEmail").val(),
            Password: $("#inputUserPassword").val(),
            ConfirmPassword: $("#inputUserConfirmPassword").val(),
            Admin: $("#checkboxAdmin").prop('checked'),
            Id: (myModalUserRecord != null) ? myModalUserRecord.Id : 0

        }
    }).done(function (data) {
        finishLoading();
        $('#successAlert').show();
        LoadUsersStore();

    }).fail(function (data) {
        finishLoading();
        ajaxError(data)
    });

}

var filtersWereShown=false;
function PrintExpenses()
{

    $(".actionCol").css("display", "none");


    $("#panelExpensesTable").addClass("ExpensesPrint");

    $("#tbExpenseBody").addClass("ExpensesBodyPrint");

    $("#PrintHeader").show();
    $("#ExpensesTitle").hide();
    $("#navbar").hide();
    $("#footer").hide();
    
    $("#TableResponsive").removeClass("table-responsive");

    var startDate = $("#inputStartDate").val(),
       endDate = $("#inputEndDate").val() ;

    $("#ReportStartDate").text(startDate);
    $("#ReportEndDate").text(endDate);

    var amount = $("#inputSearchAmount").val(),
       amountOp = $("#inputSearchAmountOperator").val()
    desc = $("#inputSearchDesc").val(),
    userId = $("#inputSearchUser").val();
    userName = $("#inputSearchUser  option:selected").text();

    var filters = "";
    filters += (amount != null && amount != "") ? ", Amount " + amountOp + " " + amount : "";
    filters += (desc != null && desc != "") ? ", Description contains \"" + desc+"\"" : "";
    filters += (userId != null && userId != "") ? ", User is " + userName : "";

    if (filters.length > 0) {
        filters = filters.substr(2, filters.length - 2);
        $("#ReportFilters").text("Filters: " + filters);
    }
    else {
        $("#ReportFilters").text("");
    }


    filtersWereShown = false;
    if (!$("#panelFilters").hasClass('hide'))
    {
        filtersWereShown = true;
        $("#panelFilters").addClass('hide');
    }

    
    
    window.print();
    
    
}

function ClosePrintExpenses() {

    $(".actionCol").css("display", "");

    $("#panelExpensesTable").removeClass("ExpensesPrint");

    $("#tbExpenseBody").removeClass("ExpensesBodyPrint");


    $("#TableResponsive").addClass("table-responsive");

    $("#PrintHeader").hide();
    $("#ExpensesTitle").show();
    $("#navbar").show();
    $("#footer").show();

    if (filtersWereShown) {
        $("#panelFilters").removeClass('hide');
    }
    
}

function EraseFilters() {
    $("#inputSearchAmount").val("");
    $("#inputSearchAmountOperator").val(">");
    $("#inputSearchDesc").val("");
    $("#inputSearchUser").val("");

    var oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 6);
    $('#inputStartDate').val(moment(oneWeekAgo).format('YYYY-MM-DD'));

    $('#inputEndDate').val(moment(new Date()).format('YYYY-MM-DD'));


}