import pkg from '../../../package.json';

function formatAppName(name: string) {
  return name
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export const APP_NAME = formatAppName(pkg.name || 'Nimbus');
export const APP_VERSION = pkg.version || '0.0.0';
export const COPYRIGHT = `© ${new Date().getFullYear()} ${APP_NAME}`;
