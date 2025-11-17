import { usePage } from '@inertiajs/react'

export default function Role({ permission, children }) {
  const { auth } = usePage().props
  const permissions = auth?.permissions || []

  const required = Array.isArray(permission)
      ? permission
      : [permission]

  const allowed = required.some(p => permissions.includes(p))

  if (!allowed) return null

  return children
}
