<?php

namespace App\Http\Controllers;

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
}
