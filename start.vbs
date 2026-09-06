Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")
rootDir = FSO.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = rootDir

' Check if packaged exe exists, otherwise use local electron.exe
exePath = rootDir & "\dist\DroidDeck-win32-x64\DroidDeck.exe"
If FSO.FileExists(exePath) Then
    WshShell.Run """" & exePath & """", 0, False
Else
    electronPath = rootDir & "\node_modules\electron\dist\electron.exe"
    If FSO.FileExists(electronPath) Then
        WshShell.Run """" & electronPath & """ """ & rootDir & """", 0, False
    Else
        WshShell.Run "cmd /c npx electron .", 0, False
    End If
End If
