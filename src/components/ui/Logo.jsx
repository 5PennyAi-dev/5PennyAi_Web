import { useTranslation } from 'react-i18next'

export default function Logo({ variant = 'light', className = '', height = 32 }) {
  const { i18n } = useTranslation()
  const isFr = i18n.language === 'fr' || i18n.language.startsWith('fr-')

  const file = isFr
    ? variant === 'dark' ? '5PennyiA_blanc.png' : '5PennyiA_bleu.png'
    : variant === 'dark' ? '5PennyAi_blanc.png' : '5PennyAi_bleu.png'

  return (
    <img
      src={`/images/logos/${file}`}
      alt={isFr ? '5PennyiA' : '5PennyAi'}
      style={{ height }}
      className={className}
    />
  )
}
