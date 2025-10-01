# OllamaChat

`OllamaChat` is an interactive user interface built with Next.js, React, and TypeScript, designed to interact with local language models via Ollama. This project offers a smooth chat experience with advanced features like audio transcription, voice playback of model responses, and image analysis.

## Overview (desktop & mobile)

<img src="./public/desktop.png" />
<img src="./public/mobile.png" height="400" />

## Features

*   **Chat with Ollama:** Interact with any local LLM available through Ollama.
*   **Multi-Session Management:** Your chat history is saved and organized into distinct sessions.
*   **Import/Export Sessions:** Save and restore your chat sessions in JSON format.
*   **Voice Transcription (STT):** Record your voice to have it transcribed as text input.
*   **Text-to-Speech (TTS):** Model responses are read aloud for a more immersive experience.
*   **Image Analysis:** Attach images to your prompts for vision-capable models to analyze.
*   **Internationalization (i18n):** The interface is available in multiple languages.
*   **Markdown & Collapsible Reasoning:** Responses are rendered in Markdown, with `<think>` tags automatically displayed in a collapsible section.
*   **Customizable System Prompt:** Define a custom system prompt to guide the model's behavior, with presets available.
*   **LLM Capabilities Display:** The UI shows the capabilities of each LLM (e.g., vision) to help you choose the right model.

## Tech Stack

*   **Next.js:** A React framework for building full-stack web applications.
*   **React & TypeScript:** For building the user interface with strong typing.
*   **Mantine:** A React component library for an elegant UI.
*   **React Feather:** For icons.
*   **Ollama JS:** A JavaScript client for interacting with Ollama models.
*   **i18next:** An internationalization framework.

## Architecture

This project is built on the **Next.js App Router**, which uses **Server Components** by default for performance and fetches data on the server. Interactive parts of the UI are explicitly marked as **Client Components** (`'use client'`).

- **Server Actions** (`src/app/actions.ts`) are used to securely fetch data from the Ollama server without exposing it to the client.
- **API Routes** (`src/app/api/`) are used to act as a secure proxy between the client and external backends. This is used for the voice transcription service to avoid CORS issues and hide the backend URL.

## Prerequisites

Before starting, ensure you have the following:

*   **Node.js** (version 18 or higher recommended)
*   **npm** (or another package manager like yarn, pnpm)
*   **A running Ollama server** with your desired models (e.g., `ollama pull mistral`).
*   **A running Python backend for transcription.** The one this UI was designed for is available at [https://github.com/vaccarov/ChatServer](https://github.com/vaccarov/ChatServer).

## Installation and Startup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/vaccarov/OllamaChat
    cd OllamaChat
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure .env.local (can be configured in the app directly):**
    Create a `.env.local` file at the root of the project. This file should **not** be committed to Git. Add the following variables, pointing to the servers you want to use.

    *Example using a local setup:*
    ```env
    NEXT_PUBLIC_OLLAMA_URL=http://localhost:11434
    NEXT_PUBLIC_TRANSCRIBE_URL=http://localhost:8000
    ```

    *Example using a remote or secured setup like with Tailscale and Caddy:*
    ```env
    NEXT_PUBLIC_OLLAMA_URL=https://YOUR_PRIVATE_URL.ts.net/ollama
    NEXT_PUBLIC_TRANSCRIBE_URL=https://YOUR_PRIVATE_URL.ts.net/transcribe
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be accessible at [http://localhost:3000](http://localhost:3000).

## Development Scripts

*   `npm run dev`: Starts the development server.
*   `npm run build`: Compiles the application for production.
*   `npm run start`: Starts the production server.
*   `npm run lint`: Runs ESLint to check for code quality issues.

## Bugfixes and improvements

* Handle large image (use local DB instead of localstorage)
* Show reasoning collapse even if reasoning isn't finished
* The tag <think> is unrecognized in this browser. If you meant to render a React component, start its name with an uppercase letter.
// embedding
https://huggingface.co/tencent/SRPO
https://huggingface.co/openbmb/VoxCPM-0.5B
