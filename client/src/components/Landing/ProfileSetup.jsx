import React, { useState } from 'react';
import { User, MapPin, Calendar, Globe, ChevronDown, ChevronUp, Sparkles, Trash2, Users } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';

export const ProfileSetup = () => {
  const { userProfile, updateUserProfile } = useSocket();
  const [isOpen, setIsOpen] = useState(() => {
    // If user has already filled any data, open by default
    return Boolean(userProfile?.name || userProfile?.city || userProfile?.country || userProfile?.age || userProfile?.gender);
  });

  const hasAnyData = Boolean(userProfile?.name || userProfile?.age || userProfile?.gender || userProfile?.city || userProfile?.country);

  const handleClear = (e) => {
    e.stopPropagation();
    updateUserProfile({ name: '', age: '', gender: '', city: '', country: '' });
  };

  return (
    <div
      style={{
        width: '100%',
        background: 'var(--bg-surface-muted)',
        border: '1.5px solid var(--border-soft)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        marginTop: '6px',
        overflow: 'hidden'
      }}
    >
      {/* Header Toggle */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
          background: isOpen ? 'var(--border-soft)' : 'transparent',
          transition: 'background 0.15s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <User size={16} color="var(--accent)" />
          <div style={{ minWidth: 0 }}>
            <span
              style={{
                fontSize: '0.82rem',
                fontFamily: 'var(--font-sans)',
                fontWeight: 700,
                color: 'var(--text-primary)'
              }}
            >
              Share Details with Strangers
            </span>
            <span
              style={{
                fontSize: '0.74rem',
                fontFamily: 'var(--font-sans)',
                color: 'var(--text-muted)',
                marginLeft: '6px'
              }}
            >
              (Optional)
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {hasAnyData && (
            <span
              className="tag-pill"
              style={{
                fontSize: '0.72rem',
                padding: '2px 8px',
                background: 'var(--teal-bg)',
                color: 'var(--teal)',
                border: '1px solid var(--teal)',
                borderRadius: 'var(--radius-pill)',
                fontWeight: 700
              }}
            >
              Active Profile
            </span>
          )}
          {isOpen ? <ChevronUp size={16} color="var(--text-primary)" /> : <ChevronDown size={16} color="var(--text-primary)" />}
        </div>
      </div>

      {/* Expandable Form Body */}
      {isOpen && (
        <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--bg-surface)' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            Fill in only what you'd like to share. Strangers will see this when you connect. Leave blank to stay completely anonymous.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '8px'
            }}
          >
            {/* Name / Nickname */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.74rem',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '4px'
                }}
              >
                <User size={12} color="var(--purple)" /> Name / Nickname
              </label>
              <input
                type="text"
                value={userProfile?.name || ''}
                onChange={(e) => updateUserProfile({ name: e.target.value })}
                placeholder="e.g. Alex"
                maxLength={30}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  fontSize: '0.85rem',
                  height: '36px'
                }}
              />
            </div>

            {/* Sex / Gender */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.74rem',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '4px'
                }}
              >
                <Users size={12} color="var(--pink)" /> Sex / Gender
              </label>
              <select
                value={userProfile?.gender || ''}
                onChange={(e) => updateUserProfile({ gender: e.target.value })}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  fontSize: '0.85rem',
                  height: '36px',
                  cursor: 'pointer'
                }}
              >
                <option value="">-- Not specified --</option>
                <option value="Male (M)">Male (M)</option>
                <option value="Female (F)">Female (F)</option>
                <option value="Other">Other / Non-Binary</option>
              </select>
            </div>

            {/* Age */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.74rem',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '4px'
                }}
              >
                <Calendar size={12} color="var(--coral)" /> Age
              </label>
              <input
                type="number"
                min={18}
                max={120}
                value={userProfile?.age || ''}
                onChange={(e) => updateUserProfile({ age: e.target.value })}
                placeholder="e.g. 22"
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  fontSize: '0.85rem',
                  height: '36px'
                }}
              />
            </div>

            {/* City */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.74rem',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '4px'
                }}
              >
                <MapPin size={12} color="var(--teal)" /> City
              </label>
              <input
                type="text"
                value={userProfile?.city || ''}
                onChange={(e) => updateUserProfile({ city: e.target.value })}
                placeholder="e.g. Tokyo"
                maxLength={40}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  fontSize: '0.85rem',
                  height: '36px'
                }}
              />
            </div>

            {/* Country */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.74rem',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '4px'
                }}
              >
                <Globe size={12} color="var(--accent)" /> Country
              </label>
              <input
                type="text"
                value={userProfile?.country || ''}
                onChange={(e) => updateUserProfile({ country: e.target.value })}
                placeholder="e.g. Japan"
                maxLength={40}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  fontSize: '0.85rem',
                  height: '36px'
                }}
              />
            </div>
          </div>

          {/* Quick Clear Action */}
          {hasAnyData && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button
                type="button"
                onClick={handleClear}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  fontSize: '0.76rem',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <Trash2 size={12} /> Clear all details (Go 100% Anonymous)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default ProfileSetup;
