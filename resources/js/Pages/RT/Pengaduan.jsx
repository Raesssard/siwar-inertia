import Layout from "@/Layouts/Layout"
import { Head, useForm, usePage } from "@inertiajs/react";
import React, { useEffect, useRef, useState } from "react";
import { FilterPengaduan } from "../Component/Filter";
import Masonry from "react-masonry-css";
import FileDisplay from "../Component/FileDisplay"
import { FormatWaktu } from "../Warga/Pengaduan";
import { DetailPengaduan } from "../Component/Modal";

export default function Pengaduan() {
    const {
        title,
        rt_pengaduan: pengaduanFromServer,
        total_pengaduan_rt,
        total_pengaduan_rt_filtered,
        list_bulan,
        list_tahun,
        list_level,
    } = usePage().props
    const { props } = usePage()
    const role = props.auth?.currentRole
    const user = props.auth?.user
    const [selected, setSelected] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [pengaduanList, setPengaduanList] = useState(pengaduanFromServer)
    const [total, setTotal] = useState(total_pengaduan_rt)
    const [totalFiltered, setTotalFiltered] = useState(total_pengaduan_rt_filtered)
    const cardBodyRef = useRef(null)
    const [showButton, setShowButton] = useState(false)
    const { get, data, setData } = useForm({
        search: '',
        tahun: '',
        bulan: '',
        kategori: ''
    })

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
        setTotal(total_pengaduan_rt)
        setTotalFiltered(total_pengaduan_rt_filtered)
        setPengaduanList(pengaduanFromServer)
    }, [total_pengaduan_rt, total_pengaduan_rt_filtered , pengaduanFromServer])

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
        get(`/${role}/pengaduan`, { preserveState: true, preserveScroll: true })
    }

    const resetFilter = () => {
        setData({
            search: '',
            tahun: '',
            bulan: '',
            kategori: ''
        })
    }

    return (
        <Layout>
            <Head title={`${title} ${role.length <= 2
                ? role.toUpperCase()
                : role.charAt(0).toUpperCase() + role.slice(1)}`} />
            <FilterPengaduan
                data={data}
                setData={setData}
                list_tahun={list_tahun}
                list_bulan={list_bulan}
                list_level={list_level}
                filter={filter}
                resetFilter={resetFilter}
                role={role}
            />
            <div className="d-flex justify-content-between align-items-center mb-3 mx-4 w-100">
                <div className="d-flex align-items-center gap-1">
                    <i className="fas fa-paper-plane me-2 text-primary"></i>
                    <span className="fw-semibold text-dark">
                        {totalFiltered ?? 0} Pengaduan
                    </span>
                </div>

                <div className="text-muted">
                    Menampilkan {totalFiltered} dari total {total} data
                </div>
            </div>
            <div className="col-12">
                <div ref={cardBodyRef} className="card-body pengaduan">
                    {pengaduanList.length ? (
                        <>
                            <Masonry
                                breakpointCols={breakpointColumnsObj}
                                className="flex gap-4"
                                columnClassName="space-y-4"
                            >
                                {pengaduanList.map((item, index) => (
                                    <div key={index} className="card-clickable d-flex justify-content-center align-items-center flex-column" onClick={() => modalDetail(item)}>
                                        <FileDisplay
                                            filePath={`/storage/${item.file_path}`}
                                            judul={item.file_name}
                                            displayStyle={imgStyle} />
                                        <h2 className="font-semibold text-lg mb-2 text-left mx-3">{item.judul}</h2>
                                        <div className="text-sm text-gray-500 mb-2 d-flex gap-3">
                                            <span><i className="fas fa-user mr-1"></i>{item.warga.nama}</span>
                                            <span><i className="fas fa-clock mr-1"></i><FormatWaktu createdAt={item.created_at} /></span>
                                        </div>
                                        {item.nik_warga !== user.nik ? (
                                            <div className="text-sm text-gray-500 mb-2 d-flex gap-3">
                                                <span><i className="fas fa-users mr-1"></i>RT {item.warga?.kartu_keluarga?.rukun_tetangga?.rt}/RW {item.warga?.kartu_keluarga?.rw?.nomor_rw}</span>
                                            </div>
                                        ) : ""
                                        }
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
                        <span className="d-block w-100 text-muted text-center">Tidak ada pengaduan</span>
                    )}
                </div>
                <DetailPengaduan
                    selectedData={selected}
                    detailShow={showModal}
                    onClose={() => setShowModal(false)}
                    onUpdated={(updated) => {
                        setSelected(updated)
                        setPengaduanList(prev =>
                            prev.map(item =>
                                item.id === updated.id ? updated : item
                            )
                        )
                    }}
                    onDeleted={(deletedId) => {
                        setPengaduanList(prev => prev.filter(item => item.id !== deletedId))
                        setTotal(prev => prev - 1)
                        setTotalFiltered(prev => prev - 1)
                        setShowModal(false)
                    }}
                    userData={user}
                    role={role}
                />
            </div>
        </Layout>
    )
}