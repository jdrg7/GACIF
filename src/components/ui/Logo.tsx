import logoBlack from '../../assets/tecnasa-logo-black.webp'
import logoWhite from '../../assets/tecnasa-logo-white.webp'

interface LogoProps {
  /**
   * auto: negro en tema claro y blanco bajo un ancestro con data-theme="dark".
   * black / white: fuerza el color (ej. white sobre un fondo oscuro puntual).
   */
  variant?: 'auto' | 'black' | 'white'
  className?: string
}

export function Logo({ variant = 'auto', className = 'h-7 w-auto' }: LogoProps) {
  if (variant === 'black') return <img src={logoBlack} alt="Tecnasa" className={className} />
  if (variant === 'white') return <img src={logoWhite} alt="Tecnasa" className={className} />

  return (
    <>
      <img src={logoBlack} alt="Tecnasa" className={`${className} dark:hidden`} />
      <img src={logoWhite} alt="" aria-hidden="true" className={`${className} hidden dark:block`} />
    </>
  )
}
