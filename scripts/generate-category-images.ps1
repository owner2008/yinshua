param(
  [string]$OutputDir
)

if ([string]::IsNullOrWhiteSpace($OutputDir)) {
  $projectRoot = Split-Path -Parent $PSScriptRoot
  $OutputDir = Join-Path $projectRoot "tmp-generated-images-test"
}

Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$categories = @(
  "卷筒不干胶标签",
  "定制异形标签",
  "白卡纸盒",
  "瓦楞纸盒",
  "彩盒包装",
  "礼品盒",
  "食品包装盒",
  "化妆品包装盒",
  "药品包装盒",
  "电子产品包装盒",
  "企业画册",
  "产品画册",
  "宣传册",
  "折页单页",
  "海报",
  "说明书",
  "吊牌",
  "合格证",
  "手提袋",
  "纸袋",
  "纸杯",
  "杯套",
  "台卡",
  "档案袋",
  "信封信纸"
)

$palettes = @(
  @("#f6f1e7", "#2c6e49", "#f4a261", "#264653"),
  @("#edf6f9", "#006d77", "#83c5be", "#e29578"),
  @("#fff7ed", "#9a3412", "#facc15", "#334155"),
  @("#f8fafc", "#0f766e", "#38bdf8", "#111827"),
  @("#fdf2f8", "#be185d", "#f9a8d4", "#1f2937"),
  @("#f7fee7", "#4d7c0f", "#a3e635", "#365314"),
  @("#eff6ff", "#1d4ed8", "#93c5fd", "#172554"),
  @("#faf5ff", "#7e22ce", "#d8b4fe", "#3b0764")
)

function New-Color($hex) {
  return [System.Drawing.ColorTranslator]::FromHtml($hex)
}

function New-Brush($hex) {
  return New-Object System.Drawing.SolidBrush (New-Color $hex)
}

function New-Pen($hex, $width = 2) {
  return New-Object System.Drawing.Pen (New-Color $hex), $width
}

