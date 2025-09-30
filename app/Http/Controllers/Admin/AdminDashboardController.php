<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Rt;
use App\Models\Rw;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    //
    public function index()
    {
        $title = 'Dashboard';
        $jumlah_rt = Rt::count();
        $jumlah_rw = Rw::count();
        return Inertia::render('admin.dashboard.dashboard',compact('title','jumlah_rt','jumlah_rw'));
    }
}
