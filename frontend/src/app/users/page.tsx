'use client';

// INTENTIONAL ISSUE #5: This is a monolithic 250+ line component that should be split.
// It handles: data fetching, table rendering, pagination, modal state, form state,
// delete confirmation, and API calls — all in a single component.
// Better architecture would extract: UsersTable, UserModal, DeleteConfirmDialog,
// useUsers hook, etc.

// INTENTIONAL ISSUE (bonus): Direct DOM manipulation via document.getElementById
// is used in the modal focus management instead of using React refs (useRef).

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Badge from '@/components/ui/Badge';
import { usersApi } from '@/lib/api';
import type { User, PaginatedResponse } from '@/types';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  Check,
  Users as UsersIcon,
  Download,
  Filter,
} from 'lucide-react';

interface EditUserForm {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  phone: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Form state
  const [editForm, setEditForm] = useState<EditUserForm>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'customer',
    isActive: true,
    phone: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery]);

  const fetchUsers = async () => {
    try {
      const response = (await usersApi.getAll({
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
      })) as PaginatedResponse<User>;
      setUsers(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
      setIsLoading(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to load users');
      setIsLoading(false);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      phone: user.phone || '',
    });
    setSaveError('');
    setIsEditModalOpen(true);

    // INTENTIONAL ISSUE: Direct DOM manipulation instead of React refs.
    // The correct approach is: const modalRef = useRef<HTMLDivElement>(null);
    // then modalRef.current?.focus() after state update.
    setTimeout(() => {
      const firstInput = document.getElementById('edit-firstName');
      if (firstInput) firstInput.focus();
    }, 100);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
    setSaveError('');
  };

  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
    setDeleteError('');
  };

  const handleEditFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    setSaveError('');

    try {
      await usersApi.update(selectedUser.id, {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        role: editForm.role,
        isActive: editForm.isActive,
        phone: editForm.phone || undefined,
      });

      setSuccessMessage(`${editForm.firstName} ${editForm.lastName} updated successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
      closeEditModal();
      fetchUsers();
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    setDeleteError('');

    try {
      await usersApi.delete(userToDelete.id);
      setSuccessMessage(`${userToDelete.firstName} ${userToDelete.lastName} deleted`);
      setTimeout(() => setSuccessMessage(''), 3000);
      closeDeleteModal();
      fetchUsers();
    } catch (err: any) {
      setDeleteError(err?.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateStr));
  };

  const getRoleBadgeVariant = (role: string) => {
    if (role === 'admin') return 'info' as const;
    if (role === 'vendor') return 'default' as const;
    return 'default' as const;
  };

  const getRoleStyle = (role: string) => {
    if (role === 'admin') return 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20';
    if (role === 'vendor') return 'bg-violet-50 text-violet-700 ring-1 ring-violet-600/20';
    return 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Users</h1>
            <p className="text-sm text-slate-500 mt-1">
              {total > 0 ? `${total} total users` : 'Manage platform users'}
            </p>
          </div>
          <button className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={15} />
            Invite User
          </button>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 flex items-center gap-3 animate-slide-up">
            <Check size={16} />
            <span className="text-sm">{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
            <AlertTriangle size={16} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Toolbar */}
        <div className="card p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search users by name or email..."
                className="input pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select className="input w-auto text-sm">
                <option value="">All roles</option>
                <option value="admin">Admin</option>
                <option value="customer">Customer</option>
                <option value="vendor">Vendor</option>
              </select>
              <select className="input w-auto text-sm">
                <option value="">All status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button className="btn-secondary flex items-center gap-1.5 text-sm whitespace-nowrap">
                <Download size={14} />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <UsersIcon size={32} className="text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-semibold">
                              {user.firstName[0]}{user.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleStyle(user.role)}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={user.isActive ? 'success' : 'error'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit user"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(user)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete user"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-5">
            <p className="text-sm text-slate-500">
              Page {currentPage} of {totalPages} &middot; {total} users
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2.5 border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-white bg-white shadow-sm transition-all"
              >
                <ChevronLeft size={16} className="text-slate-600" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2.5 border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-white bg-white shadow-sm transition-all"
              >
                <ChevronRight size={16} className="text-slate-600" />
              </button>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up">
              {/* Modal header */}
              <div className="flex items-center gap-4 p-6 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-semibold">
                    {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-slate-900">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h2>
                  <p className="text-xs text-slate-500">{selectedUser.email}</p>
                </div>
                <button
                  onClick={closeEditModal}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {saveError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    {saveError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">First name</label>
                    <input
                      id="edit-firstName"
                      name="firstName"
                      type="text"
                      value={editForm.firstName}
                      onChange={handleEditFormChange}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Last name</label>
                    <input
                      name="lastName"
                      type="text"
                      value={editForm.lastName}
                      onChange={handleEditFormChange}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={editForm.email}
                    onChange={handleEditFormChange}
                    className="input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Role</label>
                    <select
                      name="role"
                      value={editForm.role}
                      onChange={handleEditFormChange}
                      className="input"
                    >
                      <option value="customer">Customer</option>
                      <option value="vendor">Vendor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input
                      name="phone"
                      type="tel"
                      value={editForm.phone}
                      onChange={handleEditFormChange}
                      className="input"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() =>
                      setEditForm((prev) => ({ ...prev, isActive: !prev.isActive }))
                    }
                    className={`w-9 h-5 rounded-full transition-colors duration-200 flex items-center relative cursor-pointer ${
                      editForm.isActive ? 'bg-indigo-600' : 'bg-slate-200'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full bg-white shadow transition-transform duration-200 absolute ${
                        editForm.isActive ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                  <span className="text-sm text-slate-700">Account is active</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100">
                <button
                  onClick={closeEditModal}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUser}
                  disabled={isSaving}
                  className="btn-primary text-sm disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && userToDelete && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-slide-up">
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={20} className="text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900 mb-1">Delete User</h2>
                    <p className="text-sm text-slate-600">
                      Are you sure you want to delete{' '}
                      <strong className="text-slate-900">
                        {userToDelete.firstName} {userToDelete.lastName}
                      </strong>
                      ? This action cannot be undone.
                    </p>
                  </div>
                </div>

                {deleteError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    {deleteError}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end gap-3 px-6 pb-6">
                <button
                  onClick={closeDeleteModal}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-xl text-sm transition-all duration-200 active:scale-95 disabled:opacity-60"
                >
                  {isDeleting ? 'Deleting...' : 'Delete user'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
