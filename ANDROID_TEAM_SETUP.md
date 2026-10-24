# Instalação do Alibe no Android — mensagem para a equipe

## Antes de começar

- Use um aparelho Android físico para testar notificações push.
- O `google-services.json` deve existir na raiz do Frontend. Ele é a configuração pública do app
  Firebase e pode ser versionado.
- **Não compartilhe o JSON da service account Firebase** (`firebase-adminsdk` ou arquivo que tenha
  o campo `private_key`). Essa chave fica cadastrada uma única vez no EAS e não é necessária para
  instalar ou executar o aplicativo.
- O Expo Go não serve para este teste. Use o aplicativo **Alibe** gerado como development build.

## 1. Preparar o projeto no computador

Os comandos abaixo funcionarão para os demais integrantes depois que a branch estiver publicada no
GitHub.

```bash
git clone https://github.com/Alibe-AGES/Frontend.git
cd Frontend
git checkout ALI-89-Infra-das-notificacoes
npm ci
```

Crie `Frontend/.env.local` com o IP do computador na rede local:

```dotenv
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3000
```

Para descobrir o IP:

```bash
# Linux/WSL
hostname -I

# Windows (PowerShell ou Prompt de Comando)
ipconfig
```

Use o IPv4 da rede Wi-Fi/Ethernet, por exemplo `192.168.0.6`. Não use `localhost`, porque no
celular `localhost` significa o próprio celular.

## 2. Gerar o APK de desenvolvimento

Esta etapa deve ser executada por uma pessoa que tenha acesso ao projeto Alibe no Expo/EAS. Um
único APK pode ser compartilhado e instalado pelos demais integrantes da equipe.

Na pasta `Frontend`:

```bash
npx eas-cli@latest login
npx eas-cli@latest whoami
npx eas-cli@latest build --platform android --profile development
```

O último comando envia o projeto ao EAS e gera o APK. Quando terminar, o terminal mostrará a URL
para baixar o arquivo. Caso o terminal tenha sido fechado, recupere a URL com:

```bash
npx eas-cli@latest build:list --platform android --limit 1
```

Copie o endereço exibido em `Application Archive URL`. Esse é o link do APK que pode ser enviado à
equipe. Não envie a chave privada da service account Firebase.

Se aparecer `spawn adb ENOENT` depois de `Successfully downloaded app`, a geração funcionou. Apenas
a instalação automática falhou porque o `adb` não está instalado; use a URL do build no celular.

## 3. Instalar o APK no celular

1. Abra no celular a URL obtida no passo 2.
2. Toque em **Download** ou **Install**.
3. Se o Android solicitar, permita temporariamente a instalação por essa origem.
4. Instale e abra o aplicativo **Alibe**.

O QR Code do Metro não instala o APK. Primeiro instale o APK pelo link; depois use o Metro para
carregar o JavaScript durante o desenvolvimento.

## 4. Iniciar o Backend local completo

Em outro terminal:

```bash
git clone --recurse-submodules https://github.com/Alibe-AGES/Backend.git
cd Backend
git checkout ALI-89-Infra-das-notificacoes
git submodule update --init --recursive
cp .env.template .env
docker compose up --build backend
```

Esse comando também inicia PostgreSQL, MiniStack, SQS e a Lambda Go local. Para ver o consumidor de
notificações:

```bash
docker compose logs -f ministack
```

Antes de abrir o app, confirme pelo navegador do celular:

```text
http://SEU_IP_LOCAL:3000/docs
```

Se essa URL não abrir, o aplicativo também não conseguirá acessar o Backend. Confira se celular e
computador estão na mesma rede e se a porta `3000` está liberada no firewall.

## 5. Iniciar o Frontend com o APK já instalado

Na pasta `Frontend`:

```bash
source /home/SEU_USUARIO/.nvm/nvm.sh
nvm use 22.23.2
npx expo start --dev-client --tunnel --clear
```

Depois:

1. abra o aplicativo **Alibe** já instalado;
2. escaneie o QR Code com a opção de leitura do development build;
3. faça login ou cadastro;
4. aceite a permissão de notificações.

O túnel conecta o app ao Metro, mas não encaminha a API. A API continua sendo acessada pelo IP
definido em `.env.local`.

## 6. Quando gerar outro APK

Repita o passo 2 somente quando houver mudança nativa, como dependência Expo, plugin,
`google-services.json`, package Android ou configuração nativa no `app.config.ts`. Para mudanças
comuns em telas e código TypeScript, reutilize o APK instalado e reinicie somente o Metro.

## 7. Instalar o último APK em um emulador Android

Com um emulador já iniciado pelo Android Studio:

```bash
cd Frontend
npx eas-cli@latest login
npx eas-cli@latest build:run -p android --latest
npx expo start --dev-client --clear
```

O emulador serve para navegação e desenvolvimento geral. O fluxo atual de cadastro do Expo Push
Token ignora emuladores deliberadamente; valide notificações push em aparelho físico.

## 8. Testar a notificação local

1. Entre no Alibe pelo celular físico e aceite notificações.
2. Minimize o aplicativo.
3. Abra `http://localhost:3000/docs` no computador.
4. Execute `POST /api/auth/sign-in/email` com o mesmo usuário.
5. Copie o token da resposta e use **Authorize** no Swagger.
6. Execute `POST /api/users/me/test-notification`.

Resultado esperado: `202 Accepted` e a notificação aparece no celular.

```text
Frontend -> Backend -> SQS no MiniStack -> Lambda Go no MiniStack
         -> Expo Push Service -> Firebase/FCM -> celular
```

## 9. Encerrar sem apagar os dados locais

Na pasta do Backend:

```bash
docker compose down
```

Não use `docker compose down -v`, pois isso apaga os volumes locais.
