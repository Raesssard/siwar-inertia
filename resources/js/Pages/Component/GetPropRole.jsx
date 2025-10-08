import React from "react";

export function formatRupiah(angka, withDecimals = false) {
    if (angka == null || isNaN(angka)) return "Rp. 0";
    return "Rp. " + Number(angka).toLocaleString("id-ID", {
        minimumFractionDigits: withDecimals ? 2 : 0,
        maximumFractionDigits: withDecimals ? 2 : 0,
    });
}

export function formatTanggal(tanggal) {
    if (!tanggal) return "-"
    const date = new Date(tanggal)
    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    })
}

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

export function getRwCards({ ...rest }) {
    return [
        {
            href: "/rw/rukun_tetangga",
            color: "info",
            title: "Jumlah RT",
            value: rest.jumlah_rt,
            icon: "house-user",
        },
        {
            href: "/rw/kartu_keluarga",
            color: "info",
            title: "Jumlah KK",
            value: rest.jumlah_kk,
            icon: "clipboard-list",
        },
        {
            href: "/rw/warga",
            color: "primary",
            title: "Jumlah Warga",
            value: rest.jumlah_warga,
            icon: "people-fill",
        },
        {
            href: "/rw/pengaduan",
            color: "warning",
            title: "Pengaduan",
            value: rest.pengaduan,
            icon: "paper-plane",
        },
        {
            href: "/rw/pengumuman",
            color: "warning",
            title: "Pengumuman RW",
            value: rest.pengumuman_rw,
            icon: "comments",
        },
        {
            href: "/rw/pengumuman-rt",
            color: "warning",
            title: "Pengumuman RT",
            value: rest.pengumuman_rt,
            icon: "clipboard-list",
        },
        {
            href: "/rw/warga",
            color: "primary",
            title: "Jumlah Warga Sebagai Penduduk",
            value: rest.jumlah_warga_penduduk,
            icon: "home",
        },
        {
            href: "/rw/warga",
            color: "primary",
            title: "Jumlah Warga Sebagai Pendatang",
            value: rest.jumlah_warga_pendatang,
            icon: "walking",
        },
        {
            href: "/rw/iuran",
            color: "success",
            title: "Total Iuran Masuk Bulan Ini",
            value: rest.total_iuran_bulan_ini,
            icon: "dollar-sign",
        },
        {
            href: "/rw/transaksi",
            color: "success",
            title: "Total Pemasukan",
            value: rest.total_pemasukan,
            icon: "dollar-sign",
        },
        {
            href: "/rw/transaksi",
            color: "danger",
            title: "Total Pengeluaran",
            value: rest.total_pengeluaran,
            icon: "money-bill-wave",
        },
        {
            href: "/rw/transaksi",
            color: "primary",
            title: "Saldo Akhir",
            value: rest.total_saldo_akhir,
            icon: "wallet",
        },
    ];
}

export function getRwLinks() {
    return [
        {
            href: "/dashboard",
            text: "Dashboard",
            icon: "tachometer-alt",
        },
        {
            href: "/rw/rt",
            text: "Data RT",
            icon: "users",
        },
        {
            href: "/rw/warga",
            text: "Data Warga",
            icon: "users",
        },
        {
            href: "/rw/kartu_keluarga",
            text: "Data Kartu Keluarga",
            icon: "id-card",
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
            href: "/rw/iuran",
            text: "Iuran Warga",
            icon: "file-invoice-dollar",
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

export function getRtCards({ ...rest }) {
    return [
        {
            href: "/rt/warga",
            color: "primary",
            title: "Jumlah Warga",
            value: rest.jumlah_warga,
            icon: "users",
        },
        {
            href: "/rt/warga",
            color: "primary",
            title: "Jumlah Warga Penduduk",
            value: rest.jumlah_warga_penduduk,
            icon: "home",
        },
        {
            href: "/rt/warga",
            color: "primary",
            title: "Jumlah Warga Pendatang",
            value: rest.jumlah_warga_pendatang,
            icon: "walking",
        },
        {
            href: "/rt/kartu_keluarga",
            color: "info",
            title: "Jumlah Kartu Keluarga",
            value: rest.jumlah_kk,
            icon: "clipboard-list",
        },
        {
            href: "/rt/pengumuman",
            color: "warning",
            title: "Jumlah Pengumuman",
            value: rest.jumlah_pengumuman,
            icon: "comments",
        },
        {
            href: "/rt/pengaduan",
            color: "warning",
            title: "Jumlah Pengaduan",
            value: rest.pengaduan_rt_saya,
            icon: "comment-dots",
        },
        {
            href: "/rt/transaksi",
            color: rest.total_pemasukan > 0 ? "success" : "warning",
            title: "Total Pemasukkan",
            value: formatRupiah(rest.total_pemasukan),
            icon: "dollar-sign",
        },
        {
            href: "/rt/transaksi",
            color: rest.pengeluaran > 0 ? "danger" : "success",
            title: "Total Pengeluaran",
            value: formatRupiah(rest.pengeluaran),
            icon: "donate",
        },
        {
            href: "/rt/transaksi",
            color: rest.total_saldo_akhir === 0 ? "warning" : rest.total_saldo_akhir > 0 ? "success" : "danger",
            title: "Total Saldo Akhir",
            value: formatRupiah(rest.total_saldo_akhir),
            icon: "wallet",
        },
    ]
}

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
            href: "/rt/kartu_keluarga",
            text: "Data Kartu Keluarga",
            icon: "id-card",
        },
        {
            href: "/rt/pengumuman",
            text: "Pengumuman",
            icon: "comments",
        },
        {
            href: "/rt/pengaduan",
            text: "Pengaduan",
            icon: "comment-dots",
        },
        {
            href: "/rt/iuran",
            text: "Iuran",
            icon: "file-invoice-dollar",
        },
        {
            href: "/rt/tagihan",
            text: "Tagihan",
            icon: "hand-holding-usd",
        },
        {
            href: "/rt/transaksi",
            text: "Transaksi",
            icon: "money-bill-wave",
        },
    ];
}
