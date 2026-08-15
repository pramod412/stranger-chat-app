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
        background: 'var(--parchment-card)',
        border: '1px solid var(--ink)',
        boxShadow: '1px 1px 0px var(--ink)',
        marginTop: '8px'
      }}
    >
      {/* Header Toggle */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
          background: isOpen ? 'var(--parchment-dark)' : 'transparent',
          borderBottom: isOpen ? '1px solid var(--ink)' : 'none',
          transition: 'background 0.15s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <User size={15} color="var(--rust-clay)" />
          <div style={{ minWidth: 0 }}>
            <span
              style={{
                fontSize: '0.78rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: 'var(--ink)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              Share Details with Strangers
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)',
                color: 'rgba(28, 26, 23, 0.6)',
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
              className="tag-pill active"
              style={{
                fontSize: '0.68rem',
                padding: '1px 6px',
                background: 'var(--sage)',
                color: '#FFFFFF',
                border: '1px solid var(--ink)'
              }}
            >
              Active Profile
            </span>
          )}
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expandable Form Body */}
      {isOpen && (
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ fontSize: '0.76rem', color: 'rgba(28, 26, 23, 0.75)', lineHeight: 1.4, margin: 0 }}>
            Fill in only what you'd like to share. Strangers will see this when you connect. Leave blank to stay completely anonymous.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
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
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: 'var(--ink)',
                  marginBottom: '3px'
                }}
              >
                <User size={12} /> Name / Nickname
              </label>
              <input
                type="text"
                value={userProfile?.name || ''}
                onChange={(e) => updateUserProfile({ name: e.target.value })}
                placeholder="e.g. Alex"
                maxLength={30}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  fontSize: '0.82rem',
                  height: '34px'
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
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: 'var(--ink)',
                  marginBottom: '3px'
                }}
              >
                <Users size={12} /> Sex / Gender
              </label>
              <select
                value={userProfile?.gender || ''}
                onChange={(e) => updateUserProfile({ gender: e.target.value })}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  fontSize: '0.82rem',
                  height: '34px',
                  background: '#FFFFFF',
                  border: '2px solid var(--ink)',
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-sans)',
                  outline: 'none',
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
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: 'var(--ink)',
                  marginBottom: '3px'
                }}
              >
                <Calendar size={12} /> Age
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
                  padding: '6px 8px',
                  fontSize: '0.82rem',
                  height: '34px'
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
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: 'var(--ink)',
                  marginBottom: '3px'
                }}
              >
                <MapPin size={12} /> City
              </label>
              <input
                type="text"
                value={userProfile?.city || ''}
                onChange={(e) => updateUserProfile({ city: e.target.value })}
                placeholder="e.g. Tokyo"
                maxLength={40}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  fontSize: '0.82rem',
                  height: '34px'
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
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: 'var(--ink)',
                  marginBottom: '3px'
                }}
              >
                <Globe size={12} /> Country
              </label>
              <input
                type="text"
                value={userProfile?.country || ''}
                onChange={(e) => updateUserProfile({ country: e.target.value })}
                placeholder="e.g. Japan"
                maxLength={40}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  fontSize: '0.82rem',
                  height: '34px'
                }}
              />
            </div>
          </div>

          {/* Quick Clear Action */}
          {hasAnyData && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
              <button
                type="button"
                onClick={handleClear}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--rust-clay)',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  padding: '2px 4px'
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
