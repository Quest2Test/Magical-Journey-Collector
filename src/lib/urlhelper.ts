/**
 * Returns the site URL for redirects, ensuring it works in both local development and production.
 */
export function getURL(path: string = "") {
  let url = import.meta.env.VITE_SITE_URL ?? 
            import.meta.env.VITE_VERCEL_URL ?? 
            (import.meta.env.DEV ? 'http://localhost:5173/' : 'https://lorbound.ink/');
  
  // Make sure to include `https://` if not present
  url = url.includes('http') ? url : `https://${url}`;
  // Make sure to include a trailing slash
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
  
  // Append the path if provided, removing any leading slash from the path
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  return `${url}${cleanPath}`;
}
