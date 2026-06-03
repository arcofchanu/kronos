import React from 'react';

/**
 * NavBar — Bottom navigation with three text tabs.
 * Active tab is white, inactive is muted gray. No icons.
 */
export default function NavBar({ activeScreen, onNavigate }) {
  const tabs = [
    { id: 'timer', label: 'TIMER' },
    { id: 'stopwatch', label: 'STOPWATCH' },
    { id: 'streak', label: 'STREAK' },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around
                 bg-kronos-bg border-t border-kronos-border"
      style={{ height: '56px' }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          id={`nav-${tab.id}`}
          onClick={() => onNavigate(tab.id)}
          className={`small-caps text-sm font-medium tracking-widest px-6 py-4 transition-colors duration-150
            ${activeScreen === tab.id || (activeScreen === 'builder' && tab.id === 'timer')
              ? 'text-kronos-text'
              : 'text-kronos-muted hover:text-gray-300'
            }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
