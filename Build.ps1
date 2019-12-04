
# This build script can be run from Visual Studio Code by pressing CTRL+SHIFT+B

# To enable running PowerShell scripts: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned

Write-Output "Building '$PSScriptRoot'"

$code = (Get-Content .\Build.csx) -join "`r`n"
Add-Type -TypeDefinition $code -Language CSharp	
[Program]::Main($PSScriptRoot)