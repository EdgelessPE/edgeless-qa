ControlClick "402 334", "向日葵远程控制"
Loop {
    If FileExist("C:\Users\Public\Desktop\向日葵远程控制.lnk") {
        Sleep 60000
        ControlClick "405 359", "向日葵远程控制"
        Break
    }
    Sleep 1000
}