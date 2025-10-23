import Layout from "@/Layouts/Layout";
import React from "react";
import { Head, usePage } from "@inertiajs/react";
import { StatCard } from "./Component/Card";
import { analisisKeuanganRt, analisisKeuanganRw, analisisWargaRt, analisisWargaRw } from "./Component/GetPropRole";

export default function Analisis() {
    const { role, ...rest } = usePage().props
    let statCards = [];
    const jenis = usePage().url.split("/").pop()

    switch (role) {
        case "rw":
            if (jenis === 'keuangan') {
                statCards = analisisKeuanganRw(rest);
            } else if (jenis === 'warga') {
                statCards = analisisWargaRw(rest);
            }
            break;
        case "rt":
            if (jenis === 'keuangan') {
                statCards = analisisKeuanganRt(rest);
            } else if (jenis === 'warga') {
                statCards = analisisWargaRt(rest);
            }
            break;
        default:
            statCards = [];
    }

    return (
        <Layout>
            <Head title={`Analisis ${jenis.charAt(0).toUpperCase() + jenis.slice(1)} - ${role.length <= 2
                ? role.toUpperCase()
                : role.charAt(0).toUpperCase() + role.slice(1)}`}
            />
            {statCards.map((card, index) => (
                <StatCard key={index} {...card} />
            ))}
        </Layout>
    )
}