interface MaestroLogoProps {
  tone?: 'light' | 'dark'
  className?: string
}

export function MaestroLogo({ tone = 'light', className = '' }: MaestroLogoProps) {
  const isDark = tone === 'dark'
  const primary = isDark ? '#ffffff' : '#3682f9'
  const secondary = isDark ? 'rgba(255,255,255,0.5)' : '#181818'
  const word = isDark ? '#ffffff' : '#000000'

  return (
    <div className={`inline-flex items-center gap-2 ${className}`.trim()}>
      <div className="flex flex-col gap-[0.54px]">
        <div className="flex gap-[0.54px]">
          <span
            className="size-[9.73px] rounded-[7.57px]"
            style={{ background: primary }}
          />
          <span
            className="size-[9.73px] rounded-[7.57px]"
            style={{ background: primary }}
          />
        </div>
        <div className="flex gap-[0.54px]">
          <span
            className="size-[9.73px] rounded-[7.57px]"
            style={{ background: secondary }}
          />
          <span
            className="size-[9.73px] rounded-[7.57px]"
            style={{ background: primary }}
          />
        </div>
      </div>
      <span
        className="font-logo text-[19px] font-medium tracking-[-0.19px]"
        style={{ color: word }}
      >
        Maestro
      </span>
    </div>
  )
}
