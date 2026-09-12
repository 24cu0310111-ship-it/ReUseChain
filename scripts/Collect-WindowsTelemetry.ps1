<#
.SYNOPSIS
    ReUseChain Windows Component Telemetry Collector (WMI/CIM, Performance Counters, Event Log)
.DESCRIPTION
    Collects granular component-level telemetry across:
    1) WMI / CIM: Hardware, OS, devices, processes, services, configuration
    2) Windows Performance Counters: CPU, RAM, disk, network, processes
    3) Windows Event Log: Hardware (WHEA, Kernel-Power), software (App crash), system (Disk, NDIS, Services)
    Feeds structured payload to the ReUseChain Multi-Agent AI system.
.PARAMETER TargetAsset
    Asset tag identifier in ReUseChain fleet (e.g. ASSET-0142)
.PARAMETER EndpointUrl
    ReUseChain API ingestion endpoint
.PARAMETER TestScenario
    Live (real probe), CpuThermal, MemoryThrash, DiskFailure, NetworkDrop, DeviceDriverCrash
#>

param (
    [string]$TargetAsset = "ASSET-0142",
    [string]$EndpointUrl = "http://localhost:3000/api/diagnostics/windows-telemetry",
    [string]$TestScenario = "Live",
    [switch]$NoTransmit,
    [switch]$AsJson
)

if ($AsJson) {
    function Write-Host { param([Parameter(ValueFromRemainingArguments=$true)]$dummy) }
}

function Write-Msg ($text, $color = "Gray", [switch]$NoNewline) {
    if (-not $AsJson) {
        if ($NoNewline) {
            Write-Host $text -ForegroundColor $color -NoNewline
        } else {
            Write-Host $text -ForegroundColor $color
        }
    }
}

Write-Msg "==========================================================================" "Cyan"
Write-Msg "   ReUseChain Windows Telemetry & Component Diagnostic Collector v3.0    " "White"
Write-Msg "   Sources: 1) WMI/CIM  2) Performance Counters  3) Windows Event Log     " "DarkCyan"
Write-Msg "==========================================================================" "Cyan"

$telemetryPayload = @{
    assetTag     = $TargetAsset
    collectedAt  = (Get-Date).ToString("o")
    testScenario = $TestScenario
    hostName     = $env:COMPUTERNAME
    wmi          = @{}
    perfCounters = @{}
    eventLogs    = @{}
}

