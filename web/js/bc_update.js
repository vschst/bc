'use strict';

var UpdateTimers = {Added: null, Removed: null, Edited: null};

function updateAddedBans() {
    if ((Actions.Internal.Execute == false) && (Actions.External.Execute == false)) {
        var maxBanTime = 0;

        for (var banTime in Bans.Data) {
            if ((Bans.Data.hasOwnProperty(banTime) == true) && ((maxBanTime == 0) || (banTime > maxBanTime))) {
                maxBanTime = banTime;
            }
        }

        if (maxBanTime != 0) {
            Actions.Internal.Execute = true;

            $.ajax({
                url: "/"+ resourceName +"/call/webUpdateAddedBans",
                data: JSON.stringify([maxBanTime]),
                type: "POST"
            })
            .done(
                function (data) {
                    var ResponseObject = $.parseJSON(data)[0];

                    try {
                        if (ResponseObject == undefined) {
                            throw new SyntaxError("Error with function 'webUpdateAddedBans' (Response undefined)");
                        }
                        else if (ResponseObject.ErrorCode == undefined) {
                            throw new SyntaxError("Error with function 'webUpdateAddedBans' ('ErrorCode' incorrect)");
                        }
                        else if (ResponseObject.ErrorCode != 0) {
                            throw new ReferenceError("Error with function 'webUpdateAddedBans' (Error code: "+ ResponseObject.ErrorCode +")");
                        }
                        else if ((ResponseObject.Response.Data == undefined) || (Array.isArray(ResponseObject.Response.Data) == false)) {
                            throw new SyntaxError("Error with function 'webUpdateAddedBans' (Response 'Data' incorrect)");
                        }
                        else if ((ResponseObject.Response.NumberOfBans == undefined) || (Number.isInteger(ResponseObject.Response.NumberOfBans) == false)) {
                            throw new SyntaxError("Error with function 'webUpdateAddedBans' (Response 'NumberOfBans' incorrect)");
                        }

                        var AddedBansLoadData = ResponseObject.Response.Data;

                        loadBansData(AddedBansLoadData);

                        Bans.NumberOfBans = ResponseObject.Response.NumberOfBans;


                        if (AddedBansLoadData.length > 0) {
                            var banRow;

                            for (var abldKey = 0; abldKey < AddedBansLoadData.length; abldKey++) {
                                banRow = getBansDataTableRow((AddedBansLoadData.length - abldKey), AddedBansLoadData[abldKey].BanTime, AddedBansLoadData[abldKey].Data);

                                $("#bansdata-table-rows").prepend(banRow.hide());
                                banRow.fadeIn("slow");
                            }

                            banRow.nextAll().each(
                                function(i) {
                                    $(this).find(".row-number").text(AddedBansLoadData.length + i + 1);
                                }
                            );


                            if ($("#no-bans").css("display") == "table-row") {
                                $("#no-bans").css("display", "none");
                            }
                        }

                        updateShownBansText();
                    }
                    catch (e) {
                        console.log("["+ e.name + "] "+ e.message);
                    }

                    Actions.Internal.Execute = false;
                }
            );
        }
    }

    UpdateTimers.Removed = setTimeout(updateRemovedBans, 3000);
}


