import { Link } from 'react-router-dom'

const base =
  'inline-flex items-center justify-center rounded-full font-heading font-semibold tracking-tight ' +
  'transition-[background-color,color,box-shadow,border-color,transform] duration-200 ease-out ' +
  'active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap'

const variants = {
  primary:
    `${base} bg-accent text-white px-7 py-3 text-[14px] shadow-[var(--shadow-cta)] hover:brightness-95 hover:shadow-[var(--shadow-cta-hover)]`,
  outline:
    `${base} border border-navy/15 text-navy bg-white px-7 py-3 text-[14px] hover:bg-navy/[0.03] hover:border-navy/25`,
  ghost:
    `${base} text-white/80 px-7 py-3 text-[14px] hover:text-white hover:bg-white/[0.06] border border-white/[0.14] hover:border-white/25`,
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
