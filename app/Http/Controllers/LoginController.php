<?php

namespace App\Http\Controllers;

use App\Models\Warga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class LoginController extends Controller
{
    public function showLoginForm()
    {
        return Inertia::render('Login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'nik' => 'required',
            'password' => 'required',
        ]);

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();
            $user = Auth::user();

            // Kalau hanya punya 1 role → langsung ke dashboard
            if ($user->roles->count() === 1) {
                $role = $user->roles->first()->name;
                session(['active_role' => $role]);
                return $this->redirectByRole($role, $user);
            }

            // Kalau punya banyak role → pilih role dulu
            return Inertia::location(route('choose-role'));
        }

        // Jika gagal login
        return back()->withErrors([
            'nik' => 'NIK atau password salah.',
            'password' => 'NIK atau password salah.',
        ]);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/login');
    }

    private function redirectByRole(string $role, $user)
    {
        // Khusus warga cek apakah Kepala Keluarga
        if ($role === 'warga') {
            $warga = $user->warga;
            if (!$warga || strtolower($warga->status_hubungan_dalam_keluarga) !== 'kepala keluarga') {
                Auth::logout();
                return redirect('/login')->withErrors([
                    'nik' => 'Hanya Kepala Keluarga yang bisa login.',
                ]);
            }
            return Inertia::location(route('dashboard'));
        }

        // Semua role diarahkan ke Dashboard.jsx
        return Inertia::location(route('dashboard'));
    }

    // Halaman pilih role
    public function chooseRole()
    {
        /** @var User $user */
        $user = Auth::user();
        $roles = $user->getRoleNames();
        return Inertia::render('ChooseRole', compact('user', 'roles'));
    }

    // Simpan role yang dipilih
    public function setRole(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();
        $role = $request->input('role');

        if (!$user->hasRole($role)) {
            return redirect()->route('choose-role')->with('error', 'Role tidak valid.');
        }

        session(['active_role' => $role]);

        return $this->redirectByRole($role, $user);
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password' => 'required|confirmed|min:6',
        ], [
            'current_password.required' => 'Password lama harus diisi.',
            'password.required' => 'Password baru harus diisi.',
            'password.confirmed' => 'Password baru tidak cocok.',
            'password.min' => 'Password minimal 6 karakter.',
        ]);

        $user = Auth::user();

        // Ensure $user is an instance of User model
        if (!$user instanceof \App\Models\User) {
            // Ini lebih baik ditangani di middleware atau guardian
            return back()->withErrors(['user' => 'User instance not found.'])->withInput();
        }

        // Cek apakah password lama cocok
        if (!Hash::check($request->current_password, $user->password)) {
            // Jika password lama tidak cocok, kembali dengan error dan input lama
            return back()->withErrors(['current_password' => 'Password lama tidak cocok.'])->withInput();
        }

        // Hash password baru sebelum disimpan
        $user->password = bcrypt($request->password);
        $user->save();

        // Jika berhasil, kembali dengan pesan sukses
        return back()->with('success', 'Password berhasil diperbarui!');
    }
}
