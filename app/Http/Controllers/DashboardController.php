<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Rt;
use App\Models\Rw;
use App\Models\Kategori_golongan; // sesuaikan nama model jika beda
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Http\Controllers\Controller;

class DashboardController extends Controller
{
    public function index()
    {
        /** @var User $user */
        $user = Auth::user();

        // default props (safe)
        $data = [
            'title' => 'Dashboard',
            'jumlah_rt' => 0,
            'jumlah_rw' => 0,
            'jumlah_golongan' => 0,
            'jumlah_roles' => 0,
            'jumlah_permissions' => 0,
        ];

        // kalau admin, ambil statistik
        if ($user && $user->hasRole('admin')) {
            $data = [
                'title' => 'Dashboard',
                'jumlah_rt' => Rt::count(),
                'jumlah_rw' => Rw::count(),
                'jumlah_golongan' => Kategori_golongan::count(),
                'jumlah_roles' => Role::count(),
                'jumlah_permissions' => Permission::count(),
            ];
        }

        return Inertia::render('Dashboard', $data);
    }
}
