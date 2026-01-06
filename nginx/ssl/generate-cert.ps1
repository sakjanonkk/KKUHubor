# Generate self-signed SSL certificate with SAN for localhost (Windows PowerShell)
# Run this script from the nginx/ssl directory

$ErrorActionPreference = "Stop"

Write-Host "Generating self-signed SSL certificate with SAN..." -ForegroundColor Cyan

# Check if OpenSSL is available
try {
    $null = Get-Command openssl -ErrorAction Stop
} catch {
    Write-Host "ERROR: OpenSSL is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install OpenSSL or use Git Bash to run generate-cert.sh" -ForegroundColor Yellow
    exit 1
}

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Generate private key and certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 `
    -keyout server.key `
    -out server.crt `
    -config openssl.cnf

Write-Host ""
Write-Host "SSL Certificate generated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Files created:" -ForegroundColor Cyan
Write-Host "  - server.key (private key)"
Write-Host "  - server.crt (certificate)"
Write-Host ""
Write-Host "Certificate details:" -ForegroundColor Cyan
openssl x509 -in server.crt -noout -subject -dates

Write-Host ""
Write-Host "SAN (Subject Alternative Names):" -ForegroundColor Cyan
openssl x509 -in server.crt -noout -ext subjectAltName
