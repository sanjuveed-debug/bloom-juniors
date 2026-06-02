$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

function New-RoundedRectPath {
  param(
    [float]$X,
    [float]$Y,
    [float]$Width,
    [float]$Height,
    [float]$Radius
  )

  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $Radius * 2

  $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
  $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
  $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function New-StarPath {
  param(
    [float]$CenterX,
    [float]$CenterY,
    [float]$OuterRadius,
    [float]$InnerRadius
  )

  $points = New-Object 'System.Collections.Generic.List[System.Drawing.PointF]'
  for ($i = 0; $i -lt 10; $i++) {
    $angle = (-90 + ($i * 36)) * [Math]::PI / 180
    $radius = if ($i % 2 -eq 0) { $OuterRadius } else { $InnerRadius }
    $x = $CenterX + ([Math]::Cos($angle) * $radius)
    $y = $CenterY + ([Math]::Sin($angle) * $radius)
    $points.Add([System.Drawing.PointF]::new([float]$x, [float]$y))
  }

  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddPolygon($points.ToArray())
  return $path
}

function Draw-Icon {
  param(
    [int]$Size,
    [string]$Path,
    [float]$PaddingFactor = 0.14
  )

  $bmp = New-Object System.Drawing.Bitmap $Size, $Size
  $gfx = [System.Drawing.Graphics]::FromImage($bmp)
  $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $gfx.Clear([System.Drawing.Color]::Transparent)

  $padding = $Size * $PaddingFactor
  $baseSize = $Size - (2 * $padding)
  $radius = $baseSize * 0.26

  $bgRect = [System.Drawing.RectangleF]::new([float]$padding, [float]$padding, [float]$baseSize, [float]$baseSize)
  $bgPath = New-RoundedRectPath -X $bgRect.X -Y $bgRect.Y -Width $bgRect.Width -Height $bgRect.Height -Radius $radius

  $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    [System.Drawing.PointF]::new($padding, $padding),
    [System.Drawing.PointF]::new($padding + $baseSize, $padding + $baseSize),
    [System.Drawing.Color]::FromArgb(29, 78, 216),
    [System.Drawing.Color]::FromArgb(124, 58, 237)
  )
  $blend = New-Object System.Drawing.Drawing2D.ColorBlend
  $blend.Colors = @(
    [System.Drawing.Color]::FromArgb(29, 78, 216),
    [System.Drawing.Color]::FromArgb(79, 70, 229),
    [System.Drawing.Color]::FromArgb(124, 58, 237)
  )
  $blend.Positions = @(0.0, 0.58, 1.0)
  $bgBrush.InterpolationColors = $blend
  $gfx.FillPath($bgBrush, $bgPath)

  $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(45, 255, 255, 255), [Math]::Max(2, $Size * 0.01))
  $gfx.DrawPath($borderPen, $bgPath)

  $glowBrush = New-Object System.Drawing.Drawing2D.PathGradientBrush((New-StarPath -CenterX ($padding + $baseSize * 0.72) -CenterY ($padding + $baseSize * 0.22) -OuterRadius ($baseSize * 0.30) -InnerRadius ($baseSize * 0.18)))
  $glowBrush.CenterColor = [System.Drawing.Color]::FromArgb(105, 253, 230, 138)
  $glowBrush.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 253, 230, 138))
  $gfx.FillEllipse($glowBrush, $padding + $baseSize * 0.44, $padding + $baseSize * 0.01, $baseSize * 0.52, $baseSize * 0.52)

  $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(34, 17, 24, 39))
  $pageBrushLeft = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(234, 241, 255))
  $pageBrushRight = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(249, 251, 255))
  $baseBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
  $spinePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(199, 210, 254), [Math]::Max(3, $Size * 0.03))
  $linePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(183, 198, 255), [Math]::Max(2, $Size * 0.022))
  $linePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $linePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

  $leftPage = @(
    [System.Drawing.PointF]::new([float]($padding + $baseSize * 0.20), [float]($padding + $baseSize * 0.30)),
    [System.Drawing.PointF]::new([float]($padding + $baseSize * 0.20), [float]($padding + $baseSize * 0.60)),
    [System.Drawing.PointF]::new([float]($padding + $baseSize * 0.45), [float]($padding + $baseSize * 0.67)),
    [System.Drawing.PointF]::new([float]($padding + $baseSize * 0.45), [float]($padding + $baseSize * 0.39)),
    [System.Drawing.PointF]::new([float]($padding + $baseSize * 0.37), [float]($padding + $baseSize * 0.29)),
    [System.Drawing.PointF]::new([float]($padding + $baseSize * 0.20), [float]($padding + $baseSize * 0.30))
  )

  $rightPage = @(
    [System.Drawing.PointF]::new([float]($padding + $baseSize * 0.55), [float]($padding + $baseSize * 0.39)),
    [System.Drawing.PointF]::new([float]($padding + $baseSize * 0.55), [float]($padding + $baseSize * 0.67)),
    [System.Drawing.PointF]::new([float]($padding + $baseSize * 0.80), [float]($padding + $baseSize * 0.60)),
    [System.Drawing.PointF]::new([float]($padding + $baseSize * 0.80), [float]($padding + $baseSize * 0.30)),
    [System.Drawing.PointF]::new([float]($padding + $baseSize * 0.63), [float]($padding + $baseSize * 0.29)),
    [System.Drawing.PointF]::new([float]($padding + $baseSize * 0.55), [float]($padding + $baseSize * 0.39))
  )

  $leftBase = New-RoundedRectPath -X ($padding + $baseSize * 0.12) -Y ($padding + $baseSize * 0.60) -Width ($baseSize * 0.33) -Height ($baseSize * 0.20) -Radius ($baseSize * 0.06)
  $rightBase = New-RoundedRectPath -X ($padding + $baseSize * 0.55) -Y ($padding + $baseSize * 0.60) -Width ($baseSize * 0.33) -Height ($baseSize * 0.20) -Radius ($baseSize * 0.06)

  $gfx.FillPath($shadowBrush, (New-RoundedRectPath -X ($padding + $baseSize * 0.14) -Y ($padding + $baseSize * 0.63) -Width ($baseSize * 0.72) -Height ($baseSize * 0.22) -Radius ($baseSize * 0.07)))
  $gfx.FillPath($baseBrush, $leftBase)
  $gfx.FillPath($baseBrush, $rightBase)
  $gfx.FillPolygon($pageBrushLeft, $leftPage)
  $gfx.FillPolygon($pageBrushRight, $rightPage)
  $gfx.DrawLine($spinePen, $padding + $baseSize * 0.50, $padding + $baseSize * 0.34, $padding + $baseSize * 0.50, $padding + $baseSize * 0.72)

  $gfx.DrawLine($linePen, $padding + $baseSize * 0.27, $padding + $baseSize * 0.36, $padding + $baseSize * 0.40, $padding + $baseSize * 0.36)
  $gfx.DrawLine($linePen, $padding + $baseSize * 0.27, $padding + $baseSize * 0.43, $padding + $baseSize * 0.43, $padding + $baseSize * 0.43)
  $gfx.DrawLine($linePen, $padding + $baseSize * 0.60, $padding + $baseSize * 0.36, $padding + $baseSize * 0.73, $padding + $baseSize * 0.36)
  $gfx.DrawLine($linePen, $padding + $baseSize * 0.57, $padding + $baseSize * 0.43, $padding + $baseSize * 0.73, $padding + $baseSize * 0.43)

  $starPath = New-StarPath -CenterX ($padding + $baseSize * 0.74) -CenterY ($padding + $baseSize * 0.24) -OuterRadius ($baseSize * 0.10) -InnerRadius ($baseSize * 0.045)
  $starBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(251, 191, 36))
  $gfx.FillPath($starBrush, $starPath)

  $resolvedPath = [System.IO.Path]::GetFullPath($Path)
  $tempPath = "$resolvedPath.tmp.png"
  if (Test-Path $tempPath) {
    Remove-Item -LiteralPath $tempPath -Force
  }
  $bmp.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)

  $starBrush.Dispose()
  $linePen.Dispose()
  $spinePen.Dispose()
  $baseBrush.Dispose()
  $pageBrushLeft.Dispose()
  $pageBrushRight.Dispose()
  $shadowBrush.Dispose()
  $glowBrush.Dispose()
  $borderPen.Dispose()
  $bgBrush.Dispose()
  $bgPath.Dispose()
  $leftBase.Dispose()
  $rightBase.Dispose()
  $starPath.Dispose()
  $gfx.Dispose()
  $bmp.Dispose()

  [System.IO.File]::Copy($tempPath, $resolvedPath, $true)
  Remove-Item -LiteralPath $tempPath -Force
}

$publicDir = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\public'))

if (-not (Test-Path $publicDir)) {
  throw "Public directory not found: $publicDir"
}

Draw-Icon -Size 64  -Path (Join-Path $publicDir 'bm-icon-64.png')
Draw-Icon -Size 180 -Path (Join-Path $publicDir 'bm-apple-touch-icon.png')
Draw-Icon -Size 180 -Path (Join-Path $publicDir 'bm-apple-touch-icon-180.png')
Draw-Icon -Size 192 -Path (Join-Path $publicDir 'bm-icon-192.png')
Draw-Icon -Size 512 -Path (Join-Path $publicDir 'bm-icon-512.png')
Draw-Icon -Size 512 -Path (Join-Path $publicDir 'bm-maskable-512.png') -PaddingFactor 0.20
