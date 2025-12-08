<?php

namespace App\Http\Controllers;

use App\Models\Kartu_keluarga;
use App\Models\Rt;
use App\Models\Rw;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
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
            'settings' => $settings, 
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

        if (!Hash::check($request->current_password, $user->password)) {
            return back()->withErrors(['current_password' => 'Password lama tidak cocok.']);
        }

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

        $rt = Rt::find($user->id_rt);
        $rw = Rw::find($user->id_rw);

        $kk = Kartu_keluarga::whereHas('warga', function ($q) use ($user) {
            $q->where('nik', $user->nik);
        })
            ->first();

        return inertia('ProfilePage', [
            'user' => $user,
            'rt' => $rt,        
            'rw' => $rw,        
            'kk' => $kk,        
        ]);
    }

    public function updatePhoto(Request $request)
    {
        try {
            /** @var User $user */
            $user = Auth::user();

            $request->validate([
                'foto_profil' => 'required|file|mimes:jpeg,png,jpg|max:2048',
            ]);

            $file = $request->file('foto_profil');

            $fileName = time() . '_' .
                Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) .
                '.' . $file->getClientOriginalExtension();

            if ($user->foto_profil) {
                Storage::disk('public')->delete($user->foto_profil);
            }

            $path = $file->storeAs('profil', $fileName, 'public');

            $user->update([
                'foto_profil' => $path
            ]);

            return redirect()
                ->route('profile')
                ->with('success', 'Foto profil berhasil diperbarui.');
        } catch (\Exception $e) {
            Log::error('Upload Foto Profil Error: ' . $e->getMessage());
            return back()->withErrors(['foto_profil' => 'Upload gagal.']);
        }
    }

    public function deletePhoto()
    {
        try {
            /** @var User $user */
            $user = Auth::user();

            if ($user->foto_profil) {
                Storage::disk('public')->delete($user->foto_profil);
            }

            $user->update([
                'foto_profil' => null
            ]);

            return redirect()
                ->route('profile')
                ->with('success', 'Foto profil berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('Hapus Foto Profil Error: ' . $e->getMessage());
            return back()->withErrors(['foto_profil' => 'Gagal menghapus foto.']);
        }
    }
}
