import { usePage } from '@inertiajs/react'

export default function Role({ isnRole, role, children }) {
  const { auth } = usePage().props
  const currentRole = auth?.currentRole || []

  const allowedRoles = role
    ? (Array.isArray(role) ? role : [role])
    : []

  const notAllowedRoles = isnRole
    ? (Array.isArray(isnRole) ? isnRole : [isnRole])
    : []

  // If allowedRole exists but currentRole is NOT allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
    return null
  }

  // If currentRole is in notAllowedRoles
  if (notAllowedRoles.includes(currentRole)) {
    return null
  }

  return children
}
