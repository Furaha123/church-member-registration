import { useEffect, useRef, useState } from 'react';
import type { Member, MemberFilters } from '../types/member';
import { Icon } from './Layout';
import { SEX_OPTIONS, MARITAL_STATUS_OPTIONS } from '../data/constants';
import { MemberFiltersPanel } from './form/MemberFilters';
import { getMembersPage, exportMembers } from '../api/members';
import { resolveMediaUrl } from '../api/client';
import { notifyError } from '../notify';
import { toDisplayLabel } from '../utils/format';

// Saves a fetched Blob to disk via a throwaway <a download> link — the
// standard way to trigger a "Save As" for data that only exists in memory
// (there's no navigable URL for it, since it came back from an authenticated
// fetch rather than a plain link the browser could follow itself).
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

interface DirectoryProps {
  members: Member[];
  loading: boolean;
  error: string | null;
  filters: MemberFilters;
  onFiltersChange: (filters: MemberFilters) => void;
  onNewMember: () => void;
  onViewMember: (id: number) => void;
  onEditMember: (id: number) => void;
  // Opens the Families tab straight on the given family's detail view — used
  // by the "Family"/"Birth Family" action buttons below, which read directly
  // off the member's own has_family/has_birth_family fields (MemberResource
  // now reports these inline, so there's no need to cross-reference a
  // separately-fetched families list here anymore).
  onOpenFamily: (familyId: number) => void;
}

interface FamilyLinkButtonProps {
  label: string;
  tooltip: string;
  icon: string;
  familyId: number;
  onOpen: (familyId: number) => void;
}

// A "Has Family" or "Birth Family" action button — only rendered at all when
// the member actually has that link (see the row below), so it's always a
// live, clickable pill that jumps straight to the family's detail view.
function FamilyLinkButton({ label, tooltip, icon, familyId, onOpen }: FamilyLinkButtonProps) {
  return (
    <button
      type="button"
      className="family-action linked"
      onClick={() => onOpen(familyId)}
      title={tooltip}
    >
      <Icon name={icon} size={12} /> {label}
    </button>
  );
}

const PAGE_SIZE = 5;

function countActiveFilters(filters: MemberFilters): number {
  return Object.values(filters).filter((value) =>
    Array.isArray(value) ? value.length > 0 : value !== undefined && value !== '',
  ).length;
}

function lookupName(options: { id: number; name: string }[], id: number | null): string {
  if (id === null) return '—';
  const name = options.find((o) => o.id === id)?.name;
  return name ? toDisplayLabel(name) : '—';
}

function initials(m: Member): string {
  return (m.first_name?.[0] ?? '') + (m.last_name?.[0] ?? '');
}

function namesOf(list: { name: string }[]): string {
  return list.length > 0 ? list.map((l) => l.name).join(', ') : '—';
}

