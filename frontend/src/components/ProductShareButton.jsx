'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

function IconShare() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="18" cy="5" r="2.8" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="6" cy="10" r="2.8" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="18" cy="18" r="2.8" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="M8.6 8.7 15.3 5.9M8.6 11.3l6.7 5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M12.02 2C6.49 2 2 6.48 2 12c0 1.95.56 3.85 1.63 5.47L2.6 21.4l4.04-1.02A9.97 9.97 0 0 0 12.02 22C17.53 22 22 17.52 22 12S17.53 2 12.02 2Zm0 18a7.98 7.98 0 0 1-4.08-1.12l-.29-.17-2.4.61.64-2.34-.19-.3A7.96 7.96 0 0 1 4.02 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.58 8-8 8Zm4.42-5.96c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.95-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.48-.4-.42-.54-.43h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.5.58.18 1.1.16 1.52.1.46-.07 1.43-.58 1.63-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.84c0-2.5 1.5-3.89 3.8-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

function IconX() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.61L6.3 22H3.2l7.23-8.27L.8 2h6.4l4.42 5.98L18.9 2Zm-1.1 18h1.73L6.2 3.9H4.35L17.8 20Z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm10.25 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M10.59 13.41a1 1 0 0 1 0-1.41l3-3a3 3 0 1 1 4.24 4.24l-2 2a3 3 0 0 1-4.24 0 1 1 0 0 1 1.41-1.41 1 1 0 0 0 1.42 0l2-2a1 1 0 0 0-1.42-1.42l-3 3a1 1 0 0 1-1.41 0Zm2.82-2.82a1 1 0 0 1 0 1.41l-3 3a3 3 0 1 1-4.24-4.24l2-2a3 3 0 0 1 4.24 0 1 1 0 0 1-1.41 1.41 1 1 0 0 0-1.42 0l-2 2a1 1 0 1 0 1.42 1.42l3-3a1 1 0 0 1 1.41 0Z" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M9.55 17.2 4.8 12.45l1.4-1.4 3.35 3.34 8.25-8.24 1.4 1.4-9.65 9.65Z" />
    </svg>
  );
}

function toINR(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(num);
}

async function safeCopy(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  if (typeof document !== 'undefined') {
    const temp = document.createElement('textarea');
    temp.value = text;
    temp.setAttribute('readonly', '');
    temp.style.position = 'fixed';
    temp.style.left = '-9999px';
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
  }
}

function getSafeUrl(url) {
  if (url && typeof url === 'string' && url.trim()) return url.trim();
  if (typeof window !== 'undefined') return window.location.href;
  return '';
}

