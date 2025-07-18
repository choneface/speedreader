import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import { Scissors } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type Section = { id: string; text: string };

const make = (txt: string): Section => ({
  id: crypto.randomUUID(), // any uid generator works
  text: txt,
});

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
  const [sections, setSections] = useState<Section[]>(
    initialSections.map(make),
  );

  /* bubble up */
  useEffect(
    () => onSectionsChange?.(sections.map((s) => s.text)),
    [sections, onSectionsChange],
  );

  // Always ensure a blank section at the end and never more than one
  useEffect(() => {
    // Remove extra blank sections at the end
    let n = sections;
    while (
      n.length > 1 &&
      n[n.length - 1].text === "" &&
      n[n.length - 2].text === ""
    ) {
      n = n.slice(0, -1);
    }
    // Ensure a blank section at the end
    if (n.length === 0 || n[n.length - 1].text !== "") {
      n = [...n, make("")];
    }
    if (n !== sections) {
      setSections(n);
    }
  }, [sections]);

  /* helpers */
  const update = useCallback((i: number, v: string) => {
    setSections((p) => {
      let n = [...p];
      n[i] = { ...n[i], text: v };
      // Ensure a blank section at the end if editing the last section
      if (i === n.length - 1 && v !== "") {
        n.push(make(""));
      }
      // Remove extra blank sections at the end if needed
      while (
        n.length > 1 &&
        n[n.length - 1].text === "" &&
        n[n.length - 2].text === ""
      ) {
        n = n.slice(0, -1);
      }
      return n;
    });
  }, []);

  const split = useCallback((i: number, ...parts: string[]) => {
    setSections((prev) => {
      const n = [...prev];
      n.splice(i, 1, ...parts.map(make)); // new ids for new pieces
      return n;
    });
  }, []);

  const mergeUp = useCallback((i: number) => {
    setSections((p) => {
      if (i === 0) return p;
      const n = [...p];
      n[i - 1] = {
        ...n[i - 1],
        text: (n[i - 1].text + " " + n[i].text).trim(),
      };
      n.splice(i, 1);
      return n;
    });
  }, []);

  return (
    <div className="flex flex-col gap-2 w-full">
      {sections.map((sec, i) => {
        const done = completed.includes(i);
        // Do not show delete button on the last buffer section
        const isLast = i === sections.length - 1;
        return (
          <React.Fragment key={sec.id}>
            <SectionEditor
              value={sec.text}
              disabled={done}
              showDelete={i > 0 && !completed.includes(i - 1) && !isLast}
              onChange={(v) => update(i, v)}
              onSplit={(parts) => split(i, ...parts)}
              onDelete={() => mergeUp(i)}
            />
            {i < sections.length - 1 && (
              <div className="w-full flex justify-center text-2xl opacity-60 select-none">
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
// 3. Update SectionEditorProps and SectionEditor
interface SectionEditorProps {
  value: string;
  disabled?: boolean;
  showDelete: boolean;
  onChange(v: string): void;
  onSplit(parts: string[]): void;
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

  useLayoutEffect(() => {
    if (ref.current && ref.current.innerText !== value) {
      ref.current.innerText = value;
    }
  }, [value]);

  // 4. Update handleInput to auto-split on newlines
  const handleInput = () => {
    if (disabled || !ref.current) return;
    let val = ref.current.innerText;
    // Remove leading/trailing newlines
    val = val.replace(/^\n+|\n+$/g, "");
    // Find first sequence of newlines
    const match = val.match(/^(.*?)(\n+)(.+)$/s);
    if (match && match[1].trim() && match[3].trim()) {
      // Content on both sides, split into two sections, discard newlines
      const parts = [match[1].trim(), match[3].trim()];
      onSplit(parts);
    } else {
      onChange(val);
    }
  };

  // 5. Update handlePaste to auto-split on newlines
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    let txt = e.clipboardData.getData("text/plain");
    // Discard leading newlines
    txt = txt.replace(/^\n+/, "");
    if (txt.includes("\n")) {
      // Remove empty sections from consecutive newlines
      const parts = txt
        .split(/\n/g)
        .map((s) => s.trim())
        .filter(Boolean);
      onSplit(parts);
    } else {
      document.execCommand("insertText", false, txt);
    }
  };

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
    onSplit([before, after]);
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
