import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Scissors } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

/* ────────────────────────────────────────────────────────────────────────────
   SectionedTextInput  ▸  top‑level component
   ------------------------------------------------------------------------- */
export interface SectionedTextInputProps {
  initialSections?: string[];
  onSectionsChange?(sections: string[]): void;
}

export default function SectionedTextInput({
  initialSections = [''],
  onSectionsChange,
}: SectionedTextInputProps) {
  const [sections, setSections] = useState<string[]>(initialSections);

  /* bubble changes upward */
  useEffect(() => onSectionsChange?.(sections), [sections, onSectionsChange]);

  /* helpers */
  const update = useCallback((i: number, v: string) => {
    setSections(p => {
      const n = [...p];
      n[i] = v;
      return n;
    });
  }, []);

  const split = useCallback((i: number, a: string, b: string) => {
    setSections(p => {
      const n = [...p];
      n[i] = a;
      n.splice(i + 1, 0, b);
      return n;
    });
  }, []);

  return (
    <div className="flex flex-col gap-2 w-full">
      {sections.map((txt, i) => (
        <React.Fragment key={i}>
          <SectionEditor
            value={txt}
            onChange={v => update(i, v)}
            onSplit={(a, b) => split(i, a, b)}
          />
          {i < sections.length - 1 && (
            <div className="w-full flex justify-center text-2xl select-none opacity-60">⋯⋯⋯</div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   SectionEditor  ▸  editable block with hover‑split UI
   ------------------------------------------------------------------------- */
interface SectionEditorProps {
  value: string;
  onChange(v: string): void;
  onSplit(before: string, after: string): void;
}

function SectionEditor({ value, onChange, onSplit }: SectionEditorProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [hover, setHover] = useState<{ rect: DOMRect; index: number } | null>(null);

  /* keep editable content in sync */
  useEffect(() => {
    if (ref.current && ref.current.innerText !== value) {
      ref.current.innerText = value;
    }
  }, [value]);

  /* paste → plain text */
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const txt = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, txt);
  };

  /* propagate edits upward */
  const handleInput = () => ref.current && onChange(ref.current.innerText);

  /* hover → compute nearest space boundary */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const raw = document.caretRangeFromPoint?.(e.clientX, e.clientY);
    if (!raw || !ref.current || !ref.current.contains(raw.startContainer))
      return setHover(null);

    const pre = document.createRange();
    pre.setStart(ref.current, 0);
    pre.setEnd(raw.startContainer, raw.startOffset);
    let idx = pre.toString().length;
    const txt = value;

    while (idx < txt.length && txt[idx] !== ' ') idx++;
    if (idx === txt.length) return setHover(null);

    const snap = document.createRange();
    snap.setStart(raw.startContainer, raw.startOffset + (idx - pre.toString().length));
    snap.collapse(true);
    const rect = snap.getBoundingClientRect();

    setHover({
      rect: new DOMRect(rect.right + 15, rect.top, 0, rect.height),
      index: idx,
    });
  };

  /* perform split */
  const performSplit = () => {
    if (!hover) return;
    const before = value.slice(0, hover.index).trimEnd();
    const after = value.slice(hover.index).trimStart();
    onSplit(before, after);
    setHover(null);
  };

  /* click anywhere while guide visible → split */
  const handleClick = (e: React.MouseEvent) => {
    if (hover) {
      e.preventDefault();
      performSplit();
    }
  };

  /* render */
  return (
    <div
      className="relative border border-gray-300 rounded-2xl p-4 bg-white shadow-sm"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHover(null)}
      onClick={handleClick}
    >
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className="outline-none whitespace-pre-wrap break-words min-h-[4rem]"
        onInput={handleInput}
        onPaste={handlePaste}
      />

      <AnimatePresence>
        {hover && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute"
            style={{
              left: hover.rect.right - ref.current!.getBoundingClientRect().left,
              top: hover.rect.top - ref.current!.getBoundingClientRect().top,
            }}
          >
            <div className="h-8 w-px bg-red-400/50" />
            {/* visual cue only – split triggers on any click now */}
            <div className="relative mt-[-0.25rem]">
              <Scissors size={16} className="text-gray-700" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}