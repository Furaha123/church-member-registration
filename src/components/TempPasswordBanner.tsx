import { useState } from 'react';
import { Icon } from './Layout';
import { ChangePasswordModal } from './ChangePasswordModal';

// Non-blocking reminder for users still on an admin-issued temporary password.
// Opens an in-app form that sets a new password directly (POST /password/change),
// with no reset token or email round-trip.
export function TempPasswordBanner() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div
        className="state-banner info"
        style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', margin: '12px 0' }}
      >
        <Icon name="lock" size={15} />
        <span style={{ flex: 1, minWidth: 220 }}>
          You're using a temporary password. Update it to keep your account secure.
        </span>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowModal(true)}>
          Update password
          <Icon name="edit" size={13} />
        </button>
      </div>

      {showModal && <ChangePasswordModal onClose={() => setShowModal(false)} />}
    </>
  );
}
