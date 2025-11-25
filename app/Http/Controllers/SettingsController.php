<?php

namespace App\Http\Controllers;

use App\Models\Kartu_keluarga;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $settings = [
            'max_rt_per_rw' => Setting::getValue('max_rt_per_rw'),
        ];
        return Inertia::render('Settings', [
            'user' => $user,
            'settings' => $settings, // ⬅️ kirim ke frontend
        ]);
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password' => 'required|min:8|confirmed',
        ], [
            'current_password.required' => 'Password lama wajib diisi.',
            'password.required' => 'Password baru wajib diisi.',
            'password.min' => 'Password baru minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ]);

        $user = Auth::user();

        // Pastikan password lama benar
        if (!Hash::check($request->current_password, $user->password)) {
            return back()->withErrors(['current_password' => 'Password lama tidak cocok.']);
        }

        // Update password user
        $user->password = Hash::make($request->password);
        $user->save();

        return redirect()->route('settings')->with('success', 'Password berhasil diperbarui.');
    }

    public function updateSystem(Request $request)
    {
        $request->validate([
            'max_rt_per_rw' => 'required|integer|min:1',
        ], [
            'max_rt_per_rw.required' => 'Nilai maksimal RT per RW wajib diisi.',
            'max_rt_per_rw.integer' => 'Nilai harus berupa angka.',
            'max_rt_per_rw.min' => 'Minimal 1 RT per RW.',
        ]);

        Setting::setValue('max_rt_per_rw', $request->max_rt_per_rw, 'Batas maksimal jumlah RT per RW.');

        return redirect()->route('settings')->with('success', 'Pengaturan sistem berhasil diperbarui.');
    }

    public function profile()
    {
        $user = Auth::user();

        // Ambil data RT & RW
        $rt = $user->rt;
        $rw = $user->rw;

        // Ambil no_kk berdasarkan nik user
        $kk = Kartu_keluarga::where('id_rt', $user->id_rt)
            ->whereHas('warga', function ($q) use ($user) {
                $q->where('nik', $user->nik);
            })
            ->first();

        return Inertia::render('ProfilePage', [
            'user' => $user,
            'rt' => $rt,
            'rw' => $rw,
            'kk' => $kk,
        ]);
    }

    public function updatePhoto(Request $request)
    {
        $request->validate([
            'foto_profil' => 'required|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $user = Auth::user();

        // hapus foto lama
        if ($user->foto_profil && file_exists(public_path('uploads/profil/'.$user->foto_profil))) {
            unlink(public_path('uploads/profil/'.$user->foto_profil));
        }

        // simpan foto baru
        $file = $request->file('foto_profil');
        $filename = time().'_'.$file->getClientOriginalName();
        $file->move(public_path('uploads/profil/'), $filename);

        $user->foto_profil = $filename;
        $user->save();

        return back()->with('success', 'Foto profil berhasil diperbarui.');
    }
}
