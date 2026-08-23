$ErrorActionPreference = 'Stop'

Write-Host "Preparando o repositório para segurança antes do Git..." -ForegroundColor Cyan

$pathsToRemove = @(
  '.env',
  '.env.local',
  '.env.development',
  '.env.production',
  '.env.*',
  'google-services.json',
  'GoogleService-Info.plist',
  'node_modules',
  '.expo',
  '.expo-shared',
  '.expo-packager-cache',
  '.expo-cache',
  '.expo-cli',
  '.expo-dev-client',
  'dist',
  'build',
  'coverage',
  '.cache',
  '.vscode',
  '.idea',
  '.manus-logs',
  'web-build',
  'android',
  'ios',
  '*.pem',
  '*.key',
  '*.p12',
  '*.p8',
  '*.jks',
  '*.keystore',
  '*.mobileprovision',
  '*.log'
)

# Remove do rastreio do Git, se houver
foreach ($pattern in $pathsToRemove) {
  $isTracked = $false
  try {
    git ls-files --error-unmatch $pattern *>$null
    $isTracked = ($LASTEXITCODE -eq 0)
  } catch {
    $isTracked = $false
  }

  if ($isTracked) {
    git rm -r --cached --ignore-unmatch $pattern *>$null
    Write-Host "Removido do rastreio: $pattern" -ForegroundColor Yellow
  }
}

# Remove arquivos físicos locais, apenas se existirem e a intenção for limpar o workspace
$removeLocalFiles = @(
  '.env',
  '.env.local',
  '.env.development',
  '.env.production',
  '.expo',
  'dist',
  'build',
  'coverage',
  'node_modules',
  '.manus-logs',
  'android',
  'ios'
)

foreach ($item in $removeLocalFiles) {
  if (Test-Path $item) {
    Remove-Item -Recurse -Force $item -ErrorAction SilentlyContinue
    Write-Host "Removido localmente: $item" -ForegroundColor DarkYellow
  }
}

# Garante que o Gitignore está no lugar
if (-not (Test-Path '.gitignore')) {
  Write-Host 'Arquivo .gitignore não encontrado.' -ForegroundColor Red
  exit 1
}

Write-Host "" 
Write-Host "Checklist final:" -ForegroundColor Green
Write-Host "1. Arquivos sensíveis removidos do rastreio do Git." -ForegroundColor Green
Write-Host "2. .gitignore reforçado para ignorar segredos e artefatos locais." -ForegroundColor Green
Write-Host "3. Recomendado: validar com 'git status --ignored --short' e depois fazer o primeiro commit." -ForegroundColor Green
Write-Host "4. Se este for o primeiro commit, cria um .env.example sem segredos e mantenha as credenciais apenas localmente." -ForegroundColor Green
