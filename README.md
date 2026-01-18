# Terco Online

Aplicacao web para rezar o terco com acompanhamento visual, meditacoes e modo de oracao com contas interativas.

## Stack

- React + Vite
- Firebase Auth
- Firestore (presenca em tempo real)
- Firebase Hosting

## Rodar localmente

1) Instale as dependencias

```bash
npm install
```

2) Rode o app

```bash
npm run dev
```

## Firebase

Este projeto usa Firebase Auth e Firestore.

Crie um `.env.local` com base em `.env.example` e preencha as credenciais:

```bash
cp .env.example .env.local
```

### Presenca em tempo real (bolinhas)

Para mostrar as iniciais nas contas ativas, o app grava em:

```
presence/global/users/{uid}
```

Regras simples de Firestore (ajuste conforme sua necessidade):

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /presence/global/users/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

Se o usuario nao tiver `displayName`, o app usa o email como fallback.

## Deploy no Firebase Hosting

Este repositorio ja tem `firebase.json` e `.firebaserc`.

```bash
npm run build
firebase deploy --only hosting
```

URL padrao:
- `https://terco-online.web.app`
- `https://terco-online.firebaseapp.com`

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
