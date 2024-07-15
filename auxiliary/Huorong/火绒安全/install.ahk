ControlClick "x330 y257", "火绒安全软件安装"
Loop {
    If FileExist("C:\Users\Public\Desktop\火绒安全软件.lnk") {
        Sleep 60000
        ControlClick "x330 y311", "火绒安全软件安装"
        Break
    }
    Sleep 1000
}