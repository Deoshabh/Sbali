$files = @(
'docs/FIREBASE_AUTHENTICATION_GUIDE.md',
'docs/QUICK_REFERENCE.md',
'docs/FIREBASE_GOOGLE_SIGNIN_SECURITY_GUIDE.md',
'docs/COMPREHENSIVE_WEBSITE_REVIEW.md',
'docs/PRODUCT_AVAILABILITY_FIX.md',
'docs/COMPLETE_BUG_FIX_REPORT.md',
'docs/DEBUGGING_STEPS.md',
'docs/RAZORPAY_SETUP_AND_DEPLOYMENT.md',
'docs/FIREBASE_LOGIN_400_DEBUGGING.md',
'frontend/README.md',
'docs/SOLUTION_SUMMARY.md',
'docs/FIXES_AND_TESTING_COMPLETE.md',
'docs/CATEGORY_FILTER_IMPLEMENTATION.md',
'.github/architect.chatmode.md',
'docs/QUICK_START_NEW_FEATURES.md',
'docs/VPS_NIXPACK_SETUP_GUIDE.md',
'docs/QUICK_START_ENHANCED_DASHBOARD.md',
'docs/PRODUCTS_NOT_SHOWING_FIX.md',
'docs/API_DOCUMENTATION.md',
'REPLACEMENT_SUMMARY_SBALI.md',
'docs/PRODUCT_FETCH_FIX.md',
'docs/ENHANCED_FILTERS_GUIDE.md',
'docs/DEPLOYMENT_CHANGES_GUIDE.md',
'docs/MINIO_HTTPS_SETUP.md',
'docs/IMAGE_EDITING_QUICK_START.md',
'docs/README_CORS_FIXES.md',
'docs/FIREBASE_BACKEND_SETUP.md',
'docs/ALL_ISSUES_FIXED.md',
'docs/IMPLEMENTATION_COMPLETE.md',
'docs/PROJECT_STATUS.md',
'docs/CLOUDFLARE_CONFIGURATION.md',
'.github/debug.chatmode.md',
'DOKPLOY_SETUP.md',
'docs/CUSTOMER_ORDER_TRACKING.md',
'docs/README_TRAEFIK_FIX.md',
'docs/CODEBASE_CLEANUP_REPORT.md',
'docs/TRAEFIK_SETUP.md',
'memory-bank/architect.md',
'docs/REACT_ERROR_FIXES.md',
'docs/SHIPROCKET_SETUP.md',
'docs/DEPLOYMENT_GUIDE.md',
'docs/REFERENCE_ERROR_FIX.md',
'docs/FULL_AUDIT_RECOMMENDATIONS.md',
'docs/COMPREHENSIVE_API_AUDIT.md',
'docs/CRITICAL_ISSUES_AND_FLOWS_ANALYSIS.md',
'docs/FIREBASE_LOGIN_SYNC_REVIEW.md',
'.github/code.chatmode.md',
'docs/COMPLETION_REPORT.md',
'docs/GOOGLE_SIGNIN_SETUP.md',
'.github/ask.chatmode.md',
'docs/FIX_502_BAD_GATEWAY.md',
'docs/UI_IMPROVEMENTS_COMPLETE.md'
)

$updated = @()
foreach ($f in $files) {
  if (-not (Test-Path $f)) { continue }
  $content = Get-Content -Raw -Path $f
  $orig = $content

  $content = [regex]::Replace($content, '(?m)^(#{1,6}\s.+):\s*$', '$1')
  $content = [regex]::Replace($content, '(?m)^(\d+)\.\s{2,}', '$1. ')

  do {
    $prev = $content
    $content = [regex]::Replace($content, '(?m)^(#{1,6}\s.+)\r?\n([-*]\s)', '$1`r`n`r`n$2')
    $content = [regex]::Replace($content, '(?m)^(#{1,6}\s.+)\r?\n(\d+\.\s)', '$1`r`n`r`n$2')
  } while ($content -ne $prev)

  $content = [regex]::Replace($content, '(?<!<)(https?://[^\s<>)]+)(?!>)', '<$1>')
  $content = [regex]::Replace($content, '(?<!<)\b([A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,})\b(?!>)', '<$1>')

  if ($content -ne $orig) {
    Set-Content -Path $f -Value $content
    $updated += $f
  }
}

"UPDATED_COUNT=$($updated.Count)"
$updated
