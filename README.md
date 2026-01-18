# Terco Online

Aplicacao web para rezar o terco com acompanhamento visual, meditacoes e modo de oracao com contas interativas.
Feita para oracao pessoal ou em conjunto, com presenca em tempo real nas bolinhas do terco.

## Stack

- React + Vite
- Firebase Auth
- Firestore (presenca em tempo real)
- Firebase Hosting

## Arquitetura (visao geral)

- UI em React com layouts e estilos em CSS tradicional
- Conteudos em `src/data/textos.js` (cartoes, salmos, meditacoes)
- Autenticacao via Firebase Auth (email/senha)
- Presenca em tempo real via Firestore
- Deploy estatico no Firebase Hosting

## Estrutura de pastas

- `src/components/` componentes de UI e estilos locais
- `src/data/` dados dos terços e meditacoes
- `src/services/` integracoes externas (Firebase)

## Fluxo principal

1) Usuario autentica via Firebase Auth
2) Seleciona um terco no menu
3) O texto aparece no leitor e as bolinhas ficam clicaveis
4) Ao clicar ou avancar, a bolinha ativa atualiza e sincroniza com outros usuarios

## Realtime (presenca)

- Colecao: `presence/global/users/{uid}`
- Cada usuario grava `activeIndex`, `name` e `updatedAt`
- Leitura por todos os usuarios autenticados

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

## Configuracao do tema

- Tema claro e escuro sao definidos em `src/App.css`
- Elementos do terco usam variaveis CSS em `src/components/TercoVisual.css`

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
