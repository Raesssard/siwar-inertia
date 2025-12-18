import React, { useEffect } from "react";
import { useForm, router, Head } from "@inertiajs/react";
import { route } from "ziggy-js";
import Layout from "@/Layouts/Layout";

export default function FormKK({ kk = null, daftar_rt = [], kategori_iuran = [], auth }) {
    const isEdit = !!kk;

    const role = auth?.currentRole;

    // ===================== INITIAL DATA =====================
    const { data, setData, post, put, processing, errors, reset } = useForm({
        no_kk: kk?.no_kk ?? "",
        no_registrasi: kk?.no_registrasi ?? "",
        alamat: kk?.alamat ?? "",
        kelurahan: kk?.kelurahan ?? "",
        kecamatan: kk?.kecamatan ?? "",
        kabupaten: kk?.kabupaten ?? "",
        provinsi: kk?.provinsi ?? "",
        kode_pos: kk?.kode_pos ?? "",
        tgl_terbit: kk?.tgl_terbit ?? "",
        kategori_iuran: kk?.kategori_iuran ?? "",
        instansi_penerbit: kk?.instansi_penerbit ?? "",
        kabupaten_kota_penerbit: kk?.kabupaten_kota_penerbit ?? "",
        nama_kepala_dukcapil: kk?.nama_kepala_dukcapil ?? "",
        nip_kepala_dukcapil: kk?.nip_kepala_dukcapil ?? "",
        id_rt: kk?.id_rt ?? "",
    });

    useEffect(() => {
        if (!isEdit) reset();
    }, []);

    // Base route utk role
    const baseRoute =
        role === "admin" ? "admin.kartu_keluarga" : "rw.kartu_keluarga";

    // ===================== HANDLE SUBMIT =====================
    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEdit) {
            put(route(`${baseRoute}.update`, kk.id), {
                preserveScroll: true,
                // onSuccess: () => router.visit(route(`${baseRoute}.index`)),
            });
        } else {
            post(route(`${baseRoute}.store`), {
                preserveScroll: true,
                // onSuccess: () => router.visit(route(`${baseRoute}.index`)),
            });
        }
    };

    const inputBase =
        "w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition text-gray-800";

    return (
        <Layout>
            <Head title={isEdit ? "Edit Kartu Keluarga" : "Tambah Kartu Keluarga"} />

            <div className="max-w-6xl mx-auto bg-white p-10 mt-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-green-500 pb-3 mb-8">
                    {isEdit ? "Edit Data Kartu Keluarga" : "Tambah Kartu Keluarga"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-10">
                    {/* =================== DATA NOMOR KK =================== */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-700 mb-5 border-l-4 border-green-500 pl-3">
                            Informasi Dasar KK
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="font-medium text-gray-700">No KK</label>
                                <input
                                    type="text"
                                    value={data.no_kk}
                                    onChange={(e) => setData("no_kk", e.target.value)}
                                    className={inputBase}
                                />
                                {errors.no_kk && <p className="text-red-500 text-sm">{errors.no_kk}</p>}
                            </div>

                            <div>
                                <label className="font-medium text-gray-700">No Registrasi</label>
                                <input
                                    type="text"
                                    value={data.no_registrasi}
                                    onChange={(e) => setData("no_registrasi", e.target.value)}
                                    className={inputBase}
                                />
                                {errors.no_registrasi && (
                                    <p className="text-red-500 text-sm">{errors.no_registrasi}</p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* =================== RT & KATEGORI =================== */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-700 mb-5 border-l-4 border-green-500 pl-3">
                            Lokasi RT & Kategori Iuran
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="font-medium text-gray-700">Pilih RT</label>
                                <select
                                    value={data.id_rt}
                                    onChange={(e) => setData("id_rt", e.target.value)}
                                    className={inputBase}
                                >
                                    <option value="">-- Pilih RT --</option>
                                    {daftar_rt.map((rt) => (
                                        <option key={rt.id} value={rt.id}>
                                            RT {rt.nomor_rt} / RW {rt?.rw?.nomor_rw}
                                        </option>
                                    ))}
                                </select>
                                {errors.id_rt && <p className="text-red-500 text-sm">{errors.id_rt}</p>}
                            </div>

                            <div>
                                <label className="font-medium text-gray-700">Kategori Iuran</label>
                                <select
                                    value={data.kategori_iuran}
                                    onChange={(e) => setData("kategori_iuran", e.target.value)}
                                    className={inputBase}
                                >
                                    <option value="">-- Pilih Kategori --</option>

                                    {(Array.isArray(kategori_iuran)
                                        ? kategori_iuran
                                        : Object.values(kategori_iuran)
                                    ).map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.jenis}
                                        </option>
                                    ))}
                                </select>
                                {errors.kategori_iuran && (
                                    <p className="text-red-500 text-sm">{errors.kategori_iuran}</p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* =================== ALAMAT =================== */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-700 mb-5 border-l-4 border-green-500 pl-3">
                            Alamat Lengkap
                        </h3>

                        <textarea
                            value={data.alamat}
                            onChange={(e) => setData("alamat", e.target.value)}
                            className={`${inputBase} min-h-[100px]`}
                        />
                        {errors.alamat && <p className="text-red-500 text-sm">{errors.alamat}</p>}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
                            {["kelurahan", "kecamatan", "kabupaten", "provinsi"].map((f) => (
                                <div key={f}>
                                    <label className="font-medium text-gray-700">
                                        {f.charAt(0).toUpperCase() + f.slice(1)}
                                    </label>
                                    <input
                                        type="text"
                                        value={data[f]}
                                        onChange={(e) => setData(f, e.target.value)}
                                        className={inputBase}
                                    />
                                    {errors[f] && <p className="text-red-500 text-sm">{errors[f]}</p>}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                            <div>
                                <label className="font-medium text-gray-700">Kode Pos</label>
                                <input
                                    type="text"
                                    value={data.kode_pos}
                                    onChange={(e) => setData("kode_pos", e.target.value)}
                                    className={inputBase}
                                />
                                {errors.kode_pos && (
                                    <p className="text-red-500 text-sm">{errors.kode_pos}</p>
                                )}
                            </div>

                            <div>
                                <label className="font-medium text-gray-700">Tanggal Terbit</label>
                                <input
                                    type="date"
                                    value={data.tgl_terbit}
                                    onChange={(e) => setData("tgl_terbit", e.target.value)}
                                    className={inputBase}
                                />
                                {errors.tgl_terbit && (
                                    <p className="text-red-500 text-sm">{errors.tgl_terbit}</p>
                                )}
                            </div>

                            <div>
                                <label className="font-medium text-gray-700">Instansi Penerbit</label>
                                <input
                                    type="text"
                                    value={data.instansi_penerbit}
                                    onChange={(e) =>
                                        setData("instansi_penerbit", e.target.value)
                                    }
                                    className={inputBase}
                                />
                            </div>
                        </div>
                    </section>

                    {/* =================== DUKCAPIL =================== */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-700 mb-5 border-l-4 border-green-500 pl-3">
                            Informasi Dukcapil
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="font-medium text-gray-700">Kab/Kota Penerbit</label>
                                <input
                                    type="text"
                                    value={data.kabupaten_kota_penerbit}
                                    onChange={(e) =>
                                        setData("kabupaten_kota_penerbit", e.target.value)
                                    }
                                    className={inputBase}
                                />
                            </div>

                            <div>
                                <label className="font-medium text-gray-700">Nama Kepala Dukcapil</label>
                                <input
                                    type="text"
                                    value={data.nama_kepala_dukcapil}
                                    onChange={(e) =>
                                        setData("nama_kepala_dukcapil", e.target.value)
                                    }
                                    className={inputBase}
                                />
                            </div>

                            <div>
                                <label className="font-medium text-gray-700">NIP Kepala Dukcapil</label>
                                <input
                                    type="text"
                                    value={data.nip_kepala_dukcapil}
                                    onChange={(e) =>
                                        setData("nip_kepala_dukcapil", e.target.value)
                                    }
                                    className={inputBase}
                                />
                            </div>
                        </div>
                    </section>

                    {/* =================== ACTION BUTTONS =================== */}
                    <div className="flex justify-end gap-4 pt-8 border-t-2 border-gray-200 mt-8">
                        <button
                            type="submit"
                            className="btn btn-success text-white px-6 py-2 rounded-lg shadow-sm"
                            disabled={processing}
                        >
                            {processing ? "Menyimpan..." : isEdit ? "Perbarui" : "Simpan"}
                        </button>

                        <button
                            type="button"
                            onClick={() => router.visit(route(`${baseRoute}.index`))}
                            className="btn btn-secondary px-6 py-2 rounded-lg shadow-sm"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
