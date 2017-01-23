'use strict';

$("#bansdata-table").ready(
    function () {
        Actions.External.Execute = true;

        $.ajax({
            url: "/"+ resourceName +"/call/webGetBansData",
            type: "POST"
        })
        .done(
            function(data) {
                var ResponseObject = $.parseJSON(data)[0];

                try {
                    if (ResponseObject == undefined) {
                        throw new SyntaxError("Error with function 'webGetBansData' (Response undefined)");
                    }
                    else if (ResponseObject.ErrorCode == undefined) {
                        throw new SyntaxError("Error with function 'webGetBansData' ('ErrorCode' incorrect)");
                    }
                    else if (ResponseObject.ErrorCode != 0) {
                        throw new ReferenceError("Error with function 'webGetBansData' (Error code: "+ ResponseObject.ErrorCode +")");
                    }
                    else if ((ResponseObject.Response.Data == undefined) || (Array.isArray(ResponseObject.Response.Data) == false)) {
                        throw new SyntaxError("Error with function 'webGetBansData' (Response 'Data' incorrect)");
                    }
                    else if ((ResponseObject.Response.NumberOfBans == undefined) || (Number.isInteger(ResponseObject.Response.NumberOfBans) == false)) {
                        throw new SyntaxError("Error with function 'webGetBansData' (Response 'NumberOfBans' incorrect)");
                    }

                    var BansLoadData = ResponseObject.Response.Data;

                    loadBansData(BansLoadData);

                    Bans.NumberOfBans = ResponseObject.Response.NumberOfBans;

                    Bans.Load = true;


                    var banRow;

                    for (var bldKey = 0; bldKey < BansLoadData.length; bldKey++) {
                        banRow = getBansDataTableRow((bldKey + 1), BansLoadData[bldKey].BanTime, BansLoadData[bldKey].Data);

                        $("#bansdata-table-rows").append(banRow);
                    }


                    if ((Bans.Length != 0) && (Bans.Length < Bans.NumberOfBans)) {
                        $("#show-more-bans").removeClass("bc-hide");
                    }
                    else if (Bans.Length == 0) {
                        $("#no-bans").removeClass("bc-hide");
                    }

                    updateShownBansText();

                    UpdateTimers.Added = setTimeout(updateAddedBans, 5000);
                }
                catch (e) {
                    console.log("["+ e.name + "] "+ e.message);
                }

                Actions.External.Execute = false;
            }
        );
    }
);


$("#show-more-bans-link").click(
    function() {
        if (Actions.External.Execute == false) {
            Actions.External.Execute = true;

            var minBanTime = 0;

            for (var banTime in Bans.Data) {
                if ((Bans.Data.hasOwnProperty(banTime) == true) && ((minBanTime == 0) || (banTime < minBanTime))) {
                    minBanTime = banTime;
                }
            }

            $.ajax({
                url: "/"+ resourceName +"/call/webGetMoreBansData",
                data: JSON.stringify([minBanTime]),
                type: "POST"
            })
            .done(
                function(data) {
                    var ResponseObject = $.parseJSON(data)[0];

                    try {
                        if (ResponseObject == undefined) {
                            throw new SyntaxError("Error with function 'webGetMoreBansData' (Response undefined)");
                        }
                        else if (ResponseObject.ErrorCode == undefined) {
                            throw new SyntaxError("Error with function 'webGetMoreBansData' ('ErrorCode' incorrect)");
                        }
                        else if (ResponseObject.ErrorCode != 0) {
                            throw new ReferenceError("Error with function 'webGetMoreBansData' (Error code: "+ ResponseObject.ErrorCode +")");
                        }
                        else if ((ResponseObject.Response.Data == undefined) || (Array.isArray(ResponseObject.Response.Data) == false)) {
                            throw new SyntaxError("Error with function 'webGetMoreBansData' (Response 'Data' incorrect)");
                        }
                        else if ((ResponseObject.Response.NumberOfBans == undefined) || (Number.isInteger(ResponseObject.Response.NumberOfBans) == false)) {
                            throw new SyntaxError("Error with function 'webGetBansData' (Response 'NumberOfBans' incorrect)");
                        }

                        var lastBansDataLength = Bans.Length;

                        var BansLoadData = ResponseObject.Response.Data;

                        loadBansData(BansLoadData);

                        Bans.NumberOfBans = ResponseObject.Response.NumberOfBans;


                        var banRow;

                        for (var bldKey = 0; bldKey < BansLoadData.length; bldKey++) {
                            banRow = getBansDataTableRow((lastBansDataLength + bldKey + 1), BansLoadData[bldKey].BanTime, BansLoadData[bldKey].Data);

                            $("#bansdata-table-rows").append(banRow.hide());
                            banRow.fadeIn("slow");
                        }


                        if (Bans.Length < Bans.NumberOfBans) {
                            $("#show-more-bans").removeClass("bc-hide");
                        }
                        else {
                            $("#show-more-bans").addClass("bc-hide");
                        }

                        updateShownBansText();
                    }
                    catch (e) {
                        console.log("["+ e.name + "] "+ e.message);
                    }

                    Actions.External.Execute = false;
                }
            );
        }
    }
);


