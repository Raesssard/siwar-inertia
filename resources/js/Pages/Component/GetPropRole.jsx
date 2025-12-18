import React, { Children, useEffect, useState } from "react";

export function formatRupiah(angka, withDecimals = false) {
    if (angka == null || isNaN(angka)) return "Rp. 0";
    return angka >= 0 ? `Rp. ${Number(angka).toLocaleString("id-ID", {
        minimumFractionDigits: withDecimals ? 2 : 0,
        maximumFractionDigits: withDecimals ? 2 : 0,
    })}` : `( Rp. ${Number(angka).toLocaleString("id-ID", {
        minimumFractionDigits: withDecimals ? 2 : 0,
        maximumFractionDigits: withDecimals ? 2 : 0,
    }).replace('-', ' ')} )`;
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
            kategori: 'Keuangan RT/RW',
            isi: [
                // {
                //     href: "",
                //     color: "primary",
                //     title: "Transaksi",
                //     value: rest.jumlah_transaksi,
                //     icon: "money-bill-wave",
                //     permission: "view.transaksi",
                // },
                {
                    href: "",
                    color: rest.pemasukan < 1 ? 'warning' : 'success',
                    title: "Total Pemasukan",
                    value: formatRupiah(rest.pemasukan),
                    icon: "dollar-sign",
                    permission: "view.transaksi",
                },
                {
                    href: "",
                    color: rest.pengeluaran < 1 ? 'success' : 'danger',
                    title: "Total Pengeluaran",
                    value: formatRupiah(rest.pengeluaran),
                    icon: "donate",
                    permission: "view.transaksi",
                },
                {
                    href: "",
                    color: "primary",
                    title: "Total Saldo",
                    value: formatRupiah(rest.total_saldo_akhir),
                    icon: "wallet",
                    permission: "view.transaksi",
                },
            ]
        },
        {
            kategori: 'Informasi',
            isi: [
                {
                    href: "/warga/kk",
                    color: "info",
                    title: "Lihat Kartu Keluarga",
                    value: (
                        <p style={{ fontSize: '0.75rem' }}>
                            <strong>No. KK</strong>: {rest.kk.no_kk}<br />
                            <strong>Kepala Keluarga</strong>: {rest.kk.kepala_keluarga.nama}
                        </p>
                    ),
                    icon: "id-card",
                    permission: "view.kartu_keluarga",
                },
                {
                    href: "/warga/pengumuman",
                    color: "warning",
                    title: "Jumlah Pengumuman",
                    value: rest.jumlah_pengumuman,
                    icon: "comments",
                    permission: "view.pengumuman",
                },
                {
                    href: "/warga/pengaduan",
                    color: "warning",
                    title: "Pengaduan",
                    value: rest.pengaduan,
                    icon: "paper-plane",
                    permission: "view.pengaduan",
                },
            ],
            permissions: [
                "view.kartu_keluarga",
                "view.pengumuman",
                "view.pengaduan",
            ],
        },
        {
            kategori: 'Tagihan Saya',
            isi: [
                {
                    href: "/warga/tagihan",
                    color: rest.jumlah_tagihan < 1 ? 'success' : 'danger',
                    title: "Tagihan",
                    value: rest.jumlah_tagihan,
                    icon: "money-check-alt",
                    permission: "view.tagihan",
                },
                {
                    href: "/warga/tagihan",
                    color: rest.total_tagihan < 1 ? 'success' : 'danger',
                    title: "Total Tagihan",
                    value: formatRupiah(rest.total_tagihan),
                    icon: "hand-holding-usd",
                    permission: "view.tagihan",
                },
                {
                    href: "/warga/tagihan",
                    color: rest.jumlah_tagihan_sudah_bayar < 1 ? 'warning' : 'success',
                    title: "Tagihan Sudah Dibayar",
                    value: rest.jumlah_tagihan_sudah_bayar,
                    icon: "envelope-circle-check",
                    permission: "view.tagihan",
                },
                {
                    href: "/warga/tagihan",
                    color: rest.total_tagihan_sudah_bayar < 1 ? 'warning' : 'success',
                    title: "Total Tagihan Yang Sudah Dibayar",
                    value: formatRupiah(rest.total_tagihan_sudah_bayar),
                    icon: "circle-dollar-to-slot",
                    permission: "view.tagihan",
                },
            ]
        },
    ];
}

