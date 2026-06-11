export function formatCount(value, complete = true) {
  return `${Number(value || 0).toLocaleString()}${complete ? '' : '+'}`
}
