import { useRef, useState } from "react";

interface Props {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export default function FileDropzone({ onFile, disabled }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  function pick(files: FileList | null) {
    if (files && files[0] && !disabled) onFile(files[0]);
  }

  return (
    <div
      className={`drop ${over ? "over" : ""}`}
      role="button"
      tabIndex={0}
      onClick={() => input.current?.click()}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files); }}
    >
      <strong>Drop a file here, or tap to choose one</strong>
      The file stays on your device. Only its fingerprint is sent.
      <input ref={input} type="file" hidden onChange={(e) => pick(e.target.files)} />
    </div>
  );
}