export function getWargaLinks() {
    return [
        {
            href: "/dashboard",
            text: "Dashboard",
            icon: "tachometer-alt",
            permission: "dashboard.warga",
        },
        {
            href: "/warga/kk",
            text: "Lihat Kartu Keluarga",
            icon: "id-card",
            permission: "view.kartu_keluarga",
        },
        {
            href: "/warga/tagihan",
            text: "Tagihan",
            icon: "money-check-alt",
            permission: "view.tagihan",
        },
        {
            href: "/warga/pengumuman",
            text: "Pengumuman",
            icon: "comments",
            permission: "view.pengumuman",
        },
        {
            href: "/warga/pengaduan",
            text: "Pengaduan",
            icon: "paper-plane",
            permission: "view.pengaduan",
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
            kategori: 'Keuangan',
            isi: [
                {
                    href: "/rw/transaksi",
                    color: "success",
                    title: "Total Pemasukan",
                    value: formatRupiah(rest.total_pemasukan),
                    icon: "dollar-sign",
                    permission: "view.transaksi",
                },
                {
                    href: "/rw/transaksi",
                    color: "danger",
                    title: "Total Pengeluaran",
                    value: formatRupiah(rest.total_pengeluaran),
                    icon: "money-bill-wave",
                    permission: "view.transaksi",
                },
                {
                    href: "/rw/transaksi",
                    color: "primary",
                    title: "Saldo Akhir",
                    value: formatRupiah(rest.total_saldo_akhir),
                    icon: "wallet",
                    permission: "view.transaksi",
                },
                {
                    href: "/rw/iuran",
                    color: "success",
                    title: "Total Iuran Bulan Ini",
                    value: formatRupiah(rest.total_iuran_bulan_ini),
                    icon: "circle-dollar-to-slot",
                    permission: "view.iuran",
                },
            ],
        },
        {
            kategori: 'Data Warga',
            isi: [
                {
                    href: "/admin/kartu_keluarga",
                    color: "info",
                    title: "Jumlah KK",
                    value: rest.jumlah_kk,
                    icon: "clipboard-list",
                    permission: "view.kartu_keluarga",
                },
                {
                    href: "/admin/warga",
                    color: "primary",
                    title: "Jumlah Warga",
                    value: rest.jumlah_warga,
                    icon: "users",
                    permission: "view.warga",
                },
                {
                    href: "/admin/warga",
                    color: "primary",
                    title: "Jumlah Warga Sebagai Penduduk",
                    value: rest.jumlah_warga_penduduk,
                    icon: "home",
                    permission: "view.warga",
                },
                {
                    href: "/admin/warga",
                    color: "primary",
                    title: "Jumlah Warga Sebagai Pendatang",
                    value: rest.jumlah_warga_pendatang,
                    icon: "walking",
                    permission: "view.warga",
                },
                {
                    href: "/admin/rw",
                    color: "success",
                    title: "Jumlah RW",
                    value: rest.jumlah_rw,
                    icon: "house-user",
                    permission: "view.rw",
                },
                {
                    href: "/admin/rt",
                    color: "info",
                    title: "Jumlah RT",
                    value: rest.jumlah_rt,
                    icon: "users",
                    permission: "view.rt",
                },
            ]
        },
        {
            kategori: 'Informasi',
            isi: [
                {
                    href: "/admin/pengaduan",
                    color: "warning",
                    title: "Pengaduan",
                    value: rest.jumlah_pengaduan,
                    icon: "paper-plane",
                    permission: "view.pengaduan",
                },
                {
                    href: "/admin/pengumuman",
                    color: "warning",
                    title: "Pengumuman RW",
                    value: rest.jumlah_pengumuman_rw,
                    icon: "comments",
                    permission: "view.pengumuman",
                },
                {
                    href: "/admin/pengumuman",
                    color: "warning",
                    title: "Pengumuman RT",
                    value: rest.jumlah_pengumuman_rt,
                    icon: "clipboard-list",
                    permission: "view.pengumuman",
                },
            ],
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
                    permission: "view.kategori_golongan",
                },
                {
                    href: "/admin/roles",
                    color: "warning",
                    title: "Jumlah Roles",
                    value: rest.jumlah_roles,
                    icon: "user-shield",
                    permission: "view.role",
                },
                {
                    href: "/admin/permissions",
                    color: "danger",
                    title: "Jumlah Permissions",
                    value: rest.jumlah_permissions,
                    icon: "key",
                    permission: "view.permission",
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
            permission: "dashboard.admin",
        },
        {
            text: "Analisis Warga",
            icon: "users",
            children: [
                {
                    href: "/admin/kartu_keluarga",
                    text: "Warga",
                    icon: "id-card",
                    permission: "view.kartu_keluarga",
                },
                {
                    href: "/admin/rw",
                    text: "Pengurus RW",
                    icon: "house-user",
                    permission: "view.rw",
                },
                {
                    href: "/admin/rt",
                    text: "Pengurus RT",
                    icon: "users",
                    permission: "view.rt",
                },
            ],
            permissions: [
                "view.kartu_keluarga",
                "view.rw",
                "view.rt",
            ]
        },
        {
            text: "Keuangan",
            icon: "wallet",
            children: [
                {
                    href: "/admin/iuran",
                    text: "Iuran Warga",
                    icon: "file-invoice-dollar",
                    permission: "view.iuran",
                },
                {
                    href: "/admin/tagihan",
                    text: "Tagihan Warga",
                    icon: "hand-holding-usd",
                    permission: "view.tagihan",
                },
                {
                    href: "/admin/transaksi",
                    text: "Transaksi Warga",
                    icon: "money-bill-wave",
                    permission: "view.transaksi",
                },
            ],
            permissions: [
                "view.iuran",
                "view.tagihan",
                "view.transaksi",
            ],
        },
        {
            text: "Laporan",
            icon: "file-alt",
            children: [
                {
                    href: "/laporan-keuangan",
                    text: "Laporan Keuangan",
                    icon: "money-check-alt",
                    permission: "view.transaksi",
                },
                {
                    href: "/laporan-pengaduan",
                    text: "Laporan Pengaduan",
                    icon: "file-contract",
                    permission: "view.pengaduan",
                },
            ],
            permissions: [
                "view.transaksi",
                "view.pengaduan",
            ]
        },
        {
            text: "Pengaturan Sistem",
            icon: "cog",
            children: [
                {
                    href: "/admin/kategori-golongan",
                    text: "Kategori Golongan",
                    icon: "layer-group",
                    permission: "view.kategori_golongan",
                },
                {
                    href: "/admin/roles",
                    text: "Roles",
                    icon: "user-shield",
                    permission: "view.role",
                },
                {
                    href: "/admin/permissions",
                    text: "Permissions",
                    icon: "key",
                    permission: "view.permission",
                },
            ],
            permissions: [
                "view.kategori_golongan",
                "view.role",
                "view.permission",
            ]
        },
        {
            href: "/admin/pengumuman",
            text: "Pengumuman",
            icon: "bullhorn",
            permission: "view.pengumuman",
        },
        {
            href: "/admin/pengaduan",
            text: "Pengaduan",
            icon: "paper-plane",
            permission: "view.pengaduan",
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
            title: "Jumlah Warga Sebagai PenPengurusng",
            value: rest.jumlah_warga_pendatang,
            icon: "walking",
        },
    ];
}