$("#add-new-ban-link").click(
    function() {
        selectPage("AddNewBan");

        $("#index-page").addClass("bc-hide");

        $("#add-new-ban-page").removeClass("bc-hide");


        removeInputDanger("add-new-ban-ip");

        removeInputDanger("add-new-ban-serial");

        removeInputDanger("add-new-ban-reason");

        removeInputDanger("add-new-ban-unban-time");
    }
);


$("#add-new-ban-back-link, #edit-ban-back-link").click(backToIndexPage);


$("#add-new-ban-unban-infinity-time").on("change",
    function() {
        var checkState = $(this).prop("checked");

        if (checkState == true) {
            $("#add-new-ban-unban-time").prop("disabled", true);
        }
        else {
            $("#add-new-ban-unban-time").prop("disabled", false);
        }
    }
)


$("#add-new-ban-ip, #add-new-ban-serial, #add-new-ban-reason, #add-new-ban-unban-time, #add-new-ban-unban-infinity-time").focus(
	function() {
		if (Bans.Load == true) {
			$('#add-new-ban-btn').prop("disabled", false);

            var selectorID = $(this).attr('id');

            if (selectorID == ("add-new-ban-ip" || "add-new-ban-serial")) {
                removeInputDanger("add-new-ban-ip");
                removeInputDanger("add-new-ban-serial");
            }
            else if (selectorID != "add-new-ban-unban-infinity-time") {
			    removeInputDanger(selectorID);
			}
		}
	}
);


