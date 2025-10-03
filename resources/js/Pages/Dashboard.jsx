// resources/js/Pages/Dashboard.jsx
import React from "react";
import { usePage } from "@inertiajs/react";
import DashboardAdmin from "./Admin/DashboardAdmin";
import Role from "./Component/Role";
import '../../css/card.css'
import DashboardWarga from "./Warga/DashboardWarga";

export default function Dashboard() {
  const { role, title, ...rest } = usePage().props
  return (
    <>
      <Role role="admin">
        <DashboardAdmin
          title={title}
          role={role}
          {...rest}
        />
      </Role>
      {/* 
        nanti di bikin
      <Role role="rw">
        <DashboardRW 
          title={title}
          role={role}
          {...rest}
        />
      </Role>
      <Role role="rt">
        <DashboardRT 
          title={title}
          role={role}
          {...rest}
        />
      </Role>
      */}
      <Role role="warga">
        <DashboardWarga
          title={title}
          role={role}
          {...rest}
        />
      </Role>
    </>
  )
}