export function MemberList({
  members,
  loading,
  error,
  filters,
  onFiltersChange,
  onNewMember,
  onViewMember,
  onEditMember,
  onOpenFamily,
}: DirectoryProps) {
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [exporting, setExporting] = useState(false);
  const activeFilterCount = countActiveFilters(filters);
  const filtersRef = useRef<HTMLDivElement>(null);
  const isSearching = search.trim() !== '';

  async function handleExport(): Promise<void> {
    setExporting(true);
    try {
      const { blob, filename } = await exportMembers(filters);
      downloadBlob(blob, filename);
    } catch (err) {
      notifyError(err, 'Failed to export members.');
    } finally {
      setExporting(false);
    }
  }

  useEffect(() => {
    if (!showFilters) return;
    function handleClickOutside(e: MouseEvent) {
      if (filtersRef.current && !filtersRef.current.contains(e.target as Node)) {
        setShowFilters(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilters]);

  // Free-text search spans fields (mobile, email, talent) the backend filter
  // doesn't support, so it runs client-side over the already-loaded `members`
  // and paginates that filtered set in memory — no extra round trip per page.
  const searched = members.filter((m) => {
    if (!isSearching) return true;
    const q = search.toLowerCase();
    const haystack = [
      m.first_name,
      m.last_name,
      m.mobile_tel ?? '',
      m.email ?? '',
      ...m.departments.map((d) => d.name),
      ...m.talents.map((t) => t.name),
    ];
    return haystack.some((f) => f?.toLowerCase().includes(q));
  });

  const [searchPageIndex, setSearchPageIndex] = useState(0);
  const searchPageCount = Math.max(1, Math.ceil(searched.length / PAGE_SIZE));
  const currentSearchPage = Math.min(searchPageIndex, searchPageCount - 1);
  const searchedPageMembers = searched.slice(
    currentSearchPage * PAGE_SIZE,
    currentSearchPage * PAGE_SIZE + PAGE_SIZE,
  );

  useEffect(() => {
    setSearchPageIndex(0);
  }, [search, members]);

  // Outside of an active search, the table pages the real backend (page/per_page
  // params) so Next/Prev genuinely round-trips instead of re-slicing a local array.
  const [serverPage, setServerPage] = useState(1);
  const [serverMembers, setServerMembers] = useState<Member[]>([]);
  const [serverTotal, setServerTotal] = useState(0);
  const [serverLastPage, setServerLastPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    setServerPage(1);
  }, [filtersKey]);

  useEffect(() => {
    if (isSearching) return;
    let cancelled = false;
    setPageLoading(true);
    setPageError(null);
    getMembersPage({ ...(JSON.parse(filtersKey) as MemberFilters), page: serverPage, per_page: PAGE_SIZE })
      .then(({ members: pageMembers, meta }) => {
        if (cancelled) return;
        setServerMembers(pageMembers);
        setServerTotal(meta?.total ?? pageMembers.length);
        setServerLastPage(meta?.lastPage ?? 1);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setPageError(err instanceof Error ? err.message : 'Failed to load members.');
      })
      .finally(() => {
        if (!cancelled) setPageLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isSearching, filtersKey, serverPage]);

  const pagedMembers = isSearching ? searchedPageMembers : serverMembers;
  const totalCount = isSearching ? searched.length : serverTotal;
  const currentPage = isSearching ? currentSearchPage : serverPage - 1;
  const pageCount = isSearching ? searchPageCount : serverLastPage;
  const firstShown = totalCount === 0 ? 0 : currentPage * PAGE_SIZE + 1;
  const lastShown = Math.min(totalCount, currentPage * PAGE_SIZE + pagedMembers.length);
  const tableLoading = isSearching ? loading : pageLoading;
  const tableError = isSearching ? error : pageError ?? error;

  function goToPage(nextPage: number): void {
    if (isSearching) {
      setSearchPageIndex(nextPage);
    } else {
      setServerPage(nextPage + 1);
    }
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="eyebrow">Members</div>
            <h2 className="card-title">Member Directory</h2>
            <div className="card-sub">
              Showing <strong style={{ color: 'var(--gold-300)' }}>{totalCount}</strong> members enrolled.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="filters-dropdown-wrap" ref={filtersRef}>
              <button
                className={'btn btn-sm ' + (showFilters || activeFilterCount > 0 ? 'btn-primary' : 'btn-outline')}
                onClick={() => setShowFilters((v) => !v)}
              >
                <Icon name="search" size={12} /> Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
                <Icon name="chevron-down" size={12} />
              </button>

              {showFilters && (
                <MemberFiltersPanel
                  value={filters}
                  onApply={(next) => {
                    onFiltersChange(next);
                    setShowFilters(false);
                  }}
                  onClear={() => {
                    onFiltersChange({});
                    setShowFilters(false);
                  }}
                />
              )}
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleExport}
              disabled={exporting}
              title={
                activeFilterCount > 0
                  ? `Export the ${activeFilterCount} applied filter${activeFilterCount === 1 ? '' : 's'} to Excel`
                  : 'Export all members to Excel'
              }
            >
              {exporting ? (
                <><span className="spinner" aria-hidden="true" /> Exporting…</>
              ) : (
                <><Icon name="download" size={12} /> Export</>
              )}
            </button>
            <button className="btn btn-primary btn-sm" onClick={onNewMember}>
              <Icon name="plus" size={12} /> New Member
            </button>
          </div>
        </div>

        {tableError && <div className="state-banner error">Couldn't load members: {tableError}</div>}

        <div className="directory-toolbar">
          <div className="search">
            <span className="ico"><Icon name="search" size={16} /></span>
            <input
              placeholder="Search by name, mobile, email, department, or talent…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {tableLoading ? (
          <div className="checklist-empty">
            <span className="spinner" aria-hidden="true" /> Loading members…
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="member-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Gender</th>
                  <th>Marital Status</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Departments</th>
                  <th>Employed</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedMembers.map((m) => {
                  const pictureUrl = resolveMediaUrl(m.picture_url);
                  return (
                  <tr key={m.id}>
                    <td>
                      <div className="member-cell">
                        <div
                          className="avatar"
                          style={
                            pictureUrl
                              ? { backgroundImage: `url(${pictureUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                              : undefined
                          }
                        >
                          {!pictureUrl && initials(m)}
                        </div>
                        <div className="name">{m.first_name}</div>
                      </div>
                    </td>
                    <td>{lookupName(SEX_OPTIONS, m.sex_id)}</td>
                    <td>{lookupName(MARITAL_STATUS_OPTIONS, m.marital_status_id)}</td>
                    <td>{m.email || '—'}</td>
                    <td>{m.mobile_tel || '—'}</td>
                    <td><span className="tag gold">{namesOf(m.departments)}</span></td>
                    <td>
                      <span className={'tag ' + (m.employed ? 'green' : '')}>{m.employed === null ? '—' : m.employed ? 'Yes' : 'No'}</span>
                    </td>
                    <td>
                      <div className="row-actions">
                        {m.has_family[0] && (
                          <FamilyLinkButton
                            label="Has Family"
                            tooltip="View family details"
                            icon="home"
                            familyId={m.has_family[1]}
                            onOpen={onOpenFamily}
                          />
                        )}
                        {m.has_birth_family[0] && (
                          <FamilyLinkButton
                            label="Birth Family"
                            tooltip="View birth family details"
                            icon="sprout"
                            familyId={m.has_birth_family[1]}
                            onOpen={onOpenFamily}
                          />
                        )}
                        {!m.has_family[0] && !m.has_birth_family[0] && (
                          <span className="family-action unlinked" title="No family linked to this member.">
                            <Icon name="home" size={12} /> No Family
                          </span>
                        )}
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => onViewMember(m.id)}
                          aria-label={`View ${m.first_name} ${m.last_name}`}
                          title="View details"
                        >
                          <Icon name="eye" size={15} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn accent"
                          onClick={() => onEditMember(m.id)}
                          aria-label={`Edit ${m.first_name} ${m.last_name}`}
                          title="Edit member"
                        >
                          <Icon name="edit" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
                {pagedMembers.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', color: 'var(--cream-faint)', padding: '32px 0' }}>
                      {isSearching ? 'No members match your search.' : 'No members found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {pagedMembers.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  marginTop: 16,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ fontSize: 13, color: 'var(--cream-faint)' }}>
                  Showing {firstShown}–{lastShown} of {totalCount}
                </div>
                {pageCount > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 0}
                    >
                      ← Prev
                    </button>
                    <span style={{ fontSize: 13, color: 'var(--cream-dim)' }}>
                      Page {currentPage + 1} of {pageCount}
                    </span>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage >= pageCount - 1}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
