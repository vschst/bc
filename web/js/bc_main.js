'use strict';

var Bans = {Load: false, Data: {}, Length: 0, NumberOfBans: 0};

var Pages = {
    Index: {
        Selected: true
    },
    AddNewBan: {
        Selected: false
    },
    EditBan: {
        Selected: false,
        Time: null
    }
};

var Actions = {Internal: {Execute: false}, External: {Execute: false}}


function loadBansData(LoadData) {
    for (var ldKey in LoadData) {
        if (LoadData[ldKey].hasOwnProperty("BanTime") == false) {
            throw new SyntaxError("Error with function 'loadBansData' (Key: "+ ldKey +", Login undefined)");
        }
        else if (LoadData[ldKey].hasOwnProperty("Data") == false) {
            throw new SyntaxError("Error with function 'loadBansData' (Key: "+ ldKey +", Data undefined)");
        }
        else if ((LoadData[ldKey].Data.hasOwnProperty("IP") == false) && (LoadData[ldKey].Data.hasOwnProperty("Serial") == false)) {
            throw new SyntaxError("Error with function 'loadBansData' (Key: "+ ldKey +", IP and Serial undefined!)");
        }

        Bans.Data[LoadData[ldKey].BanTime] = LoadData[ldKey].Data;

        Bans.Length++;
    }
}


function removeBansData(BansTimeData) {
    for (var btdKey in BansTimeData) {
        if (Bans.Data.hasOwnProperty(BansTimeData[btdKey]) == true) {
            delete Bans.Data[BansTimeData[btdKey]];

            Bans.Length--;
        }
        else {
            throw new SyntaxError("Error with function 'removeBansData' (Ban time '"+ BansTimeData[btdKey] +"' undefined)");
        }
    }
}


function editBansData(ChangedBansData) {
    var banTime;

    for (var сbdKey in ChangedBansData) {
        if (ChangedBansData[сbdKey].hasOwnProperty("BanTime") == false) {
            throw new SyntaxError("Error with function 'editBansData' (Key: "+ ebdKey +", Ban time undefined)");
        }
        else if (ChangedBansData[сbdKey].hasOwnProperty("Data") == false) {
            throw new SyntaxError("Error with function 'editBansData' (Key: "+ ebdKey +", Data undefined)");
        }

        banTime = ChangedBansData[cbdKey].BanTime;

        if (Bans.Data.hasOwnProperty(banTime) == true) {
            //Nick
            if (ChangedBansData[cbdKey].Data.hasOwnProperty('Nick') == true) {
                if (ChangedBansData[cbdKey].Data.Nick != false) {
                    Bans.Data[banTime].Nick = ChangedBansData[cbdKey].Data.Nick;
                }
                else {
                    delete Bans.Data[banTime].Nick;
                }
            }

            //Admin
            if (ChangedBansData[cbdKey].Data.hasOwnProperty('Admin') == true) {
                if (ChangedBansData[cbdKey].Data.Admin != false) {
                    Bans.Data[banTime].Admin = ChangedBansData[cbdKey].Data.Admin;
                }
                else {
                    delete Bans.Data[banTime].Admin;
                }
            }

            //Reason
            if (ChangedBansData[cbdKey].Data.hasOwnProperty('Reason') == true) {
                if (ChangedBansData[cbdKey].Data.Reason != false) {
                    Bans.Data[banTime].Reason = ChangedBansData[cbdKey].Data.Reason;
                }
                else {
                    delete Bans.Data[banTime].Reason;
                }
            }

            //Unban time
            if (ChangedBansData[cbdKey].Data.hasOwnProperty('UnbanTime') == true) {
                if (ChangedBansData[cbdKey].Data.UnbanTime != false) {
                    Bans.Data[banTime].UnbanTime = ChangedBansData[cbdKey].Data.UnbanTime;
                }
                else {
                    delete Bans.Data[banTime].UnbanTime;
                }
            }
        }
        else {
            throw new SyntaxError("Error with function 'updateAdminData' (Ban time '"+ banTime +"' undefined)");
        }
    }
}


function updateShownBansText() {
    $("#bans-shown").text(Bans.Length);
    $("#bans-all").text(Bans.NumberOfBans);
}


function getTimesElement() {
    return $('<i class="fa fa-times" aria-hidden="true"></i>');
}


