import { useEffect } from 'react';

function setMeta(attr, key, value) {
  if (!value) return;
  let node = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!node) {
    node = document.createElement('meta');
    node.setAttribute(attr, key);
    document.head.appendChild(node);
  }
  node.setAttribute('content', value);
}

export function usePageMeta({ title, description, url, image }) {
  useEffect(() => {
    const previous = document.title;
    if (title) document.title = title;
    if (description) {
      setMeta('name', 'description', description);
      setMeta('property', 'og:description', description);
      setMeta('name', 'twitter:description', description);
    }
    if (title) {
      setMeta('property', 'og:title', title);
      setMeta('name', 'twitter:title', title);
    }
    setMeta('property', 'og:type', 'website');
    setMeta('name', 'twitter:card', 'summary_large_image');
    if (url) {
      setMeta('property', 'og:url', url);
      setMeta('name', 'twitter:url', url);
    }
    if (image) {
      setMeta('property', 'og:image', image);
      setMeta('name', 'twitter:image', image);
    }
    return () => {
      document.title = previous;
    };
  }, [title, description, url, image]);
}
