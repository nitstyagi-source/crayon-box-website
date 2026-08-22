import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Crayon Box School ERP',
    short_name: 'Crayon Box',
    description: 'Common Role-Based Mobile ERP for Crayon Box School',
    start_url: '/mobile',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#0f172a',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    shortcuts: [
      {
        name: 'Mark Attendance',
        short_name: 'Attendance',
        description: 'Mark student attendance in 1 tap',
        url: '/mobile/attendance',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Pay Fees',
        short_name: 'Fees',
        description: 'View and pay school fee invoices',
        url: '/mobile/fees',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Live Classroom',
        short_name: 'Live Stream',
        description: 'Watch authorized live classroom feed',
        url: '/mobile/live-stream',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Scan QR Code',
        short_name: 'QR Scanner',
        description: 'Scan ID, visitor and boarding passes',
        url: '/mobile/qr-scanner',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
    ],
  };
}
