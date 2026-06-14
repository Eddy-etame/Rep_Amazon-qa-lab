# Guide de lecture — app `qa-lab`

Petite app Angular qui sert à **tester l'API via la gateway** sans dérouler tout le
parcours boutique. Elle reproduit, écran par écran, ce que fait la suite de
régression backend (`npm run test:gateway-suite`), mais dans le navigateur — ce qui
permet de **montrer en direct** que la PoW, l'auth et les routes fonctionnent.

## Le chemin d'un appel

Comme les autres apps : un écran appelle `service-client-api.ts`, qui passe par la
gateway en ajoutant la **preuve de travail** (`service-pow.ts`) et l'empreinte
(`fingerprint.ts`). L'URL de la gateway est centralisée dans `gateway-url.ts`.

## Carte des dossiers (`src/app/`)

### `core/`
| Fichier | Rôle |
|---------|------|
| `services/service-client-api.ts` | Client HTTP unique vers la gateway. |
| `services/service-pow.ts` | Calcule la preuve de travail. |
| `utils/crypto.ts`, `utils/fingerprint.ts`, `utils/gateway-url.ts` | Hash, empreinte client, URL de base. |

### `pages/` — un écran de test par domaine
| Page | Teste |
|------|-------|
| `sante` | Santé de la gateway et des services (`/health/aggregate`). |
| `auth` | Inscription / connexion / `me`. |
| `otp`, `reinitialisation` | Vérification OTP et réinitialisation de mot de passe. |
| `produits` | Catalogue (`GET /produits`). |
| `commandes` | Création/lecture de commandes. |
| `messagerie` | Envoi/lecture de messages. |
| `ia` | Recommandations IA + `bot/auth`. |
| `execution-complete` | « Run all » : enchaîne tous les tests d'affilée. |

## À retenir pour la démo
Lancer `ng serve` (port **4202**), ouvrir l'écran **`execution-complete`** et cliquer
sur « tout exécuter » : c'est la façon la plus rapide de prouver que la chaîne
PoW → gateway → services → bases répond correctement.
