import React, { Children } from "react";

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
            value: <p style={{
                fontSize: '0.75rem',
            }}>
                <strong>No. KK</strong>: {rest.kk.no_kk}<br /><strong>Kepala Keluarga</strong>: {rest.kk.kepala_keluarga.nama}</p>,
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
            href: "/dashboard",
            color: "primary",
            title: "Transaksi",
            value: rest.jumlah_transaksi,
            icon: "money-bill-wave",
        },
        {
            href: "/dashboard",
            color: rest.pemasukan < 1 ? 'warning' : 'success',
            title: "Pemasukan",
            value: formatRupiah(rest.pemasukan),
            icon: "dollar-sign",
        },
        {
            href: "/dashboard",
            color: rest.pengeluaran < 1 ? 'success' : 'danger',
            title: "Pengeluaran",
            value: formatRupiah(rest.pengeluaran),
            icon: "donate",
        },
        {
            href: "/dashboard",
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
            href: "/warga/tagihan",
            text: "Tagihan",
            icon: "money-check-alt",
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
    ];
}

export function analisisSistemAdmin({ ...rest }) {
    return [
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

export function analisisWargaAdmin({ ...rest }) {
    return [
        {
            href: "/admin/kartu_keluarga",
            color: "info",
            title: "Jumlah KK",
            value: rest.jumlah_kk,
            icon: "clipboard-list",
        },
        {
            href: "/admin/kartu_keluarga",
            color: "primary",
            title: "Jumlah Warga",
            value: rest.jumlah_warga,
            icon: "users",
        },
        {
            href: "/admin/kartu_keluarga",
            color: "primary",
            title: "Jumlah Warga Sebagai Penduduk",
            value: rest.jumlah_warga_penduduk,
            icon: "home",
        },
        {
            href: "/admin/kartu_keluarga",
            color: "primary",
            title: "Jumlah Warga Sebagai Pendatang",
            value: rest.jumlah_warga_pendatang,
            icon: "walking",
        },
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
    ];
}

export function getAdminCards({ ...rest }) {
    return [
        {
            kategori: 'Data Warga',
            isi: [
                {
                    href: "/admin/kartu_keluarga",
                    color: "info",
                    title: "Jumlah KK",
                    value: rest.jumlah_kk,
                    icon: "clipboard-list",
                },
                {
                    href: "/admin/warga",
                    color: "primary",
                    title: "Jumlah Warga",
                    value: rest.jumlah_warga,
                    icon: "users",
                },
                {
                    href: "/admin/warga",
                    color: "primary",
                    title: "Jumlah Warga Sebagai Penduduk",
                    value: rest.jumlah_warga_penduduk,
                    icon: "home",
                },
                {
                    href: "/admin/warga",
                    color: "primary",
                    title: "Jumlah Warga Sebagai Pendatang",
                    value: rest.jumlah_warga_pendatang,
                    icon: "walking",
                },
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
            ]
        },
        {
            kategori: 'Pengaturan Sistem',
            isi: [
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
            ]
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
            text: "Analisis Warga",
            icon: "users",
            children: [
                {
                    href: "/admin/analisis/warga",
                    text: "Analisis Warga Admin",
                    icon: "eye",
                },
                {
                    href: "/admin/kartu_keluarga",
                    text: "Data Kartu Keluarga",
                    icon: "id-card",
                },
                {
                    href: "/admin/rw",
                    text: "Data RW",
                    icon: "house-user",
                },
                {
                    href: "/admin/rt",
                    text: "Data RT",
                    icon: "users",
                },
            ],
        },
        {
            text: "Pengaturan Sistem",
            icon: "cog",
            children: [
                {
                    href: "/admin/analisis/sistem",
                    text: "Analisis Sistem",
                    icon: "cogs",
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
            ],
        },
    ];
}

export function analisisKeuanganRw({ ...rest }) {
    return [
        {
            href: "/rw/iuran",
            color: "success",
            title: "Total Iuran Masuk Bulan Ini",
            value: formatRupiah(rest.total_iuran_bulan_ini),
            icon: "dollar-sign",
        },
        {
            href: "/rw/transaksi",
            color: "success",
            title: "Total Pemasukan",
            value: formatRupiah(rest.total_pemasukan),
            icon: "dollar-sign",
        },
        {
            href: "/rw/transaksi",
            color: "danger",
            title: "Total Pengeluaran",
            value: formatRupiah(rest.total_pengeluaran),
            icon: "money-bill-wave",
        },
        {
            href: "/rw/transaksi",
            color: "primary",
            title: "Saldo Akhir",
            value: formatRupiah(rest.total_saldo_akhir),
            icon: "wallet",
        },
    ];
}

export function analisisWargaRw({ ...rest }) {
    return [
        {
            href: "/rw/rt",
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
            href: "/rw/kartu_keluarga",
            color: "primary",
            title: "Jumlah Warga",
            value: rest.jumlah_warga,
            icon: "users",
        },
        {
            href: "/admin/kartu_keluarga",
            color: "primary",
            title: "Jumlah Warga Sebagai Penduduk",
            value: rest.jumlah_warga_penduduk,
            icon: "home",
        },
        {
            href: "/admin/kartu_keluarga",
            color: "primary",
            title: "Jumlah Warga Sebagai Pendatang",
            value: rest.jumlah_warga_pendatang,
            icon: "walking",
        },
    ];
}

export function getRwCards({ ...rest }) {
    return [
        {
            kategori: 'Data Warga',
            isi: [
                {
                    href: "/rw/rt",
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
                    href: "/rw/kartu_keluarga",
                    color: "primary",
                    title: "Jumlah Warga",
                    value: rest.jumlah_warga,
                    icon: "users",
                },
                {
                    href: "/rw/kartu_keluarga",
                    color: "primary",
                    title: "Jumlah Warga Sebagai Penduduk",
                    value: rest.jumlah_warga_penduduk,
                    icon: "home",
                },
                {
                    href: "/rw/kartu_keluarga",
                    color: "primary",
                    title: "Jumlah Warga Sebagai Pendatang",
                    value: rest.jumlah_warga_pendatang,
                    icon: "walking",
                },
            ]
        },
        {
            kategori: 'Keuangan',
            isi: [
                {
                    href: "/rw/iuran",
                    color: "success",
                    title: "Total Iuran Masuk Bulan Ini",
                    value: formatRupiah(rest.total_iuran_bulan_ini),
                    icon: "dollar-sign",
                },
                {
                    href: "/rw/transaksi",
                    color: "success",
                    title: "Total Pemasukan",
                    value: formatRupiah(rest.total_pemasukan),
                    icon: "dollar-sign",
                },
                {
                    href: "/rw/transaksi",
                    color: "danger",
                    title: "Total Pengeluaran",
                    value: formatRupiah(rest.total_pengeluaran),
                    icon: "money-bill-wave",
                },
                {
                    href: "/rw/transaksi",
                    color: "primary",
                    title: "Saldo Akhir",
                    value: formatRupiah(rest.total_saldo_akhir),
                    icon: "wallet",
                },
            ]
        },
        {
            kategori: 'Informasi',
            isi: [
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
            ]
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
            text: "Warga",
            icon: "users",
            children: [
                {
                    href: "/rw/analisis/warga",
                    text: "Analisis Warga",
                    icon: "eye",
                },
                {
                    href: "/rw/rt",
                    text: "Data RT",
                    icon: "users",
                },
                {
                    href: "/rw/kartu_keluarga",
                    text: "Data Kartu Keluarga",
                    icon: "id-card",
                },
            ],
        },
        {
            text: "Keuangan",
            icon: "wallet",
            children: [
                {
                    href: "/rw/analisis/keuangan",
                    text: "Analisis Keuangan",
                    icon: "eye",
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
            ],
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
    ];
}

export function analisisKeuanganRt({ ...rest }) {
    return [
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

export function analisisWargaRt({ ...rest }) {
    return [
        {
            href: "/rt/kartu_keluarga",
            color: "primary",
            title: "Jumlah Warga",
            value: rest.jumlah_warga,
            icon: "users",
        },
        {
            href: "/rt/kartu_keluarga",
            color: "primary",
            title: "Jumlah Warga Penduduk",
            value: rest.jumlah_warga_penduduk,
            icon: "home",
        },
        {
            href: "/rt/kartu_keluarga",
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
    ]
}

export function getRtCards({ ...rest }) {
    return [
        {
            kategori: 'Data Warga',
            isi: [
                {
                    href: "/rt/kartu_keluarga",
                    color: "primary",
                    title: "Jumlah Warga",
                    value: rest.jumlah_warga,
                    icon: "users",
                },
                {
                    href: "/rt/kartu_keluarga",
                    color: "primary",
                    title: "Jumlah Warga Penduduk",
                    value: rest.jumlah_warga_penduduk,
                    icon: "home",
                },
                {
                    href: "/rt/kartu_keluarga",
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
            ]
        },
        {
            kategori: 'Keuangan',
            isi: [
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
        },
        {
            kategori: 'Informasi',
            isi: [
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
            ]
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
            text: "Warga",
            icon: "users",
            children: [
                {
                    href: "/rt/analisis/warga",
                    text: "Analisis Warga",
                    icon: "eye",
                },
                {
                    href: "/rt/kartu_keluarga",
                    text: "Data Kartu Keluarga",
                    icon: "id-card",
                },
            ],
        },
        {
            text: "Keuangan",
            icon: "wallet",
            children: [
                {
                    href: "/rt/analisis/keuangan",
                    text: "Analisis Keuangan",
                    icon: "eye",
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
            ],
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
    ];
}
