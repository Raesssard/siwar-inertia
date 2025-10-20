// resources/js/Pages/Dashboard.jsx
import React from "react";
import { Head, usePage } from "@inertiajs/react";
import '../../css/card.css'
import Layout from "@/Layouts/Layout";
import { StatCard } from "./Component/Card";
import { getAdminCards, getRtCards, getWargaCards, getRwCards } from "./Component/GetPropRole"

export default function Dashboard() {
  const { role, title, ...rest } = usePage().props
  let statCards = [];

  switch (role) {
    case "admin":
      statCards = getAdminCards(rest);
      break;
    case "rw":
      statCards = getRwCards(rest);
      break;
    case "rt":
      statCards = getRtCards(rest);
      break;
    case "warga":
      statCards = getWargaCards(rest);
      break;
    default:
      statCards = [];
  }

  return (
    <Layout>
      {/* diubah lagi, biar keliatan lebih ringkas */}
      <Head title={`${title} - ${role.length <= 2
        ? role.toUpperCase()
        : role.charAt(0).toUpperCase() + role.slice(1)}`}
      />
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
    </Layout> 
  )
}