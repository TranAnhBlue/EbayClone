# PowerShell script to test load balancing
# This script sends multiple requests to test if load is distributed across backend instances

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Testing Load Balancing" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# API endpoint
$API_URL = "http://localhost/api/health"

Write-Host "Testing health endpoint: $API_URL" -ForegroundColor Blue
Write-Host ""

# Test 1: Single request
Write-Host "Test 1: Single request" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri $API_URL -Method Get
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Multiple concurrent requests
Write-Host "Test 2: 10 concurrent requests" -ForegroundColor Yellow
$jobs = @()
for ($i = 1; $i -le 10; $i++) {
    $jobs += Start-Job -ScriptBlock {
        param($url, $index)
        try {
            $response = Invoke-RestMethod -Uri $url -Method Get
            Write-Output "Request $index : $($response | ConvertTo-Json -Compress)"
        } catch {
            Write-Output "Request $index : Error - $_"
        }
    } -ArgumentList $API_URL, $i
}

# Wait for all jobs to complete
$jobs | Wait-Job | Out-Null
$jobs | Receive-Job
$jobs | Remove-Job
Write-Host ""

# Test 3: Sequential requests to see response times
Write-Host "Test 3: 20 sequential requests with timing" -ForegroundColor Yellow
$times = @()
for ($i = 1; $i -le 20; $i++) {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $response = Invoke-RestMethod -Uri $API_URL -Method Get
        $stopwatch.Stop()
        $time = $stopwatch.ElapsedMilliseconds / 1000.0
        $times += $time
        Write-Host "Request $i : $($time.ToString('F3'))s" -ForegroundColor Green
    } catch {
        Write-Host "Request $i : Error" -ForegroundColor Red
    }
}
Write-Host ""
if ($times.Count -gt 0) {
    $avgTime = ($times | Measure-Object -Average).Average
    Write-Host "Average response time: $($avgTime.ToString('F3'))s" -ForegroundColor Cyan
}
Write-Host ""

# Test 4: Check Nginx status
Write-Host "Test 4: Checking Nginx health endpoint" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost/health" -Method Get
    Write-Host "Nginx health: $response" -ForegroundColor Green
} catch {
    Write-Host "Nginx health check failed: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "==========================================" -ForegroundColor Green
Write-Host "Load balancing test completed!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

