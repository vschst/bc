function webGetBansData()
    local returnTable = {}

    returnTable.ErrorCode = 0

    if (BCLoad == true) then
        local WebBansData = {}

        local BansTimeData = {}

        local numberOfBans = 0

        for bdKey, bdValue in pairs(BansData) do
            table.insert(BansTimeData, bdKey)

            numberOfBans = numberOfBans + 1
        end

        if (numberOfBans > 0) then
            table.sort(BansTimeData,
                function(a, b)
                    return (a > b)
                end
            )

            for btdKey, btdValue in ipairs(BansTimeData) do
                if (btdKey <= BCSettings.WebMaxNumberOfBansToShow) then
                    table.insert(WebBansData, {BanTime = btdValue, Data = webGetBanData(btdValue)})
                else
                    break
                end
            end
        end

        returnTable.Response = {Data = WebBansData, NumberOfBans = numberOfBans}
    else
        returnTable.ErrorCode = (-1)
    end

    return returnTable
end


function webGetBanData(banTime)
    local theBan = BansData[banTime].Object

    local BanData = getBanAdditionalData(theBan)

    if (BansData[banTime].Data.IP ~= nil) then
        BanData.IP = BansData[banTime].Data.IP
    end

    if (BansData[banTime].Data.Serial ~= nil) then
        BanData.Serial = BansData[banTime].Data.Serial
    end

    return BanData
end


function webGetMoreBansData(minBanTime)
    local returnTable = {}

    returnTable.ErrorCode = 0

    if (BCLoad == true) then
        if (minBanTime ~= nil) then
            minBanTime = tonumber(minBanTime)

            local WebBansData = {}

            local BansTimeData = {}

            local numberOfBans = 0

            for bdKey, bdValue in pairs(BansData) do
                if (bdKey < minBanTime) then
                    table.insert(BansTimeData, bdKey)
                end

                numberOfBans = numberOfBans + 1
            end

            if (numberOfBans > 0) then
                table.sort(BansTimeData,
                    function(a, b)
                        return (a > b)
                    end
                )

                for btdKey, btdValue in ipairs(BansTimeData) do
                    if (btdKey <= BCSettings.WebMaxNumberOfBansToShow) then
                        table.insert(WebBansData, {BanTime = btdValue, Data = webGetBanData(btdValue)})
                    else
                        break
                    end
                end
            end

            returnTable.Response = {Data = WebBansData, NumberOfBans = numberOfBans}
        else
            returnTable.ErrorCode = (-2)
        end
    else
        returnTable.ErrorCode = (-1)
    end

    return returnTable
end


function webAddNewBan(NewBanData)
    local returnTable = {}

    returnTable.ErrorCode = 0

    if (BCLoad == true) then
        if (NewBanData ~= nil) then
            if ((NewBanData.IP == nil) and (NewBanData.Serial == nil)) then
                returnTable.ErrorCode = (-3)
            else
                local time = getRealTime()

                local unbanTime = 0

                if (NewBanData.UnbanTime ~= nil) then
                    unbanTime = NewBanData.UnbanTime - time.timestamp

                    if (unbanTime < 0) then
                       unbanTime = 0
                    end
                end

                local theBan = addBan(NewBanData.IP, nil, NewBanData.Serial, getRootElement(), NewBanData.Reason, unbanTime)

                local addBanDataStatus, addBanDataResult = pcall(addBanData, theBan)

                if (addBanDataStatus == true) then
                    returnTable.Response = {BanTime = addBanDataResult, Data = webGetBanData(addBanDataResult)}
                else
                    returnTable.ErrorCode = ((-4) + addBanDataResult.Code)
                end
            end
        else
            returnTable.ErrorCode = (-2)
        end
    else
        returnTable.ErrorCode = (-1)
    end

    return returnTable
end


function webRemoveBans(BansTimeData)
    local returnTable = {}

    returnTable.ErrorCode = 0

    if (BCLoad == true) then
        if (BansTimeData ~= nil) then
            for btKey, btValue in ipairs(BansTimeData) do
                local banTime = tonumber(btValue)

                if (BansData[banTime] ~= nil) then
                    if (removeBan(BansData[banTime].Object) == true) then
                        BansData[btValue] = nil
                    else
                        returnTable.ErrorData = {Key = btKey, BanTime = banTime}
                        returnTable.ErrorCode = (-3)

                        break
                    end
                end
            end
        else
            returnTable.ErrorCode = (-2)
        end
    else
        returnTable.ErrorCode = (-1)
    end

    return returnTable
end


function webEditBan(banTime, EditedData)
    local returnTable = {}

    returnTable.ErrorCode = 0

    if (BCLoad == true) then
        if ((banTime ~= nil) and (EditedData ~= nil)) then
            banTime = tonumber(banTime)

            if (BansData[banTime] ~= nil) then
                if (EditedData.UnbanTime ~= nil) then
                    EditedData.UnbanTime = tonumber(EditedData.UnbanTime)
                end

                local editBanDataStatus, editBanDataResult = pcall(editBanData, BansData[banTime].Object, EditedData)

                if (editBanDataStatus == true) then
                    returnTable.Response = editBanDataResult
                else
                    returnTable.ErrorCode = ((-4) + editBanDataResult.Code)
                end
            else
                returnTable.ErrorCode = (-3)
            end
        else
            returnTable.ErrorCode = (-2)
        end
    else
        returnTable.ErrorCode = (-1)
    end

    return returnTable
