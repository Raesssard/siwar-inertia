<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Inertia\Inertia;

class AdminRoleController extends Controller
{
    public function index(Request $request)
    {
        $title = 'Roles';
        // 🔹 Filter nama role
        $filterName = $request->input('name');

        $roles = Role::with('permissions')
            ->when($filterName, function ($query, $filterName) {
                $query->where('name', 'like', "%{$filterName}%");
            })
            ->paginate(10)
            ->withQueryString();

        $permissions = Permission::all();

        return Inertia::render('Admin/Roles', [
            'roles' => $roles,
            'permissions' => $permissions,
            'filters' => ['name' => $filterName],
            'title' => $title
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:roles,name',
        ]);

        Role::create(['name' => $request->name]);

        return redirect()->back()->with('success', 'Role berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|unique:roles,name,' . $id,
        ]);

        $role = Role::findOrFail($id);
        $role->update(['name' => $request->name]);

        return redirect()->back()->with('success', 'Role berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $role = Role::findOrFail($id);
        $role->delete();

        return redirect()->back()->with('success', 'Role berhasil dihapus.');
    }

    // 🔹 Update permission untuk role tertentu
    public function updatePermissions(Request $request, $id)
    {
        $role = Role::findOrFail($id);
        $permissions = $request->permissions ?? [];
        $role->syncPermissions($permissions);

        return redirect()->back()->with('success', 'Permission role berhasil diperbarui.');
    }
    public function editPermissions($id)
    {
        $role = Role::with('permissions')->findOrFail($id);
        $permissions = Permission::orderBy('name')->get();
        $title = "Atur Permission untuk Role {$role->name}";

        return Inertia::render('Admin/AssignRolesPermission', [
            'role' => $role,
            'permissions' => $permissions,
            'title' => $title,
        ]);
    }
}
