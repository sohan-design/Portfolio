type UvVariant = 'login' | 'sidebar' | 'card' | 'chip'

interface UvMapBackgroundProps {
  variant: UvVariant
  className?: string
  overlay?: boolean
}

const SRC: Record<UvVariant, string> = {
  login: '/assets/brand/uv-map.png',
  sidebar: '/assets/brand/uv-map-sidebar.png',
  card: '/assets/brand/uv-map-card.png',
  chip: '/assets/brand/uv-map-chip.png',
}

export function UvMapBackground({
  variant,
  className = '',
  overlay = false,
}: UvMapBackgroundProps) {
  if (variant === 'login') {
    return (
      <div
        aria-hidden
        className={`uv-map uv-map--login pointer-events-none absolute inset-0 overflow-hidden ${className}`.trim()}
      >
        <img
          src={SRC.login}
          alt=""
          className="uv-map__image uv-map__image--login-img absolute left-0 w-full max-w-none"
        />
      </div>
    )
  }

  return (
    <div
      aria-hidden
      className={`uv-map uv-map--${variant} pointer-events-none absolute inset-0 overflow-hidden ${className}`.trim()}
    >
      <div
        className="uv-map__image absolute"
        style={{
          backgroundImage: `url(${SRC[variant]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {overlay ? <div className="uv-map__overlay absolute inset-0" /> : null}
    </div>
  )
}
