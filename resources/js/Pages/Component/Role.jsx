import { usePage } from '@inertiajs/react'

export default function Role({ role, children }) {
  const { auth } = usePage().props
  const currentRole = auth?.currentRole || []

  const allowedRoles = Array.isArray(role) ? role : [role]

  if (!allowedRoles.includes(currentRole)) {
    return null
  }

  return children
}
