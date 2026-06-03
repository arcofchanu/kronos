import React, { useState, useEffect } from 'react';

const CUSTOM_STORAGE_KEY = 'kronos_custom_presets';
const HIDDEN_STORAGE_KEY = 'kronos_hidden_defaults';

const ALL_DEFAULT_PRESETS = [
  {
    id: 'tabata',
    name: 'TABATA',
    isDefault: true,
    rounds: Array.from({ length: 8 }, (_, i) => ({
      label: `ROUND ${i + 1}`,
      workSeconds: 20,
      restSeconds: 10,
    })),
  },
  {
    id: 'hiit',
    name: 'HIIT',
    isDefault: true,
    rounds: Array.from({ length: 6 }, (_, i) => ({
      label: `ROUND ${i + 1}`,
      workSeconds: 40,
      restSeconds: 20,
    })),
  },
  {
    id: 'endurance',
    name: 'ENDURANCE',
    isDefault: true,
    rounds: Array.from({ length: 4 }, (_, i) => ({
      label: `ROUND ${i + 1}`,
      workSeconds: 60,
      restSeconds: 30,
    })),
  },
  {
    id: 'sprint',
    name: 'SPRINT',
    isDefault: true,
    rounds: Array.from({ length: 10 }, (_, i) => ({
      label: `ROUND ${i + 1}`,
      workSeconds: 15,
      restSeconds: 10,
    })),
  },
];