export function getRwCards({ ...rest }) {
    return [
        {
            kategori: 'Keuangan',
            isi: [
                {
                    href: "/rw/transaksi",
                    color: "success",
                    title: "Total Pemasukan",
                    value: formatRupiah(rest.total_pemasukan),
                    icon: "dollar-sign",
                    permission: "view.transaksi",
                },
                {
                    href: "/rw/transaksi",
                    color: "danger",
                    title: "Total Pengeluaran",
                    value: formatRupiah(rest.total_pengeluaran),
                    icon: "money-bill-wave",
                    permission: "view.transaksi",
                },
                {
                    href: "/rw/transaksi",
                    color: "primary",
                    title: "Saldo Akhir",
                    value: formatRupiah(rest.total_saldo_akhir),
                    icon: "wallet",
                    permission: "view.transaksi",
                },
                {
                    href: "/rw/iuran",
                    color: "success",
                    title: "Total Iuran Bulan Ini",
                    value: formatRupiah(rest.total_iuran_bulan_ini),
                    icon: "circle-dollar-to-slot",
                    permission: "view.iuran",
                },
            ],
        },
        {
            kategori: 'Data Warga',
            isi: [
                {
                    href: "/rw/rt",
                    color: "info",
                    title: "Jumlah RT",
                    value: rest.jumlah_rt,
                    icon: "house-user",
                    permission: "view.rt",
                },
                {
                    href: "/rw/kartu_keluarga",
                    color: "info",
                    title: "Jumlah KK",
                    value: rest.jumlah_kk,
                    icon: "clipboard-list",
                    permission: "view.kartu_keluarga",
                },
                {
                    href: "/rw/kartu_keluarga",
                    color: "primary",
                    title: "Jumlah Warga",
                    value: rest.jumlah_warga,
                    icon: "users",
                    permission: "view.warga",
                },
                {
                    href: "/rw/kartu_keluarga",
                    color: "primary",
                    title: "Jumlah Warga Tetap",
                    value: rest.jumlah_warga_penduduk,
                    icon: "home",
                    permission: "view.warga",
                },
                {
                    href: "/rw/kartu_keluarga",
                    color: "primary",
                    title: "Jumlah Warga Pendatang",
                    value: rest.jumlah_warga_pendatang,
                    icon: "walking",
                    permission: "view.warga",
                },
            ],
            permissions: [
                "view.rt",
                "view.kartu_keluarga",
                "view.warga",
                "view.warga",
                "view.warga",
            ],
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
                    permission: "view.pengaduan",
                },
                {
                    href: "/rw/pengumuman",
                    color: "warning",
                    title: "Pengumuman RW",
                    value: rest.pengumuman_rw,
                    icon: "comments",
                    permission: "view.pengumuman",
                },
                {
                    href: "/rw/pengumuman",
                    color: "warning",
                    title: "Pengumuman RT",
                    value: rest.pengumuman_rt,
                    icon: "clipboard-list",
                    permission: "view.pengumuman",
                },
            ],
        },
    ];
}

