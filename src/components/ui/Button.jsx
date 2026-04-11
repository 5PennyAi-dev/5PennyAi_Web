import { Link } from 'react-router-dom'

const base =
  'inline-flex items-center justify-center rounded-full font-heading font-semibold tracking-tight ' +
  'transition-[background-color,color,box-shadow,border-color,transform] duration-200 ease-out ' +
  'active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap'

// Shine hover: a soft diagonal highlight that sweeps across on hover.
// Only applied to filled/dark variants — invisible on the white outline.
const shine =
  'relative overflow-hidden isolate ' +
  'before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] ' +
  'before:bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.55)_50%,transparent_75%,transparent_100%)] ' +
  'before:bg-[length:250%_250%,100%_100%] before:bg-[position:200%_0,0_0] before:bg-no-repeat ' +
  'before:transition-[background-position] before:duration-[900ms] before:ease-out ' +
  'hover:before:bg-[position:-100%_0,0_0]'

const variants = {
  primary:
    `${base} ${shine} bg-accent text-white px-7 py-3 text-[14px] shadow-[var(--shadow-cta)] hover:brightness-95 hover:shadow-[var(--shadow-cta-hover)]`,
  outline:
    `${base} border border-navy/15 text-navy bg-white px-7 py-3 text-[14px] hover:bg-navy/[0.03] hover:border-navy/25`,
  ghost:
    `${base} ${shine} text-white/80 px-7 py-3 text-[14px] hover:text-white hover:bg-white/[0.06] border border-white/[0.14] hover:border-white/25`,
}

export default function Button({ variant = 'primary', children, className = '', href, to, ...rest }) {
  const classes = `${variants[variant]} ${className}`.trim()

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    )
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}
