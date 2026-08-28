"use client";

import { useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { T } from "@/lib/i18n";
import { stashFiles } from "@/lib/ai/files";

function bytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

const QUEUED: Record<string, { en: string; th: string }> = {
  assemble: { en: "Attached to matter", th: "แนบกับเรื่องแล้ว" },
  review: { en: "Queued for review", th: "เข้าคิวตรวจ" },
  xray: { en: "Queued for X-Ray", th: "เข้าคิว X-Ray" },
  holistic: { en: "Linked to analysis", th: "ผูกกับการวิเคราะห์" },
  diligence: { en: "OCR queued", th: "เข้าคิว OCR" },
  negotiate: { en: "Round file received", th: "รับไฟล์รอบเจรจา" },
  obligations: { en: "Evidence filed", th: "เก็บเป็นหลักฐาน" },
};

export function Dropzone({
  bucket,
  title,
  hint,
  accept = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.msg,.eml,.png,.jpg",
  multiple = true,
  compact = false,
  onAfter,
}: {
  bucket: string;
  title: ReactNode;
  hint: ReactNode;
  accept?: string;
  multiple?: boolean;
  compact?: boolean;
  onAfter?: () => void;
}) {
  const s = useStore();
  const [drag, setDrag] = useState(false);
  const files = s.uploads.filter((u) => u.bucket === bucket);
  const queued = QUEUED[bucket] || QUEUED.review;
  const th = s.lang === "th";

  function take(list: FileList | null) {
    if (!list || list.length === 0) return;
    const arr = Array.from(list);
    stashFiles(bucket, arr);
    s.addUploads(bucket, arr.map((f) => ({ name: f.name, size: f.size })));
    s.flash(th
      ? `รับเข้า ${list.length} ไฟล์ — ${queued.th}`
      : `${list.length} file(s) ingested — ${queued.en}`);
    onAfter?.();
  }

  return (
    <div className={compact ? "dropzone-wrap compact" : "dropzone-wrap"}>
      <label
        className={`dropzone${drag ? " drag" : ""}${compact ? " compact" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); take(e.dataTransfer.files); }}
      >
        <div className="dropzone-title">{title}</div>
        <p className="dropzone-hint">{hint}</p>
        <input type="file" multiple={multiple} accept={accept} onChange={(e) => take(e.target.files)} />
      </label>
      {files.length > 0 && (
        <div className="dropzone-list">
          {files.map((u, i) => (
            <div key={`${u.name}-${i}`} className="dropzone-row">
              <span>{u.name}</span>
              <span className="text-muted" style={{ fontSize: 12 }}>{bytes(u.size)}</span>
              <span className="tag tag-accent">
                {bucket === "xray" && s.xrayReady
                  ? (th ? "วางแผนที่แล้ว" : "Mapped")
                  : (th ? queued.th : queued.en)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function DropHint({ n }: { n: number }) {
  if (!n) return null;
  return <span className="tag tag-accent">+{n} <T en="this session" th="รอบนี้" /></span>;
}
