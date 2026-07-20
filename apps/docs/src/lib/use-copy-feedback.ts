import { useRef, useState } from 'react';
import { writeClipboard } from './clipboard';

/** Shared click-to-copy feedback: transient `copied` key for visual state,
 *  plus an aria-live announcement. A zero-width-space toggle forces a DOM
 *  mutation on repeat copies so screen readers re-announce identical
 *  messages (live regions only fire on mutation). */
export function useCopyFeedback() {
  const [copied, setCopied] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const timer = useRef<number | undefined>(undefined);
  const nonce = useRef(0);

  const copy = async (key: string, text: string, successMessage: string) => {
    const ok = await writeClipboard(text);
    nonce.current += 1;
    const mutationPad = nonce.current % 2 ? '​' : '';
    setCopied(ok ? key : null);
    setAnnouncement((ok ? successMessage : 'Copy failed — clipboard unavailable') + mutationPad);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(null), 1200);
  };

  return { copied, announcement, copy };
}
