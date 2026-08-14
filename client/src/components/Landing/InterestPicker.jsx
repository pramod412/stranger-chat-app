import React, { useState } from 'react';
import { Tag, Plus, X, Sparkles } from 'lucide-react';

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
    <div style={{ marginTop: '16px', width: '100%' }}>
      {/* Header with tag counter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <label
          style={{
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: 'var(--ink)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Sparkles size={14} color="var(--rust-clay)" /> Topics you like (optional)
        </label>
        <span
          style={{
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            color: 'rgba(28, 26, 23, 0.6)'
          }}
        >
          {tags.length}/8 tags
        </span>
      </div>

      {/* Input container - Field Guide Blueprint Box */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: '#FFFFFF',
          border: '2px solid var(--ink)',
          boxShadow: '2px 2px 0px var(--ink)',
          padding: '4px 10px',
          gap: '8px'
        }}
      >
        <Tag size={15} color="var(--ink)" />
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add topics (e.g. gaming, anime, music)..."
          style={{
            flex: 1,
            height: '34px',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            color: 'var(--ink)',
            fontSize: '0.88rem',
            fontFamily: 'var(--font-sans)'
          }}
        />
        {inputVal.trim() && (
          <button
            type="button"
            onClick={() => addTag(inputVal)}
            className="btn"
            style={{
              padding: '3px 10px',
              fontSize: '0.75rem',
              height: '26px',
              background: 'var(--ink)',
              color: 'var(--parchment)',
              border: '1px solid var(--ink)'
            }}
          >
            <Plus size={13} /> Add
          </button>
        )}
      </div>

      {/* Active Selected Tags */}
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
          {tags.map((t) => (
            <span
              key={t}
              className="tag-pill active"
              style={{
                fontSize: '0.78rem',
                padding: '3px 8px',
                background: 'var(--ink)',
                color: 'var(--parchment)',
                border: '1px solid var(--ink)',
                boxShadow: '2px 2px 0px var(--rust-clay)'
              }}
            >
              #{t}
              <X
                size={12}
                style={{ cursor: 'pointer', marginLeft: '4px', display: 'inline' }}
                onClick={() => removeTag(t)}
              />
            </span>
          ))}
        </div>
      )}

      {/* Popular Suggestions */}
      <div style={{ marginTop: '12px' }}>
        <span
          style={{
            fontSize: '0.7rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'rgba(28, 26, 23, 0.65)',
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
            return (
              <button
                key={t}
                type="button"
                className="tag-pill"
                onClick={() => isSelected ? removeTag(t) : addTag(t)}
                style={{
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  padding: '3px 8px',
                  background: isSelected ? 'var(--ink)' : 'var(--parchment-card)',
                  color: isSelected ? 'var(--parchment)' : 'var(--ink)',
                  border: '1px solid var(--ink)',
                  boxShadow: isSelected ? '2px 2px 0px var(--rust-clay)' : '1px 1px 0px var(--ink)'
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
