import React, { useEffect, useState } from "react";
import Layout from "@/Layouts/Layout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import { AddRtModal, EditRtModal } from "@/Pages/Component/Modal";
import "../../../css/kk.css"; // biar tabel dan tombolnya sama gaya

export default function Rt() {
    const {
        rukun_tetangga,
        filters,
        rukun_tetangga_filter,
        title,
        warga,
        roles
    } = usePage().props
    const { props } = usePage();
    const role = props.auth?.currentRole || "rw";

    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(null);

    const [form, setForm] = useState({
        nik: "",
        nomor_rt: "",
        nama_anggota_rt: "",
        mulai_menjabat: "",
        akhir_jabatan: "",
        status: "aktif",
    });

    const [search, setSearch] = useState({
        keyword: filters?.keyword || "",
        nomor_rt: filters?.nomor_rt || "",
    });

    const handleSelectChange = (name, selected) => {
        setForm({
            ...form,
            [name]: selected?.value || ""
        });
    };
    useEffect(() => {
        if (form.nik) {
            const namaWarga = form.nik ? warga.find(n => n.nik === form.nik).nama : ""
            const noRt = form.nik ? warga.find(n => n.nik === form.nik).kartu_keluarga.rukun_tetangga.nomor_rt : ""

            setForm({
                ...form,
                nomor_rt: noRt,
                nama_anggota_rt: namaWarga,
            })
        }
    }, [form.nik])

    // 🔹 Handle form input
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleAdd = (e) => {
        e.preventDefault();
        router.post(route("rw.rt.store"), form, {
            onSuccess: () => {
                setShowAdd(false);
                setForm({
                    nik: "",
                    nomor_rt: "",
                    nama_anggota_rt: "",
                    mulai_menjabat: "",
                    akhir_jabatan: "",
                    status: "aktif",
                });
            },
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        router.put(route("rw.rt.update", showEdit.id), form, {
            onSuccess: () => setShowEdit(null),
        });
    };

    const handleDelete = (id) => {
        if (confirm("Yakin ingin menghapus data RT ini?")) {
            router.delete(route("rw.rt.destroy", id));
        }
    };

    const handleToggleStatus = (id) => {
        if (confirm("Yakin ingin mengubah status RT ini?")) {
            router.put(route("rw.rt.toggleStatus", id), {}, { preserveScroll: true });
        }
    };

    const openEdit = (item) => {
        setForm({
            nik: item.nik || "",
            nomor_rt: item.nomor_rt || "",
            nama_anggota_rt: item.nama_anggota_rt || "",
            mulai_menjabat: item.mulai_menjabat || "",
            akhir_jabatan: item.akhir_jabatan || "",
            status: item.status || "aktif",
        });
        setShowEdit(item);
    };

    // 🔹 Filter logic
    const handleSearchChange = (e) =>
        setSearch({ ...search, [e.target.name]: e.target.value });

    const applyFilter = (e) => {
        e.preventDefault();
        router.get(route("rw.rt.index"), search, {
            replace: true,
            preserveScroll: true,
        });
    };

    const resetFilter = () => {
        setSearch({ keyword: "", nomor_rt: "" });
        router.get(route("rw.rt.index"), {}, { replace: true, preserveScroll: true });
    };

    return (
        <Layout>
            <Head
                title={`${title} - ${role.length <= 2
                    ? role.toUpperCase()
                    : role.replace(/\b\w/g, (char) => char.toUpperCase())
                    }`}
            />

            {/* 🔍 Filter Section */}
            <form onSubmit={applyFilter} className="filter-form mb-4 d-flex align-items-center">
                <input
                    type="text"
                    name="keyword"
                    placeholder="Cari NIK atau Nama Ketua RT..."
                    value={search.keyword}
                    onChange={handleSearchChange}
                    className="me-2"
                />

                <select
                    name="nomor_rt"
                    value={search.nomor_rt}
                    onChange={handleSearchChange}
                    className="me-2"
                >
                    <option value="">-- Semua Nomor RT --</option>
                    {rukun_tetangga_filter.map((rtItem, index) => (
                        <option key={index} value={rtItem.nomor_rt || rtItem}>
                            RT {rtItem.nomor_rt || rtItem}
                        </option>
                    ))}
                </select>

                <button type="submit" className="btn-custom btn-secondary me-2">
                    Filter
                </button>
                <button
                    type="button"
                    onClick={resetFilter}
                    className="btn-custom btn-light bg-gray-300"
                >
                    Reset
                </button>
            </form>

            {/* 📋 Table Section */}
            <div className="table-container">
                <div className="table-header d-flex justify-content-between align-items-center">
                    <h4>Data RT</h4>
                    <button
                        className="btn btn-success btn-sm"
                        onClick={() => setShowAdd(true)}
                    >
                        Tambah RT
                    </button>
                </div>

                <div className="table-scroll">
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th className="text-center px-3">No.</th>
                                <th className="text-center px-3">Nomor RT</th>
                                <th className="text-center px-3">NIK</th>
                                <th className="text-center px-3">Nama Anggota RT</th>
                                <th className="text-center px-3">Jabatan</th>
                                <th className="text-center px-3">Mulai Menjabat</th>
                                <th className="text-center px-3">Akhir Jabatan</th>
                                <th className="text-center px-3">Status</th>
                                <th className="text-center px-3">Aksi</th>
                            </tr>
                        </thead>

                        <tbody>
                            {rukun_tetangga.data.length > 0 ? (
                                rukun_tetangga.data.flatMap((item, index) => {
                                    const roleUtama = ['admin', 'rw', 'rt', 'warga']

                                    const jabatanPerUser = item.user.map(u => {
                                        // cari role non-utama
                                        const sideRole = u.roles.find(r => !roleUtama.includes(r.name))

                                        // kalau ada jabatan asli (bendahara, sekretaris, dll)
                                        if (sideRole) {
                                            return {
                                                nik: u.nik,
                                                jabatan: sideRole.name.replace(/\b\w/g, (char => char.toUpperCase()))
                                            }
                                        }

                                        // kalau dia ketua (nik sama + role rt)
                                        if (
                                            u.nik === item.nik &&
                                            u.roles.some(r => r.name === 'rt')
                                        ) {
                                            return {
                                                nik: u.nik,
                                                jabatan: 'Ketua'
                                            }
                                        }

                                        // selain itu abaikan
                                        return null
                                    }).filter(Boolean)

                                    const jabatanRt = jabatanPerUser.find(j => j.nik === item.nik)
                                    console.log(jabatanRt)
                                    return (
                                        <>
                                            <tr key={item.id}>
                                                <td className="text-center">
                                                    {index + 1}
                                                </td>
                                                <td className="text-center">{item.nomor_rt}</td>
                                                <td className="text-center">{item?.nik || "-"}</td>
                                                <td className="text-center">{item.nama_anggota_rt || "-"}</td>
                                                <td className="text-center">{jabatanRt?.jabatan || "-"}</td>
                                                <td className="text-center">{item?.mulai_menjabat || "-"}</td>
                                                <td className="text-center">{item?.akhir_jabatan || "-"}</td>
                                                <td className="text-center align-middle">
                                                    <span
                                                        className={`inline-block px-2 py-1 rounded text-sm font-medium ${item.status === "aktif"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                            }`}
                                                        onClick={() => handleToggleStatus(item.id)}
                                                        style={{ cursor: 'pointer', width: '4.25rem' }}
                                                        title="Ganti status RT"
                                                    >
                                                        {item.status || "-"}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <div className="d-flex justify-content-center gap-2">
                                                        <button
                                                            className="btn btn-warning btn-sm"
                                                            onClick={() => openEdit(item)}
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </button>

                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => handleDelete(item.id)}
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        </>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center">
                                        Tidak ada data RT
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 🔹 Pagination */}
                {rukun_tetangga.links && (
                    <div className="pagination-container">
                        <ul className="pagination-custom">
                            {rukun_tetangga.links.map((link, index) => {
                                let label = link.label
                                if (label.includes("Previous")) label = "&lt;"
                                if (label.includes("Next")) label = "&gt;"

                                return (
                                    <li
                                        key={index}
                                        className={`page-item ${link.active ? "active" : ""} ${!link.url ? "disabled" : ""
                                            }`}
                                        style={{ cursor: !link.url ? "not-allowed" : "pointer" }}
                                    >
                                        <Link
                                            preserveScroll
                                            preserveState
                                            href={link.url || ""}
                                            dangerouslySetInnerHTML={{
                                                __html: label,
                                            }}
                                            title={`Pergi ke halaman ${label === "&lt;" ? 'sebelumnya' : label === "&gt;" ? 'selanjutnya' : label}`}
                                        />
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                )}
            </div>

            {/* ➕ Modal Tambah & ✏️ Edit */}
            {showAdd && (
                <AddRtModal
                    dataWarga={warga}
                    form={form}
                    handleChange={handleChange}
                    handleSelectChange={handleSelectChange}
                    handleAdd={handleAdd}
                    onClose={() => setShowAdd(false)}
                    isRw={true}
                    roles={roles}
                />
            )}

            {showEdit && (
                <EditRtModal
                    dataWarga={warga}
                    form={form}
                    handleChange={handleChange}
                    handleEdit={handleEdit}
                    onClose={() => setShowEdit(null)}
                    isRw={true}
                    roles={roles}
                />
            )}
        </Layout>
    );
}