export default function ProductShareButton({
  productName,
  productPrice,
  productUrl,
  productImage,
  variant = 'icon',
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [resolvedUrl, setResolvedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [instagramHint, setInstagramHint] = useState('');
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isNativeSharing, setIsNativeSharing] = useState(false);
  const rootRef = useRef(null);

  const formattedPrice = useMemo(() => toINR(productPrice), [productPrice]);

  const shareText = useMemo(() => {
    const pricePart = formattedPrice ? ` - ${formattedPrice}` : '';
    return `${productName}${pricePart}`;
  }, [formattedPrice, productName]);

  const whatsAppMessage = useMemo(() => {
    return encodeURIComponent(resolvedUrl);
  }, [resolvedUrl]);

  useEffect(() => {
    setResolvedUrl(getSafeUrl(productUrl));
  }, [productUrl]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(max-width: 480px)');
    const update = () => setIsMobileViewport(mediaQuery.matches);
    update();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', update);
      return () => mediaQuery.removeEventListener('change', update);
    }

    mediaQuery.addListener(update);
    return () => mediaQuery.removeListener(update);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleOutside = (event) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);

    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!copied) return undefined;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  async function handleNativeShare() {
    if (typeof navigator === 'undefined' || !navigator.share) return false;

    setIsNativeSharing(true);
    try {
      const baseData = {
        title: productName,
        text: shareText,
        url: resolvedUrl,
      };

      await navigator.share(baseData);
      return true;
    } catch (error) {
      if (error && error.name === 'AbortError') return true;
      return false;
    } finally {
      setIsNativeSharing(false);
    }
  }

  function isMobileDevice() {
    if (typeof window === 'undefined') return false;
    const ua = window.navigator.userAgent || '';
    const mobileUA = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(ua);
    return mobileUA || window.matchMedia('(pointer: coarse)').matches;
  }

  async function handleTriggerClick() {
    setInstagramHint('');

    if (isMobileDevice() && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      const shared = await handleNativeShare();
      if (shared) {
        setIsOpen(false);
        return;
      }
    }

    setIsOpen((prev) => !prev);
  }

  async function handleCopyLink() {
    if (!resolvedUrl) return;
    try {
      await safeCopy(resolvedUrl);
      setCopied(true);
      setInstagramHint('');
    } catch {
      setCopied(false);
    }
  }

  function openPopup(url) {
    if (typeof window === 'undefined') return;
    const width = 620;
    const height = 640;
    const left = Math.max(0, (window.screen.width - width) / 2);
    const top = Math.max(0, (window.screen.height - height) / 2);
    window.open(
      url,
      'share-dialog',
      `width=${width},height=${height},left=${left},top=${top},noopener,noreferrer`
    );
  }

  async function handleInstagram() {
    try {
      await safeCopy(resolvedUrl);
      setCopied(true);
      setInstagramHint('Link copied. Instagram opened. Paste in Story or DM.');
    } catch {
      setInstagramHint('Could not copy automatically. Please copy the URL manually.');
    }

    if (typeof window !== 'undefined') {
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
    }
  }

  const triggerLabel = copied ? 'Link copied' : 'Share product';
  const wrapperClass = `psb-root ${className}`.trim();
  const stylesCss = [
    '.psb-root{position:relative;display:inline-flex;align-items:center;}',
    '.psb-trigger{border:1px solid #d6d6d6;background:#fff;color:#121212;border-radius:999px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all .2s ease;}',
    '.psb-trigger:disabled{opacity:.65;cursor:not-allowed;}',
    '.psb-trigger:hover{border-color:#bcbcbc;box-shadow:0 6px 20px rgba(0,0,0,.08);}',
    '.psb-trigger:focus-visible{outline:2px solid #1a73e8;outline-offset:2px;}',
    '.psb-trigger-icon .psb-icon-wrap{width:20px;height:20px;}',
    '.psb-trigger-button{height:40px;min-width:112px;padding:0 14px;gap:8px;border-radius:10px;font-size:14px;font-weight:600;}',
    '.psb-trigger-icon{width:40px;height:40px;padding:0;}',
    '.psb-trigger-minimal{border:none;background:transparent;padding:0;gap:6px;border-radius:8px;font-size:14px;font-weight:600;}',
    '.psb-trigger-minimal:hover{box-shadow:none;color:#0f5fc7;}',
    '.psb-trigger-text{line-height:1;}',
    '.psb-icon-wrap,.psb-action-icon{width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;}',
    '.psb-icon-wrap svg,.psb-action-icon svg,.psb-thumb-fallback svg{width:100%;height:100%;}',
    '.psb-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.35);opacity:0;pointer-events:none;transition:opacity .24s ease;z-index:29;}',
    '.psb-backdrop.psb-visible{opacity:1;pointer-events:auto;}',
    '.psb-panel{position:absolute;top:calc(100% + 10px);right:0;width:min(92vw,340px);background:#fff;border:1px solid #ececec;border-radius:14px;padding:12px;box-shadow:0 14px 40px rgba(0,0,0,.15);opacity:0;transform:translateY(8px) scale(.98);transform-origin:top right;pointer-events:none;transition:opacity .22s ease,transform .22s ease;z-index:30;}',
    '.psb-panel.psb-open{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}',
    '.psb-preview{display:flex;align-items:center;gap:10px;padding:10px;border-radius:12px;background:#f8f8f8;margin-bottom:10px;}',
    '.psb-thumb{width:48px;height:48px;border-radius:10px;object-fit:cover;background:#ededed;flex:0 0 auto;}',
    '.psb-thumb-fallback{display:inline-flex;align-items:center;justify-content:center;color:#616161;}',
    '.psb-preview-text{min-width:0;}',
    '.psb-name{font-size:13px;font-weight:700;color:#151515;line-height:1.25;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}',
    '.psb-price{font-size:13px;color:#0f7a30;font-weight:700;margin-top:4px;}',
    '.psb-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;}',
    '.psb-action{border:1px solid #e7e7e7;background:#fff;border-radius:10px;min-height:42px;padding:9px 10px;display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:#222;cursor:pointer;text-decoration:none;transition:background .2s ease,border-color .2s ease;}',
    '.psb-action:hover{background:#f7f7f7;border-color:#d6d6d6;}',
    '.psb-action:focus-visible{outline:2px solid #1a73e8;outline-offset:2px;}',
    '.psb-copied{color:#15803d;}',
    '.psb-note{margin:10px 2px 2px;font-size:12px;color:#4e4e4e;line-height:1.4;}',
    '@media (max-width: 480px){.psb-panel.psb-sheet{position:fixed;left:0;right:0;bottom:0;top:auto;width:100vw;max-width:100vw;border-radius:16px 16px 0 0;border-bottom:none;transform:translateY(100%);transform-origin:center bottom;padding:14px 14px 18px;box-shadow:0 -8px 32px rgba(0,0,0,.22);z-index:31;}.psb-panel.psb-sheet.psb-open{transform:translateY(0);}.psb-actions{grid-template-columns:1fr;}.psb-action{justify-content:flex-start;min-height:46px;}}',
  ].join('\n');

  return (
    <div className={wrapperClass} ref={rootRef}>
      <button
        type="button"
        className={`psb-trigger psb-trigger-${variant}`}
        onClick={handleTriggerClick}
        aria-label={triggerLabel}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        disabled={isNativeSharing}
      >
        <span className="psb-icon-wrap"><IconShare /></span>
        {variant !== 'icon' && <span className="psb-trigger-text">Share</span>}
      </button>

      <div className={`psb-backdrop ${isOpen && isMobileViewport ? 'psb-visible' : ''}`} onClick={() => setIsOpen(false)} aria-hidden="true" />

      <div className={`psb-panel ${isOpen ? 'psb-open' : ''} ${isMobileViewport ? 'psb-sheet' : ''}`} role="dialog" aria-label="Share product options">
        <div className="psb-preview">
          {productImage ? (
            <Image
              src={productImage}
              alt="Product preview"
              width={48}
              height={48}
              unoptimized
              className="psb-thumb"
            />
          ) : (
            <div className="psb-thumb psb-thumb-fallback" aria-hidden="true"><IconShare /></div>
          )}
          <div className="psb-preview-text">
            <div className="psb-name" title={productName}>{productName}</div>
            {formattedPrice ? <div className="psb-price">{formattedPrice}</div> : null}
          </div>
        </div>

        <div className="psb-actions" role="menu" aria-label="Share destinations">
          <a
            href={`https://wa.me/?text=${whatsAppMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="psb-action"
            role="menuitem"
            aria-label="Share on WhatsApp"
            onClick={() => setIsOpen(false)}
          >
            <span className="psb-action-icon"><IconWhatsApp /></span>
            <span>WhatsApp</span>
          </a>

          <button
            type="button"
            className="psb-action"
            role="menuitem"
            aria-label="Share on Facebook"
            onClick={() => {
              const u = encodeURIComponent(resolvedUrl);
              openPopup(`https://www.facebook.com/sharer/sharer.php?u=${u}`);
              setIsOpen(false);
            }}
          >
            <span className="psb-action-icon"><IconFacebook /></span>
            <span>Facebook</span>
          </button>

          <button
            type="button"
            className="psb-action"
            role="menuitem"
            aria-label="Share on X"
            onClick={() => {
              const text = encodeURIComponent(shareText);
              const u = encodeURIComponent(resolvedUrl);
              openPopup(`https://twitter.com/intent/tweet?text=${text}&url=${u}`);
              setIsOpen(false);
            }}
          >
            <span className="psb-action-icon"><IconX /></span>
            <span>Twitter/X</span>
          </button>

          <button
            type="button"
            className="psb-action"
            role="menuitem"
            aria-label="Share on Instagram"
            onClick={async () => {
              await handleInstagram();
              setIsOpen(false);
            }}
          >
            <span className="psb-action-icon"><IconInstagram /></span>
            <span>Instagram</span>
          </button>

          <button
            type="button"
            className="psb-action"
            role="menuitem"
            aria-label="Copy product link"
            onClick={handleCopyLink}
          >
            <span className={`psb-action-icon ${copied ? 'psb-copied' : ''}`}>{copied ? <IconCheck /> : <IconLink />}</span>
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>

        {instagramHint ? <p className="psb-note">{instagramHint}</p> : null}
      </div>

      <style>{stylesCss}</style>
    </div>
  );
}
