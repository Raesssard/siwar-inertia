// resources/js/Pages/Dashboard.jsx
import React from "react";
import { usePage } from "@inertiajs/react";
import DashboardAdmin from "./Admin/DashboardAdmin";

export default function Dashboard(props) {
  const { props: page } = usePage();
  // Bisa dapat roles dari shared auth (sesuaikan kalau kamu share lain)
  const roles = page?.auth?.roles || page?.auth?.user?.roles || [];
  const isAdmin = Array.isArray(roles) ? roles.includes('admin') : roles === 'admin';

  // Untuk sekarang: kalau admin → tampilkan DashboardAdmin
  if (isAdmin) {
    // lempar semua props ke DashboardAdmin (controller sudah mengirim jumlah_*)
    return <DashboardAdmin {...page} />;
  }

  // fallback: tampilkan DashboardAdmin juga (sementara), atau ganti dengan halaman lain
  return <DashboardAdmin {...page} />;
}
