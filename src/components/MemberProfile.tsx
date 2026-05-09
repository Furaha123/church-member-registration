import { useState } from 'react';
import type { Member, MemberFormData, MembershipStatus } from '../types/member';
import { MemberForm } from './MemberForm';

interface MemberProfileProps {
  member: Member;
  onUpdate: (id: string, data: MemberFormData) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

const STATUS_COLORS: Record<MembershipStatus, string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  inactive: 'bg-gray-100 text-gray-600 border-gray-200',
  visitor: 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

interface DetailRowProps {
  label: string;
  value: string | boolean;
}

function DetailRow({ label, value }: DetailRowProps) {
  const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value || '—';
  return (
    <div className="flex justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm text-gray-800 font-medium text-right max-w-[60%]">{display}</span>
    </div>
  );
}

export function MemberProfile({ member, onUpdate, onDelete, onBack }: MemberProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function handleUpdate(data: MemberFormData) {
    onUpdate(member.id, data);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div>
        <button onClick={() => setIsEditing(false)} className="mb-4 text-sm text-church-600 hover:underline">
          ← Back to Profile
        </button>
        <MemberForm onSubmit={handleUpdate} onCancel={() => setIsEditing(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="text-sm text-church-600 hover:underline">
        ← Back to Directory
      </button>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="w-20 h-20 rounded-full bg-church-100 flex items-center justify-center text-church-700 font-bold text-2xl flex-shrink-0">
          {getInitials(member.firstName, member.lastName)}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-gray-800">
            {member.firstName} {member.lastName}
          </h2>
          <p className="text-gray-500 mt-0.5">{member.occupation || 'No occupation listed'}</p>
          <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
            <span className={`text-xs font-medium px-3 py-1 rounded-full border ${STATUS_COLORS[member.membershipStatus]}`}>
              {member.membershipStatus}
            </span>
            <span className="text-xs font-medium px-3 py-1 rounded-full border bg-church-50 text-church-700 border-church-200">
              {member.department}
            </span>
            {member.baptised && (
              <span className="text-xs font-medium px-3 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                Baptised ✝
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-church-700 hover:bg-church-800 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-xs font-semibold text-church-700 uppercase tracking-wide mb-3">Personal</h3>
          <DetailRow label="Date of Birth" value={formatDate(member.dateOfBirth)} />
          <DetailRow label="Gender" value={member.gender.replace('_', ' ')} />
          <DetailRow label="Marital Status" value={member.maritalStatus} />
          <DetailRow label="Occupation" value={member.occupation} />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-xs font-semibold text-church-700 uppercase tracking-wide mb-3">Contact</h3>
          <DetailRow label="Phone" value={member.phone} />
          <DetailRow label="Email" value={member.email} />
          <DetailRow label="Address" value={member.address} />
          <DetailRow label="City" value={member.city} />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-xs font-semibold text-church-700 uppercase tracking-wide mb-3">Church</h3>
          <DetailRow label="Department" value={member.department} />
          <DetailRow label="Status" value={member.membershipStatus} />
          <DetailRow label="Baptised" value={member.baptised} />
          <DetailRow label="Date Joined" value={formatDate(member.dateJoined)} />
        </div>

        {member.notes && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-church-700 uppercase tracking-wide mb-3">Notes</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{member.notes}</p>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Member?</h3>
            <p className="text-sm text-gray-500 mb-5">
              This will permanently remove <strong>{member.firstName} {member.lastName}</strong> from the registry.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { onDelete(member.id); onBack(); }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
