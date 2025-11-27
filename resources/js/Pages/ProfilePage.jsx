import React from "react";
import { useForm, Head } from "@inertiajs/react";
import Layout from "@/Layouts/Layout";

export default function ProfilePage({ user, rt, rw, kk }) {

    const { data, setData, post, processing, errors } = useForm({
        nama: user.nama,
        foto_profil: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("profile.updatePhoto"), {
            forceFormData: true,
        });
    };

    return (
        <Layout title="Profil Pengguna">
            <Head title="Profil" />

            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow">
                <h2 className="text-2xl font-bold mb-6">Profil Pengguna</h2>

                <div className="flex gap-10">

                    {/* FOTO PROFIL */}
                    <div>
                        <img
                            src={
                                user.foto_profil
                                    ? `/storage/${user.foto_profil}`
                                    : "/default-profile.png"
                            }
                            alt="Foto Profil"
                            className="w-40 h-40 rounded-full object-cover border"
                        />

                        <input
                            type="file"
                            accept="image/*"
                            className="mt-4"
                            onChange={(e) =>
                                setData("foto_profil", e.target.files[0])
                            }
                        />

                        {errors.foto_profil && (
                            <p className="text-red-500 text-sm">
                                {errors.foto_profil}
                            </p>
                        )}
                    </div>

                    {/* FORM */}
                    <form onSubmit={handleSubmit} className="flex-1 space-y-4">

                        {/* NAMA */}
                        <div>
                            <label className="font-medium">Nama Lengkap</label>
                            <input
                                type="text"
                                value={data.nama}
                                className="w-full border rounded p-2"
                                disabled
                            />
                            {errors.nama && (
                                <p className="text-red-500 text-sm">
                                    {errors.nama}
                                </p>
                            )}
                        </div>

                        {/* INFO USER */}
                        <div className="p-4 bg-gray-100 rounded">
                            <h3 className="font-semibold mb-2">Informasi User</h3>

                            <p>
                                <strong>NIK:</strong> {user.nik}
                            </p>
                            <p>
                                <strong>No KK:</strong> {kk?.no_kk ?? "-"}
                            </p>
                            <p>
                                <strong>RT:</strong> {rt ? rt.nomor_rt : "-"}
                            </p>
                            <p>
                                <strong>RW:</strong> {rw ? rw.nomor_rw : "-"}
                            </p>
                        </div>

                        {/* BUTTON */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-green-600 text-white px-5 py-2 rounded"
                        >
                            Simpan Perubahan
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
