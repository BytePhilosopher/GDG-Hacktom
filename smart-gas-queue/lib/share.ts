import toast from 'react-hot-toast';

/**
 * Share a link using the Web Share API when available, otherwise fall back to
 * copying the URL to the clipboard. Always gives the user feedback via a toast
 * so the control is never a silent no-op (e.g. on desktop browsers).
 */
export async function shareOrCopy(data: { title?: string; text?: string; url: string }) {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share(data);
      return;
    } catch (err) {
      // User cancelled the share sheet — do nothing.
      if (err instanceof DOMException && err.name === 'AbortError') return;
      // Otherwise fall through to the clipboard fallback.
    }
  }

  try {
    await navigator.clipboard.writeText(data.url);
    toast.success('Link copied to clipboard');
  } catch {
    toast.error('Could not share this link');
  }
}