$("#add-new-ban-btn").click(
    function() {
        if ((Bans.Load == true) && (Pages.AddNewBan.Selected == true) && (Actions.External.Execute == false)) {
            var banIP = $('#add-new-ban-ip').val();

            var banSerial = $('#add-new-ban-serial').val();

            var banReason = $('#add-new-ban-reason').val();

            var banUnbanTime = Date.parse($('#add-new-ban-unban-time').val());

            var banUnbanInfinityTimeCheck = $("#add-new-ban-unban-infinity-time").prop("checked");

            var NewBan = {Error: false, Data: {}};

            if ((banIP == "") && (banSerial == "")) {
                NewBan.Error = true;

                setInputDanger("add-new-ban-ip");
                setInputDanger("add-new-ban-serial");

                alert(BCJSTexts.AddNewBanPage.Error.IPAndSerialEmptyText);
            }
            else {
                if (banIP != "") {
                    NewBan.Data.IP = banIP;
                }

                if (banSerial != "") {
                    NewBan.Data.Serial = banSerial;
                }
            }

            if ((NewBan.Error == false) && (banReason.length > 60)) {
                NewBan.Error = true;

                setInputDanger("add-new-ban-reason");

                alert(BCJSTexts.AddNewBanPage.Error.ReasonTooLongText);
            }
            else if (banReason != "") {
                NewBan.Data.Reason = banReason;
            }

            if ((NewBan.Error == false) && (banUnbanInfinityTimeCheck == false) && (isNaN(banUnbanTime) == true)) {
                NewBan.Error = true;

                setInputDanger("add-new-ban-unban-time");

                alert(BCJSTexts.AddNewBanPage.Error.UnbanTimeEmptyText);
            }
            else if (banUnbanInfinityTimeCheck == false) {
                NewBan.Data.UnbanTime = banUnbanTime / 1000;
            }

            if (NewBan.Error == false) {
                Actions.External.Execute = true;

                $.ajax({
                    url: "/"+ resourceName +"/call/webAddNewBan",
                    data: JSON.stringify([NewBan.Data]),
                    type: "POST"
                })
                .done(
                    function(data) {
                        var ResponseObject = $.parseJSON(data)[0];

                        try {
                            if (ResponseObject == undefined) {
                                throw new SyntaxError("Error with function 'webAddNewBan' (Response undefined)");
                            }
                            else if (ResponseObject.ErrorCode == undefined) {
                                throw new SyntaxError("Error with function 'webAddNewBan' ('ErrorCode' incorrect)");
                            }
                            else if (ResponseObject.ErrorCode != 0) {
                                alert(BCJSTexts.AddNewBanPage.Error.ServerErrorText.replace("$error_code", ResponseObject.ErrorCode));

                                throw new ReferenceError("Error with function 'webAddNewBan' (Error code: "+ ResponseObject.ErrorCode +")");
                            }
                            else if ((ResponseObject.Response == undefined) || (typeof ResponseObject.Response != "object")) {
                                throw new SyntaxError("Error with function 'webAddNewBan' ('Response' incorrect)");
                            }

                            var NewBanLoadData = ResponseObject.Response;

                            loadBansData(new Array(NewBanLoadData));

                            Bans.NumberOfBans++;


                            alert(BCJSTexts.AddNewBanPage.SuccessfullyText);

                            var banRow = getBansDataTableRow(1, NewBanLoadData.BanTime, NewBanLoadData.Data);

                            $("#bansdata-table-rows").prepend(banRow.hide());
                            banRow.fadeIn("slow");

                            banRow.nextAll().each(
                                function(i) {
                                    $(this).find(".row-number").text(i + 2);
                                }
                            );


                            if ($("#no-bans").css("display") == "table-row") {
                                $("#no-bans").addClass("bc-hide");
                            }

                            updateShownBansText();

                            $("#add-new-ban-ip, #add-new-ban-serial, #add-new-ban-reason, #add-new-ban-unban-time").val("");
                            $("#add-new-ban-unban-infinity-time").prop("checked", false);
                            $("#add-new-ban-btn").prop("disabled", true);

                            backToIndexPage();
                        }
                        catch (e) {
                            console.log("["+ e.name + "] "+ e.message);
                        }

                        Actions.External.Execute = false;
                    }
                );
            }
        }
    }
);


