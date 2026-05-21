import { useMemo, useState } from 'react';
import { Search, ShieldCheck, UserRound, UsersRound } from 'lucide-react';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { getRoleLabel, REVIEW_ROLE_OPTIONS, ROLE_OPTIONS } from '../../lib/roles';
import { UserAccessStatus, UserRole } from '../../types';

const ACCESS_STATUSES: UserAccessStatus[] = ['active', 'pending', 'disabled', 'invited'];

interface UserManagementSectionProps {
  enabled: boolean;
  currentUserId?: string;
}

export function UserManagementSection({ enabled, currentUserId }: UserManagementSectionProps) {
  const { users, isLoading, isSaving, error, updateUserRole, updateUserStatus } = useAdminUsers(enabled);
  const [search, setSearch] = useState('');

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) => {
      return [user.name, user.email, getRoleLabel(user.role), user.accessStatus]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(term));
    });
  }, [search, users]);

  const handleRoleChange = async (uid: string, role: UserRole, userName: string) => {
    const confirmed = window.confirm(`Change ${userName || 'this user'} to ${getRoleLabel(role)}?`);
    if (!confirmed) return;
    await updateUserRole(uid, role);
  };

  const handleStatusChange = async (uid: string, status: UserAccessStatus, userName: string) => {
    const confirmed = window.confirm(`Set ${userName || 'this user'} to ${status}?`);
    if (!confirmed) return;
    await updateUserStatus(uid, status);
  };

  return (
    <section>
      <div className="flex items-start gap-3 mb-4 px-1">
        <div className="w-11 h-11 rounded-2xl bg-maldives-lagoon/10 flex items-center justify-center shrink-0">
          <UsersRound className="w-5 h-5 text-maldives-lagoon" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-maldives-deep">User Management</h3>
          <p className="text-xs text-slate-500 leading-relaxed mt-1">
            Manage registered divers, trusted contributors, and operational access.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 mb-4">
        <label className="block">
          <span className="text-xs font-semibold text-slate-500">Search users</span>
          <div className="mt-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, email, role, or status"
              className="w-full min-h-[44px] rounded-xl border border-slate-200 pl-10 pr-3 text-sm"
            />
          </div>
        </label>
      </div>

      {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 mb-4">{error}</p>}
      <ReviewRightsPanel
        isSaving={isSaving}
        users={users}
        onGrant={(uid, role, name) => handleRoleChange(uid, role, name)}
      />
      {isLoading && <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">Loading users...</p>}
      {!isLoading && filteredUsers.length === 0 && (
        <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">No users match this filter.</p>
      )}

      <div className="space-y-3">
        {filteredUsers.map((managedUser) => (
          <article key={managedUser.uid} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-start gap-3">
              {managedUser.photoURL ? (
                <img src={managedUser.photoURL} alt="" className="w-11 h-11 rounded-2xl object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <UserRound className="w-5 h-5 text-slate-400" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-bold text-maldives-deep truncate">{managedUser.name}</h4>
                  {managedUser.uid === currentUserId && (
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-maldives-lagoon/10 text-maldives-lagoon px-2 py-1 rounded-full">
                      You
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate">{managedUser.email || 'No email recorded'}</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {getRoleLabel(managedUser.role)} · {managedUser.accessStatus || 'active'}
                </p>
              </div>
              <ShieldCheck className="w-5 h-5 text-slate-300 shrink-0" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 mt-4">
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">Role</span>
                <select
                  value={managedUser.role || 'recreational-diver'}
                  disabled={isSaving}
                  onChange={(event) => handleRoleChange(managedUser.uid, event.target.value as UserRole, managedUser.name)}
                  className="mt-1 w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm bg-white"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">Access status</span>
                <select
                  value={managedUser.accessStatus || 'active'}
                  disabled={isSaving}
                  onChange={(event) => handleStatusChange(managedUser.uid, event.target.value as UserAccessStatus, managedUser.name)}
                  className="mt-1 w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm bg-white capitalize"
                >
                  {ACCESS_STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </label>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ReviewRightsPanel({
  users,
  isSaving,
  onGrant,
}: {
  users: ReturnType<typeof useAdminUsers>['users'];
  isSaving: boolean;
  onGrant: (uid: string, role: UserRole, name: string) => Promise<void>;
}) {
  const candidates = users.filter((user) => user.role !== 'platform-admin');

  return (
    <section className="mb-4 rounded-3xl border border-cyan-100 bg-cyan-50/60 p-4">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-maldives-lagoon">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-display text-lg font-bold text-maldives-deep">Review & Approval Rights</h4>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Grant trusted roles to users who can approve dive-site information, sketch instructions, and conservation-relevant updates.
          </p>
        </div>
      </div>

      {candidates.length === 0 ? (
        <p className="rounded-2xl bg-white px-4 py-3 text-xs font-semibold text-slate-500">
          No eligible users are available yet.
        </p>
      ) : (
        <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
          {candidates.map((user) => (
            <div key={user.uid} className="rounded-2xl bg-white p-3">
              <p className="truncate text-sm font-bold text-maldives-deep">{user.name}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {REVIEW_ROLE_OPTIONS.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    disabled={isSaving || user.role === role.value}
                    onClick={() => onGrant(user.uid, role.value, user.name)}
                    className="min-h-[44px] rounded-xl bg-maldives-deep px-3 text-[11px] font-bold text-white disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    {user.role === role.value ? 'Assigned' : role.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
