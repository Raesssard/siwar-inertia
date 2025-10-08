import Layout from "@/Layouts/Layout"
import { Head, Link, useForm, usePage } from "@inertiajs/react"
import React from "react"

export default function KartuKeluarga() {
    const {
        kartu_keluarga,
        kategori_iuran,
        warga,
        title,
        total_kk,
    } = usePage().props
    console.log(kartu_keluarga)
    console.log(kategori_iuran)
    console.log(warga)
    console.log(title)
    console.log(total_kk)
    return (
        <Layout>
            <h1>ini adalah halaman kartu keluarga</h1>
        </Layout>
    )
}