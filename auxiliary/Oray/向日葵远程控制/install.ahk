ControlClick "x402 y334", "向日葵远程控制"
Loop {
    If FileExist("C:\Users\Public\Desktop\向日葵远程控制.lnk") {
        Sleep 60000
        ControlClick "x405 y359", "向日葵远程控制"
        Break
    }
    Sleep 1000
}