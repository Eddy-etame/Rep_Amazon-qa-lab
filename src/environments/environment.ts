export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/api/v1',
  gatewayUrl: 'http://localhost:3000',
  powDifficulty: 3,
  socketUrl: 'http://localhost:3004',
  socketNamespace: '/messages',
  serviceUrls: {
    user: 'http://localhost:3001',
    product: 'http://localhost:3002',
    order: 'http://localhost:3003',
    messaging: 'http://localhost:3004',
    ai: 'http://localhost:3005',
    pepper: 'http://localhost:3006'
  }
};
