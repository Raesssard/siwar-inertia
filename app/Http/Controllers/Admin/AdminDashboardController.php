<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Rt;
use App\Models\Rw;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    // controller ini gk kepake, 
    // soalnya di DashboardController.php langsung render Inertia, 
    // gk ada acara mampir ke controller ini 🗿
    public function index()
    {
        $title = 'Dashboard';
        $jumlah_rt = Rt::count();
        $jumlah_rw = Rw::count();
        return Inertia::render('admin.dashboard.dashboard', compact('title', 'jumlah_rt', 'jumlah_rw'));
    }
}
