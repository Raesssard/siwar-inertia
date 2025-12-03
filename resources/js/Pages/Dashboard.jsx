import React from "react";
import { Head, usePage } from "@inertiajs/react";
import "../../css/card.css";
import Layout from "@/Layouts/Layout";
import { StatCard } from "./Component/Card";
import { getAdminCards, getRtCards, getWargaCards, getRwCards } from "./Component/GetPropRole";

export default function Dashboard() {
  const { role, title, auth, ...rest } = usePage().props;
  const permissions = auth?.permissions || [];
  const sideRoles = auth?.sideRoles || [];

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
        title={`${title} - ${role.length <= 2
          ? role.toUpperCase()
          : role.charAt(0).toUpperCase() + role.slice(1)
          }`}
      />

      {statCards.map((card, cIndex) => {
        // ngecek boleh liat kartu atau nggak, pake permission parent
        const canSeeParent = card.permissions?.some(p =>
          permissions.includes(p)
        );

        // ngefilter si kartu dari permission kartunya
        const filteredIsi = card.isi.filter(item =>
          !item.permission || permissions.includes(item.permission)
        );

        // klo nggak ada permission yg sesuai, skip 👍
        if (!canSeeParent && filteredIsi.length === 0) return null;

        return (
          <div key={cIndex} className="row px-3">
            {/* {!sideRoles.length > 0 && ( */}
              <div className="mb-3 w-100" style={{ borderBottom: "1px solid lightgray" }}>
                <p className="w-100 mb-1 ms-2">
                  <span style={{ fontWeight: "600", fontSize: "1.15rem" }}>
                    {card.kategori}
                  </span>
                </p>
              </div>
            {/* )} */}

            <div className="row mt-2">
              {filteredIsi.map((cards, index) => (
                <StatCard key={index} {...cards} />
              ))}
            </div>
          </div>
        );
      })}
    </Layout>
  );
}