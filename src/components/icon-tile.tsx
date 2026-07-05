import { Icon } from '@/components/icon'

type IconTileSize = 'sm' | 'md' | 'lg' | 'xl'
type IconTileTone = 'navy' | 'gold' | 'outline' | 'active' | 'ghost'

const SIZE_CLASSES: Record<IconTileSize, string> = {
  sm: 'h-10 w-10',
  md: 'h-14 w-14',
  lg: 'h-20 w-20',
  xl: 'h-24 w-24',
}

const ICON_SIZE: Record<IconTileSize, number> = {
  sm: 18,
  md: 22,
  lg: 28,
  xl: 36,
}

const TONE_CLASSES: Record<IconTileTone, string> = {
  navy: 'bg-brand-navy-panel text-white',
  gold: 'bg-brand-gold text-brand-gold-ink',
  outline: 'border-4 border-dashed border-hairline bg-transparent text-brand-ink',
  active: 'scale-110 bg-brand-navy-panel text-brand-gold shadow-pop',
  ghost: 'bg-transparent text-brand-ink',
}

/**
 * One "icon in a container" primitive covers every boxed/circled icon in the
 * source: Core Principles squares, Partner offer squares, About's pathway
 * circles, Projects hero/CTA circles.
 */
export function IconTile({
  icon,
  shape = 'square',
  tone = 'navy',
  size = 'md',
  filled = false,
}: {
  icon: string
  shape?: 'square' | 'circle'
  tone?: IconTileTone
  size?: IconTileSize
  filled?: boolean
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${SIZE_CLASSES[size]} ${shape === 'circle' ? 'rounded-full' : 'rounded-lg'} ${TONE_CLASSES[tone]}`}
    >
      <Icon name={icon} filled={filled} size={ICON_SIZE[size]} />
    </span>
  )
}
