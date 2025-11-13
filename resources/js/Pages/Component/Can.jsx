import { usePage } from '@inertiajs/react'

export default function Can({ permission, children }) {
  const { auth } = usePage().props || {}
  const permissions = auth?.permissions || []

  const requiredPermissions = Array.isArray(permission)
    ? permission
    : [permission]

  const hasPermission = requiredPermissions.some(p =>
    permissions.includes(p)
  )

  if (!hasPermission) {
    return null
  }

  return <>{children}</>
}
