import { useMemo, useState } from 'react';
import { AppHeader, type Route } from './components/Layout';
import { Welcome } from './components/Welcome';
import { MemberList } from './components/MemberList';
import { MemberForm } from './components/MemberForm';
import { MemberProfile } from './components/MemberProfile';
import { useMembers } from './hooks/useMembers';
import { useAuth } from './context/AuthContext';

export function App() {
  const { isAuthenticated, user, login, logout, loggingIn, loginError } = useAuth();
  const { members, loading, error, addMember, editMember, getMemberById } = useMembers(isAuthenticated);
  const [route, setRoute] = useState<Route>('welcome');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selectedMember = selectedId !== null ? getMemberById(selectedId) : undefined;

  const totalDepartments = useMemo(() => {
    const names = new Set<string>();
    members.forEach((m) => m.departments.forEach((d) => names.add(d.name)));
    return names.size;
  }, [members]);

  function openProfile(id: number) {
    setSelectedId(id);
    setRoute('profile');
  }

  function openEdit(id: number) {
    setSelectedId(id);
    setRoute('edit');
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
            totalMembers={0}
            totalDepartments={0}
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
        {route === 'welcome' ? (
          <>
            <AppHeader setRoute={setRoute} userName={user?.name} onLogout={handleLogout} />
            <Welcome
              onEnter={() => setRoute('directory')}
              onRegisterNew={() => setRoute('register')}
              totalMembers={members.length}
              totalDepartments={totalDepartments}
              isAuthenticated={true}
              user={user}
              onLogin={login}
              loggingIn={loggingIn}
              loginError={loginError}
            />
          </>
        ) : (
          <>
            <AppHeader setRoute={setRoute} userName={user?.name} onLogout={handleLogout} />
            <main className="page">
              {route === 'directory' && (
                <MemberList
                  members={members}
                  loading={loading}
                  error={error}
                  onNewMember={() => setRoute('register')}
                  onViewMember={openProfile}
                  onEditMember={openEdit}
                />
              )}

              {route === 'register' && (
                <MemberForm
                  onSubmit={addMember}
                  onSuccess={(saved) => openProfile(saved.id)}
                  onCancel={() => setRoute('directory')}
                />
              )}

              {route === 'profile' && selectedMember && (
                <MemberProfile
                  member={selectedMember}
                  onEdit={() => setRoute('edit')}
                  onBack={() => setRoute('directory')}
                />
              )}

              {route === 'edit' && selectedMember && (
                <MemberForm
                  member={selectedMember}
                  onSubmit={(data) => editMember(selectedMember.id, data)}
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
