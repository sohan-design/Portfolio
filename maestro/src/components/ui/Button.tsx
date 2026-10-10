import { Button as AntButton, type ButtonProps } from 'antd'
import type { ReactNode } from 'react'

type MaestroVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'outline-light'

interface MaestroButtonProps extends Omit<ButtonProps, 'type' | 'variant'> {
  maestroVariant?: MaestroVariant
  children: ReactNode
}

const variantClass: Record<MaestroVariant, string> = {
  primary:
    'maestro-btn !h-10 !rounded-full !border-none !bg-[var(--maestro-ink)] !px-6 !font-[family-name:var(--font-display)] !text-sm !tracking-[-0.14px] !text-white hover:!bg-[#2a2a2a] hover:!text-white',
  secondary:
    'maestro-btn !h-10 !rounded-full !border-none !bg-[var(--maestro-border)] !px-6 !font-[family-name:var(--font-display)] !text-sm !tracking-[-0.14px] !text-[var(--maestro-ink)] hover:!bg-[#e4e2dc] hover:!text-[var(--maestro-ink)]',
  ghost:
    'maestro-btn !h-10 !rounded-full !border !border-[var(--maestro-border)] !bg-transparent !px-6 !font-[family-name:var(--font-display)] !text-sm !tracking-[-0.14px] !text-[var(--maestro-ink)] hover:!border-[var(--maestro-ink)] hover:!bg-[var(--maestro-ink)] hover:!text-white',
  outline:
    'maestro-btn !h-10 !rounded-full !border !border-white !bg-transparent !px-6 !font-[family-name:var(--font-display)] !text-sm !tracking-[-0.14px] !text-white hover:!bg-white hover:!text-[var(--maestro-ink)]',
  'outline-light':
    'maestro-btn !h-10 !rounded-full !border-none !bg-white !px-6 !font-[family-name:var(--font-display)] !text-sm !tracking-[-0.14px] !text-[var(--maestro-ink)] hover:!bg-[var(--maestro-border)] hover:!text-[var(--maestro-ink)]',
}

export function Button({
  maestroVariant = 'primary',
  className = '',
  children,
  ...rest
}: MaestroButtonProps) {
  return (
    <AntButton
      type="default"
      className={`${variantClass[maestroVariant]} ${className}`.trim()}
      {...rest}
    >
      {children}
    </AntButton>
  )
}
