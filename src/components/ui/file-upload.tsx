import { useRef, useState, type DragEvent, type ReactNode } from "react";
import { FileUp, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { faFileSize } from "@/lib/booking/fa";

export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  onFiles?: (files: File[]) => void;
  onAdd?: (files: File[]) => void;
  showList?: boolean;
  hint?: ReactNode;
  className?: string;
}

/** آپلود فایل. برگرفته از وایب‌فارسی: ناحیه رها کردن، حجم فارسی، حذف. */
export function FileUpload({ accept, multiple = true, maxSize, onFiles, onAdd, showList = true, hint, className }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [over, setOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function add(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list);
    const tooBig = maxSize ? incoming.find((file) => file.size > maxSize) : undefined;
    if (tooBig) {
      setError(`«${tooBig.name}» بزرگ‌تر از ${faFileSize(maxSize!)} است.`);
      return;
    }
    setError(null);
    const picked = multiple ? incoming : incoming.slice(0, 1);
    if (!showList) {
      onAdd?.(picked);
      return;
    }
    const next = multiple ? [...files, ...picked] : picked;
    setFiles(next);
    onFiles?.(next);
  }

  function onDragOver(event: DragEvent) {
    event.preventDefault();
    setOver(true);
  }

  return (
    <div className={cn("space-y-2", className)}>
      <label
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={onDragOver}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setOver(false);
          add(event.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed p-6 text-center transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade/60",
          over ? "border-ink bg-paper-deep" : "border-line bg-card hover:bg-paper",
        )}
      >
        <FileUp className="size-5 text-muted" />
        <p className="text-sm">
          فایل را این‌جا رها کنید یا <span className="font-medium underline underline-offset-4">انتخاب کنید</span>
        </p>
        {hint ? <p className="text-xs text-muted">{hint}</p> : null}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={(event) => {
            const input = event.currentTarget;
            add(input.files);
            queueMicrotask(() => {
              input.value = "";
            });
          }}
        />
      </label>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
      {showList && files.length > 0 ? (
        <ul className="divide-y divide-line rounded-xl border border-line">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} className="flex items-center gap-2 px-3 py-2 text-xs">
              <span className="min-w-0 flex-1 truncate" dir="auto">{file.name}</span>
              <span className="shrink-0 text-muted">{faFileSize(file.size)}</span>
              <button
                type="button"
                aria-label="حذف"
                onClick={() => {
                  const next = files.filter((_, item) => item !== index);
                  setFiles(next);
                  onFiles?.(next);
                }}
                className="rounded p-0.5 text-muted hover:text-ink"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
