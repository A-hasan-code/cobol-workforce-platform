# Install portable GnuCOBOL into tools\gnucobol\dist (no Admin required).
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\setup-gnucobol-windows.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Tools = Join-Path $Root "tools\gnucobol"
$Dist = Join-Path $Tools "dist"
$Cobc = Join-Path $Dist "bin\cobc.exe"
$Archive = Join-Path $Tools "gnucobol.7z"
$Url = "https://arnoldtrembley.com/GC32-BDB-SP1-rename-7z-to-exe.7z"

function Test-CobcReady {
  param([string]$PathHint)
  if ($PathHint -and (Test-Path $PathHint)) {
    & $PathHint --version | Select-Object -First 1
    return $true
  }
  $cmd = Get-Command cobc -ErrorAction SilentlyContinue
  if ($cmd) {
    & cobc --version | Select-Object -First 1
    return $true
  }
  return $false
}

Write-Host "==> Checking for cobc..."
if (Test-CobcReady $Cobc) {
  Write-Host "OK — bundled cobc ready at $Cobc"
  Write-Host "Runtime Kit auto-detects tools\gnucobol\dist. Run: npm run doctor"
  exit 0
}

New-Item -ItemType Directory -Force -Path $Tools | Out-Null

if (-not (Test-Path $Archive) -or (Get-Item $Archive).Length -lt 1MB) {
  Write-Host "==> Downloading GnuCOBOL 3.2 MinGW (~26MB)..."
  Invoke-WebRequest -Uri $Url -OutFile $Archive -UseBasicParsing
}

Write-Host "==> Extracting to $Dist ..."
New-Item -ItemType Directory -Force -Path $Dist | Out-Null

$seven = @(
  "$env:ProgramFiles\7-Zip\7z.exe",
  "${env:ProgramFiles(x86)}\7-Zip\7z.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

$sevenZa = Join-Path $Root "tools\7za\7za.exe"
if (-not $seven -and -not (Test-Path $sevenZa)) {
  Write-Host "==> Fetching portable 7za..."
  $zip = Join-Path $Root "tools\7za.zip"
  Invoke-WebRequest -Uri "https://www.7-zip.org/a/7za920.zip" -OutFile $zip -UseBasicParsing
  Expand-Archive -Force $zip -DestinationPath (Join-Path $Root "tools\7za")
}

if ($seven) {
  & $seven x -y "-o$Dist" $Archive | Out-Null
} elseif (Test-Path $sevenZa) {
  & $sevenZa x -y "-o$Dist" $Archive | Out-Null
} else {
  # Self-extracting 7z disguised as archive — copy to .exe and run
  $sfx = Join-Path $Tools "gnucobol-extract.exe"
  Copy-Item -Force $Archive $sfx
  Push-Location $Tools
  & $sfx -o"$Dist" -y
  Pop-Location
}

# Some SFX layouts nest one extra folder
if (-not (Test-Path $Cobc)) {
  $found = Get-ChildItem $Dist -Recurse -Filter cobc.exe -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($found) {
    $nestedRoot = $found.Directory.Parent.FullName
    if ($nestedRoot -ne $Dist) {
      Write-Host "==> Flattening nested extract from $nestedRoot"
      Get-ChildItem $nestedRoot | ForEach-Object {
        Move-Item -Force $_.FullName -Destination $Dist
      }
    }
  }
}

if (-not (Test-Path $Cobc)) {
  Write-Host "FAIL — cobc.exe not found after extract."
  exit 1
}

Write-Host "OK — $Cobc"
& $Cobc --version | Select-Object -First 1
Write-Host ""
Write-Host "Next: npm run doctor && npm run compile && npm run test:sample"
exit 0
