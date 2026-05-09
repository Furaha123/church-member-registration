import { useState } from 'react';
import { AppHeader, type Route } from './components/Layout';
import { Welcome } from './components/Welcome';
import { MemberList } from './components/MemberList';
import { MemberForm } from './components/MemberForm';
import { useMembers } from './hooks/useMembers';
import type { MemberFormData } from './types/member';

export function App() {
  const { members, addMember } = useMembers();
  const [route, setRoute] = useState<Route>('welcome');

  function handleRegister(data: MemberFormData) {
    addMember(data);
    setRoute('directory');
  }

  return (
    <>
      <div className="app-bg" />
      <div className="app-shell">
        {route === 'welcome' ? (
          <>
            <AppHeader route={route} setRoute={setRoute} showTabs={false} />
            <Welcome onEnter={() => setRoute('directory')} />
          </>
        ) : (
          <>
            <AppHeader route={route} setRoute={setRoute} />
            <main className="page">
              {route === 'directory' && (
                <MemberList members={members} onNewMember={() => setRoute('register')} />
              )}
              {route === 'register' && (
                <MemberForm onSubmit={handleRegister} onCancel={() => setRoute('directory')} />
              )}
            </main>
          </>
        )}
      </div>
    </>
  );
}
