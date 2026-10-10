import { Typography as AntTypography } from 'antd'
import type { CSSProperties, ReactNode } from 'react'

const { Title, Paragraph, Text } = AntTypography

interface TypoProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export function DisplayTitle({ children, className = '', style }: TypoProps) {
  return (
    <Title
      level={1}
      className={`!m-0 font-display !font-normal !text-[var(--maestro-ink)] ${className}`}
      style={style}
    >
      {children}
    </Title>
  )
}

export function SerifText({ children, className = '', style }: TypoProps) {
  return (
    <Paragraph
      className={`!m-0 font-serif !text-[var(--maestro-ink)] ${className}`}
      style={style}
    >
      {children}
    </Paragraph>
  )
}

export function UiText({ children, className = '', style }: TypoProps) {
  return (
    <Text className={`font-display ${className}`} style={style}>
      {children}
    </Text>
  )
}