$("#remove-bans-btn, #edit-remove-ban-btn").click(
    function() {
        if ((Bans.Load == true) && (Actions.External.Execute == false)) {
            var BansTimeData = new Array();

            $('input[name="ban-check"]:checked').each(
                function(key, value) {
                    BansTimeData.push($(value).val());
                }
            );

            if (confirm(BCJSTexts.RemoveBans.ConfirmText)) {
                Actions.External.Execute = true;

                $.ajax({
                    url: "/"+ resourceName +"/call/webRemoveBans",
                    data: JSON.stringify([BansTimeData]),
                    type: "POST"
                })
                .done(
                    function (data) {
                        var ResponseObject = $.parseJSON(data)[0];

                        try {
                            if (ResponseObject == undefined) {
                                throw new SyntaxError("Error with function 'webRemoveBans' (Response undefined)");
                            }
                            if (ResponseObject.ErrorCode == undefined) {
                                throw new SyntaxError("Error with function 'webRemoveBans' ('ErrorCode' incorrect)");
                            }
                            else if (ResponseObject.ErrorCode != 0) {
                                if (ResponseObject.ErrorData != undefined) {
                                    throw new ReferenceError("Error with function 'webRemoveBans' (Error code: " + ResponseObject.ErrorCode + ", Key: "+ ResponseObject.ErrorData.Key +", Time: "+ ResponseObject.ErrorData.Time +")");
                                }
                                else {
                                    throw new ReferenceError("Error with function 'webRemoveBans' (Error code: " + ResponseObject.ErrorCode + ")");
                                }
                            }

                            removeBansData(BansTimeData);

                            Bans.NumberOfBans = (Bans.NumberOfBans - BansTimeData.length);


                            alert(BCJSTexts.RemoveBans.SuccessfullyText);

                            var lastRemovedRow = false;

                            for (var btdKey in BansTimeData) {
                                if (btdKey == (BansTimeData.length - 1)) {
                                    lastRemovedRow = true;
                                }

                                removeBansDataTableRow(BansTimeData[btdKey], lastRemovedRow);
                            }


                            if (Bans.Length == 0) {
                                $("#no-admins").css("display", "table-row");
                                $("#show-more-bans").css("display", "none");
                            }

                            updateShownBansText();

                            $("#edit-ban-btn").prop("disabled", true);
                            $("#remove-bans-btn").prop("disabled", true).text(BCJSTexts.IndexPage.RemoveBansBtnText);

                            backToIndexPage();
                        }
                        catch (e) {
                            console.log("["+ e.name + "] "+ e.message);
                        }

                        Actions.External.Execute = false;
                    }
                );
            }
        }
    }
);


$("#edit-ban-unban-infinity-time").on("change",
    function() {
        var checkState = $(this).prop("checked");

        if (checkState == true) {
            $("#edit-ban-unban-time").prop("disabled", true);
        }
        else {
            $("#edit-ban-unban-time").prop("disabled", false);
        }
    }
);


$("#edit-ban-nick, #edit-ban-admin, #edit-ban-reason, #edit-ban-unban-time, #edit-ban-unban-infinity-time").focus(
	function() {
		if (Bans.Load == true) {
			$('#edit-edit-ban-btn').prop("disabled", false);

            var selectorID = $(this).attr('id');

            if ((selectorID == "edit-ban-reason") || (selectorID == "edit-ban-unban-time")) {
			    removeInputDanger(selectorID);
			}
		}
	}
);


$("#edit-ban-btn").click(
    function() {
        if (Bans.Load == true) {
            var banTime = $('input[name="ban-check"]:checked').val();

            if(Bans.Data[banTime] != undefined) {
                selectPage("EditBan");

                Pages.EditBan.BanTime = banTime;


                $("#index-page").addClass("bc-hide");

                $("#edit-ban-page").removeClass("bc-hide");

                if (Bans.Data[banTime].IP != undefined) {
                    $("#edit-ban-ip").parent().removeClass("bc-hide");
                    $("#edit-ban-ip").html($("<b>").text(Bans.Data[banTime].IP));
                }
                else {
                    $("#edit-ban-ip").parent().addClass("bc-hide");
                }

                if (Bans.Data[banTime].Serial != undefined) {
                    $("#edit-ban-serial").parent().removeClass("bc-hide");
                    $("#edit-ban-serial").html($("<b>").text(Bans.Data[banTime].Serial));
                }
                else {
                    $("#edit-ban-serial").parent().addClass("bc-hide");
                }

                var banTimeDate = moment.unix(banTime);

                $("#edit-ban-ban-time").text(banTimeDate.format("DD/MM/YYYY hh:mm:ss"));


                if (Bans.Data[banTime].Nick != undefined) {
                    $("#edit-ban-nick").val(Bans.Data[banTime].Nick);
                }

                if (Bans.Data[banTime].Admin != undefined) {
                    $("#edit-ban-admin").val(Bans.Data[banTime].Admin);
                }

                if (Bans.Data[banTime].Reason != undefined) {
                    $("#edit-ban-reason").val(Bans.Data[banTime].Reason);
                }

                removeInputDanger("edit-ban-reason");

                if (Bans.Data[banTime].UnbanTime != undefined) {
                    var unbanTimeDate = moment.unix(Bans.Data[banTime].UnbanTime);

                    $("#edit-ban-unban-time").val(unbanTimeDate.format("YYYY-MM-DDThh:mm:ss")).prop("disabled", false);
                    $("#edit-ban-unban-infinity-time").prop("checked", false);
                }
                else {
                    $("#edit-ban-unban-time").val("").prop("disabled", true);
                    $("#edit-ban-unban-infinity-time").prop("checked", true);
                }

                removeInputDanger("edit-ban-unban-time");


                $('#edit-edit-ban-btn').prop("disabled", true);
            }
        }
    }
);


