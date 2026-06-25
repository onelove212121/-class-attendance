import { useEffect, useRef, useState } from "react";
import { X, Nfc } from "lucide-react";

const CHANNELS = [
  { value: "", label: "Not linked yet" },
  { value: "telegram", label: "Telegram" },
  { value: "messenger", label: "Messenger" },
];

export default function StudentFormModal({ initial, onSave, onClose, lockedSection }) {
  const [name, setName] = useState(initial?.name || "");
  const [section, setSection] = useState(lockedSection || initial?.section || "");
  const [rfidUid, setRfidUid] = useState(initial?.rfidUid || "");
  const [parentChannel, setParentChannel] = useState(initial?.parentChannel || "");
  const [parentChatId, setParentChatId] = useState(initial?.parentChatId || "");
  const uidInputRef = useRef(null);

  useEffect(() => {
    // Auto-focus the RFID field so a USB reader plugged into this computer
    // can "type" a tapped card's ID straight into it.
    uidInputRef.current?.focus();
  }, []);

  function handleUidKeyDown(e) {
    // The USB reader sends Enter after the card ID — capture it, don't submit the form.
    if (e.key === "Enter") e.preventDefault();
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      section: section.trim(),
      rfidUid: rfidUid.trim() || null,
      parentChannel: parentChannel || null,
      parentChatId: parentChatId.trim() || null,
    });
  }

  return (
    <div className="fixed inset-0 bg-ink/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-rule">
          <h2 className="font-display text-lg font-semibold">
            {initial ? "Edit Student" : "Add Student"}
          </h2>
          <button
            onClick={onClose}
            className="text-ink-dim hover:text-ink p-1 rounded-md"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-dim mb-1.5">
              Full name
            </label>
            <input
              autoFocus={false}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Juan Dela Cruz"
              className="w-full px-3 py-2 rounded-lg border border-rule focus:border-accent text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-dim mb-1.5">
              Grade & section
            </label>
            <input
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="e.g. Grade 5 - Sampaguita"
              readOnly={!!lockedSection && !initial}
              className={`w-full px-3 py-2 rounded-lg border text-sm ${
                lockedSection && !initial
                  ? "bg-paper border-rule/60 text-ink-dim cursor-default"
                  : "border-rule focus:border-accent"
              }`}
              tabIndex={lockedSection && !initial ? -1 : 0}
            />
            {lockedSection && !initial && (
              <p className="text-xs text-ink-dim mt-1.5">
                Section is locked to {lockedSection}.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-dim mb-1.5">
              RFID / NFC card
            </label>
            <div className="relative">
              <Nfc
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-dim"
              />
              <input
                ref={uidInputRef}
                value={rfidUid}
                onChange={(e) => setRfidUid(e.target.value)}
                onKeyDown={handleUidKeyDown}
                placeholder="Tap the card on the reader now…"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-rule focus:border-accent text-sm font-mono"
              />
            </div>
            <p className="text-xs text-ink-dim mt-1.5">
              Plug the USB reader into this computer, click this field, then tap
              the blank card. The ID fills in automatically.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-dim mb-1.5">
                Parent channel
              </label>
              <select
                value={parentChannel}
                onChange={(e) => setParentChannel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-rule text-sm bg-white"
              >
                {CHANNELS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-dim mb-1.5">
                Chat ID
              </label>
              <input
                value={parentChatId}
                onChange={(e) => setParentChatId(e.target.value)}
                placeholder="Linked via code"
                className="w-full px-3 py-2 rounded-lg border border-rule text-sm font-mono"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-rule text-sm font-medium text-ink-dim hover:bg-paper"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg bg-board text-chalk text-sm font-medium hover:bg-board-deep"
            >
              {initial ? "Save changes" : "Add student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
