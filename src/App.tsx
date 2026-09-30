import { useCallback, useState } from 'react';
import { AppHeader, type Route } from './components/Layout';
import { Welcome } from './components/Welcome';
import { MemberList } from './components/MemberList';
import { MemberForm } from './components/MemberForm';
import { MemberProfile, MemberProfileSkeleton } from './components/MemberProfile';
import { Families } from './components/Families';
import { AdminUsers } from './components/AdminUsers';
import { ResetPassword } from './components/ResetPassword';
import { TempPasswordBanner } from './components/TempPasswordBanner';
import { FamilySetup } from './components/FamilySetup';
import { useMembers } from './hooks/useMembers';
import { useAuth } from './context/AuthContext';
import { getMember } from './api/members';
import { notifyError } from './notify';
import { MARITAL_STATUS_OPTIONS } from './data/constants';
import type { Member, MemberFilters } from './types/member';

function isResetPasswordRoute(): boolean {
  return window.location.pathname.replace(/\/+$/, '') === '/reset-password';
}

function isMarriedMember(member: Member): boolean {
  return MARITAL_STATUS_OPTIONS.find((option) => option.id === member.marital_status_id)?.name === 'MARRIED';
}

export function App() {
  const { isAuthenticated, user, login, logout, loggingIn, loginError } = useAuth();

  // The password-reset link is a standalone screen reachable from an email while
  // signed out, so it's resolved before the authentication gate below.
  if (isResetPasswordRoute()) {
    return <ResetPassword />;
  }
  const [memberFilters, setMemberFilters] = useState<MemberFilters>({});
  const { members, loading, error, addMember, editMember, getMemberById } = useMembers(
    isAuthenticated,
    memberFilters,
  );
  const [route, setRoute] = useState<Route>('welcome');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [familySeedMember, setFamilySeedMember] = useState<Member | null>(null);
  const [openFamilyId, setOpenFamilyId] = useState<number | null>(null);
  // The directory list loads members in bulk; the profile screen instead
  // hits GET /members/{id} directly so what's shown (picture included) is
  // always the backend's current record for that one member, not a possibly
  // stale copy from the bulk fetch.
  const [profileMember, setProfileMember] = useState<Member | null>(null);

  const isAdmin = user?.role === 'admin';
  const selectedMember = selectedId !== null ? getMemberById(selectedId) : undefined;

  const openProfile = useCallback(async (id: number) => {
    setSelectedId(id);
    setRoute('profile');
    setProfileMember(null);
    try {
      const fresh = await getMember(id);
      setProfileMember(fresh);
    } catch (err) {
      notifyError(err, 'Failed to load member details.');
    }
  }, []);

  function openEdit(id: number) {
    setSelectedId(id);
    setRoute('edit');
  }

  function openMemberFamily(familyId: number) {
    setOpenFamilyId(familyId);
    setRoute('families');
  }

  async function handleLogout() {
    await logout();
    setRoute('welcome');
    setSelectedId(null);
  }

  // Every other screen depends on data that sits behind auth:sanctum, so an
  // unauthenticated visitor only ever sees the welcome/login screen.
  if (!isAuthenticated) {
    return (
      <>
        <div className="app-bg" />
        <div className="app-shell">
          <AppHeader setRoute={() => {}} />
          <Welcome
            onEnter={() => setRoute('directory')}
            onRegisterNew={() => setRoute('register')}
            onViewFamilies={() => setRoute('families')}
            onManageUsers={() => setRoute('admin')}
            isAuthenticated={false}
            user={null}
            onLogin={login}
            loggingIn={loggingIn}
            loginError={loginError}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="app-bg" />
      <div className="app-shell">
        {user?.must_change_password && <TempPasswordBanner />}
        {route === 'welcome' ? (
          <>
            <AppHeader
              setRoute={setRoute}
              userEmail={user?.email}
              onLogout={handleLogout}
              currentRoute={route}
              isAdmin={isAdmin}
            />
            <Welcome
              onEnter={() => setRoute('directory')}
              onRegisterNew={() => setRoute('register')}
              onViewFamilies={() => setRoute('families')}
              onManageUsers={() => setRoute('admin')}
              isAuthenticated={true}
              user={user}
              onLogin={login}
              loggingIn={loggingIn}
              loginError={loginError}
            />
          </>
        ) : (
          <>
            <AppHeader
              setRoute={setRoute}
              userEmail={user?.email}
              onLogout={handleLogout}
              currentRoute={route}
              isAdmin={isAdmin}
            />
            <main className="page">
              {route === 'directory' && (
                <MemberList
                  members={members}
                  loading={loading}
                  error={error}
                  filters={memberFilters}
                  onFiltersChange={setMemberFilters}
                  onNewMember={() => setRoute('register')}
                  onViewMember={openProfile}
                  onEditMember={openEdit}
                  onOpenFamily={openMemberFamily}
                />
              )}

              {route === 'families' && (
                <Families
                  members={members}
                  openFamilyId={openFamilyId}
                  onOpenFamilyIdConsumed={() => setOpenFamilyId(null)}
                />
              )}

              {route === 'admin' && isAdmin && user && (
                <AdminUsers currentUserId={user.id} />
              )}

              {route === 'register' && (
                <MemberForm
                  onSubmit={addMember}
                  onSuccess={(saved) => {
                    if (isMarriedMember(saved)) {
                      setFamilySeedMember(saved);
                      setRoute('family-setup');
                    } else {
                      openProfile(saved.id);
                    }
                  }}
                  onCancel={() => setRoute('directory')}
                />
              )}

              {route === 'family-setup' && familySeedMember && (
                <FamilySetup
                  member={familySeedMember}
                  members={members}
                  onDone={(id) => {
                    setFamilySeedMember(null);
                    openProfile(id);
                  }}
                />
              )}

              {route === 'profile' && profileMember && (
                <MemberProfile
                  member={profileMember}
                  onEdit={() => setRoute('edit')}
                  onBack={() => setRoute('directory')}
                />
              )}

              {route === 'profile' && !profileMember && (
                <MemberProfileSkeleton onBack={() => setRoute('directory')} />
              )}

              {route === 'edit' && (profileMember ?? selectedMember) && (
                <MemberForm
                  member={(profileMember ?? selectedMember)!}
                  onSubmit={(data) => editMember((profileMember ?? selectedMember)!.id, data)}
                  onSuccess={(saved) => openProfile(saved.id)}
                  onCancel={() => setRoute('profile')}
                />
              )}
            </main>
          </>
        )}
      </div>
    </>
  );
}
