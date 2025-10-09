import React, { useState, useEffect, useRef } from "react"
import Layout from "@/Layouts/Layout"
import { Head, Link, usePage, useForm } from "@inertiajs/react"
import { DetailPengumuman, TambahPengumuman } from "../Component/Modal"
import { FilterPengumuman } from "../Component/Filter"
import Masonry from "react-masonry-css"
import FileDisplay from "../Component/FileDisplay"
import { FormatWaktu } from "../Warga/Pengaduan"

export default function Pengumuman() {
    const {
        title,
        pengumuman: pengumumanFromServer,
        list_bulan,
        daftar_tahun,
        daftar_kategori,
        total_pengumuman,
        total_pengumuman_filtered,
    } = usePage().props
    const [selected, setSelected] = useState(null)
    const [showModalDetail, setShowModalDetail] = useState(false)
    const [showModalTambah, setShowModalTambah] = useState(false)
    const cardBodyRef = useRef(null)
    const [showButton, setShowButton] = useState(false)
    const [pengumumanList, setPengumumanList] = useState(pengumumanFromServer)
    const { props } = usePage()
    const [total, setTotal] = useState(total_pengumuman)
    const [totalFiltered, setTotalFiltered] = useState(total_pengumuman_filtered)
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
        setShowModalDetail(true)
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
        setTotal(total_pengumuman)
        setTotalFiltered(total_pengumuman_filtered)
    }, [total_pengumuman, total_pengumuman_filtered])

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
        get(`/${role}/pengumuman`, { preserveState: true, preserveScroll: true })
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
                tambahShow={() => setShowModalTambah(true)}
                role={role}
            />
            <div className="d-flex justify-content-between align-items-center mb-3 mx-4 w-100">
                <div className="d-flex align-items-center gap-1">
                    <i className="fas fa-bullhorn me-2 text-primary"></i>
                    <span className="fw-semibold text-dark">
                        {totalFiltered ?? 0} Pengumuman
                    </span>
                </div>

                <div className="text-muted">
                    Menampilkan {totalFiltered} dari total {total} data
                </div>
            </div>
            <div className="col-12">
                <div ref={cardBodyRef} className="card-body pengumuman">

                    {pengumumanList.length ? (
                        <>
                            <Masonry
                                breakpointCols={breakpointColumnsObj}
                                className="flex gap-4"
                                columnClassName="space-y-4"
                            >
                                {pengumumanList.map((item, index) => (
                                    <div key={index} className="card-clickable d-flex justify-content-center align-items-center flex-column" onClick={() => modalDetail(item)}>
                                        <FileDisplay
                                            filePath={`/storage/${item.dokumen_path}`}
                                            judul={item.dokumen_name}
                                            displayStyle={imgStyle} />
                                        <h2 className="font-semibold text-lg mb-2 text-left mx-3">{item.judul}</h2>
                                        <div className="text-sm text-gray-500 mb-2 d-flex gap-3">
                                            <span><i className="fas fa-user mr-1"></i>{item.rukun_tetangga ? item.rukun_tetangga?.nama_ketua_rt : item.rw?.nama_ketua_rw}</span>
                                            <span><i className="fas fa-clock mr-1"></i><FormatWaktu createdAt={item.created_at} /></span>
                                        </div>
                                        <div className="text-sm text-gray-500 mb-2 mx-3 flex justify-between">
                                            <span><i className="fas fa-users mr-1"></i>{item.rukun_tetangga ? `RT ${item.rukun_tetangga.nomor_rt}/ RW ${item.rw.nomor_rw}` : ""}</span>
                                        </div>
                                        <p className="isi-pengaduan text-gray-700 text-sm mb-3 mx-3 line-clamp-3">
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
                    detailShow={showModalDetail}
                    onClose={() => setShowModalDetail(false)}
                    onUpdated={(updated) => {
                        setSelected(updated)
                        setPengumumanList(prev =>
                            prev.map(item =>
                                item.id === updated.id ? updated : item
                            )
                        )
                    }}
                    onDeleted={(deletedId) => {
                        setPengumumanList(prev => prev.filter(item => item.id !== deletedId))
                        setTotal(prev => prev - 1)
                        setTotalFiltered(prev => prev - 1)
                        setShowModalDetail(false)
                    }}
                    userData={user}
                    role={role}
                />
                <TambahPengumuman
                    tambahShow={showModalTambah}
                    onClose={() => setShowModalTambah(false)}
                    onAdded={(newPengumuman) => {
                        setPengumumanList(prev => [newPengumuman, ...prev])
                        setTotal(prev => prev + 1)
                        setTotalFiltered(prev => prev + 1)
                        setSelected(newPengumuman)
                        setShowModalDetail(true)
                    }}
                    role={role}
                />
            </div>
        </Layout>
    )
}