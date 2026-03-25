param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$TauriArguments
)

$ErrorActionPreference = "Stop"

function Resolve-NodeExecutable {
  if ($env:npm_node_execpath) {
    $sanitizedNodeExecutable = $env:npm_node_execpath.Trim('"', "'")

    if (-not [string]::IsNullOrWhiteSpace($sanitizedNodeExecutable)) {
      $npmNodeCommand = Get-Command $sanitizedNodeExecutable -ErrorAction SilentlyContinue

      if ($npmNodeCommand) {
        return $npmNodeCommand.Source
      }

      if (Test-Path $sanitizedNodeExecutable) {
        return $sanitizedNodeExecutable
      }
    }
  }

  $shellNodeCommand = Get-Command node -ErrorAction SilentlyContinue

  if ($shellNodeCommand) {
    return $shellNodeCommand.Source
  }

  throw "Node.js executable could not be found. Install Node.js or run this command through npm."
}

$nodeExecutable = Resolve-NodeExecutable
$runTauriScriptPath = Join-Path $PSScriptRoot "run-tauri.js"

& $nodeExecutable $runTauriScriptPath @TauriArguments
exit $LASTEXITCODE
