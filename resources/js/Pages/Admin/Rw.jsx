import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import Layout from "@/Layouts/Layout";

export default function Rw({ rw }) {
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(null);

    const [form, setForm] = useState({
        nik: "",
        nomor_rw: "",
        nama_ketua_rw: "",
        mulai_menjabat: "",
        akhir_jabatan: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAdd = (e) => {
        e.preventDefault();
        Inertia.post(route("admin.rw.store"), form, {
            onSuccess: () => {
                setShowAdd(false);
                setForm({
                    nik: "",
                    nomor_rw: "",
                    nama_ketua_rw: "",
                    mulai_menjabat: "",
                    akhir_jabatan: "",
                });
            },
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        Inertia.put(route("admin.rw.update", showEdit.id), form, {
            onSuccess: () => setShowEdit(null),
        });
    };

    const handleDelete = (id) => {
        if (confirm("Yakin ingin menghapus data RW ini?")) {
            Inertia.delete(route("admin.rw.destroy", id));
        }
    };

    const openEdit = (rwItem) => {
        setForm({
            nik: rwItem.nik || "",
            nomor_rw: rwItem.nomor_rw || "",
            nama_ketua_rw: rwItem.nama_ketua_rw || "",
            mulai_menjabat: rwItem.mulai_menjabat || "",
            akhir_jabatan: rwItem.akhir_jabatan || "",
        });
        setShowEdit(rwItem);
    };

    return (
        <Layout title="Data RW">
            <div className="table-header">
                <h4>Data RW</h4>
                <button className="btn-custom btn-primary" onClick={() => setShowAdd(true)}>
                    Tambah RW
                </button>
            </div>

            <div className="table-container">
                <table className="table-custom">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>NIK</th>
                            <th>Nomor RW</th>
                            <th>Nama Ketua RW</th>
                            <th>Mulai Menjabat</th>
                            <th>Akhir Jabatan</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rw.data.length > 0 ? (
                            rw.data.map((item, index) => (
                                <tr key={item.id}>
                                    <td>{rw.from + index}</td>
                                    <td>{item.nik}</td>
                                    <td>{item.nomor_rw}</td>
                                    <td>{item.nama_ketua_rw}</td>
                                    <td>{item.mulai_menjabat}</td>
                                    <td>{item.akhir_jabatan}</td>
                                    <td>
                                        <button
                                            className="btn-custom btn-warning me-1"
                                            onClick={() => openEdit(item)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn-custom btn-danger"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            Hapus
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center">
                                    Tidak ada data
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="pagination-container">
                    {rw.links && (
                        <nav>
                            <ul className="pagination-custom">
                                {rw.links.map((link, index) => (
                                    <li
                                        key={index}
                                        className={`page-item ${link.active ? "active" : ""} ${
                                            !link.url ? "disabled" : ""
                                        }`}
                                    >
                                        <a
                                            href={link.url || "#"}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    )}
                </div>
            </div>

            {/* Modal Tambah */}
            {showAdd && (
                <div className="modal-overlay">
                    <div className="modal-custom">
                        <form onSubmit={handleAdd}>
                            <div className="modal-header">
                                <h5>Tambah RW</h5>
                                <button type="button" className="btn-close" onClick={() => setShowAdd(false)} />
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>NIK</label>
                                    <input type="text" name="nik" value={form.nik} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Nomor RW</label>
                                    <input type="text" name="nomor_rw" value={form.nomor_rw} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Nama Ketua RW</label>
                                    <input type="text" name="nama_ketua_rw" value={form.nama_ketua_rw} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Mulai Menjabat</label>
                                    <input type="date" name="mulai_menjabat" value={form.mulai_menjabat} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Akhir Jabatan</label>
                                    <input type="date" name="akhir_jabatan" value={form.akhir_jabatan} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-custom btn-secondary" onClick={() => setShowAdd(false)}>
                                    Batal
                                </button>
                                <button type="submit" className="btn-custom btn-primary">
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Edit */}
            {showEdit && (
                <div className="modal-overlay">
                    <div className="modal-custom">
                        <form onSubmit={handleEdit}>
                            <div className="modal-header">
                                <h5>Edit RW</h5>
                                <button type="button" className="btn-close" onClick={() => setShowEdit(null)} />
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>NIK</label>
                                    <input type="text" name="nik" value={form.nik} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Nomor RW</label>
                                    <input type="text" name="nomor_rw" value={form.nomor_rw} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Nama Ketua RW</label>
                                    <input type="text" name="nama_ketua_rw" value={form.nama_ketua_rw} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Mulai Menjabat</label>
                                    <input type="date" name="mulai_menjabat" value={form.mulai_menjabat} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Akhir Jabatan</label>
                                    <input type="date" name="akhir_jabatan" value={form.akhir_jabatan} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-custom btn-secondary" onClick={() => setShowEdit(null)}>
                                    Batal
                                </button>
                                <button type="submit" className="btn-custom btn-primary">
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}
