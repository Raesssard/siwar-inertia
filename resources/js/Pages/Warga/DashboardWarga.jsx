import React from "react";
import Layout from "@/Layouts/Layout";
import { StatCard } from "../Component/Card";
import { Head, usePage } from "@inertiajs/react";

export default function DashboardWarga({ role, title, ...rest }) {
    const formatRupiah = (angka, withDecimals = false) => {
        return "Rp. " + Number(angka).toLocaleString("id-ID", {
            minimumFractionDigits: withDecimals ? 2 : 0,
            maximumFractionDigits: withDecimals ? 2 : 0,
        });
    };
    const statCards = [
        {
            href: "/warga/pengumuman",
            color: "warning",
            title: "Jumlah Pengumuman",
            value: rest.jumlah_pengumuman,
            icon: "comments",
        },
        {
            href: "/warga/pengaduan",
            color: "warning",
            title: "Pengaduan",
            value: rest.pengaduan,
            icon: "paper-plane",
        },
        {
            href: "/#",
            color: rest.jumlah_tagihan < 1 ? 'success' : 'danger',
            title: "Tagihan",
            value: rest.jumlah_tagihan,
            icon: "money-check-alt",
        },
        {
            href: "/#",
            color: rest.total_tagihan < 1 ? 'success' : 'danger',
            title: "Total Tagihan",
            value: formatRupiah(rest.total_tagihan),
            icon: "hand-holding-usd",
        },
        {
            href: "/#",
            color: "primary",
            title: "Transaksi",
            value: rest.jumlah_transaksi,
            icon: "money-bill-wave",
        },
        {
            href: "/#",
            color: "primary",
            title: "Total Transaksi",
            value: formatRupiah(rest.total_transaksi),
            icon: "wallet",
        },
        {
            href: "/#",
            color: "primary",
            title: "Total Saldo",
            value: formatRupiah(rest.total_saldo_akhir),
            icon: "wallet",
        },
    ];
    return (
        <Layout>
            <Head title={`${title} ${role.length <= 2
                ? role.toUpperCase()
                : role.charAt(0).toUpperCase() + role.slice(1)}`}
            />
            <div className="dashboard-cards">
                {statCards.map((card, index) => (
                    <StatCard key={index} {...card} />
                ))}
            </div>
        </Layout>
    )
}