$("#edit-edit-ban-btn").click(
    function() {
        if ((Pages.EditBan.Selected == true) && (Actions.External.Execute == false)) {
            var banNick = $("#edit-ban-nick").val();

            var banAdmin = $("#edit-ban-admin").val();

            var banReason = $("#edit-ban-reason").val();

            var banUnbanTime = Date.parse($("#edit-ban-unban-time").val());

            var banUnbanInfinityTimeCheck = $("#edit-ban-unban-infinity-time").prop("checked");

            var EditBan = {Error: false, Data: {}};

            if (banNick != "") {
                EditBan.Data.Nick = banNick;
            }

            if (banAdmin != "") {
                EditBan.Data.Admin = banAdmin;
            }

            if (banReason.length > 60) {
                EditBan.Error = true;

                setInputDanger("edit-ban-reason");

                alert(BCJSTexts.EditBanPage.Error.ReasonTooLongText);
            }
            else if (banReason != "") {
                EditBan.Data.Reason = banReason;
            }

            if ((EditBan.Error == false) && (banUnbanInfinityTimeCheck == false) && (isNaN(banUnbanTime) == true)) {
                EditBan.Error = true;

                setInputDanger("edit-ban-unban-time");

                alert(BCJSTexts.EditBanPage.Error.UnbanTimeEmptyText);
            }
            else if (banUnbanInfinityTimeCheck == false) {
                EditBan.Data.UnbanTime = banUnbanTime / 1000;
            }

            if (EditBan.Error == false) {
                Actions.External.Execute = true;

                $.ajax({
                    url: "/"+ resourceName +"/call/webEditBan",
                    data: JSON.stringify([Pages.EditBan.BanTime, EditBan.Data]),
                    type: "POST"
                })
                .done(
                    function (data) {
                        var ResponseObject = $.parseJSON(data)[0];

                        try {
                            if (ResponseObject == undefined) {
                                throw new SyntaxError("Error with function 'webEditBan' (Response undefined)");
                            }
                            else if (ResponseObject.ErrorCode == undefined) {
                                throw new SyntaxError("Error with function 'webEditBan' ('ErrorCode' incorrect)");
                            }
                            else if (ResponseObject.ErrorCode != 0) {
                                alert(BCJSTexts.EditBanPage.Error.ServerErrorText.replace("$error_code", ResponseObject.ErrorCode));

                                throw new ReferenceError("Error with function 'webEditBan' (Error code: "+ ResponseObject.ErrorCode +")");
                            }
                            else if ((ResponseObject.Response == undefined) || (typeof ResponseObject.Response != "object")) {
                                throw new SyntaxError("Error with function 'webEditBan' ('Response' incorrect)");
                            }

                            var ChangedBanData = ResponseObject.Response;

                            editBansData(new Array({BanTime: Pages.EditBan.BanTime, Data: ChangedBanData}));


                            alert(BCJSTexts.EditBanPage.SuccessfullyText);

                            editBansDataTableRow(Pages.EditBan.BanTime, ChangedBanData);


                            $('#edit-edit-ban-btn').prop("disabled", true);

                            backToIndexPage();
                        }
                        catch (e) {
                            console.log("["+ e.name + "] "+ e.message);
                        }

                        Actions.External.Execute = false;
                    }
                );
            }
        }
    }
);