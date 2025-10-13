import Layout from "@/Layouts/Layout"
import { Head, useForm, usePage } from "@inertiajs/react";
import React from "react";
import { FilterIuran } from "../Component/Filter";

export default function Iuran() {
    const {
        iuran,
        golongan_list,
        title,
    } = usePage().props
    const { props } = usePage()
    const role = props.auth?.currentRole
    const user = props.auth?.user
    const { get, data, setData } = useForm({
        search: '',
    })

    const filter = (e) => {
        e.preventDefault()
        get(`/${role}/iuran`, { preserveState: true, preserveScroll: true })
    }

    const resetFilter = () => {
        setData({
            search: '',
        })
    }
    console.table(iuran)
    console.table(golongan_list)
    console.log(title)
    return (
        <Layout>
            <Head title={`${title} - ${role.length <= 2
                ? role.toUpperCase()
                : role.charAt(0).toUpperCase() + role.slice(1)}`} />
            <FilterIuran
                data={data}
                setData={setData}
                filter={filter}
                resetFilter={resetFilter}
                role={role}
            />
        </Layout>
    )
}