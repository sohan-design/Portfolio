interface ModeToggleProps {
  mode: 'text' | 'voice'
  onChange: (mode: 'text' | 'voice') => void
  /** Subjective screen shows Voice first in Figma */
  voiceFirst?: boolean
}

export function ModeToggle({ mode, onChange, voiceFirst = false }: ModeToggleProps) {
  const items: Array<{ id: 'text' | 'voice'; label: string; icon: string }> = voiceFirst
    ? [
        { id: 'voice', label: 'Voice', icon: '/assets/icons/mic.svg' },
        { id: 'text', label: 'Text', icon: '/assets/icons/keyboard.svg' },
      ]
    : [
        { id: 'text', label: 'Text', icon: '/assets/icons/keyboard.svg' },
        { id: 'voice', label: 'Voice', icon: '/assets/icons/mic.svg' },
      ]

  return (
    <div className="flex gap-2 anim-fade-up">
      {items.map((item) => {
        const active = mode === item.id
        return (
          <button
            key={item.id}
            type="button"
            className={`mode-toggle mode-toggle--${item.id} ${active ? 'is-active' : ''}`.trim()}
            onClick={() => onChange(item.id)}
            aria-pressed={active}
          >
            <img src={item.icon} alt="" width={16} height={16} />
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
