$dir = "H:\Github\1IMPORTANT\Resume Builder\src\templates\html"
$templates = @(
    "ModernTemplate.tsx",
    "MinimalTemplate.tsx",
    "ExecutiveTemplate.tsx",
    "CreativeTemplate.tsx",
    "TechnicalTemplate.tsx",
    "ElegantTemplate.tsx",
    "CompactTemplate.tsx",
    "AcademicTemplate.tsx",
    "LaTeXTemplate.tsx"
)

foreach ($t in $templates) {
    $path = Join-Path $dir $t
    $content = Get-Content $path -Raw
    
    # 1. Add getBodyTextWeight, getDateSeparatorChar to import line
    if ($content -match "getSkillSeparator \}" -and $content -notmatch "getDateSeparatorChar") {
        $content = $content -replace "getSkillSeparator \}", "getSkillSeparator, getBodyTextWeight, getDateSeparatorChar }"
    } elseif ($content -match "getSkillSeparator\}" -and $content -notmatch "getDateSeparatorChar") {
        $content = $content -replace "getSkillSeparator\}", "getSkillSeparator, getBodyTextWeight, getDateSeparatorChar}"
    }
    
    # 2. Replace hardcoded em dash in job date ranges
    $content = $content -replace '\{job\.startDate\} \x{2014} \{job\.endDate\}', '{job.startDate}{getDateSeparatorChar(formatting.dateSeparator)}{job.endDate}'
    
    # 3. Replace hardcoded em dash in project date ranges
    $content = $content -replace '\{project\.startDate\} \x{2014} \{project\.endDate\}', '{project.startDate}{getDateSeparatorChar(formatting.dateSeparator)}{project.endDate}'
    
    # 4. Replace award.summary unconditional with showAwardsSummaries conditional
    $content = $content -replace '\{award\.summary && <', '{formatting.showAwardsSummaries && award.summary && <'
    
    Set-Content $path $content -NoNewline
    Write-Host "Updated: $t"
}
