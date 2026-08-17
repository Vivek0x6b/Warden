import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import playbookMarkdown from "../data/playbook.md?raw"

export default function PlaybookView({ onClose }) {
  return (
    <div className="h-full overflow-y-auto px-8 py-7">
      <div className="flex items-center justify-between mb-6">
        <p className="text-[11.5px] text-[var(--text-muted)] uppercase tracking-wide">Playbook</p>
        <button onClick={onClose} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          Close ✕
        </button>
      </div>
      <article className="prose prose-sm max-w-none playbook-prose">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{playbookMarkdown}</ReactMarkdown>
      </article>
    </div>
  )
}