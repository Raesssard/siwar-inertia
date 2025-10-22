import React from "react";
import { useForm, usePage } from "@inertiajs/react";
import Layout from "@/Layouts/Layout";

export default function Settings() {
    const { auth } = usePage().props;
    const user = auth.user;
    const role = auth.currentRole;
    console.log("Current Role:", role);

    const { data, setData, put, processing, errors } = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("settings.update-password"));
    };

    return (
        <Layout title="Pengaturan Akun">
            <div className="col-12 col-md-10 col-lg-8 mx-auto py-5">
                <div className="bg-white shadow rounded-lg p-4">
                    <h3 className="mb-4 fw-bold text-center">
                        <i className="fas fa-cog me-2 text-primary"></i> Pengaturan Akun
                    </h3>

                    <div className="border-bottom mb-4"></div>

                    <div className="mb-4">
                        <h5 className="fw-semibold mb-2 text-gray-800">
                            Informasi Akun
                        </h5>
                        <div className="mb-1">
                            <strong>Nama:</strong> {user.nama}
                        </div>
                        <div className="mb-1">
                            <strong>NIK:</strong> {user.nik}
                        </div>
                        {user.nomor_rw && (
                            <div className="mb-1">
                                <strong>Nomor RW:</strong> {user.nomor_rw}
                            </div>
                        )}
                        {user.id_rt && (
                            <div className="mb-1">
                                <strong>ID RT:</strong> {user.id_rt}
                            </div>
                        )}
                    </div>

                    <div className="border-bottom mb-4"></div>

                    <h5 className="fw-semibold mb-3 text-gray-800">
                        <i className="fas fa-key text-primary me-2"></i> Ubah Password
                    </h5>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="current_password" className="form-label">
                                <i className="fas fa-lock me-2"></i> Password Lama
                            </label>
                            <input
                                type="password"
                                name="current_password"
                                id="current_password"
                                className="form-control"
                                placeholder="Password Lama"
                                value={data.current_password}
                                onChange={(e) => setData("current_password", e.target.value)}
                                required
                            />
                            {errors.current_password && (
                                <div className="text-danger small mt-1">
                                    {errors.current_password}
                                </div>
                            )}
                        </div>

                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">
                                <i className="fas fa-lock me-2"></i> Password Baru
                            </label>
                            <input
                                type="password"
                                name="password"
                                id="password"
                                className="form-control"
                                placeholder="Password Baru"
                                value={data.password}
                                onChange={(e) => setData("password", e.target.value)}
                                required
                                minLength={8}
                            />
                            {errors.password && (
                                <div className="text-danger small mt-1">
                                    {errors.password}
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="password_confirmation" className="form-label">
                                <i className="fas fa-lock me-2"></i> Konfirmasi Password
                            </label>
                            <input
                                type="password"
                                name="password_confirmation"
                                id="password_confirmation"
                                className="form-control"
                                placeholder="Konfirmasi Password Baru"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData("password_confirmation", e.target.value)
                                }
                                required
                            />
                            {errors.password_confirmation && (
                                <div className="text-danger small mt-1">
                                    {errors.password_confirmation}
                                </div>
                            )}
                        </div>

                        <div className="d-flex justify-content-end gap-2">
                            <button
                                type="button"
                                onClick={() => window.history.back()}
                                className="btn btn-secondary px-4"
                            >
                                <i className="fas fa-arrow-left me-1"></i> Batal
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="btn btn-primary px-4"
                            >
                                <i className="fas fa-save me-1"></i> Simpan Perubahan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
