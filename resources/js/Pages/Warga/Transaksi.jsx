import Layout from "@/Layouts/Layout"
import { Head, usePage } from "@inertiajs/react";
import React from "react";

export default function Transaksi() {
    const { title, transaksi } = usePage().props
    const { props } = usePage()
    const role = props.auth?.currentRole
    return (
        <Layout>
            <Head title={`${title} ${role.length <= 2
                ? role.toUpperCase()
                : role.charAt(0).toUpperCase() + role.slice(1)}`} />
            <h1>ini halaman transaksi</h1>
        </Layout>
    )
}