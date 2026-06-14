import { hoteDevServeur } from '../../../shared-frontend/hote-dev-serveur';

const h = hoteDevServeur();

export const environment = {
  production: false,
  apiBaseUrl: `http://${h}:3000/api/v1`,
  gatewayUrl: `http://${h}:3000`,
  powDifficulty: 3,
  socketUrl: `http://${h}:3004`,
  socketNamespace: '/messages',
  serviceUrls: {
    user: `http://${h}:3001`,
    product: `http://${h}:3002`,
    order: `http://${h}:3003`,
    messaging: `http://${h}:3004`,
    ai: `http://${h}:3005`,
    pepper: `http://${h}:3006`
  }
};