function updateRemovedBans() {
    if ((Actions.Internal.Execute == false) && (Actions.External.Execute == false) && (Pages.EditBan.Selected == false)) {
        var LastBansTimeData = new Array();

        for (var banTime in Bans.Data) {
            if (Bans.Data.hasOwnProperty(banTime) == true) {
                LastBansTimeData.push(banTime);
            }
        }

        if (LastBansTimeData.length != 0) {
            Actions.Internal.Execute = true;

            $.ajax({
                url: "/"+ resourceName +"/call/webUpdateRemovedBans",
                data: JSON.stringify([LastBansTimeData]),
                type: "POST"
            })
            .done(
                function(data) {
                    var ResponseObject = $.parseJSON(data)[0];

                    try {
                        if (ResponseObject == undefined) {
                            throw new SyntaxError("Error with function 'webUpdateRemovedBans' (Response undefined)");
                        }
                        else if (ResponseObject.ErrorCode == undefined) {
                            throw new SyntaxError("Error with function 'webUpdateRemovedBans' ('ErrorCode' incorrect)");
                        }
                        if (ResponseObject.ErrorCode != 0) {
                            throw new ReferenceError("Error with function 'webUpdateRemovedBans' (Error code: "+ ResponseObject.ErrorCode +")");
                        }
                        else if ((ResponseObject.Response == undefined) || (Array.isArray(ResponseObject.Response) == false)) {
                            throw new SyntaxError("Error with function 'webUpdateRemovedBans' (Response incorrect)");
                        }

                        var RemovedBansTimeData = ResponseObject.Response;

                        removeBansData(RemovedBansTimeData);

                        Bans.NumberOfBans = (Bans.NumberOfBans - RemovedBansTimeData.length);


                        var lastRemovedRow = false;

                        for (var rbtdKey in RemovedBansTimeData) {
                            if (rbtdKey == (RemovedBansTimeData.length - 1)) {
                                lastRemovedRow = true;
                            }

                            removeBansDataTableRow(RemovedBansTimeData[rbtdKey], lastRemovedRow);
                        }


                        if (Bans.Length == 0) {
                            $("#no-bans").css("display", "table-row");
                            $("#show-more-bans").css("display", "none");
                        }

                        updateShownBansText();
                    }
                    catch (e) {
                        console.log("["+ e.name + "] "+ e.message);
                    }

                    Actions.Internal.Execute = false;
                }
            );
        }
    }

    UpdateTimers.Edited = setTimeout(updateEditedBans, 3000);
}


function updateEditedBans() {
    if ((Actions.Internal.Execute == false) && (Actions.External.Execute == false) && (Pages.EditBan.Selected == false) && (Bans.Length > 0)) {
        Actions.Internal.Execute = true;

        var LastBansData = new Array();

        for (var banTime in Bans.Data) {
            if (Bans.Data.hasOwnProperty(banTime) == true) {
                LastBansData.push({BanTime: banTime, Data: Bans.Data[banTime]});
            }
        }

        $.ajax({
            url: "/"+ resourceName +"/call/webUpdateEditedBans",
            data: JSON.stringify([LastBansData]),
            type: "POST"
        })
        .done(
            function(data) {
                var ResponseObject = $.parseJSON(data)[0];

                try {
                    if (ResponseObject == undefined) {
                        throw new SyntaxError("Error with function 'webUpdateEditedBans' (Response undefined)");
                    }
                    else if (ResponseObject.ErrorCode == undefined) {
                        throw new SyntaxError("Error with function 'webUpdateEditedBans' ('ErrorCode' incorrect)");
                    }
                    if (ResponseObject.ErrorCode != 0) {
                        if (ResponseObject.ErrorData != undefined) {
                            throw new ReferenceError("Error with function 'webUpdateEditedBans' (Error code: " + ResponseObject.ErrorCode + ", Key: "+ ResponseObject.ErrorData.Key +")");
                        }
                        else {
                            throw new ReferenceError("Error with function 'webUpdateEditedBans' (Error code: " + ResponseObject.ErrorCode + ")");
                        }
                    }
                    else if ((ResponseObject.Response == undefined) || (Array.isArray(ResponseObject.Response) == false)) {
                        throw new SyntaxError("Error with function 'webUpdateEditedBans' (Response incorrect)");
                    }

                    var ChangedBansData = ResponseObject.Response;

                    editBansData(ChangedBansData);


                    for (var cbdKey in ChangedBansData) {
                        editBansDataTableRow(ChangedBansData[cbdKey].BanTime, ChangedBansData[cbdKey].Data);
                    }
                }
                catch (e) {
                    console.log("["+ e.name + "] "+ e.message);
                }

                Actions.Internal.Execute = false;
            }
        );
    }

    UpdateTimers.Added = setTimeout(updateAddedBans, 3000);
}