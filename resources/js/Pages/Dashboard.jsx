import React from "react";
import { Head, usePage } from "@inertiajs/react";
import "../../css/card.css";
import Layout from "@/Layouts/Layout";
import { StatCard } from "./Component/Card";
import { getAdminCards, getRtCards, getWargaCards, getRwCards } from "./Component/GetPropRole";

export default function Dashboard() {
  const { role, title, auth, ...rest } = usePage().props;
  const permissions = auth?.permissions || [];
  let statCards = [];

  // Ambil card sesuai role
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
      <Head
        title={`${title} - ${
          role.length <= 2
            ? role.toUpperCase()
            : role.charAt(0).toUpperCase() + role.slice(1)
        }`}
      />

      {statCards[0]?.kategori ? (
        <div className="col">
          {statCards.map((stat, i) => (
            <div key={i}>
              <div
                className="mb-4"
                style={{ borderBottom: "1px solid lightgray" }}
              >
                <p className="w-100 mb-1 ml-2">
                  <span style={{ fontWeight: "600", fontSize: "1.15rem" }}>
                    {stat.kategori}
                  </span>
                </p>
              </div>

              <div className="row">
                {stat.isi
                  // 🔹 FILTER CARD berdasarkan permission user
                  .filter(
                    (card) =>
                      !card.permission ||
                      permissions.includes(card.permission)
                  )
                  .map((card, index) => (
                    <StatCard key={index} {...card} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        statCards
          // 🔹 FILTER kalau data bukan kategori tapi flat list
          .filter(
            (card) =>
              !card.permission || permissions.includes(card.permission)
          )
          .map((card, index) => <StatCard key={index} {...card} />)
      )}
    </Layout>
  );
}