function getBansDataTableRow(rowNumber, banTime, BanData) {
    var RowTR = $("<tr id="+ banTime +"></tr>");

    //Row number
    RowTR.append($('<td class="row-number"></td>').text(rowNumber));

    //Nick
    var banNickElement = $('<td class="ban-nick"></td>');

    if (BanData.hasOwnProperty("Nick") == true) {
        RowTR.append(banNickElement.html($("<b></b>").html(hexToHtml(BanData.Nick))));
    }
    else {
        RowTR.append(banNickElement.html(getTimesElement()));
    }

    //Banner
    var banAdminElement = $('<td class="ban-admin"></td>');

    if (BanData.hasOwnProperty("Admin") == true) {
        RowTR.append(banAdminElement.html(hexToHtml(BanData.Admin)));
    }
    else {
        RowTR.append(banAdminElement.html(getTimesElement()));
    }

    //Ban time
    var banTimeDate = moment.unix(banTime);

    RowTR.append($('<td></td>').text(banTimeDate.format("DD/MM/YYYY hh:mm")));

    //Unban time
    var banUnbanTimeElement = $('<td class="ban-unban-time"></td>');

    if (BanData.hasOwnProperty("UnbanTime") == true) {
        var unbanTimeDate = moment.unix(BanData.UnbanTime);

        RowTR.append(banUnbanTimeElement.text(unbanTimeDate.format("DD/MM/YYYY hh:mm")));
    }
    else {
        RowTR.append(banUnbanTimeElement.html(getTimesElement()));
    }

    //Reason
    var banReasonElement = $('<td class="ban-reason"></td>');

    if (BanData.hasOwnProperty("Reason") == true) {
        RowTR.append(banReasonElement.text(formatBanReasonString(BanData.Reason)));
    }
    else {
        RowTR.append(banReasonElement.html(getTimesElement()));
    }

    //IP
    var banIPElement = $('<td></td>');

    if (BanData.hasOwnProperty("IP") == true) {
        RowTR.append(banIPElement.text(BanData.IP));
    }
    else {
        RowTR.append(banIPElement.html(getTimesElement()));
    }

    //Serial
    var banSerialElement = $('<td></td>');

    if (BanData.hasOwnProperty("Serial") == true) {
        RowTR.append(banSerialElement.text(BanData.Serial));
    }
    else {
        RowTR.append(banSerialElement.html(getTimesElement()));
    }

    //Choose
    var chooseElement = $('<input name="ban-check" type="checkbox" class="form-check-input" value="'+ banTime +'">');

    chooseElement.on("change",
        function(event) {
            event.preventDefault();

            var n = $('input[name="ban-check"]:checked').length;

            if (n > 0) {
                $("#edit-ban-btn").prop("disabled", false);
                $("#remove-bans-btn").prop("disabled", false).text(BCJSTexts.IndexPage.RemoveBansBtnSelectedText.replace("$n", n));
            }
            else {
                $("#edit-ban-btn").prop("disabled", true);
                $("#remove-bans-btn").prop("disabled", true).text(BCJSTexts.IndexPage.RemoveBansBtnText);
            }
        }
    );

    RowTR.append($('<td><label class="form-check-label"></label></td>').html(chooseElement));

    return RowTR;
}


function removeBansDataTableRow(banTime, lastRemovedRow) {
    var banRow = $("#"+ banTime);

    banRow.find('input[name="ban-check"]').off("change");

    if (lastRemovedRow == false) {
        banRow.fadeOut("slow",
            function() {
                $(this).remove();
            }
        );
    }
    else {
        banRow.fadeOut("slow",
            function() {
                $(this).remove();

                updateBansRowNumbers();
            }
        );
    }
}


function editBansDataTableRow(banTime, ChangedBanData) {
    var banRow = $("#"+ banTime);

    //Nick
    if (ChangedBanData.hasOwnProperty('Nick') == true) {
        if (ChangedBanData.Nick != false) {
            banRow.find(".ban-nick").html($("<b></b>").html(hexToHtml(ChangedBanData.Nick)));
        }
        else {
            banRow.find(".ban-nick").html(getTimesElement());
        }
    }

    //Admin
    if (ChangedBanData.hasOwnProperty('Admin') == true) {
        if (ChangedBanData.Admin != false) {
            banRow.find(".ban-admin").html(hexToHtml(ChangedBanData.Admin));
        }
        else {
            banRow.find(".ban-admin").html(getTimesElement());
        }
    }

    //Reason
    if (ChangedBanData.hasOwnProperty('Reason') == true) {
        if (ChangedBanData.Reason != false) {
            banRow.find(".ban-reason").text(formatBanReasonString(ChangedBanData.Reason));
        }
        else {
            banRow.find(".ban-reason").html(getTimesElement());
        }
    }

    //Unban time
    if (ChangedBanData.hasOwnProperty('UnbanTime') == true) {
        if (ChangedBanData.UnbanTime != false) {
            var unbanTimeDate = moment.unix(ChangedBanData.UnbanTime);

            banRow.find(".ban-unban-time").text(unbanTimeDate.format("DD/MM/YYYY hh:mm"));
        }
        else {
            banRow.find(".ban-unban-time").html(getTimesElement());
        }
    }
}


function setInputDanger(inputID) {
    var selector = $("#"+ inputID);

    selector.parent().addClass("has-danger");
    selector.addClass("form-control-danger");
}


function removeInputDanger(inputID) {
    var selector = $("#"+ inputID);

    selector.parent().removeClass("has-danger");
    selector.removeClass("form-control-danger");
}


function updateBansRowNumbers() {
    $("#bansdata-table-rows").find("tr").each(
        function(i) {
            $(this).find(".row-number").text(i + 1);
        }
    );
}


function selectPage(pageKey) {
    for (var pKey in Pages) {
        if (Pages.hasOwnProperty(pageKey) == true) {
            if (pKey == pageKey) {
                Pages[pKey].Selected = true;
            }
            else {
                Pages[pKey].Selected = false;
            }
        }
    }
}


function backToIndexPage() {
    selectPage("Index");

    $("#add-new-ban-page, #edit-ban-page").addClass("bc-hide");

    $("#index-page").removeClass("bc-hide");
}


function formatBanReasonString(str) {
    var strMaxLength = 15;

    if (str.length > strMaxLength) {
        return str.slice(0, strMaxLength) + "...";
    }
    else {
        return str;
    }
}


function hexToHtml(str) {
    var reg = /(#(?:[a-f\d]{2}){3})/gi
    var res = str.split(reg);

    var i = 0, substr;
    var result = "";

    while (i < res.length) {
    	substr = res[i];

        if ((substr.charAt(0) == "#") && (substr.length == 7)) {
      	    if (res[i+1] != "") {
      		    result = result + '<span style="color: '+ substr.toUpperCase() +'">';
            }
            else {
        	    i++;
            }
        }
        else {
      	    if (i == 0) {
        	    result = result + substr;
            }
            else {
      		    result = result + substr + "</span>";
            }
        }

    	i++;
    }

    if (result.length == 0) {
    	result = str;
    }

    return result;
}