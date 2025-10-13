import React, { useState } from "react";
import { router } from "@inertiajs/react";
import Layout from "@/Layouts/Layout";
import { AddRtModal, EditRtModal } from "@/Pages/Component/Modal";

export default function Rt({ rukun_tetangga, title, filters, rukun_tetangga_filter }) {
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [form, setForm] = useState({});
    const [filter, setFilter] = useState(filters || { search: "", rt: "" });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFilter = (e) => {
        setFilter({ ...filter, [e.target.name]: e.target.value });
    };

    const applyFilter = () => {
        router.get(route("rw.rt.index"), filter, { preserveState: true });
    };

    const resetFilter = () => {
        setFilter({ search: "", rt: "" });
        router.get(route("rw.rt.index"), {}, { preserveState: true });
    };

    const handleAdd = (e) => {
        e.preventDefault();
        router.post(route("rw.rt.store"), form, {
            onSuccess: () => setShowAdd(false),
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        router.put(route("rw.rt.update", form.id), form, {
            onSuccess: () => setShowEdit(false),
        });
    };

    const handleDelete = (id) => {
        if (confirm("Yakin ingin menghapus RT ini?")) {
            router.delete(route("rw.rt.destroy", id));
        }
    };

    const handleToggleStatus = (id) => {
        router.post(route("rw.rt.toggleStatus", id));
    };

    return (
        <Layout title={title}>
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-semibold">{title}</h1>
                    <button
                        onClick={() => {
                            setForm({ status: "aktif" });
                            setShowAdd(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        + Tambah RT
                    </button>
                </div>

                {/* 🔍 Filter Section */}
                <div className="flex gap-3 mb-5">
                    <input
                        type="text"
                        name="search"
                        value={filter.search}
                        onChange={handleFilter}
                        placeholder="Cari NIK / Nama..."
                        className="border rounded-md p-2 w-1/3"
                    />
                    <select
                        name="rt"
                        value={filter.rt}
                        onChange={handleFilter}
                        className="border rounded-md p-2"
                    >
                        <option value="">Semua RT</option>
                        {rukun_tetangga_filter.map((rt) => (
                            <option key={rt.nomor_rt} value={rt.nomor_rt}>
                                RT {rt.nomor_rt}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={applyFilter}
                        className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600"
                    >
                        Terapkan
                    </button>
                    <button
                        onClick={resetFilter}
                        className="bg-gray-300 text-gray-800 px-3 py-2 rounded-md hover:bg-gray-400"
                    >
                        Reset
                    </button>
                </div>

                {/* 🔹 Table */}
                <div className="overflow-x-auto bg-white rounded-xl shadow">
                    <table className="min-w-full text-sm text-gray-700">
                        <thead className="bg-gray-100 text-gray-900">
                            <tr>
                                <th className="p-3 text-left">No</th>
                                <th className="p-3 text-left">NIK</th>
                                <th className="p-3 text-left">Nama Ketua RT</th>
                                <th className="p-3 text-left">Nomor RT</th>
                                <th className="p-3 text-left">Mulai Menjabat</th>
                                <th className="p-3 text-left">Akhir Jabatan</th>
                                <th className="p-3 text-center">Status</th>
                                <th className="p-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rukun_tetangga.data.length > 0 ? (
                                rukun_tetangga.data.map((rt, index) => (
                                    <tr key={rt.id} className="border-t hover:bg-gray-50">
                                        <td className="p-3">{index + 1}</td>
                                        <td className="p-3">{rt.nik}</td>
                                        <td className="p-3">{rt.nama_ketua_rt}</td>
                                        <td className="p-3">{rt.nomor_rt}</td>
                                        <td className="p-3">{rt.mulai_menjabat?.slice(0, 10)}</td>
                                        <td className="p-3">{rt.akhir_jabatan?.slice(0, 10)}</td>
                                        <td className="p-3 text-center">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    rt.status === "aktif"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-200 text-gray-700"
                                                }`}
                                            >
                                                {rt.status}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center flex justify-center gap-2">

                                            <button
                                                onClick={() => handleToggleStatus(rt.id)}
                                                className={`px-3 py-1 rounded-md text-white ${
                                                    rt.status === "aktif"
                                                        ? "bg-gray-500 hover:bg-gray-600"
                                                        : "bg-green-600 hover:bg-green-700"
                                                }`}
                                            >
                                                {rt.status === "aktif" ? "Nonaktifkan" : "Aktifkan"}
                                            </button>                                            
                                            <button
                                                onClick={() => {
                                                    setForm(rt);
                                                    setShowEdit(true);
                                                }}
                                                className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 rounded-md text-white"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(rt.id)}
                                                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-white"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-4 text-gray-500">
                                        Tidak ada data RT
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 🔹 Pagination */}
                <div className="mt-4 flex justify-center">
                    {rukun_tetangga.links?.map((link, i) => (
                        <button
                            key={i}
                            onClick={() => router.get(link.url)}
                            disabled={!link.url}
                            className={`px-3 py-1 mx-1 rounded-md ${
                                link.active
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                            }`}
                        >
                            {link.label.replace("&laquo;", "«").replace("&raquo;", "»")}
                        </button>
                    ))}
                </div>
            </div>

            {showAdd && (
                <AddRtModal
                    form={form}
                    handleChange={handleChange}
                    handleAdd={handleAdd}
                    onClose={() => setShowAdd(false)}
                    isRw={true} // Menandakan bahwa ini adalah modal untuk RW
                />
            )}

            {showEdit && (
                <EditRtModal
                    form={form}
                    handleChange={handleChange}
                    handleEdit={handleEdit}
                    onClose={() => setShowEdit(false)}
                    isRw={true} // Menandakan bahwa ini adalah modal untuk RW
                />
            )}
        </Layout>
    );
}