function Draw-RoundedRect($g, [System.Drawing.Brush]$brush, [float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  $g.FillPath($brush, $path)
  $path.Dispose()
}

function Draw-TextCentered($g, [string]$text, [System.Drawing.Font]$font, [System.Drawing.Brush]$brush, [float]$x, [float]$y, [float]$w, [float]$h) {
  $fmt = New-Object System.Drawing.StringFormat
  $fmt.Alignment = [System.Drawing.StringAlignment]::Center
  $fmt.LineAlignment = [System.Drawing.StringAlignment]::Center
  $g.DrawString($text, $font, $brush, (New-Object System.Drawing.RectangleF $x, $y, $w, $h), $fmt)
  $fmt.Dispose()
}

function Draw-LabelRoll($g, $p, $variant) {
  $brushWhite = New-Brush "#ffffff"
  $brushAccent = New-Brush $p[1]
  $penDark = New-Object System.Drawing.Pen (New-Color $p[3]), 5
  $g.FillEllipse($brushWhite, 345, 230, 380, 300)
  $g.DrawEllipse($penDark, 345, 230, 380, 300)
  $g.FillEllipse((New-Brush $p[0]), 445, 295, 180, 170)
  $g.FillRectangle($brushWhite, 585, 320, 280, 150)
  Draw-RoundedRect $g $brushAccent 625 350 190 78 18
  $brushWhite.Dispose(); $brushAccent.Dispose(); $penDark.Dispose()
}

function Draw-Box($g, $p, $variant, [bool]$corrugated = $false, [bool]$gift = $false) {
  $front = New-Brush $p[2]
  $side = New-Brush $p[1]
  $top = New-Brush "#ffffff"
  $darkPen = New-Object System.Drawing.Pen (New-Color $p[3]), 4
  $pointsTop = @(
    (New-Object System.Drawing.Point 385,260),
    (New-Object System.Drawing.Point 760,210),
    (New-Object System.Drawing.Point 930,330),
    (New-Object System.Drawing.Point 535,390)
  )
  $pointsSide = @(
    (New-Object System.Drawing.Point 760,210),
    (New-Object System.Drawing.Point 930,330),
    (New-Object System.Drawing.Point 920,620),
    (New-Object System.Drawing.Point 740,720)
  )
  $pointsFront = @(
    (New-Object System.Drawing.Point 385,260),
    (New-Object System.Drawing.Point 535,390),
    (New-Object System.Drawing.Point 520,700),
    (New-Object System.Drawing.Point 360,565)
  )
  $g.FillPolygon($top, $pointsTop)
  $g.FillPolygon($side, $pointsSide)
  $g.FillPolygon($front, $pointsFront)
  $g.DrawPolygon($darkPen, $pointsTop)
  $g.DrawPolygon($darkPen, $pointsSide)
  $g.DrawPolygon($darkPen, $pointsFront)
  if ($corrugated) {
    $linePen = New-Object System.Drawing.Pen (New-Color "#7c4a21"), 2
    for ($i = 385; $i -lt 880; $i += 28) {
      $g.DrawLine($linePen, $i, 285, $i + 170, 390)
    }
    $linePen.Dispose()
  }
  if ($gift) {
    $ribbon = New-Object System.Drawing.Pen (New-Color "#ef4444"), 18
    $g.DrawLine($ribbon, 640, 250, 625, 690)
    $g.DrawLine($ribbon, 405, 500, 910, 420)
    $ribbon.Dispose()
  }
  $front.Dispose(); $side.Dispose(); $top.Dispose(); $darkPen.Dispose()
}

function Draw-Booklet($g, $p, $variant, [string]$mode) {
  $shadow = New-Brush "#d1d5db"
  $cover = New-Brush $p[1]
  $cover2 = New-Brush $p[2]
  $page = New-Brush "#ffffff"
  Draw-RoundedRect $g $shadow 385 250 420 500 12
  Draw-RoundedRect $g $page 360 225 420 500 12
  Draw-RoundedRect $g $cover 390 250 360 450 8
  for ($i = 0; $i -lt 4; $i++) {
    $b = if ($i % 2 -eq 0) { $cover2 } else { $page }
    $g.FillRectangle($b, 430, (330 + $i * 62), (250 - $i * 20), 24)
  }
  if ($mode -eq "fold") {
    $pen = New-Object System.Drawing.Pen (New-Color "#ffffff"), 4
    $g.DrawLine($pen, 570, 250, 570, 700)
    $pen.Dispose()
  }
  $shadow.Dispose(); $cover.Dispose(); $cover2.Dispose(); $page.Dispose()
}

function Draw-BagCupEtc($g, $p, $variant, [string]$mode) {
  $main = New-Brush $p[1]
  $accent = New-Brush $p[2]
  $white = New-Brush "#ffffff"
  $pen = New-Object System.Drawing.Pen (New-Color $p[3]), 5
  if ($mode -eq "bag") {
    Draw-RoundedRect $g $main 420 270 360 420 24
    $g.DrawArc($pen, 505, 205, 190, 170, 190, 160)
    Draw-RoundedRect $g $accent 485 415 230 105 14
  } elseif ($mode -eq "cup") {
    $points = @(
      (New-Object System.Drawing.Point 430,245),
      (New-Object System.Drawing.Point 770,245),
      (New-Object System.Drawing.Point 715,690),
      (New-Object System.Drawing.Point 485,690)
    )
    $g.FillPolygon($white, $points)
    $g.DrawPolygon($pen, $points)
    $g.FillEllipse($main, 425, 215, 350, 70)
    Draw-RoundedRect $g $accent 500 395 200 100 22
  } elseif ($mode -eq "sleeve") {
    $points = @(
      (New-Object System.Drawing.Point 380,340),
      (New-Object System.Drawing.Point 820,300),
      (New-Object System.Drawing.Point 770,580),
      (New-Object System.Drawing.Point 430,610)
    )
    $g.FillPolygon($main, $points)
    $g.DrawPolygon($pen, $points)
    Draw-RoundedRect $g $accent 500 405 190 85 14
  } else {
    Draw-RoundedRect $g $white 400 330 420 250 16
    $g.DrawRectangle($pen, 400, 330, 420, 250)
    Draw-RoundedRect $g $main 430 365 150 70 12
    $g.FillRectangle($accent, 430, 470, 330, 26)
    $g.FillRectangle($accent, 430, 525, 260, 20)
  }
  $main.Dispose(); $accent.Dispose(); $white.Dispose(); $pen.Dispose()
}

function Draw-TagCertEnvelope($g, $p, $variant, [string]$mode) {
  $main = New-Brush "#ffffff"
  $accent = New-Brush $p[1]
  $accent2 = New-Brush $p[2]
  $pen = New-Object System.Drawing.Pen (New-Color $p[3]), 4
  if ($mode -eq "tag") {
    $points = @(
      (New-Object System.Drawing.Point 470,210),
      (New-Object System.Drawing.Point 735,260),
      (New-Object System.Drawing.Point 690,695),
      (New-Object System.Drawing.Point 385,650)
    )
    $g.FillPolygon($main, $points)
    $g.DrawPolygon($pen, $points)
    $g.FillEllipse($accent, 560, 270, 55, 55)
    $g.FillRectangle($accent2, 455, 455, 210, 32)
  } elseif ($mode -eq "cert") {
    Draw-RoundedRect $g $main 330 240 540 390 18
    $g.DrawRectangle($pen, 350, 260, 500, 350)
    $g.FillEllipse($accent2, 665, 455, 105, 105)
    $g.DrawLine($pen, 440, 405, 760, 405)
    $g.DrawLine($pen, 440, 465, 640, 465)
  } elseif ($mode -eq "envelope") {
    Draw-RoundedRect $g $main 315 290 570 345 12
    $g.DrawRectangle($pen, 315, 290, 570, 345)
    $g.DrawLine($pen, 315, 290, 600, 505)
    $g.DrawLine($pen, 885, 290, 600, 505)
    $g.FillRectangle($accent, 405, 390, 210, 22)
    $g.FillRectangle($accent2, 405, 435, 310, 18)
  } else {
    Draw-RoundedRect $g $accent 390 265 420 330 12
    $g.FillPolygon($main, @(
      (New-Object System.Drawing.Point 390,265),
      (New-Object System.Drawing.Point 810,265),
      (New-Object System.Drawing.Point 760,350),
      (New-Object System.Drawing.Point 440,350)
    ))
  }
  $main.Dispose(); $accent.Dispose(); $accent2.Dispose(); $pen.Dispose()
}

function Draw-Poster($g, $p, $variant) {
  $paper = New-Brush "#ffffff"
  $accent = New-Brush $p[1]
  $accent2 = New-Brush $p[2]
  Draw-RoundedRect $g $paper 395 170 410 590 14
  $g.FillRectangle($accent, 435, 220, 330, 180)
  $g.FillRectangle($accent2, 435, 440, 240, 30)
  $g.FillRectangle($accent2, 435, 500, 300, 22)
  $g.FillEllipse($accent2, 630, 555, 95, 95)
  $paper.Dispose(); $accent.Dispose(); $accent2.Dispose()
}

function Draw-Product($g, [string]$category, $p, [int]$variant) {
  if ($category -match "标签") {
    Draw-LabelRoll $g $p $variant
  } elseif ($category -match "瓦楞") {
    Draw-Box $g $p $variant $true $false
  } elseif ($category -match "礼品") {
    Draw-Box $g $p $variant $false $true
  } elseif ($category -match "盒|包装") {
    Draw-Box $g $p $variant $false $false
  } elseif ($category -match "画册|宣传册|说明书") {
    Draw-Booklet $g $p $variant "book"
  } elseif ($category -match "折页") {
    Draw-Booklet $g $p $variant "fold"
  } elseif ($category -match "海报") {
    Draw-Poster $g $p $variant
  } elseif ($category -match "手提袋|纸袋") {
    Draw-BagCupEtc $g $p $variant "bag"
  } elseif ($category -match "纸杯") {
    Draw-BagCupEtc $g $p $variant "cup"
  } elseif ($category -match "杯套") {
    Draw-BagCupEtc $g $p $variant "sleeve"
  } elseif ($category -match "台卡") {
    Draw-BagCupEtc $g $p $variant "tablecard"
  } elseif ($category -match "吊牌") {
    Draw-TagCertEnvelope $g $p $variant "tag"
  } elseif ($category -match "合格证") {
    Draw-TagCertEnvelope $g $p $variant "cert"
  } elseif ($category -match "档案袋") {
    Draw-TagCertEnvelope $g $p $variant "folder"
  } elseif ($category -match "信封") {
    Draw-TagCertEnvelope $g $p $variant "envelope"
  } else {
    Draw-Poster $g $p $variant
  }
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$fontFamilies = @("Microsoft YaHei", "SimHei", "Arial Unicode MS", "Arial")
$fontFamily = $fontFamilies | Where-Object {
  try {
    $f = New-Object System.Drawing.FontFamily $_
    $f.Dispose()
    $true
  } catch {
    $false
  }
} | Select-Object -First 1

if (-not $fontFamily) {
  $fontFamily = "Arial"
}

$titleFont = New-Object System.Drawing.Font $fontFamily, 44, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$smallFont = New-Object System.Drawing.Font $fontFamily, 24, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
$microFont = New-Object System.Drawing.Font $fontFamily, 18, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)

$count = 0
for ($ci = 0; $ci -lt $categories.Count; $ci++) {
  $category = $categories[$ci]
  for ($variant = 1; $variant -le 4; $variant++) {
    $p = $palettes[($ci + $variant - 1) % $palettes.Count]
    $bmp = New-Object System.Drawing.Bitmap 1200, 900
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    $bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush (
      (New-Object System.Drawing.Rectangle 0, 0, 1200, 900),
      (New-Color $p[0]),
      (New-Color "#ffffff"),
      ([System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal)
    )
    $g.FillRectangle($bg, 0, 0, 1200, 900)
    $bg.Dispose()

    $accentWash = New-Brush $p[2]
    $g.FillEllipse($accentWash, 780, 65, 280, 280)
    $g.FillEllipse($accentWash, 95, 625, 220, 220)
    $accentWash.Dispose()

    Draw-Product $g $category $p $variant

    $titleBrush = New-Brush $p[3]
    $subBrush = New-Brush "#475569"
    Draw-TextCentered $g $category $titleFont $titleBrush 0 62 1200 70
    Draw-TextCentered $g "印刷包装定制样图 0$variant" $smallFont $subBrush 0 132 1200 40
    $badgeBrush = New-Brush $p[1]
    Draw-RoundedRect $g $badgeBrush 495 790 210 46 23
    $whiteBrush = New-Brush "#ffffff"
    Draw-TextCentered $g ("方案 " + $variant) $microFont $whiteBrush 495 790 210 46

    $file = Join-Path $OutputDir ("{0}{1}.png" -f $category, $variant)
    $bmp.Save($file, [System.Drawing.Imaging.ImageFormat]::Png)

    $whiteBrush.Dispose(); $badgeBrush.Dispose(); $titleBrush.Dispose(); $subBrush.Dispose()
    $g.Dispose()
    $bmp.Dispose()
    $count++
  }
}

$titleFont.Dispose()
$smallFont.Dispose()
$microFont.Dispose()

Write-Output ("Generated {0} images in {1}" -f $count, $OutputDir)
