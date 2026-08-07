<#
.SYNOPSIS
    将 PostgreSQL 的 teamsync schema 按表拆分导出为独立 SQL 结构文件。

.DESCRIPTION
    默认只导出表结构，不导出任何表数据。
    输出目录默认为仓库根目录下的 doc/sql，每张表对应一个 <table_name>.sql。
    脚本依赖 PostgreSQL 客户端工具 psql 和 pg_dump。

.EXAMPLE
    $env:PGPASSWORD = "你的数据库密码"
    .\scripts\export-teamsync-table-schema.ps1

.EXAMPLE
    .\scripts\export-teamsync-table-schema.ps1 -Password "你的数据库密码" -Clean

.EXAMPLE
    .\scripts\export-teamsync-table-schema.ps1 `
        -PsqlPath "C:\Program Files\PostgreSQL\18\bin\psql.exe" `
        -PgDumpPath "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe"
#>
[CmdletBinding()]
param(
    [ValidateNotNullOrEmpty()]
    [string]$HostName = "127.0.0.1",

    [ValidateRange(1, 65535)]
    [int]$Port = 5432,

    [ValidateNotNullOrEmpty()]
    [string]$Database = "postgres",

    [ValidateNotNullOrEmpty()]
    [string]$Schema = "teamsync",

    [ValidateNotNullOrEmpty()]
    [string]$UserName = "postgres",

    [ValidateNotNullOrEmpty()]
    [string]$OutputDir = (Join-Path -Path (Split-Path -Parent $PSScriptRoot) -ChildPath "doc/sql"),

    [ValidateNotNullOrEmpty()]
    [string]$PsqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe",

    [ValidateNotNullOrEmpty()]
    [string]$PgDumpPath = "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe",

    [string]$Password,

    [string[]]$Table,

    [switch]$Clean,

    [switch]$IncludeOwner,

    [switch]$IncludePrivileges
)

$ErrorActionPreference = "Stop"

function Assert-CommandExists {
    param(
        [Parameter(Mandatory = $true)]
        [string]$CommandPath,

        [Parameter(Mandatory = $true)]
        [string]$Name
    )

    if (-not (Get-Command -Name $CommandPath -ErrorAction SilentlyContinue)) {
        throw "未找到 $Name：$CommandPath。请将 PostgreSQL bin 目录加入 PATH，或通过 -${Name}Path 指定完整路径。"
    }
}

function ConvertTo-PgPatternIdentifier {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Identifier
    )

    return '"' + $Identifier.Replace('"', '""') + '"'
}

function ConvertTo-SafeFileName {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name
    )

    $safeName = $Name
    foreach ($char in [System.IO.Path]::GetInvalidFileNameChars()) {
        $safeName = $safeName.Replace($char, "_")
    }
    return $safeName
}

function Invoke-ExternalCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string]$FilePath,

        [Parameter(Mandatory = $true)]
        [string[]]$Arguments,

        [Parameter(Mandatory = $true)]
        [string]$FailureMessage
    )

    $output = & $FilePath @Arguments 2>&1
    if ($LASTEXITCODE -ne 0) {
        $details = ($output | ForEach-Object { $_.ToString() }) -join [Environment]::NewLine
        if ([string]::IsNullOrWhiteSpace($details)) {
            throw $FailureMessage
        }
        throw "$FailureMessage$([Environment]::NewLine)$details"
    }

    return $output
}

Assert-CommandExists -CommandPath $PsqlPath -Name "Psql"
Assert-CommandExists -CommandPath $PgDumpPath -Name "PgDump"

$previousPgPassword = $env:PGPASSWORD
$passwordWasChanged = $false

if ($PSBoundParameters.ContainsKey("Password")) {
    $env:PGPASSWORD = $Password
    $passwordWasChanged = $true
} elseif ([string]::IsNullOrEmpty($env:PGPASSWORD)) {
    $securePassword = Read-Host -Prompt "请输入 PostgreSQL 密码" -AsSecureString
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    try {
        $env:PGPASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
        $passwordWasChanged = $true
    } finally {
        [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
}

try {
    $resolvedOutputDir = [System.IO.Path]::GetFullPath($OutputDir)
    New-Item -Path $resolvedOutputDir -ItemType Directory -Force | Out-Null

    if ($Clean) {
        Get-ChildItem -LiteralPath $resolvedOutputDir -Filter "*.sql" -File |
            Remove-Item -Force
    }

    $connectionArgs = @(
        "--host=$HostName",
        "--port=$Port",
        "--username=$UserName",
        "--dbname=$Database"
    )

    if ($Table -and $Table.Count -gt 0) {
        $tables = $Table | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | ForEach-Object { $_.Trim() }
    } else {
        $schemaLiteral = $Schema.Replace("'", "''")
        $listSql = @"
SELECT c.relname
FROM pg_catalog.pg_class c
JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = '$schemaLiteral'
  AND c.relkind IN ('r', 'p')
ORDER BY c.relname;
"@

        $listArgs = $connectionArgs + @(
            "--no-password",
            "--tuples-only",
            "--no-align",
            "--quiet",
            "--set=ON_ERROR_STOP=1",
            "--command=$listSql"
        )

        $tables = Invoke-ExternalCommand `
            -FilePath $PsqlPath `
            -Arguments $listArgs `
            -FailureMessage "查询 $Schema schema 的表清单失败。" |
            Where-Object { -not [string]::IsNullOrWhiteSpace($_) } |
            ForEach-Object { $_.ToString().Trim() }
    }

    $tables = @($tables | Select-Object -Unique)
    if ($tables.Count -eq 0) {
        throw "没有在 $Schema schema 中找到可导出的表。"
    }

    foreach ($tableName in $tables) {
        $safeFileName = ConvertTo-SafeFileName -Name $tableName
        $outputFile = Join-Path -Path $resolvedOutputDir -ChildPath "$safeFileName.sql"
        $qualifiedTable = "$(ConvertTo-PgPatternIdentifier -Identifier $Schema).$(ConvertTo-PgPatternIdentifier -Identifier $tableName)"

        $dumpArgs = $connectionArgs + @(
            "--no-password",
            "--schema-only",
            "--strict-names",
            "--table=$qualifiedTable",
            "--file=$outputFile"
        )

        if (-not $IncludeOwner) {
            $dumpArgs += "--no-owner"
        }

        if (-not $IncludePrivileges) {
            $dumpArgs += "--no-privileges"
        }

        Invoke-ExternalCommand `
            -FilePath $PgDumpPath `
            -Arguments $dumpArgs `
            -FailureMessage "导出表 $Schema.$tableName 的结构失败。" |
            Out-Null

        Write-Host "已导出：$outputFile"
    }

    Write-Host "完成：共导出 $($tables.Count) 张表到 $resolvedOutputDir"
} finally {
    if ($passwordWasChanged) {
        if ($null -eq $previousPgPassword) {
            Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
        } else {
            $env:PGPASSWORD = $previousPgPassword
        }
    }
}
