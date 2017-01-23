BCSettings = {}
BansData = {}
TextsWeb = {}

BCLoad = false


addEventHandler("onResourceStart", getRootElement(),
    function(startedResource)
        if (startedResource == getThisResource()) then
            try {
                function()
                    loadBCSettings()

                    loadBansData()

                    TextsWeb = loadTexts("texts/data/texts_web.xml")

                    BCLoad = true

                    outputServerLog("[BC] Resource was successfully loaded!")
                end,

                catch {
                    function(LoadError)
                        BCSettings, BansData = nil, nil

                        outputServerLog("[BC] Load error! Error in function: " .. LoadError.Source .. ", Error code: " .. LoadError.Code)
                    end
                }
            }
        end
    end
)


addEvent("BCErrorOutput", true)

addEventHandler("BCErrorOutput", getRootElement(),
    function(ErrorSource, ErrorCode)
        outputServerLog("[BC] Error in function: " .. ErrorSource .. " (Error code: " .. ErrorCode ..")")
    end
)


addEventHandler("onBan", getRootElement(),
    function(theBan)
        if (BCLoad == true) then
            local addBanDataStatus, addBanDataResult = pcall(addBanData, theBan)

            if (addBanDataStatus == false) then
                triggerEvent("BCErrorOutput", getRootElement(), addBanDataResult.Source, addBanDataResult.Code)
            end
        end
    end
)


addEventHandler( "onUnban", getRootElement(),
    function(theBan)
        if (BCLoad == true) then
            local removeBanDataStatus, removeBanDataResult = pcall(removeBanData, theBan)

            if (removeBanDataStatus == false) then
                triggerEvent("BCErrorOutput", getRootElement(), removeBanDataResult.Source, removeBanDataResult.Code)
            end
        end
    end
)


function addBanData(theBan)
    local ErrorData = {Source = debug.getinfo(1, "n").name, Code = 0}

    local banTime = getBanTime(theBan)

    if (banTime == false) then
        ErrorData.Code = (-1)
        error(ErrorData)
    end

    if (BansData[banTime] == nil) then
        local getBanDataStatus, getBanDataResult = pcall(getBanData, theBan)

        if (getBanDataStatus == true) then
            BansData[banTime] = {Object = theBan, Data = getBanDataResult}
        else
            triggerEvent("BCErrorOutput", getRootElement(), getBanDataResult.Source, getBanDataResult.Code)

            ErrorData.Code = (-2)
            error(ErrorData)
        end
    end

    return banTime
end


function removeBanData(theBan)
    local ErrorData = {Source = debug.getinfo(1, "n").name, Code = 0}

    local banTime = getBanTime(theBan)

    if (banTime == false) then
        ErrorData.Code = (-1)
        error(ErrorData)
    end

    if (BansData[banTime] ~= nil) then
        BansData[banTime] = nil
    end
end


function editBanData(theBan, EditedBanData)
    local ErrorData = {Source = debug.getinfo(1, "n").name, Code = 0 }

    local LastBanData = getBanAdditionalData(theBan)

    local ChangedBanData = {}

    --Nick
    if ((EditedBanData.Nick ~= nil) and ((LastBanData.Nick == nil) or (LastBanData.Nick ~= EditedBanData.Nick))) then
        if (setBanNick(theBan, EditedBanData.Nick) == true) then
            ChangedBanData.Nick = EditedBanData.Nick
        else
            ErrorData.Code = (-1)
            error(ErrorData)
        end
    elseif ((LastBanData.Nick ~= nil) and (EditedBanData.Nick == nil)) then
        if (setBanNick(theBan, "") == true) then
            ChangedBanData.Nick = false
        else
            ErrorData.Code = (-2)
            error(ErrorData)
        end
    end

    --Admin
    if ((EditedBanData.Admin ~= nil) and ((LastBanData.Admin == nil) or (LastBanData.Admin ~= EditedBanData.Admin))) then
        if (setBanAdmin(theBan, EditedBanData.Admin) == true) then
            ChangedBanData.Admin = EditedBanData.Admin
        else
            ErrorData.Code = (-3)
            error(ErrorData)
        end
    elseif ((LastBanData.Admin ~= nil) and (EditedBanData.Admin == nil)) then
        if (setBanAdmin(theBan, "") == true) then
            ChangedBanData.Admin = false
        else
            ErrorData.Code = (-4)
            error(ErrorData)
        end
    end

    --Reason
    if ((EditedBanData.Reason ~= nil) and ((LastBanData.Reason == nil) or (LastBanData.Reason ~= EditedBanData.Reason))) then
        if (setBanReason(theBan, EditedBanData.Reason) == true) then
            ChangedBanData.Reason = EditedBanData.Reason
        else
            ErrorData.Code = (-5)
            error(ErrorData)
        end
    elseif ((LastBanData.Reason ~= nil) and (EditedBanData.Reason == nil)) then
        if (setBanReason(theBan, "") == true) then
            ChangedBanData.Reason = false
        else
            ErrorData.Code = (-6)
            error(ErrorData)
        end
    end

    --Unban time
    if ((EditedBanData.UnbanTime ~= nil) and ((LastBanData.UnbanTime == nil) or (LastBanData.UnbanTime ~= EditedBanData.UnbanTime))) then
        if (setUnbanTime(theBan, EditedBanData.UnbanTime) == true) then
            ChangedBanData.UnbanTime = EditedBanData.UnbanTime
        else
            ErrorData.Code = (-7)
            error(ErrorData)
        end
    elseif ((LastBanData.UnbanTime ~= nil) and (EditedBanData.UnbanTime == nil)) then
        if (setUnbanTime(theBan, 0) == true) then
            ChangedBanData.UnbanTime = false
        else
            ErrorData.Code = (-8)
            error(ErrorData)
        end
    end

    return ChangedBanData
