<?php

namespace App\Http\Controllers;

use App\Models\Warga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
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

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();
            $user = Auth::user();

            $validRoles = ['admin', 'rw', 'rt', 'warga'];

            $accountRoles = $user->roles->filter(
                fn($r) => in_array($r->name, $validRoles)
            )->values();

            session()->put(
                'need_cookie_confirmation',
                !$request->boolean('remember')
            );


            if ($accountRoles->count() === 1) {
                Log::info('User ' . $user->nik . ' logged in with role ' . $user->roles->first()->name);
                $role = $accountRoles->first()->name;
                session(['active_role' => $role]);
                return $this->redirectByRole($role, $user);
            }

            if ($request->wantsJson()) {
                return response()->json([
                    'choose_role' => true,
                    'roles' => $accountRoles->pluck('name'),
                ]);
            }

            return Inertia::location(route('choose-role'));
        }

        if ($request->expectsJson()) {
            return response()->json(['error' => 'NIK atau password salah.'], 401);
        }

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
        return redirect('/login')->withoutCookie('remember_web');
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
            return response()->json([
                'redirect' => route('dashboard')
            ]);
        }

        return response()->json([
            'redirect' => route('dashboard')
        ]);
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
            return response()->json(['error' => 'Role tidak valid.'], 400);
        }

        session(['active_role' => $role]);

        $user->last_role = $role;
        $user->save();

        // session()->flash('need_cookie_confirmation', true);

        return response()->json(['success' => true]);
    }

    public function requestCookie(Request $request)
    {
        /** @var User $user */
        $user = Auth::user(); // ambil user yang sedang login

        if (!$user) {
            return response()->json(['error' => 'User tidak ditemukan'], 401);
        }

        // Buat token random
        $token = Str::random(60);

        // Simpan di database
        $user->remember_token = $token;
        $user->save();

        // Buat cookie, expire misal 5 tahun
        $cookie = cookie('remember_web', $token, 60 * 24 * 365 * 5);

        return response()->json([
            'message' => 'Remember token set'
        ])->cookie($cookie);
    }
}
