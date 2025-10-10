import Layout from "@/Layouts/Layout"
import { Head, usePage } from "@inertiajs/react";
import React from "react";

export default function Iuran() {
    const {
        iuran,
        golongan_list,
        title,
    } = usePage().props
    const { props } = usePage()
    const role = props.auth?.currentRole
    const user = props.auth?.user

    return (
        <Layout>
            <Head title={`${title} - ${role.length <= 2
                ? role.toUpperCase()
                : role.charAt(0).toUpperCase() + role.slice(1)}`} />
            <h1>ini adalah halaman iuran RT</h1>
        </Layout>
    )
}