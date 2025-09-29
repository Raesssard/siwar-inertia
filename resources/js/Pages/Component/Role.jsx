import { usePage } from '@inertiajs/react';

export default function Role({ role, children }) {
  const { auth } = usePage().props;
  const currentRole = auth?.user?.currentRole;

  if (currentRole !== role) return null;

  return children;
}