end


function getBanData(theBan)
    local ErrorData = {Source = debug.getinfo(1, "n").name, Code = 0}

    local BanData = {}

    local theBanIP = getBanIP(theBan)

    if (theBanIP ~= false) then
        BanData.IP = theBanIP
    end

    local theBanSerial = getBanSerial(theBan)

    if (theBanSerial ~= false) then
        BanData.Serial = theBanSerial
    end

    if ((BanData.IP == nil) and (BanData.Serial == nil)) then
        ErrorData.Code = (-1)
        error(ErrorData)
    end

    return BanData
end


function getBanAdditionalData(theBan)
    local BanAdditionalData = {}

    local banNick = getBanNick(theBan)

    if (banNick ~= false) then
        BanAdditionalData.Nick = banNick
    end

    local banAdmin = getBanAdmin(theBan)

    if (banAdmin ~= false) then
        BanAdditionalData.Admin = banAdmin
    end

    local banUnbanTime = getUnbanTime(theBan)

    if ((banUnbanTime ~= false) and (banUnbanTime ~= 0)) then
        BanAdditionalData.UnbanTime = banUnbanTime
    end

    local banReason = getBanReason(theBan)

    if (banReason ~= false) then
        BanAdditionalData.Reason = banReason
    end

    return BanAdditionalData
end


function loadBansData()
    local ErrorData = {Source = debug.getinfo(1, "n").name, Code = 0}

    local BansList = getBans()

    for blKey, blValue in ipairs(BansList) do
        local banTime = getBanTime(blValue)

        if (banTime == false) then
            ErrorData.Code = (-1)
            error(ErrorData)
        end

        local getBanDataStatus, getBanDataResult = pcall(getBanData, blValue)

        if (getBanDataStatus == true) then
            BansData[banTime] = {Object = blValue, Data = getBanDataResult}
        else
            outputServerLog("[BC] Load bans data failed! Key: ".. blKey .." Error in function: ".. getBanDataResult.Source .." (Error code: ".. getBanDataResult.Code ..")")

            ErrorData.Code = (-2)
            error(ErrorData)
        end
    end
end


function loadBCSettings()
    local ErrorData = {Source = debug.getinfo(1, "n").name, Code = 0}

    local BCSettingsLoad = {
        WebMaxNumberOfBansToShow = get("WebMaxNumberOfBansToShow")
    }

    local acSettingsAmount = 0

    for acslKey, acslValue in pairs(BCSettingsLoad) do
        acSettingsAmount = acSettingsAmount + 1

        if (acslValue == false) then
            ErrorData.Code = (-1) * acSettingsAmount

            error(ErrorData)
        end
    end

    --Web maximum number of bans to show.
    BCSettings.WebMaxNumberOfBansToShow = tonumber(BCSettingsLoad.WebMaxNumberOfBansToShow)

    if (BCSettings.WebMaxNumberOfBansToShow <= 0) then
        ErrorData.Code = (-1) * (acSettingsAmount + 1)

        error(ErrorData)
    end
end