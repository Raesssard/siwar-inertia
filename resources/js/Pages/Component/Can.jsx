import { usePage } from '@inertiajs/react';

export default function Can({ permission, children }) {
  const { auth } = usePage().props;
  const permissions = auth?.permissions;

  if (!permissions?.includes(permission)) return null;
  return children;
}