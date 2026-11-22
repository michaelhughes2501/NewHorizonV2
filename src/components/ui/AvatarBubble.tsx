import React from 'react';

/** Initials avatar. Decorative, so screen readers skip it (the name is always shown beside it). */
export function AvatarBubble({ name, color, size = 32 }: { name: string; color?: string; size?: number }) {
  const bg = color || '#6d4aff';
  return (
    <div
      aria-hidden="true"
      style={{ width: size, height: size, background: bg, flexShrink: 0 }}
      className="flex select-none items-center justify-center rounded-full text-xs font-bold text-white"
    >
      {name?.charAt(0).toUpperCase() || '?'}
    </div>
  );
}
