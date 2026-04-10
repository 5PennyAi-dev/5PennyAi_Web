export default function Card({ children, className = '', highlighted = false }) {
  return (
    <div
      className={`bg-white rounded-xl p-6 shadow-sm ${
        highlighted ? 'border-2 border-accent shadow-md' : 'border border-lavender/50'
      } ${className}`}
    >
      {children}
    </div>
  )
}
