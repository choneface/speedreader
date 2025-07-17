import React, { useCallback, useEffect, useRef, useState } from "react";
import { Scissors } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

/* ────────────────────────────────────────────────────────────────────────────
   SectionedTextInput
   --------------------------------------------------------------------------
   • Renders editable text split into sections.
   • Emits `onSectionsChange` with latest sections array.
   • Accepts `completed` (indices) to grey‑out finished sections and disable
     further splitting in them.
*/
export interface SectionedTextInputProps {
  initialSections?: string[];
  completed?: number[]; // indices that are done
  onSectionsChange?(sections: string[]): void;
}

export default function SectionedTextInput({
  initialSections = [""],
  completed = [],
  onSectionsChange,
}: SectionedTextInputProps) {
  const [sections, setSections] = useState<string[]>(initialSections);

  /* bubble up */
  useEffect(() => onSectionsChange?.(sections), [sections, onSectionsChange]);

  /* helpers */
  const update = useCallback((i: number, v: string) => {
    setSections((p) => {
      const n = [...p];
      n[i] = v;
      return n;
    });
  }, []);

  const split = useCallback((i: number, a: string, b: string) => {
    setSections((p) => {
      const n = [...p];
      n[i] = a;
      n.splice(i + 1, 0, b);
      return n;
    });
  }, []);

  const mergeUp = useCallback((i: number) => {
    setSections((p) => {
      if (i === 0) return p;
      const n = [...p];
      n[i - 1] = (n[i - 1] + " " + n[i]).trim();
      n.splice(i, 1);
      return n;
    });
  }, []);

  return (
    <div className="flex flex-col gap-2 w-full">
      {sections.map((txt, i) => {
        const done = completed.includes(i);
        return (
          <React.Fragment key={i}>
            <SectionEditor
              value={txt}
              disabled={done}
              showDelete={i > 0 && !completed.includes(i - 1)}
              onChange={(v) => update(i, v)}
              onSplit={(a, b) => split(i, a, b)}
              onDelete={() => mergeUp(i)}
            />
            {i < sections.length - 1 && (
              <div className="w-full flex justify-center text-2xl select-none opacity-60">
                ⋯⋯⋯
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   SectionEditor
   --------------------------------------------------------------------------*/
interface SectionEditorProps {
  value: string;
  disabled?: boolean;
  showDelete: boolean;
  onChange(v: string): void;
  onSplit(before: string, after: string): void;
  onDelete(): void;
}

function SectionEditor({
  value,
  disabled,
  showDelete,
  onChange,
  onSplit,
  onDelete,
}: SectionEditorProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [hover, setHover] = useState<{ rect: DOMRect; index: number } | null>(
    null,
  );

  useEffect(() => {
    if (ref.current && ref.current.innerText !== value)
      ref.current.innerText = value;
  }, [value]);

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    const txt = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, txt);
  };

  const handleInput = () =>
    !disabled && ref.current && onChange(ref.current.innerText);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    const raw = document.caretRangeFromPoint?.(e.clientX, e.clientY);
    if (!raw || !ref.current || !ref.current.contains(raw.startContainer))
      return setHover(null);

    const pre = document.createRange();
    pre.setStart(ref.current, 0);
    pre.setEnd(raw.startContainer, raw.startOffset);
    let idx = pre.toString().length;
    const txt = value;
    while (idx < txt.length && txt[idx] !== " " && txt[idx] != "\n") idx++;
    if (idx === txt.length) return setHover(null);

    const snap = document.createRange();
    snap.setStart(
      raw.startContainer,
      raw.startOffset + (idx - pre.toString().length),
    );
    snap.collapse(true);
    const rect = snap.getBoundingClientRect();
    setHover({
      rect: new DOMRect(rect.right + 15, rect.top, 0, rect.height),
      index: idx,
    });
  };

  const performSplit = () => {
    if (!hover || disabled) return;
    const before = value.slice(0, hover.index).trimEnd();
    const after = value.slice(hover.index).trimStart();
    onSplit(before, after);
    setHover(null);
  };

  return (
    <div
      className={`relative border rounded-2xl p-4 shadow-sm ${
        disabled
          ? "bg-gray-100 text-gray-500 italic"
          : "bg-white border-gray-300"
      }`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHover(null)}
      onClick={performSplit}
    >
      {showDelete && !disabled && (
        <button
          className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2
                 w-8 h-8 bg-white border rounded-full shadow
   flex items-center justify-center
              text-gray-400 hover:text-red-500"
          onClick={onDelete}
        >
          X
        </button>
      )}
      <div
        ref={ref}
        contentEditable={!disabled}
        suppressContentEditableWarning
        className="outline-none whitespace-pre-wrap break-words min-h-[4rem]"
        onInput={handleInput}
        onPaste={handlePaste}
      />

      {!disabled && hover && (
        <AnimatePresence>
          {hover && (
            <motion.div
              key="split-cursor"
              initial={{ opacity: 0, scaleY: 0.8 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="pointer-events-none absolute z-50"
              style={{
                left:
                  hover.rect.right - ref.current!.getBoundingClientRect().left,
                top:
                  hover.rect.top -
                  ref.current!.getBoundingClientRect().top +
                  hover.rect.height / 2,
              }}
              aria-label="Split position"
            >
              {/* tiny guide tick */}
              <div className="w-[2px] h-10 bg-blue-500/70 rounded-sm" />

              {/* scissors inside a circular badge */}
              <motion.div
                aria-hidden
                whileHover={{ rotate: [0, -10, 0] }}
                className="-translate-y-1/2 -left-[0.75rem] absolute flex items-center justify-center
                         w-6 h-6 rounded-full bg-gray-200/80 shadow-sm backdrop-blur"
              >
                <Scissors size={14} className="text-gray-700" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
