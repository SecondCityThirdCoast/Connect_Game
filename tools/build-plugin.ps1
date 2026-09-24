# Builds dist/hackathon-quest.zip -- upload it in WordPress: Plugins > Add New > Upload Plugin.
$root = Split-Path -Parent $PSScriptRoot
$stage = Join-Path $root 'dist\hackathon-quest'
$zip = Join-Path $root 'dist\hackathon-quest.zip'

if (Test-Path $stage) { Remove-Item -Recurse -Force $stage }
if (Test-Path $zip) { Remove-Item -Force $zip }
New-Item -ItemType Directory -Force $stage | Out-Null

Copy-Item (Join-Path $root 'hackathon-quest.php') $stage
Copy-Item -Recurse (Join-Path $root 'game') $stage

Compress-Archive -Path $stage -DestinationPath $zip
Remove-Item -Recurse -Force $stage
Write-Host "Built $zip"
