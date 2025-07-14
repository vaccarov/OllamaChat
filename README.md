# OllamaChat

`OllamaChat` est une interface utilisateur interactive basée sur React et TypeScript, conçue pour interagir avec des modèles de langage locaux via Ollama et intégrer la transcription vocale en temps réel. Ce projet offre une expérience de chat fluide avec des fonctionnalités avancées comme la transcription audio, la lecture vocale des réponses du modèle, et la gestion des documents.

## Fonctionnalités

*   **Chat avec Ollama :** Interagissez avec des modèles de langage locaux via Ollama.
*   **Import/Export de Sessions :** Sauvegardez et restaurez vos sessions de chat au format JSON, permettant de les partager ou de les archiver facilement.
*   **Transcription Vocale (STT) :** Enregistrez votre voix et faites-la transcrire en texte via un backend dédié (comme `ChatServer`).
*   **Lecture Vocale (TTS) :** Les réponses du modèle sont lues à voix haute pour une expérience plus immersive.
*   **Gestion des Documents :** Joignez des documents à vos requêtes pour que le modèle puisse les analyser.
*   **Interface Réactive :** Conçue avec Mantine pour une expérience utilisateur moderne et agréable.
*   **Typage Fort (TypeScript) :** Le projet est entièrement typé pour une meilleure maintenabilité et détection précoce des erreurs.

## Technologies Utilisées

*   **React :** Bibliothèque JavaScript pour la construction d'interfaces utilisateur.
*   **Vite :** Outil de build rapide pour le développement frontend.
*   **Mantine :** Bibliothèque de composants React pour une UI élégante.
*   **Ollama JS :** Client JavaScript pour interagir avec les modèles Ollama.
*   **Web Speech API :** Pour l'enregistrement audio (`getUserMedia`) et la synthèse vocale (`SpeechSynthesis`).

## Prérequis

Avant de démarrer l'application, assurez-vous d'avoir les éléments suivants :

*   **Node.js (version 18 ou supérieure recommandée)**
*   **npm** ou **Yarn** (gestionnaire de paquets)
*   **Un serveur Ollama en cours d'exécution** avec les modèles de votre choix (ex: `ollama run mistral`).
*   **Le backend `ChatServer` en cours d'exécution** (pour la transcription vocale).

## Installation et Démarrage

Suivez ces étapes pour configurer et lancer l'application :

1.  **Naviguez vers le répertoire du projet :**
    ```bash
    cd ./OllamaChat
    ```

2.  **Installez les dépendances :**
    ```bash
    npm install
    # ou
    yarn install
    ```

3.  **Configurez l'URL du serveur de transcription :**
    Créez un fichier `.env` à la racine du projet (`/Users/victor/Projets/AnswR/OllamaChat/.env`) et ajoutez-y l'URL de votre backend `ChatServer` :
    ```
    VITE_OLLAMA_URL=http://127.0.0.1:11434
    VITE_SERVER_URL=http://127.0.0.1:8000
    ```
    *(Assurez-vous que cette URL correspond à l'adresse où votre `ChatServer` est en cours d'exécution.)*

4.  **Démarrez le serveur de développement :**
    ```bash
    npm run dev
    # ou
    yarn dev
    ```
    L'application sera accessible à `http://localhost:5173` (ou un autre port si spécifié par Vite).

## Utilisation

*   **Sélection du Modèle :** Choisissez le modèle Ollama avec lequel vous souhaitez interagir via le sélecteur en haut.
*   **Saisie de Texte :** Tapez vos questions dans la zone de texte et appuyez sur `Entrée` pour envoyer.
*   **Transcription Vocale :** Cliquez sur l'icône du microphone pour enregistrer votre voix. Le texte transcrit apparaîtra dans la zone de saisie et sera envoyé au modèle.
*   **Lecture Vocale :** Activez/désactivez la lecture des réponses du modèle via l'icône de volume. Si une lecture est en cours, cliquer sur l'icône l'arrêtera.
*   **Ajout de Documents :** Utilisez l'icône de trombone pour joindre un fichier. Son contenu sera ajouté à votre prompt.

## Structure du Projet

*   `src/App.tsx` : Composant racine de l'application.
*   `src/components/` : Contient les composants réutilisables (Chat, Question, LLMPicker, AudioRecorder, etc.).
*   `src/context/` : Gère les contextes React pour le partage d'état (messages, modèle Ollama).
*   `src/hooks/` : Contient les hooks personnalisés (ex: `useTts` pour la synthèse vocale).
*   `src/models/` : Définitions des types TypeScript.
*   `src/utils/` : Fonctions utilitaires.

## Développement

Le projet utilise Vite pour un développement rapide. Les commandes clés sont :

*   `npm run dev` : Démarre le serveur de développement.
*   `npm run build` : Compile l'application pour la production.
*   `npm run lint` : Exécute ESLint pour vérifier le code.
*   `npm run preview` : Prévisualise la version de production.

## Notes

*   En mode développement, vous pourriez observer certains effets de bord (comme des logs en double) dus au `StrictMode` de React. Ces comportements sont normaux et n'affectent pas la version de production.
*   Assurez-vous que votre serveur Ollama est accessible depuis l'URL configurée dans `VITE_OLLAMA_URL` dans votre fichier `.env`.