export function getRwLinks() {
    return [
        {
            href: "/dashboard",
            text: "Dashboard",
            icon: "tachometer-alt",
            permission: "dashboard.rw",
        },
        {
            text: "Warga",
            icon: "users",
            children: [
                {
                    href: "/rw/rt",
                    text: "Data RT",
                    icon: "users",
                    permission: "view.rt",
                },
                {
                    href: "/rw/kartu_keluarga",
                    text: "Data Kartu Keluarga",
                    icon: "id-card",
                    permission: "view.kartu_keluarga",
                },
            ],
            permissions: [
                "view.rt",
                "view.kartu_keluarga",
            ]
        },
        {
            text: "Keuangan",
            icon: "wallet",
            children: [
                {
                    href: "/rw/iuran",
                    text: "Iuran Warga",
                    icon: "file-invoice-dollar",
                    permission: "view.iuran",
                },
                {
                    href: "/rw/tagihan",
                    text: "Tagihan Warga",
                    icon: "hand-holding-usd",
                    permission: "view.tagihan",
                },
                {
                    href: "/rw/transaksi",
                    text: "Transaksi RW",
                    icon: "money-bill-wave",
                    permission: "view.transaksi",
                },
            ],
            permissions: [
                "view.iuran",
                "view.tagihan",
                "view.transaksi",
            ],
        },
        {
            text: "Laporan",
            icon: "file-alt",
            children: [
                {
                    href: "/laporan-keuangan",
                    text: "Laporan Keuangan",
                    icon: "money-check-alt",
                    permission: "view.transaksi",
                },
                {
                    href: "/laporan-pengaduan",
                    text: "Laporan Pengaduan",
                    icon: "file-contract",
                    permission: "view.pengaduan",
                },
            ],
            permissions: [
                "view.transaksi",
                "view.pengaduan",
            ],
        },
        {
            href: "/rw/pengumuman",
            text: "Pengumuman",
            icon: "bullhorn",
            permission: "view.pengumuman",
        },
        {
            href: "/rw/pengaduan",
            text: "Pengaduan",
            icon: "paper-plane",
            permission: "view.pengaduan",
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
    ]
}

export function getRtCards({ ...rest }) {
    return [
        {
            kategori: 'Keuangan',
            isi: [
                {
                    href: "/rt/transaksi",
                    color: rest.total_pemasukan > 0 ? "success" : "warning",
                    title: "Total Pemasukkan",
                    value: formatRupiah(rest.total_pemasukan),
                    icon: "dollar-sign",
                    permission: "view.transaksi",
                },
                {
                    href: "/rt/transaksi",
                    color: rest.pengeluaran > 0 ? "danger" : "success",
                    title: "Total Pengeluaran",
                    value: formatRupiah(rest.pengeluaran),
                    icon: "donate",
                    permission: "view.transaksi",
                },
                {
                    href: "/rt/transaksi",
                    color: rest.total_saldo_akhir === 0 ? "warning" : rest.total_saldo_akhir > 0 ? "success" : "danger",
                    title: "Total Saldo Akhir",
                    value: formatRupiah(rest.total_saldo_akhir),
                    icon: "wallet",
                    permission: "view.transaksi",
                },
            ]
        },
        {
            kategori: 'Data Warga',
            isi: [
                {
                    href: "/rt/warga",
                    color: "primary",
                    title: "Jumlah Warga",
                    value: rest.jumlah_warga,
                    icon: "users",
                    permission: "view.warga",
                },
                {
                    href: "/rt/warga",
                    color: "primary",
                    title: "Jumlah Warga Tetap",
                    value: rest.jumlah_warga_penduduk,
                    icon: "home",
                    permission: "view.warga",
                },
                {
                    href: "/rt/warga",
                    color: "primary",
                    title: "Jumlah Warga Pendatang",
                    value: rest.jumlah_warga_pendatang,
                    icon: "walking",
                    permission: "view.warga",
                },
                {
                    href: "/rt/kartu_keluarga",
                    color: "info",
                    title: "Jumlah Kartu Keluarga",
                    value: rest.jumlah_kk,
                    icon: "clipboard-list",
                    permission: "view.kartu_keluarga",
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
                    permission: "view.pengumuman",
                },
                {
                    href: "/rt/pengaduan",
                    color: "warning",
                    title: "Jumlah Pengaduan",
                    value: rest.pengaduan_rt_saya,
                    icon: "comment-dots",
                    permission: "view.pengaduan",
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
            permission: "dashboard.rt",
        },
        {
            text: "Warga",
            icon: "users",
            children: [
                {
                    href: "/rt/warga",
                    text: "Data Warga",
                    icon: "user",
                    permission: "view.warga",
                },
                {
                    href: "/rt/kartu_keluarga",
                    text: "Data Kartu Keluarga",
                    icon: "id-card",
                    permission: "view.kartu_keluarga",
                },
            ],
            permissions: [
                "view.warga",
                "view.kartu_keluarga",
            ]
        },
        {
            text: "Keuangan",
            icon: "wallet",
            children: [
                {
                    href: "/rt/iuran",
                    text: "Iuran",
                    icon: "file-invoice-dollar",
                    permission: "view.iuran",
                },
                {
                    href: "/rt/tagihan",
                    text: "Tagihan",
                    icon: "hand-holding-usd",
                    permission: "view.tagihan",
                },
                {
                    href: "/rt/transaksi",
                    text: "Transaksi",
                    icon: "money-bill-wave",
                    permission: "view.transaksi",
                },
            ],
            permissions: [
                "view.iuran",
                "view.tagihan",
                "view.transaksi",
            ]
        },
        {
            text: "Laporan",
            icon: "file-alt",
            children: [
                {
                    href: "/laporan-keuangan",
                    text: "Laporan Keuangan",
                    icon: "money-check-alt",
                    permission: "view.transaksi",
                },
                {
                    href: "/laporan-pengaduan",
                    text: "Laporan Pengaduan",
                    icon: "file-contract",
                    permission: "view.pengaduan",
                },
            ]
        },
        {
            href: "/rt/pengumuman",
            text: "Pengumuman",
            icon: "comments",
            permission: "view.pengumuman",
        },
        {
            href: "/rt/pengaduan",
            text: "Pengaduan",
            icon: "comment-dots",
            permission: "view.pengaduan",
        },
    ];
}

export function judul(role) {
    const url = window.location.pathname
    const segment = url.split("/").pop()

    let judulHalaman

    if (role === 'warga') {
        if (!segment && (url === "/" || url === "/dashboard-main")) {
            judulHalaman = "Dashboard"
        } else {
            switch (segment) {
                case "dashboard":
                    judulHalaman = "Dashboard"
                    break
                case "kk":
                    judulHalaman = "Kartu Keluarga"
                    break
                case "pengumuman":
                    judulHalaman = "Pengumuman"
                    break
                case "tagihan":
                    judulHalaman = "Tagihan"
                    break
                case "iuran":
                    judulHalaman = "Iuran"
                    break
                case "transaksi":
                    judulHalaman = "Transaksi"
                    break
                case "pengaduan":
                    judulHalaman = "Pengaduan"
                    break
                default:
                    judulHalaman =
                        segment
                            .replace(/[-_]+/g, " ")
                            .trim()
                            .replace(/\b\w/g, (char) => char.toUpperCase());
            }
        }
    }

    if (role === 'rt') {
        if (!segment && (url === "/" || url === "/dashboard-main")) {
            judulHalaman = "Dashboard"
        } else {
            switch (segment) {
                case "dashboard":
                    judulHalaman = "Dashboard"
                    break
                case "kartu_keluarga":
                    judulHalaman = "Data Kartu Keluarga"
                    break
                case "pengumuman":
                    judulHalaman = "Pengumuman"
                    break
                case "tagihan":
                    judulHalaman = "Tagihan"
                    break
                case "iuran":
                    judulHalaman = "Iuran"
                    break
                case "transaksi":
                    judulHalaman = "Transaksi"
                    break
                case "pengaduan":
                    judulHalaman = "Pengaduan"
                    break
                case "warga":
                    judulHalaman = "Analisis Warga"
                    break
                case "keuangan":
                    judulHalaman = "Analisis Keuangan"
                    break
                default:
                    judulHalaman =
                        segment
                            .replace(/[-_]+/g, " ")
                            .trim()
                            .replace(/\b\w/g, (char) => char.toUpperCase());
            }
        }
    }

    if (role === 'rw') {
        if (!segment && (url === "/" || url === "/dashboard-main")) {
            judulHalaman = "Dashboard"
        } else {
            switch (segment) {
                case "rt":
                    judulHalaman = "Rukun Tetangga"
                    break
                case "kartu_keluarga":
                    judulHalaman = "Data Kartu Keluarga"
                    break
                case "dashboard":
                    judulHalaman = "Dashboard"
                    break
                case "pengumuman":
                    judulHalaman = "Pengumuman"
                    break
                case "tagihan":
                    judulHalaman = "Tagihan Warga"
                    break
                case "iuran":
                    judulHalaman = "Iuran Warga"
                    break
                case "transaksi":
                    judulHalaman = "Transaksi RW"
                    break
                case "pengaduan":
                    judulHalaman = "Pengaduan"
                    break
                case "warga":
                    judulHalaman = "Analisis Warga"
                    break
                case "keuangan":
                    judulHalaman = "Analisis Keuangan"
                    break
                case "informasi_keuangan":
                    judulHalaman = "Informasi Keuangan"
                    break
                default:
                    judulHalaman =
                        segment
                            .replace(/[-_]+/g, " ")
                            .trim()
                            .replace(/\b\w/g, (char) => char.toUpperCase());
            }
        }
    }

    if (role === 'admin') {
        if (!segment && (url === "/" || url === "/dashboard-main")) {
            judulHalaman = "Dashboard"
        } else {
            switch (segment) {
                case "rw":
                    judulHalaman = "Rukun Warga"
                    break
                case "dashboard":
                    judulHalaman = "Dashboard"
                    break
                case "rt":
                    judulHalaman = "Rukun Tetangga"
                    break
                case "kategori-golongan":
                    judulHalaman = "Kategori Golongan"
                    break
                case "roles":
                    judulHalaman = "Roles"
                    break
                case "permissions":
                    judulHalaman = "Permissions"
                    break
                case "informasi_keuangan":
                    judulHalaman = "Informasi Keuangan"
                    break
                default:
                    judulHalaman =
                        segment
                            .replace(/[-_]+/g, " ")
                            .trim()
                            .replace(/\b\w/g, (char) => char.toUpperCase());
            }
        }
    }

    return judulHalaman
}

export function useIsMobile() {
    const [mobile, setMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        function handleResize() {
            setMobile(window.innerWidth < 768);
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return mobile;
}

export function iconPermission() {
    return [
        {
            name: "assign",
            icon: "clipboard-list"
        },
        {
            name: "comment",
            icon: "comments"
        },
        {
            name: "confirm",
            icon: "circle-check"
        },
        {
            name: "create",
            icon: "circle-plus"
        },
        {
            name: "dashboard",
            icon: "tachometer-alt"
        },
        {
            name: "delete",
            icon: "trash"
        },
        {
            name: "edit",
            icon: "pen-to-square"
        },
        {
            name: "export",
            icon: "file-export"
        },
        {
            name: "respond",
            icon: "reply"
        },
        {
            name: "toggle",
            icon: "toggle-on"
        },
        {
            name: "view",
            icon: "eye"
        },
    ]
}