function loadCustomPresets() {
  try {
    const raw = localStorage.getItem(CUSTOM_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveCustomPresets(presets) {
  try {
    localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(presets));
  } catch {
    console.warn('Failed to save custom presets');
  }
}

function loadHiddenDefaults() {
  try {
    const raw = localStorage.getItem(HIDDEN_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveHiddenDefaults(ids) {
  try {
    localStorage.setItem(HIDDEN_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    console.warn('Failed to save hidden defaults');
  }
}

/**
 * PresetStrip — Horizontal scrollable row of preset chips.
 * Supports default + custom presets. ALL presets can be deleted via popup confirmation.
 */
export default function PresetStrip({
  activePreset,
  onSelectPreset,
  currentRounds,
}) {
  const [customPresets, setCustomPresets] = useState(loadCustomPresets);
  const [hiddenDefaults, setHiddenDefaults] = useState(loadHiddenDefaults);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null); // preset to delete (shown in popup)

  useEffect(() => {
    setCustomPresets(loadCustomPresets());
    setHiddenDefaults(loadHiddenDefaults());
  }, []);

  // Filter out hidden defaults
  const visibleDefaults = ALL_DEFAULT_PRESETS.filter(
    (p) => !hiddenDefaults.includes(p.id)
  );
  const allPresets = [...visibleDefaults, ...customPresets];

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.isDefault) {
      // Hide the default preset
      const updated = [...hiddenDefaults, deleteTarget.id];
      setHiddenDefaults(updated);
      saveHiddenDefaults(updated);
    } else {
      // Remove custom preset
      const updated = customPresets.filter((p) => p.id !== deleteTarget.id);
      setCustomPresets(updated);
      saveCustomPresets(updated);
    }

    setDeleteTarget(null);
  };

  const handleSavePreset = () => {
    if (!newPresetName.trim() || !currentRounds || currentRounds.length === 0) return;

    const newPreset = {
      id: `custom_${Date.now()}`,
      name: newPresetName.trim().toUpperCase(),
      isDefault: false,
      rounds: currentRounds.map((r) => ({ ...r })),
    };

    const updated = [...customPresets, newPreset];
    setCustomPresets(updated);
    saveCustomPresets(updated);
    setShowSaveModal(false);
    setNewPresetName('');
  };

  return (
    <div className="w-full py-3 px-4">
      <div className="flex gap-2 overflow-x-auto items-center" style={{ scrollbarWidth: 'none' }}>
        {/* + CUSTOM — loads fresh session + save icon on hover */}
        <div className="relative flex-shrink-0 group">
          <button
            id="preset-custom"
            onClick={() => onSelectPreset({
              id: 'custom',
              name: 'CUSTOM',
              rounds: [{ label: 'ROUND 1', workSeconds: 30, restSeconds: 10 }],
            })}
            className={`preset-chip small-caps btn-press flex items-center gap-1.5 pr-2 ${
              activePreset === 'custom' ? 'active' : ''
            }`}
            style={{ borderStyle: 'dashed' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>CUSTOM</span>

            {/* Save/tick icon — always visible when active, hover when not */}
            <span
              onClick={(e) => {
                e.stopPropagation();
                setShowSaveModal(true);
              }}
              className={`w-4 h-4 rounded-full flex items-center justify-center
                         transition-all duration-150
                         ${activePreset === 'custom'
                           ? 'opacity-100 bg-kronos-accent/20 text-kronos-accent hover:bg-kronos-accent/30'
                           : 'opacity-0 group-hover:opacity-100 bg-white/10 text-kronos-muted hover:bg-kronos-accent/20 hover:text-kronos-accent'
                         }`}
              title="Save current session as preset"
            >
              {activePreset === 'custom' ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
              )}
            </span>
          </button>
        </div>

        {/* Custom saved presets — shown first */}
        {customPresets.map((preset) => (
          <div key={preset.id} className="relative flex-shrink-0 group">
            <button
              id={`preset-${preset.id}`}
              onClick={() => onSelectPreset(preset)}
              className={`preset-chip small-caps btn-press flex items-center gap-1.5 pr-2 ${
                activePreset === preset.id ? 'active' : ''
              }`}
            >
              <span>{preset.name}</span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTarget(preset);
                }}
                className="w-4 h-4 rounded-full flex items-center justify-center
                           text-[10px] leading-none font-bold
                           opacity-0 group-hover:opacity-100 transition-all duration-150
                           bg-white/10 text-kronos-muted hover:bg-kronos-danger/30 hover:text-kronos-danger"
                title="Delete preset"
              >
                ✕
              </span>
            </button>
          </div>
        ))}

        {/* Default presets — after custom */}
        {visibleDefaults.map((preset) => (
          <div key={preset.id} className="relative flex-shrink-0 group">
            <button
              id={`preset-${preset.id}`}
              onClick={() => onSelectPreset(preset)}
              className={`preset-chip small-caps btn-press flex items-center gap-1.5 pr-2 ${
                activePreset === preset.id ? 'active' : ''
              }`}
            >
              <span>{preset.name}</span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTarget(preset);
                }}
                className="w-4 h-4 rounded-full flex items-center justify-center
                           text-[10px] leading-none font-bold
                           opacity-0 group-hover:opacity-100 transition-all duration-150
                           bg-white/10 text-kronos-muted hover:bg-kronos-danger/30 hover:text-kronos-danger"
                title="Delete preset"
              >
                ✕
              </span>
            </button>
          </div>
        ))}
      </div>

      {/* ═══ Delete Confirmation Popup ═══ */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 fade-in"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="bg-kronos-surface border border-kronos-border rounded-card p-6 mx-4
                       w-full max-w-sm card-enter"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning icon */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-kronos-danger/10 border border-kronos-danger/30
                              flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                </svg>
              </div>
            </div>

            <h3 className="text-base font-medium text-center text-kronos-text mb-2">
              Delete Preset
            </h3>

            <p className="text-sm text-kronos-muted text-center mb-1">
              Are you sure you want to delete
            </p>
            <p className="text-sm text-kronos-accent text-center font-medium small-caps tracking-wider mb-1">
              {deleteTarget.name}
            </p>
            <p className="text-xs text-kronos-muted text-center mb-6">
              {deleteTarget.rounds.length} round{deleteTarget.rounds.length !== 1 ? 's' : ''}
              {deleteTarget.isDefault && (
                <span className="block mt-1 text-kronos-muted/70">
                  This is a default preset. You can restore defaults by clearing app data.
                </span>
              )}
            </p>

            <div className="flex gap-3">
              <button
                id="btn-cancel-delete-preset"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-card bg-kronos-bg border border-kronos-border
                           text-sm text-kronos-muted small-caps tracking-wider
                           hover:text-kronos-text hover:border-kronos-muted transition-colors btn-press"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delete-preset"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-card bg-kronos-danger/15 border border-kronos-danger/40
                           text-sm font-bold text-kronos-danger small-caps tracking-wider
                           hover:bg-kronos-danger/25 hover:border-kronos-danger transition-colors btn-press"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Save Preset Modal ═══ */}
      {showSaveModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 fade-in"
          onClick={() => setShowSaveModal(false)}
        >
          <div
            className="bg-kronos-surface border border-kronos-border rounded-card p-6 mx-4
                       w-full max-w-sm card-enter"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-medium small-caps tracking-wider mb-4 text-kronos-text">
              Save Custom Preset
            </h3>

            {currentRounds && currentRounds.length > 0 ? (
              <>
                <input
                  type="text"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
                  placeholder="Preset name..."
                  maxLength={20}
                  autoFocus
                  className="w-full bg-kronos-bg border border-kronos-border rounded-sm
                             text-sm text-kronos-text py-2 px-3 outline-none
                             focus:border-kronos-accent transition-colors mb-2"
                />
                <p className="text-xs text-kronos-muted mb-4">
                  {currentRounds.length} round{currentRounds.length !== 1 ? 's' : ''} will be saved
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="flex-1 py-2 rounded-sm bg-kronos-bg border border-kronos-border
                               text-sm text-kronos-muted small-caps tracking-wider
                               hover:text-kronos-text transition-colors btn-press"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePreset}
                    disabled={!newPresetName.trim()}
                    className={`flex-1 py-2 rounded-sm text-sm font-bold small-caps tracking-wider
                               transition-colors btn-press
                               ${newPresetName.trim()
                                 ? 'bg-kronos-text text-kronos-bg hover:bg-gray-200'
                                 : 'bg-kronos-border text-kronos-muted cursor-not-allowed'
                               }`}
                  >
                    Save
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-kronos-muted mb-3">Add some rounds first before saving a preset.</p>
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="py-2 px-6 rounded-sm bg-kronos-bg border border-kronos-border
                             text-sm text-kronos-muted small-caps tracking-wider
                             hover:text-kronos-text transition-colors btn-press"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export { ALL_DEFAULT_PRESETS };
