import React from "react";

// =====================================================
// 🔹 Fungsi untuk Format Uang (Rupiah)
// =====================================================
const formatRupiah = (angka, withDecimals = false) => {
    return "Rp. " + Number(angka).toLocaleString("id-ID", {
        minimumFractionDigits: withDecimals ? 2 : 0,
        maximumFractionDigits: withDecimals ? 2 : 0,
    });
};

// =====================================================
// 🔹 Kartu Statistik untuk Warga
// =====================================================
export function getWargaCards({ ...rest }) {
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

// =====================================================
// 🔹 Link Sidebar untuk Warga
// =====================================================
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

// =====================================================
// 🔹 Kartu Statistik untuk Admin
// =====================================================
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
            href: "/admin/kategori-golongan",
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

// =====================================================
// 🔹 Link Sidebar untuk Admin
// =====================================================
export function getAdminLinks() {
    return [
        {
            href: "/dashboard",
            text: "Dashboard",
            icon: "tachometer-alt",
        },
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
            href: "/admin/kategori-golongan",
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

// =====================================================
// 🔹 Link Sidebar untuk RW
// =====================================================
export function getRwLinks() {
    return [
        {
            href: "/dashboard",
            text: "Dashboard",
            icon: "tachometer-alt",
        },
        {
            href: "/rw/warga",
            text: "Data Warga",
            icon: "users",
        },
        {
            href: "/rw/pengumuman",
            text: "Pengumuman",
            icon: "bullhorn",
        },
        {
            href: "/rw/pengaduan",
            text: "Pengaduan",
            icon: "paper-plane",
        },
        {
            href: "/rw/tagihan",
            text: "Tagihan Warga",
            icon: "file-invoice-dollar",
        },
        {
            href: "/rw/transaksi",
            text: "Transaksi RW",
            icon: "money-bill-wave",
        },
    ];
}

// =====================================================
// 🔹 Link Sidebar untuk RT
// =====================================================
export function getRtLinks() {
    return [
        {
            href: "/dashboard",
            text: "Dashboard",
            icon: "tachometer-alt",
        },
        {
            href: "/rt/warga",
            text: "Data Warga",
            icon: "users",
        },
        {
            href: "/rt/pengumuman",
            text: "Pengumuman",
            icon: "bullhorn",
        },
        {
            href: "/rt/pengaduan",
            text: "Pengaduan",
            icon: "paper-plane",
        },
        {
            href: "/rt/tagihan",
            text: "Tagihan RT",
            icon: "file-invoice-dollar",
        },
        {
            href: "/rt/transaksi",
            text: "Transaksi RT",
            icon: "money-bill-wave",
        },
    ];
}
