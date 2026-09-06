$ws = New-Object -ComObject WScript.Shell
$sc = $ws.CreateShortcut("D:\Projects\baklava\DroidDeck.lnk")
$sc.TargetPath = "D:\Projects\baklava\dist\DroidDeck-win32-x64\DroidDeck.exe"
$sc.WorkingDirectory = "D:\Projects\baklava\dist\DroidDeck-win32-x64"
$sc.Description = "DroidDeck - Android Desktop Control Suite"
$sc.Save()
Write-Host "Created DroidDeck.lnk successfully"