if ($TestScenario -eq "Live") {
    Write-Host "`n[1/3] Querying WMI / CIM Infrastructure..." -ForegroundColor Yellow

    try {
        # CPU
        $cpu = Get-CimInstance -ClassName Win32_Processor -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($cpu) {
            $telemetryPayload.wmi["cpu"] = @{
                name                      = [string]$cpu.Name
                numberOfCores             = [int]$cpu.NumberOfCores
                numberOfLogicalProcessors = [int]$cpu.NumberOfLogicalProcessors
                maxClockSpeedMHz          = [int]$cpu.MaxClockSpeed
                currentClockSpeedMHz      = [int]$cpu.CurrentClockSpeed
                loadPercentage            = [int]$cpu.LoadPercentage
                socketDesignation         = [string]$cpu.SocketDesignation
            }
            Write-Host "  [OK] WMI Processor: $($cpu.Name) ($($cpu.NumberOfCores) Cores)" -ForegroundColor Gray
        }

        # RAM
        $dimms = @(Get-CimInstance -ClassName Win32_PhysicalMemory -ErrorAction SilentlyContinue)
        $osMem = Get-CimInstance -ClassName Win32_OperatingSystem -ErrorAction SilentlyContinue
        $totalRamBytes = ($dimms | Measure-Object -Property Capacity -Sum).Sum
        $ramCapGB = [math]::Round($totalRamBytes / 1GB, 2)
        $freeMemMB = if ($osMem) { [math]::Round($osMem.FreePhysicalMemory / 1024, 2) } else { 4096 }

        $dimmList = @()
        foreach ($d in $dimms) {
            $dimmList += @{
                bankLabel    = [string]$d.BankLabel
                capacityGB   = [math]::Round($d.Capacity / 1GB, 2)
                speedMHz     = [int]$d.Speed
                manufacturer = [string]$d.Manufacturer
                partNumber   = [string]($d.PartNumber.Trim())
            }
        }
        $telemetryPayload.wmi["ram"] = @{
            totalCapacityGB      = $ramCapGB
            freePhysicalMemoryMB = $freeMemMB
            dimmCount            = $dimms.Count
            modules              = $dimmList
        }
        Write-Host "  [OK] WMI Physical Memory: $ramCapGB GB ($($dimms.Count) DIMMs)" -ForegroundColor Gray

        # Disks
        $disks = @(Get-CimInstance -ClassName Win32_DiskDrive -ErrorAction SilentlyContinue)
        $diskList = @()
        foreach ($dk in $disks) {
            $diskList += @{
                model         = [string]$dk.Model
                interfaceType = [string]$dk.InterfaceType
                mediaType     = [string]$dk.MediaType
                sizeGB        = [math]::Round($dk.Size / 1GB, 2)
                status        = [string]$dk.Status
                partitions    = [int]$dk.Partitions
            }
        }
        $telemetryPayload.wmi["disks"] = $diskList
        Write-Host "  [OK] WMI Storage: Found $($disks.Count) physical drive(s)" -ForegroundColor Gray

        # Network Adapters
        $adapters = @(Get-CimInstance -ClassName Win32_NetworkAdapter -ErrorAction SilentlyContinue | Where-Object { $_.NetConnectionStatus -eq 2 -or $_.Speed -gt 0 })
        $netList = @()
        foreach ($ad in ($adapters | Select-Object -First 3)) {
            $sp = if ($ad.Speed) { [math]::Round($ad.Speed / 1MB, 1) } else { 0 }
            $netList += @{
                name                = [string]$ad.Name
                netConnectionStatus = [int]$ad.NetConnectionStatus
                speedMbps           = $sp
                macAddress          = [string]$ad.MACAddress
                adapterType         = [string]$ad.AdapterType
            }
        }
        $telemetryPayload.wmi["network"] = $netList
        Write-Host "  [OK] WMI Network: Found $($adapters.Count) active network adapter(s)" -ForegroundColor Gray

        # OS & Configuration
        if ($osMem) {
            $telemetryPayload.wmi["os"] = @{
                caption          = [string]$osMem.Caption
                version          = [string]$osMem.Version
                buildNumber      = [string]$osMem.BuildNumber
                osArchitecture   = [string]$osMem.OSArchitecture
                lastBootUpTime   = $osMem.LastBootUpTime.ToString("o")
                systemDirectory  = [string]$osMem.SystemDirectory
                windowsDirectory = [string]$osMem.WindowsDirectory
            }
            Write-Host "  [OK] WMI OS: $($osMem.Caption) (Build $($osMem.BuildNumber))" -ForegroundColor Gray
        }

        # Top Processes
        $procs = @(Get-CimInstance -ClassName Win32_Process -ErrorAction SilentlyContinue |
            Sort-Object -Property WorkingSetSize -Descending | Select-Object -First 5)
        $procList = @()
        foreach ($pr in $procs) {
            $procList += @{
                processId        = [int]$pr.ProcessId
                name             = [string]$pr.Name
                workingSetSizeMB = [math]::Round($pr.WorkingSetSize / 1MB, 2)
                kernelModeTimeMs = [math]::Round($pr.KernelModeTime / 10000, 2)
                userModeTimeMs   = [math]::Round($pr.UserModeTime / 10000, 2)
            }
        }
        $telemetryPayload.wmi["processes"] = $procList
        Write-Host "  [OK] WMI Processes: Top 5 memory consumers sampled" -ForegroundColor Gray

        # Critical Services
        $services = @(Get-CimInstance -ClassName Win32_Service -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -in @('Spooler', 'LanmanServer', 'EventLog', 'Winmgmt', 'BITS') })
        $servList = @()
        foreach ($sv in $services) {
            $servList += @{
                name        = [string]$sv.Name
                displayName = [string]$sv.DisplayName
                state       = [string]$sv.State
                startMode   = [string]$sv.StartMode
                status      = [string]$sv.Status
            }
        }
        $telemetryPayload.wmi["services"] = $servList
        Write-Host "  [OK] WMI Services: Monitored core system services" -ForegroundColor Gray

        # Problem PnP Devices
        $problemDevices = @(Get-CimInstance -ClassName Win32_PnPEntity -ErrorAction SilentlyContinue |
            Where-Object { $_.ConfigManagerErrorCode -and $_.ConfigManagerErrorCode -ne 0 })
        $pnpList = @()
        foreach ($p in $problemDevices) {
            $pnpList += @{
                name                   = [string]$p.Name
                deviceID               = [string]$p.DeviceID
                configManagerErrorCode = [int]$p.ConfigManagerErrorCode
                status                 = [string]$p.Status
            }
        }
        $telemetryPayload.wmi["problemDevices"] = $pnpList
        Write-Host "  [OK] WMI PnP Devices: Found $($problemDevices.Count) flagged hardware entities" -ForegroundColor Gray

    } catch {
        Write-Host "  ! Note: Some WMI queries encountered limits: $($_.Exception.Message)" -ForegroundColor DarkYellow
    }

    # 2. Performance Counters
    Write-Host "`n[2/3] Querying High-Frequency Windows Performance Counters..." -ForegroundColor Yellow
    try {
        $countersToQuery = @(
            '\Processor(_Total)\% Processor Time',
            '\Processor(_Total)\% Interrupt Time',
            '\Processor(_Total)\% Privileged Time',
            '\Memory\Available MBytes',
            '\Memory\% Committed Bytes In Use',
            '\Memory\Pages/sec',
            '\PhysicalDisk(_Total)\% Disk Time',
            '\PhysicalDisk(_Total)\Avg. Disk sec/Transfer',
            '\PhysicalDisk(_Total)\Disk Read Bytes/sec',
            '\PhysicalDisk(_Total)\Disk Write Bytes/sec'
        )
        $counterSamples = Get-Counter -Counter $countersToQuery -SampleInterval 1 -MaxSamples 1 -ErrorAction SilentlyContinue

        if ($counterSamples) {
            $samples = $counterSamples.CounterSamples
            $pTime = ($samples | Where-Object { $_.Path -like "*processor(_total)\% processor time*" }).CookedValue
            $iTime = ($samples | Where-Object { $_.Path -like "*processor(_total)\% interrupt time*" }).CookedValue
            $prTime = ($samples | Where-Object { $_.Path -like "*processor(_total)\% privileged time*" }).CookedValue

            $telemetryPayload.perfCounters["cpu"] = @{
                percentProcessorTime  = [math]::Round($pTime, 2)
                percentInterruptTime  = [math]::Round($iTime, 2)
                percentPrivilegedTime = [math]::Round($prTime, 2)
            }

            $availMB = ($samples | Where-Object { $_.Path -like "*memory\available mbytes*" }).CookedValue
            $commitPct = ($samples | Where-Object { $_.Path -like "*memory\% committed bytes in use*" }).CookedValue
            $pagesSec = ($samples | Where-Object { $_.Path -like "*memory\pages/sec*" }).CookedValue

            $telemetryPayload.perfCounters["ram"] = @{
                availableMBytes       = [math]::Round($availMB, 0)
                percentCommittedInUse = [math]::Round($commitPct, 2)
                pagesPerSec           = [math]::Round($pagesSec, 2)
            }

            $dTime = ($samples | Where-Object { $_.Path -like "*physicaldisk(_total)\% disk time*" }).CookedValue
            $dAvg = ($samples | Where-Object { $_.Path -like "*physicaldisk(_total)\avg. disk sec/transfer*" }).CookedValue
            $dRead = ($samples | Where-Object { $_.Path -like "*physicaldisk(_total)\disk read bytes/sec*" }).CookedValue
            $dWrite = ($samples | Where-Object { $_.Path -like "*physicaldisk(_total)\disk write bytes/sec*" }).CookedValue

            $telemetryPayload.perfCounters["disk"] = @{
                percentDiskTime         = [math]::Round($dTime, 2)
                avgDiskSecPerTransferMs = [math]::Round(($dAvg * 1000), 2)
                diskReadBytesPerSec     = [math]::Round($dRead, 0)
                diskWriteBytesPerSec    = [math]::Round($dWrite, 0)
            }
            Write-Host "  [OK] PerfCounters: CPU $($telemetryPayload.perfCounters.cpu.percentProcessorTime)%, Avail RAM $($telemetryPayload.perfCounters.ram.availableMBytes) MB, Disk Latency $($telemetryPayload.perfCounters.disk.avgDiskSecPerTransferMs) ms" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  ! Note: Performance Counter sampling fell back: $($_.Exception.Message)" -ForegroundColor DarkYellow
    }

    # 3. Windows Event Log
    Write-Host "`n[3/3] Querying Windows Event Log Channels (System & Application)..." -ForegroundColor Yellow
    try {
        $sysEvents = @(Get-WinEvent -FilterHashtable @{LogName='System'; Level=1,2,3} -MaxEvents 8 -ErrorAction SilentlyContinue)
        $sysList = @()
        foreach ($se in $sysEvents) {
            $sysList += @{
                timeCreated      = $se.TimeCreated.ToString("o")
                id               = [int]$se.Id
                providerName     = [string]$se.ProviderName
                levelDisplayName = [string]$se.LevelDisplayName
                message          = [string]($se.Message.Trim())
            }
        }
        $telemetryPayload.eventLogs["system"] = $sysList
        Write-Host "  [OK] System Event Log: Ingested $($sysEvents.Count) warning/error events" -ForegroundColor Gray

        $appEvents = @(Get-WinEvent -FilterHashtable @{LogName='Application'; Level=1,2} -MaxEvents 5 -ErrorAction SilentlyContinue)
        $appList = @()
        foreach ($ae in $appEvents) {
            $appList += @{
                timeCreated      = $ae.TimeCreated.ToString("o")
                id               = [int]$ae.Id
                providerName     = [string]$ae.ProviderName
                levelDisplayName = [string]$ae.LevelDisplayName
                message          = [string]($ae.Message.Trim())
            }
        }
        $telemetryPayload.eventLogs["application"] = $appList
        Write-Host "  [OK] Application Event Log: Ingested $($appEvents.Count) fault events" -ForegroundColor Gray
    } catch {
        Write-Host "  ! Note: Event Log ingestion completed: $($_.Exception.Message)" -ForegroundColor DarkYellow
    }
}
else {
    # Test Scenario Synthetic Injection
    Write-Host "`nInjecting Synthetic Hardware Fault Pattern: $TestScenario" -ForegroundColor Yellow
    
    $telemetryPayload.wmi["cpu"] = @{
        name = "13th Gen Intel(R) Core(TM) i3-1305U"; numberOfCores = 5; numberOfLogicalProcessors = 6; maxClockSpeedMHz = 1600; loadPercentage = 98
    }
    $telemetryPayload.perfCounters["cpu"] = @{
        percentProcessorTime = 98.4; percentInterruptTime = 12.8; percentPrivilegedTime = 24.5
    }
    
    if ($TestScenario -eq "CpuThermal") {
        $telemetryPayload.eventLogs["system"] = @(
            @{ id = 107; providerName = "Microsoft-Windows-Kernel-Power"; levelDisplayName = "Warning"; message = "The system has resumed from sleep with thermal alert tripped." },
            @{ id = 37; providerName = "Microsoft-Windows-Kernel-Processor-Power"; levelDisplayName = "Warning"; message = "The speed of processor 0 in group 0 is being limited by system firmware due to thermal threshold." }
        )
    }
    elseif ($TestScenario -eq "MemoryThrash") {
        $telemetryPayload.perfCounters["ram"] = @{ availableMBytes = 210; percentCommittedInUse = 96.5; pagesPerSec = 1420.0 }
        $telemetryPayload.eventLogs["system"] = @(
            @{ id = 2004; providerName = "Microsoft-Windows-Resource-Exhaustion-Detector"; levelDisplayName = "Warning"; message = "Windows successfully diagnosed a low virtual memory condition." }
        )
    }
    elseif ($TestScenario -eq "DiskFailure") {
        $telemetryPayload.perfCounters["disk"] = @{ percentDiskTime = 100.0; avgDiskSecPerTransferMs = 450.0; diskReadBytesPerSec = 12000; diskWriteBytesPerSec = 4500 }
        $telemetryPayload.eventLogs["system"] = @(
            @{ id = 7; providerName = "Disk"; levelDisplayName = "Error"; message = "The device, \Device\Harddisk0\DR0, has a bad block." },
            @{ id = 153; providerName = "Disk"; levelDisplayName = "Warning"; message = "The IO operation at logical block address 0x3a4810 was retried." }
        )
    }
    elseif ($TestScenario -eq "NetworkDrop") {
        $telemetryPayload.eventLogs["system"] = @(
            @{ id = 10317; providerName = "Microsoft-Windows-NDIS"; levelDisplayName = "Error"; message = "Miniport Microsoft Wi-Fi Direct Virtual Adapter had event Fatal error: The miniport has failed a power transition to operational power." }
        )
    }
    elseif ($TestScenario -eq "DeviceDriverCrash") {
        $telemetryPayload.wmi["problemDevices"] = @(
            @{ name = "Intel Iris Xe Graphics Controller"; deviceID = "PCI\VEN_8086&DEV_46A8"; configManagerErrorCode = 43; status = "Error" }
        )
    }
}

