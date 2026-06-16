export function MaterialIcon({ icon, fill, className = '', ...props }) {
  const settings = fill ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : undefined
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={settings}
      {...props}
    >
      {icon}
    </span>
  )
}
