import React, { useState } from "react"
import Layout from "@/Layouts/Layout"
import { Head, usePage } from "@inertiajs/react"
import '../../../css/kartu-keluarga.css'
import { formatTanggal, useIsMobile } from "../Component/GetPropRole"

export default function KartuKeluarga() {
    const { title, kartuKeluarga } = usePage().props
    const { props } = usePage()
    const role = props.auth?.currentRole
    const [viewDoc, setViewDoc] = useState(null)

    if (!kartuKeluarga) {
        return (
            <Layout>
                <div className="alert alert-info text-center" role="alert">
                    Data Kartu Keluarga Anda belum tersedia. Silakan hubungi RT/RW Anda.
                </div>
            </Layout>
        )
    }

    const mobile = useIsMobile();

    return (
        <Layout>
            <Head
                title={`${title} - ${role.length <= 2
                    ? role.toUpperCase()
                    : role.replace(/\b\w/g, (char) => char.toUpperCase())
                    }`}
            />
            <div className="card shadow border-0 mb-3 py-0 mx-3" style={{ width: '100%' }}>
                <div className="card-header bg-success text-white py-2">
                    <h6 className="m-0 font-weight-bold text-white small">
                        Informasi Kartu Keluarga & Anggota
                    </h6>
                </div>

                <div className="card-body p-3">
                    <div className="kk-container p-4 border rounded shadow-sm">
                        <div className="kk-header text-center mb-4">
                            <div className="kk-header-top-line d-flex justify-content-between align-items-center">
                                <div className="kk-header-right-reg text-end flex-grow-1">
                                    {kartuKeluarga.no_registrasi && (
                                        <p className={`${mobile ? 'mb-0' : 'mb-2'} small`}>No. Registrasi:
                                            <strong>{kartuKeluarga.no_registrasi}</strong>
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="kk-header-main-title">
                                <h4 className="fw-bold text-success mb-1 text-center">KARTU KELUARGA</h4>
                                <p className="no-kk-big lead fw-bold text-primary">No. KK:
                                    <span>{kartuKeluarga.no_kk}</span>
                                </p>
                            </div>
                        </div>

                        <div className="kk-info-grid col g-3 mb-4 small">
                            <div className="kk-info-item">
                                <p className="mb-1 text-start">
                                    <strong>Kepala Keluarga</strong> :{" "}
                                    {kartuKeluarga.kepala_keluarga.nama ?? '-'}
                                </p>
                                <p className="mb-1 text-start">
                                    <strong>Alamat</strong> :{" "}
                                    {kartuKeluarga.alamat ?? '-'}
                                </p>
                                <p className="mb-1 text-start">
                                    <strong>Desa/Kelurahan</strong> :{" "}
                                    {kartuKeluarga.kelurahan ?? '-'}
                                </p>
                                <p className="mb-1 text-start">
                                    <strong>Kecamatan</strong> :{" "}
                                    {kartuKeluarga.kecamatan ?? '-'}
                                </p>
                                <p className="mb-1 text-start">
                                    <strong>RT/RW</strong> :{" "}
                                    {kartuKeluarga.rukun_tetangga.nomor_rt ?? '-'}/{kartuKeluarga.rw.nomor_rw ?? '-'}
                                </p>
                            </div>
                            <div className="kk-info-item">
                                <p className="mb-1 text-start">
                                    <strong>Kabupaten/Kota</strong> :{" "}
                                    {kartuKeluarga.kabupaten ?? '-'}
                                </p>
                                <p className="mb-1 text-start">
                                    <strong>Kode Pos</strong> :{" "}
                                    {kartuKeluarga.kode_pos ?? '-'}
                                </p>
                                <p className="mb-1 text-start">
                                    <strong>Provinsi</strong> :{" "}
                                    {kartuKeluarga.provinsi ?? '-'}
                                </p>
                            </div>
                        </div>

                        <hr className="my-4" style={{ borderTop: "2px solid #e0e0e0" }} />

                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="text-dark fw-bold mb-0">DAFTAR ANGGOTA KELUARGA</h6>
                        </div>

                        <div className="table-scroll-container mb-4">
                            <div className="table-responsive">
                                <table className="table table-bordered table-sm align-middle kk-table table-striped">
                                    <thead className="text-center table-success sticky-top">
                                        <tr>
                                            <th rowSpan="2">No.</th>
                                            <th rowSpan="2">Nama Lengkap</th>
                                            <th rowSpan="2">NIK</th>
                                            <th rowSpan="2">Jenis Kelamin</th>
                                            <th colSpan="2">Tempat, Tanggal Lahir</th>
                                            <th rowSpan="2">Agama</th>
                                            <th rowSpan="2">Pendidikan</th>
                                            <th rowSpan="2">Jenis Pekerjaan</th>
                                            <th rowSpan="2">Golongan Darah</th>
                                            <th rowSpan="2">Status Perkawinan</th>
                                            <th rowSpan="2">Status Hubungan Dlm Keluarga</th>
                                            <th rowSpan="2">Kewarganegaraan</th>
                                            <th colSpan="2">Dokumen Imigrasi</th>
                                            <th colSpan="2">Nama Orang Tua</th>
                                            <th rowSpan="2">Status Warga</th>
                                        </tr>
                                        <tr>
                                            <th>Tempat Lahir</th>
                                            <th>Tanggal Lahir</th>
                                            <th>No. Paspor</th>
                                            <th>No. KITAS/KITAP</th>
                                            <th>Nama Ayah</th>
                                            <th>Nama Ibu</th>
                                        </tr>
                                    </thead>
                                    <tbody className="small">
                                        {kartuKeluarga?.warga && kartuKeluarga.warga.length > 0 ? (
                                            kartuKeluarga.warga
                                                .sort((a, b) => {
                                                    const getRank = (hubungan) => {
                                                        if (hubungan === "kepala keluarga") return 2
                                                        if (hubungan === "istri") return 1
                                                        return 0
                                                    }
                                                    return getRank(b.status_hubungan_dalam_keluarga) - getRank(a.status_hubungan_dalam_keluarga)
                                                })
                                                .map((data, index) => (
                                                    <tr key={index}>
                                                        <td className="text-center">
                                                            {index + 1}
                                                        </td>
                                                        <td className="text-center">
                                                            {data.nama ?? '-'}
                                                        </td>
                                                        <td className="text-center">
                                                            {data.nik ?? '-'}
                                                        </td>
                                                        <td className="text-center">
                                                            {data.jenis_kelamin ?? '-'}
                                                        </td>
                                                        <td className="text-center">
                                                            {data.tempat_lahir ?? '-'}
                                                        </td>
                                                        <td className="text-center">
                                                            {formatTanggal(data.tanggal_lahir)}
                                                        </td>
                                                        <td className="text-center">
                                                            {data.agama ?? '-'}
                                                        </td>
                                                        <td className="text-center">
                                                            {data.pendidikan ?? '-'}
                                                        </td>
                                                        <td className="text-center">
                                                            {data.pekerjaan ?? '-'}
                                                        </td>
                                                        <td className="text-center">
                                                            {data.golongan_darah ?? '-'}
                                                        </td>
                                                        <td className="text-center">
                                                            {data.status_perkawinan ?? '-'}
                                                        </td>
                                                        <td className="text-center">
                                                            {data.status_hubungan_dalam_keluarga ?? '-'}
                                                        </td>
                                                        <td className="text-center">
                                                            {data.kewarganegaraan ?? 'WNI'}
                                                        </td>
                                                        <td className="text-center">
                                                            {data.no_paspor ?? '-'}
                                                        </td>
                                                        <td className="text-center">
                                                            {`${data.no_kitas ?? '-'} / ${data.no_kitap ?? '-'}`}
                                                        </td>
                                                        <td className="text-center">
                                                            {data.nama_ayah ?? '-'}
                                                        </td>
                                                        <td className="text-center">
                                                            {data.nama_ibu ?? '-'}
                                                        </td>
                                                        <td className="text-center">
                                                            {data.status_warga ?? '-'}
                                                        </td>
                                                    </tr>
                                                ))
                                        ) : (
                                            <tr>
                                                <td colSpan="19" className="text-center text-muted p-4">
                                                    Tidak ada anggota keluarga yang terdaftar untuk Kartu Keluarga ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <hr className="my-4" style={{ borderTop: "2px dashed #a0a0a0" }} />

                        <div className="kk-footer row g-3">
                            <div className="col-12 col-md-6 d-flex flex-column align-items-center text-center">
                                <p className="mb-5">
                                    Mengetahui, <br />
                                    Kepala Keluarga
                                </p>
                                <p className="mb-0">
                                    <strong>{kartuKeluarga.kepala_keluarga.nama ?? '_____________________'}</strong>
                                </p>
                                <p style={{
                                    fontSize: "0.8rem",
                                    color: "#6c757d"
                                }}>(Tanda Tangan)</p>
                            </div>

                            <div className="col-12 col-md-6 d-flex flex-column align-items-center text-center">
                                <p className="mb-0">
                                    {kartuKeluarga.kabupaten ?? '___________'},
                                    {formatTanggal(kartuKeluarga.tgl_terbit)}
                                </p>
                                <p className="mb-5">
                                    {kartuKeluarga.instansi_penerbit ?? 'KEPALA DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL'}
                                </p>
                                <p className="mb-0">
                                    <strong>{kartuKeluarga.nama_kepala_dukcapil ?? '_____________________'}</strong>
                                </p>
                                <p>NIP.
                                    {kartuKeluarga.nip_kepala_dukcapil ?? '_____________________'}
                                </p>
                            </div>
                        </div>

                        <hr className="my-4" style={{ borderTop: "2px solid #e0e0e0" }} />

                        <div className="kk-document-section mt-4 border rounded p-3 bg-light">
                            <div className="kk-document-display text-center w-100" style={{ maxHeight: "100px" }}>
                                {kartuKeluarga?.foto_kk ? (
                                    (() => {
                                        const fileExtension = kartuKeluarga.foto_kk.split(".").pop().toLowerCase()
                                        const isPdf = fileExtension === 'pdf'
                                        const filePath = `/storage${kartuKeluarga.foto_kk}`

                                        return (
                                            <>
                                                <h6 className="fw-bold mb-0 small text-muted mr-4">Dokumen KK Terunggah:</h6>
                                                <div className="document-preview-wrapper text-center position-relative" style={{ height: "5rem" }}>
                                                    {isPdf ? (
                                                        <div
                                                            className="pdf-thumbnail-container d-block cursor-pointer p-0 h-100"
                                                            onClick={() =>
                                                                setViewDoc(
                                                                    `/storage/${kartuKeluarga.foto_kk}`
                                                                )
                                                            }
                                                            style={{ height: "5rem" }}
                                                        >
                                                            <i className="far fa-file-pdf mt-3"></i>
                                                            <p className="pdf-filename mt-2">Lihat Dokumen PDF</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <img
                                                                src={filePath}
                                                                alt={`Dokumen Kartu Keluarga ${kartuKeluarga.no_kk}`}
                                                                className="img-fluid rounded shadow-sm"
                                                                style={{ maxHeight: "500px", objectFit: "contain" }}
                                                            />
                                                            <div
                                                                className="view-document-overlay d-flex justify-content-center align-items-center position-absolute top-0 start-0 w-100 h-100"
                                                                style={{
                                                                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                                                                    color: "white",
                                                                    opacity: 0,
                                                                    transition: "opacity 0.3s",
                                                                    cursor: "pointer",
                                                                }}
                                                                onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                                                                onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
                                                                onClick={() => openDocumentModal(filePath, false)}
                                                            >
                                                                <i className="fas fa-eye me-2"></i> Lihat Dokumen
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </>
                                        )
                                    })()
                                ) : (
                                    <div className="text-muted p-3 border rounded bg-white">
                                        Tidak ada dokumen Kartu Keluarga yang terunggah.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {viewDoc && (
                <div
                    className="modal fade show"
                    style={{
                        display: "block",
                        backgroundColor: "rgba(0,0,0,0.8)",
                    }}
                    onClick={() => setViewDoc(null)}
                >
                    <div
                        className="modal-dialog modal-xl modal-dialog-centered"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content bg-dark border-0">
                            <div className="modal-body text-center">
                                {viewDoc.endsWith(".pdf") ? (
                                    <iframe
                                        src={viewDoc}
                                        style={{ width: "100%", height: "80vh" }}
                                    />
                                ) : (
                                    <img
                                        src={viewDoc}
                                        alt="Dokumen KK"
                                        style={{
                                            maxWidth: "100%",
                                            maxHeight: "80vh",
                                            borderRadius: "10px",
                                        }}
                                    />
                                )}
                            </div>
                            <div className="modal-footer border-0 justify-content-center">
                                <button
                                    className="btn btn-light"
                                    onClick={() => setViewDoc(null)}
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    )
}