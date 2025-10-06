import React from "react";

export function getWargaCards({ ...rest }) {
    const formatRupiah = (angka, withDecimals = false) => {
        return "Rp. " + Number(angka).toLocaleString("id-ID", {
            minimumFractionDigits: withDecimals ? 2 : 0,
            maximumFractionDigits: withDecimals ? 2 : 0,
        });
    };
    return [
        {
            href: "/warga/kk",
            color: "info",
            title: "Lihat Kartu Keluarga",
            value: null,
            icon: "id-card",
        },
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
            href: "/warga/tagihan",
            color: rest.jumlah_tagihan < 1 ? 'success' : 'danger',
            title: "Tagihan",
            value: rest.jumlah_tagihan,
            icon: "money-check-alt",
        },
        {
            href: "/warga/tagihan",
            color: rest.total_tagihan < 1 ? 'success' : 'danger',
            title: "Total Tagihan",
            value: formatRupiah(rest.total_tagihan),
            icon: "hand-holding-usd",
        },
        {
            href: "/warga/transaksi",
            color: "primary",
            title: "Transaksi",
            value: rest.jumlah_transaksi,
            icon: "money-bill-wave",
        },
        {
            href: "/warga/transaksi",
            color: "primary",
            title: "Total Transaksi",
            value: formatRupiah(rest.total_transaksi),
            icon: "wallet",
        },
        {
            href: "/warga/transaksi",
            color: "primary",
            title: "Total Saldo",
            value: formatRupiah(rest.total_saldo_akhir),
            icon: "wallet",
        },
    ];
}

export function getWargaLinks() {
    return [
        {
            href: "/dashboard",
            text: "Dashboard",
            icon: "tachometer-alt",
        },
        {
            href: "/warga/kk",
            text: "Lihat Kartu Keluarga",
            icon: "id-card",
        },
        {
            href: "/warga/pengumuman",
            text: "Pengumuman",
            icon: "comments",
        },
        {
            href: "/warga/pengaduan",
            text: "Pengaduan",
            icon: "paper-plane",
        },
        {
            href: "/warga/tagihan",
            text: "Tagihan",
            icon: "money-check-alt",
        },
        {
            href: "/warga/transaksi",
            text: "Transaksi",
            icon: "money-bill-wave",
        },
    ];
}

export function getAdminCards({ ...rest }) {
    return [
        {
            href: "/admin/rw",
            color: "success",
            title: "Jumlah RW",
            value: rest.jumlah_rw,
            icon: "house-user",
        },
        {
            href: "/admin/rt",
            color: "info",
            title: "Jumlah RT",
            value: rest.jumlah_rt,
            icon: "users",
        },
        {
            href: "/admin/golongan",
            color: "primary",
            title: "Jumlah Kategori Golongan",
            value: rest.jumlah_golongan,
            icon: "layer-group",
        },
        {
            href: "/admin/roles",
            color: "warning",
            title: "Jumlah Roles",
            value: rest.jumlah_roles,
            icon: "user-shield",
        },
        {
            href: "/admin/permissions",
            color: "danger",
            title: "Jumlah Permissions",
            value: rest.jumlah_permissions,
            icon: "key",
        },
    ];
}

export function getAdminLinks() {
    return [
        {
            href: "/admin/rw",
            text: "RW",
            icon: "house-user",
        },
        {
            href: "/admin/rt",
            text: "RT",
            icon: "users",
        },
        {
            href: "/admin/golongan",
            text: "Kategori Golongan",
            icon: "layer-group",
        },
        {
            href: "/admin/roles",
            text: "Roles",
            icon: "user-shield",
        },
        {
            href: "/admin/permissions",
            text: "Permissions",
            icon: "key",
        },
    ];
}