end


function webUpdateAddedBans(maxBanTime)
    local returnTable = {}

    returnTable.ErrorCode = 0

    if (BCLoad == true) then
        if (maxBanTime ~= nil) then
            maxBanTime = tonumber(maxBanTime)

            local WebBansData = {}

            local numberOfBans = 0

            for bdKey, bdValue in pairs(BansData) do
                if (bdKey > maxBanTime) then
                    table.insert(WebBansData, {BanTime = bdKey, Data = webGetBanData(bdKey)})
                end

                numberOfBans = numberOfBans + 1
            end

            table.sort(WebBansData,
                function(a, b)
                    return (a.BanTime >  b.BanTime)
                end
            )

            returnTable.Response = {Data = WebBansData, NumberOfBans = numberOfBans}
        else
            returnTable.ErrorCode = (-2)
        end
    else
        returnTable.ErrorCode = (-1)
    end

    return returnTable
end


function webUpdateRemovedBans(LastBansTimeData)
    local returnTable = {}

    returnTable.ErrorCode = 0

    if (BCLoad == true) then
        if (LastBansTimeData ~= nil) then
            local RemovedBansTimeData = {}

            for lbtdKey, lbtdValue in ipairs(LastBansTimeData) do
                local banTime = tonumber(lbtdValue)

                if (BansData[banTime] == nil) then
                    table.insert(RemovedBansTimeData, banTime)
                end
            end

            returnTable.Response = RemovedBansTimeData
        else
            returnTable.ErrorCode = (-2)
        end
    else
        returnTable.ErrorCode = (-1)
    end

    return returnTable
end


function webUpdateEditedBans(LastBansData)
    local returnTable = {}

    returnTable.ErrorCode = 0

    if (BCLoad == true) then
        if (LastBansData ~= nil) then
            local ChangedBansData = {}

            for lbdKey, lbdValue in ipairs(LastBansData) do
                if ((lbdValue.BanTime ~= nil) and (lbdValue.Data ~= nil)) then
                    local banTime = tonumber(lbdValue.BanTime)

                    if (BansData[banTime] ~= nil) then
                        local CurrentBanData = getBanAdditionalData(BansData[banTime].Object)

                        local ChangedBan = {Modified = false, Data = {}}

                        --Nick
                        if ((CurrentBanData.Nick ~= nil) and ((lbdValue.Data.Nick == nil) or (lbdValue.Data.Nick ~= CurrentBanData.Nick))) then
                            ChangedBan.Data.Nick = CurrentBanData.Nick

                            ChangedBan.Modified = true
                        elseif ((lbdValue.Data.Nick ~= nil) and (CurrentBanData.Nick == nil)) then
                            ChangedBan.Data.Nick = false

                            ChangedBan.Modified = true
                        end

                        --Admin
                        if ((CurrentBanData.Admin ~= nil) and ((lbdValue.Data.Admin == nil) or (lbdValue.Data.Admin ~= CurrentBanData.Admin))) then
                            ChangedBan.Data.Admin = CurrentBanData.Admin

                            ChangedBan.Modified = true
                        elseif ((lbdValue.Data.Admin ~= nil) and (CurrentBanData.Admin == nil)) then
                            ChangedBan.Data.Admin = false

                            ChangedBan.Modified = true
                        end

                        --Reason
                        if ((CurrentBanData.Reason ~= nil) and ((lbdValue.Data.Reason == nil) or (lbdValue.Data.Reason ~= CurrentBanData.Reason))) then
                            ChangedBan.Data.Reason = CurrentBanData.Reason

                            ChangedBan.Modified = true
                        elseif ((lbdValue.Data.Reason ~= nil) and (CurrentBanData.Reason == nil)) then
                            ChangedBan.Data.Reason = false

                            ChangedBan.Modified = true
                        end

                        --Unban time
                        if ((CurrentBanData.UnbanTime ~= nil) and ((lbdValue.Data.UnbanTime == nil) or (tonumber(lbdValue.Data.UnbanTime) ~= CurrentBanData.UnbanTime))) then
                            ChangedBan.Data.UnbanTime = CurrentBanData.UnbanTime

                            ChangedBan.Modified = true
                        elseif ((lbdValue.Data.UnbanTime ~= nil) and (CurrentBanData.UnbanTime == nil)) then
                            ChangedBan.Data.UnbanTime = false

                            ChangedBan.Modified = true
                        end

                        if (ChangedBan.Modified == true) then
                            table.insert(ChangedBansData, {BanTime = banTime, Data = ChangedBan.Data})
                        end
                    end
                else
                    returnTable.ErrorCode = (-3)
                    returnTable.ErrorData = {Key = lbdKey}

                    break
                end
            end

            returnTable.Response = ChangedBansData
        else
            returnTable.ErrorCode = (-2)
        end
    else
        returnTable.ErrorCode = (-1)
    end

    return returnTable
end


function webGetTexts()
    local returnTable = {}

    returnTable.ErrorCode = 0

    if (BCLoad == true) then
        returnTable.Response = TextsWeb
    else
        returnTable.ErrorCode = (-1)
    end

    return returnTable
end