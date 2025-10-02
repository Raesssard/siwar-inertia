// resources/js/Pages/Dashboard.jsx
import React from "react";
import { usePage } from "@inertiajs/react";
import DashboardAdmin from "./Admin/DashboardAdmin";
import Role from "./Component/Role";

export default function Dashboard() {
  return (
    <>
      <Role role="admin">
        <DashboardAdmin />
      </Role>
      {/* 
        nanti di bikin
      <Role role="rw">
        <DashboardRW />
      </Role>
      <Role role="rt">
        <DashboardRT />
      </Role>
      <Role role="warga">
        <DashboardWarga />
      </Role> 
      */}
    </>
  )
}
