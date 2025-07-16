import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Scissors } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

/* ────────────────────────────────────────────────────────────────────────────
   SectionedTextInput
   ---------------------------------------------------------------------------
   • Lets a user type/paste text and interactively split it into “sections”.
   • Emits `onSectionsChange` whenever sections are edited or split.
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

  useEffect(() => {
    onSectionsChange?.(sections);
  }, [sections, onSectionsChange]);

  /* helpers */
  const updateSection = useCallback((idx: number, value: string) => {
    setSections(prev => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  }, []);

  const splitSection = useCallback((idx: number, before: string, after: string) => {
    setSections(prev => {
      const next = [...prev];
      next[idx] = before;
      next.splice(idx + 1, 0, after);
      return next;
    });
  }, []);

  return (
    <div className="flex flex-col gap-2 w-full">
      {sections.map((value, i) => (
        <React.Fragment key={i}>
          <SectionEditor
            value={value}
            onChange={v => updateSection(i, v)}
            onSplit={(bef, aft) => splitSection(i, bef, aft)}
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
   SectionEditor – editable block with hover-split UI
   ------------------------------------------------------------------------- */
interface SectionEditorProps {
  value: string;
  onChange(text: string): void;
  onSplit(before: string, after: string): void;
}

function SectionEditor({ value, onChange, onSplit }: SectionEditorProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [hover, setHover] =
    useState<{ rect: DOMRect; index: number } | null>(null);

  /* sync external value → editable div */
  useEffect(() => {
    if (ref.current && ref.current.innerText !== value) {
      ref.current.innerText = value;
    }
  }, [value]);

  const handleInput = () => {
    if (ref.current) onChange(ref.current.innerText);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const raw = document.caretRangeFromPoint?.(e.clientX, e.clientY);
    if (!raw || !ref.current || !ref.current.contains(raw.startContainer))
      return setHover(null);
  
    // 1 – absolute index at cursor
    const pre = document.createRange();
    pre.setStart(ref.current, 0);
    pre.setEnd(raw.startContainer, raw.startOffset);
    let idx = pre.toString().length;
  
    const txt = value;
  
    // 2 – snap to nearest space (left if inside word, right if after)
    if (txt[idx] !== ' ') {                       // inside word → scan right
      while (idx < txt.length && txt[idx] !== ' ') idx++;
    }
    if (idx === txt.length) return setHover(null); // no space found
  
    // 3 – make a zero-width range at that space to measure rect
    const snapRange = document.createRange();
    snapRange.setStart(raw.startContainer, raw.startOffset + (idx - pre.toString().length));
    snapRange.collapse(true);
    const rect = snapRange.getBoundingClientRect();
  
    // 4 – show the guide
    const box = ref.current.getBoundingClientRect();
    setHover({
      rect: new DOMRect(rect.right, rect.top, 0, rect.height),
      index: idx,          // split exactly on that space
    });
  };

  const handleSplit = () => {
    if (!hover) return;
    const before = value.slice(0, hover.index).trimEnd();
    const after = value.slice(hover.index).trimStart();
    onSplit(before, after);
    setHover(null);
  };

  const box = ref.current?.getBoundingClientRect();

  return (
    <div className="relative border border-gray-300 rounded-2xl p-4 bg-white shadow-sm">
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className="outline-none whitespace-pre-wrap break-words min-h-[4rem]"
        onInput={handleInput}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHover(null)}
      />

      {/* Hover line + scissor */}
      <AnimatePresence>
        {hover && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute"
            style={{
              left: hover.rect.right - box!.left,
              top:
                hover.rect.top - box!.top,
            }}
          >
            <div className="h-8 w-px bg-red-400/50" />
            <div className="relative mt-[-0.25rem]">
              <button
                className="pointer-events-auto bg-white shadow p-1 rounded-full border hover:bg-red-50 transition"
                onClick={handleSplit}
              >
                <Scissors size={16} className="text-gray-700" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
