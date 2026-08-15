import React, { useState } from 'react';
import { Tag, Plus, X, Sparkles } from 'lucide-react';
import { getTagTheme } from '../../utils/tagColors';

const POPULAR_TAGS = [
  'love', 'relationship', 'fun', 'memes', 'dating', 'tiktok',
  'gaming', 'music', 'anime', 'deep-talks', 'tech', 'movies',
  'coding', 'vibes', 'travel', 'fitness', 'art', 'philosophy', 'books'
];

export const InterestPicker = ({ tags = [], setTags }) => {
  const [inputVal, setInputVal] = useState('');

  const addTag = (tag) => {
    const clean = tag.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (clean && !tags.includes(clean) && tags.length < 8) {
      setTags([...tags, clean]);
      setInputVal('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputVal);
    }
  };

  return (
    <div style={{ marginTop: '14px', width: '100%' }}>
      {/* Header with tag counter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <label
          style={{
            fontSize: '0.8rem',
            fontFamily: 'var(--font-sans)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Sparkles size={14} color="var(--accent)" /> Topics you like (optional)
        </label>
        <span
          style={{
            fontSize: '0.74rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            color: 'var(--text-muted)'
          }}
        >
          {tags.length}/8 tags
        </span>
      </div>

      {/* Input container */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-surface)',
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)',
          padding: '4px 10px',
          gap: '8px'
        }}
      >
        <Tag size={15} color="var(--text-muted)" />
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add topics (e.g. gaming, anime, music)..."
          style={{
            flex: 1,
            height: '36px',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            color: 'var(--text-primary)',
            fontSize: '0.88rem',
            fontFamily: 'var(--font-sans)'
          }}
        />
        {inputVal.trim() && (
          <button
            type="button"
            onClick={() => addTag(inputVal)}
            className="btn btn-primary"
            style={{
              padding: '4px 12px',
              fontSize: '0.78rem',
              height: '28px',
              borderRadius: 'var(--radius-pill)',
              border: '1.5px solid var(--border)'
            }}
          >
            <Plus size={13} /> Add
          </button>
        )}
      </div>

      {/* Active Selected Tags */}
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
          {tags.map((t) => {
            const theme = getTagTheme(t);
            return (
              <span
                key={t}
                className="tag-pill"
                style={{
                  fontSize: '0.8rem',
                  padding: '4px 10px',
                  background: theme.bg,
                  color: theme.color,
                  border: `1.5px solid ${theme.color}`,
                  borderRadius: 'var(--radius-pill)',
                  boxShadow: 'var(--shadow-sm)',
                  fontWeight: 700
                }}
              >
                #{t}
                <X
                  size={13}
                  style={{ cursor: 'pointer', marginLeft: '4px', display: 'inline', strokeWidth: 2.5 }}
                  onClick={() => removeTag(t)}
                  aria-label={`Remove ${t} tag`}
                />
              </span>
            );
          })}
        </div>
      )}

      {/* Popular Suggestions */}
      <div style={{ marginTop: '12px' }}>
        <span
          style={{
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-muted)',
            display: 'block',
            marginBottom: '6px',
            textAlign: 'left'
          }}
        >
          Popular Topics:
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {POPULAR_TAGS.map((t) => {
            const isSelected = tags.includes(t);
            const theme = getTagTheme(t);
            return (
              <button
                key={t}
                type="button"
                className="tag-pill"
                onClick={() => isSelected ? removeTag(t) : addTag(t)}
                style={{
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  padding: '4px 10px',
                  background: isSelected ? theme.color : theme.bg,
                  color: isSelected ? '#FFFFFF' : theme.color,
                  border: `1.5px solid ${theme.color}`,
                  borderRadius: 'var(--radius-pill)',
                  boxShadow: isSelected ? 'var(--shadow-sm)' : '1px 1px 0 rgba(0,0,0,0.06)',
                  fontWeight: 600
                }}
              >
                #{t}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default InterestPicker;
