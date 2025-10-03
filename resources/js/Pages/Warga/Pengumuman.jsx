import React, { useState, useEffect, useRef } from "react"
import Layout from "@/Layouts/Layout"
import { Head, Link, usePage, useForm } from "@inertiajs/react"
import { DetailPengumuman } from "../Component/Modal"
import { FilterPengumuman } from "../Component/Filter"
import Masonry from "react-masonry-css"
import FileDisplay from "../Component/FileDisplay"

export default function Pengumuman() {
    const {
        title,
        pengumuman,
        list_bulan,
        daftar_tahun,
        daftar_kategori,
        total_pengumuman,
        total_pengumuman_filtered,
    } = usePage().props
    const [selected, setSelected] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const cardBodyRef = useRef(null)
    const [showButton, setShowButton] = useState(false)
    const { props } = usePage()
    const { get, data, setData } = useForm({
        search: '',
        tahun: '',
        bulan: '',
        kategori: '',
        level: ''
    })

    const role = props.auth?.currentRole
    const user = props.auth?.user

    const modalDetail = (item) => {
        setSelected(item)
        setShowModal(true)
    }

    const scrollToTop = () => {
        if (cardBodyRef.current) {
            cardBodyRef.current.scrollTo({
                top: 0,
                behavior: "smooth"
            })
        }
    }
    useEffect(() => {
        const handleScroll = () => {
            if (cardBodyRef.current) {
                const scrollTop = cardBodyRef.current.scrollTop
                setShowButton(scrollTop > 50)
            }
        }

        const cardBody = cardBodyRef.current
        if (cardBody) {
            cardBody.addEventListener("scroll", handleScroll)
        }

        return () => {
            if (cardBody) {
                cardBody.removeEventListener("scroll", handleScroll)
            }
        }
    }, [])

    const breakpointColumnsObj = {
        default: 5,
        1100: 4,
        700: 3,
        500: 2
    }

    const imgStyle = {
        width: "100%",
        height: "100%",
        maxWidth: "350px",
        objectFit: "cover",
        marginBottom: "10px",
        borderRadius: "8px 8px 0 0",
        display: "block",
    }

    const filter = (e) => {
        e.preventDefault()
        get('/warga/pengumuman', { preserveState: true, preserveScroll: true })
    }

    const resetFilter = () => {
        setData({
            search: '',
            tahun: '',
            bulan: '',
            kategori: '',
            level: ''
        })
    }

    return (
        <Layout>
            <Head title={`${title} ${role.length <= 2
                ? role.toUpperCase()
                : role.charAt(0).toUpperCase() + role.slice(1)}`} />
            <FilterPengumuman
                data={data}
                setData={setData}
                daftar_tahun={daftar_tahun}
                list_bulan={list_bulan}
                daftar_kategori={daftar_kategori}
                filter={filter}
                resetFilter={resetFilter}
            />
            <div className="d-flex justify-content-between align-items-center mb-3 mx-4 w-100">
                <div className="d-flex align-items-center gap-1">
                    <i className="fas fa-bullhorn me-2 text-primary"></i>
                    <span className="fw-semibold text-dark">
                        {total_pengumuman ?? 0} Pengumuman
                    </span>
                </div>

                <div className="text-muted">
                    Menampilkan {total_pengumuman_filtered} dari total {total_pengumuman} data
                </div>
            </div>
            <div className="col-12">
                <div ref={cardBodyRef} className="card-body pengumuman">

                    {pengumuman.length ? (
                        <>
                            <Masonry
                                breakpointCols={breakpointColumnsObj}
                                className="flex gap-4"
                                columnClassName="space-y-4"
                            >
                                {pengumuman.map((item, index) => (
                                    <div key={index} className="card-clickable" onClick={() => modalDetail(item)}>
                                        <FileDisplay
                                            filePath={`/storage/${item.dokumen_path}`}
                                            judul={item.dokumen_name}
                                            displayStyle={imgStyle} />
                                        <h2 className="font-semibold text-lg mb-2 text-left mx-3">{item.judul}</h2>
                                        <div className="text-sm text-gray-500 mb-2 mx-3 flex justify-between">
                                            <span><i className="fas fa-user mr-1"></i>{item.rukun_tetangga ? item.rukun_tetangga.nama : item.rw.nama_ketua_rw}</span>
                                            <span><i className="fas fa-clock mr-1"></i>{new Date(item.created_at).toLocaleDateString("id-ID", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}</span>
                                        </div>
                                        <div className="text-sm text-gray-500 mb-2 mx-3 flex justify-between">
                                            <span><i className="fas fa-users mr-1"></i>{item.rukun_tetangga ? `RT ${item.rukun_tetangga.rt}/ RW ${item.rw.nomor_rw}` : ""}</span>
                                        </div>
                                        <p className="isi-pengumuman text-gray-700 text-sm mb-3 mx-3 line-clamp-3">
                                            {item.isi.length > 100 ? item.isi.slice(0, 100) + "..." : item.isi}
                                        </p>
                                    </div>
                                ))}
                            </Masonry>
                            {showButton && (
                                <button
                                    onClick={scrollToTop}
                                    className={`btn btn-primary scroll-top-btn ${showButton ? "show" : ""}`}
                                >
                                    <i className="fas fa-arrow-up"></i>
                                </button>
                            )}
                        </>
                    ) : (
                        <span className="d-block w-100 text-muted text-center">Tidak ada Pengumuman</span>
                    )}
                </div>
                <DetailPengumuman
                    selectedData={selected}
                    detailShow={showModal}
                    onClose={() => setShowModal(false)}
                />
            </div>
        </Layout>
    )
}