if ($AsJson) {
    $telemetryPayload | ConvertTo-Json -Depth 6
    exit 0
}

# Transmit to ReUseChain API
if (-not $NoTransmit) {
    Write-Host "`nTransmitting Telemetry Payload to ReUseChain Multi-Agent Engine ($EndpointUrl)..." -ForegroundColor Yellow
    $jsonBody = $telemetryPayload | ConvertTo-Json -Depth 6
    try {
        $response = Invoke-RestMethod -Uri $EndpointUrl -Method Post -Body $jsonBody -ContentType "application/json" -TimeoutSec 20
        Write-Host "`n==========================================================================" -ForegroundColor Green
        Write-Host "   TELEMETRY TRANSMISSION & MULTI-AGENT DIAGNOSIS SUCCESSFUL!            " -ForegroundColor White
        Write-Host "==========================================================================" -ForegroundColor Green
        Write-Host "  Target Asset Tag      : $($response.assetTag)" -ForegroundColor White
        $compKeys = if ($response.componentStats.PSObject) { ($response.componentStats.PSObject.Properties | Select-Object -ExpandProperty Name) -join ', ' } else { "All Subsystems" }
        Write-Host "  Components Diagnosed  : $compKeys" -ForegroundColor Cyan
        Write-Host "  Overall Device Health : $($response.summary.overallHealthScore)% ($($response.summary.healthStatus.ToUpper()))" -ForegroundColor Yellow
        Write-Host "  Critical Subsystem    : $($response.summary.primaryDefectSubsystem)" -ForegroundColor Red
        Write-Host "  AI Agent Verdict      : $($response.agentDossier.triageVerdict.ToUpper())" -ForegroundColor Green
        Write-Host "  Agent Action Plan     : $($response.agentDossier.recommendedAction)" -ForegroundColor Gray
        Write-Host "==========================================================================" -ForegroundColor Green
    }
    catch {
        Write-Host "[ERROR] Failed to communicate with ReUseChain API: $($_.Exception.Message)" -ForegroundColor Red
    }
}
else {
    Write-Host "`nTransmission skipped (-NoTransmit specified)." -ForegroundColor DarkGray
}
