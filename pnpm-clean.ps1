# pnpm-clean.ps1（兼容性更好的版本）

Write-Host "Clearing node_modules and pnpm-lock.yaml..." -ForegroundColor Cyan
if (Test-Path node_modules) {
    Remove-Item -Recurse -Force node_modules
}
if (Test-Path pnpm-lock.yaml) {
    Remove-Item -Force pnpm-lock.yaml
}

Write-Host "Cleaning pnpm cache..." -ForegroundColor Cyan
pnpm store prune
pnpm store clear

Write-Host "Reinstalling dependencies..." -ForegroundColor Cyan
pnpm install

Write-Host "Cleanup and reinstall completed." -ForegroundColor Green
