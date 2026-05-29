import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, ShieldAlert, Plus, Edit, Trash2, CheckCircle2, XCircle, Search, Users, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../context/ConfirmationContext';
import { Navigate } from 'react-router-dom';

interface RolePermission {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem?: boolean;
}

const defaultRoles: RolePermission[] = [
  { id: '1', name: 'Super Admin', description: 'Full system access', permissions: ['all'], isSystem: true },
  { id: '2', name: 'Admin', description: 'General administration', permissions: ['view_dashboard', 'manage_students', 'manage_teachers', 'manage_fees'], isSystem: true },
  { id: '3', name: 'Teacher', description: 'Class management', permissions: ['view_dashboard', 'take_attendance', 'manage_results'], isSystem: true },
  { id: '4', name: 'Accountant', description: 'Fee management', permissions: ['view_dashboard', 'manage_fees'] },
];

const availablePermissions = [
  { id: 'view_dashboard', label: 'View Dashboard' },
  { id: 'manage_students', label: 'Manage Students' },
  { id: 'manage_teachers', label: 'Manage Teachers' },
  { id: 'take_attendance', label: 'Take Attendance' },
  { id: 'manage_results', label: 'Manage Results' },
  { id: 'manage_fees', label: 'Manage Fees' },
  { id: 'manage_settings', label: 'Manage Settings' },
];

export default function Roles() {
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const [roles, setRoles] = useState(defaultRoles);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RolePermission | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (user?.role !== 'Super Admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSaveRole = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    
    const selectedPermissions: string[] = [];
    availablePermissions.forEach(p => {
      if (formData.get(`perm_${p.id}`) === 'on') {
        selectedPermissions.push(p.id);
      }
    });

    if (editingRole) {
      setRoles(roles.map(r => r.id === editingRole.id ? { ...r, name, description, permissions: selectedPermissions } : r));
    } else {
      setRoles([...roles, { id: Date.now().toString(), name, description, permissions: selectedPermissions }]);
    }
    
    setIsModalOpen(false);
    setEditingRole(null);
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: 'Delete Role',
      message: 'Are you sure you want to delete this role? Users assigned to this role might lose their permissions.',
      variant: 'danger',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel'
    });
    if (isConfirmed) {
      setRoles(roles.filter(r => r.id !== id));
    }
  };

  const filteredRoles = roles.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-emerald-500" />
            Roles & Permissions
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Manage user roles and system access levels.</p>
        </div>
        <button 
          onClick={() => { setEditingRole(null); setIsModalOpen(true); }}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Role
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-4">
           <div className="relative flex-1 max-w-md">
             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
               type="text"
               placeholder="Search roles..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
             />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Role Name</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold">Access Level</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRoles.map(role => (
                <tr key={role.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role.isSystem ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                        {role.isSystem ? <Shield className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 flex items-center gap-2">
                          {role.name}
                          {role.isSystem && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider border border-slate-200">System</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600">{role.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.includes('all') ? (
                         <span className="text-xs bg-purple-100 text-purple-700 font-medium px-2 py-1 rounded-md border border-purple-200">Full Access</span>
                      ) : (
                        role.permissions.length > 0 ? (
                          <>
                             <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2 py-1 rounded-md border border-slate-200">{role.permissions.length} Permissions</span>
                             <span className="text-xs text-slate-400">{role.permissions.slice(0, 2).map(p => availablePermissions.find(ap => ap.id === p)?.label).join(', ')}{role.permissions.length > 2 ? '...' : ''}</span>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No access</span>
                        )
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                         onClick={() => { setEditingRole(role); setIsModalOpen(true); }}
                         disabled={role.isSystem && role.name === 'Super Admin'}
                         className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                         title="Edit Role"
                       >
                         <Edit className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => handleDelete(role.id)}
                         disabled={role.isSystem}
                         className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                         title="Delete Role"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRoles.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-lg font-medium text-slate-600">No roles found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                  {editingRole ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                {editingRole ? 'Edit Role' : 'Create New Role'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-full transition-colors"
                type="button"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="p-8 overflow-y-auto flex-1">
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Role Name</label>
                    <input 
                      type="text" 
                      name="name"
                      defaultValue={editingRole?.name}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="e.g. Receptionist"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                    <input 
                      type="text" 
                      name="description"
                      defaultValue={editingRole?.description}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="Role purpose..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Permissions</label>
                  {editingRole?.permissions.includes('all') ? (
                    <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl text-purple-700 flex flex-col items-center justify-center text-center">
                       <ShieldCheck className="w-8 h-8 mb-2 opacity-80" />
                       <span className="font-bold">Super Admin Role</span>
                       <span className="text-sm opacity-80 mt-1">Has full access to all system features. Permissions cannot be modified.</span>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {availablePermissions.map(perm => {
                        const isChecked = editingRole?.permissions.includes(perm.id);
                        return (
                          <label key={perm.id} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-emerald-300 transition-colors">
                            <input 
                              type="checkbox" 
                              name={`perm_${perm.id}`}
                              defaultChecked={isChecked}
                              className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                            />
                            <span className="text-sm font-medium text-slate-700">{perm.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> {editingRole ? 'Update Role' : 'Create Role'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
