
# Exam Revision Bot

Exam Revision Bot is an interactive AI-powered chat application designed to help secondary school students in Nigeria (ages 12–16) prepare for their WAEC (West African Examinations Council) and NECO (National Examinations Council) exams. It offers multiple-choice questions (MCQs) and acts as a friendly tutor to explain various topics.

## Features

*   **Interactive Chat Interface:** User-friendly chat for seamless interaction.
*   **Subject Selection:** Choose from a list of WAEC/NECO subjects.
*   **Multiple-Choice Quizzes:** Get MCQs tailored to the selected subject.
*   **Instant Feedback:** Receive immediate results for quiz answers, along with explanations.
*   **Tutor Mode:** Ask questions on any topic and get clear, concise explanations.
*   **Powered by Google Gemini:** Utilizes the generative AI capabilities of Google's Gemini model.
*   **Responsive Design:** Works across different screen sizes.

## Tech Stack

*   **Frontend:** React, TypeScript
*   **Styling:** Tailwind CSS
*   **AI:** Google Gemini API (`@google/genai`)
*   **Module Loading:** ES Modules (via import maps in `index.html`)

## Project Structure

```
├── README.md               // This file
├── index.html              // Main HTML entry point
├── index.tsx               // Main React application entry point
├── App.tsx                 // Root React component, manages chat state and logic
├── components/             // UI Components
│   ├── ChatMessage.tsx     // Displays individual chat messages
│   ├── OptionButton.tsx    // Renders MCQ option buttons
│   └── SubjectSelector.tsx // Allows users to pick a subject
├── services/
│   └── geminiService.ts    // Handles communication with the Google Gemini API
├── types.ts                // TypeScript type definitions and enums
├── constants.ts            // Global constants (subjects, prompts, API model name)
├── metadata.json           // Application metadata
└── config.example.js       // Example configuration for API key (you'll create config.js)
```

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   A modern web browser with support for ES Modules (e.g., Chrome, Firefox, Edge, Safari).
*   A Google Gemini API Key. You can obtain one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation & Setup

1.  **Clone the repository (if you have it on GitHub):**
    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```
    If you just have the files locally, navigate to the project directory.

2.  **Configure your API Key:**
    The application needs your Google Gemini API key to function. Since this is a client-side application and `process.env.API_KEY` (a Node.js concept) won't work directly in the browser, we'll use a local configuration file:

    *   Create a file named `config.js` in the root directory of the project.
    *   Copy the content from `config.example.js` into `config.js`.
    *   Replace `"YOUR_GOOGLE_GEMINI_API_KEY_HERE"` with your actual Google Gemini API key.

    **`config.js` (This file should NOT be committed to Git):**
    ```javascript
    // This file is NOT committed to Git.
    // Create this file in the root of your project and add your API key.
    window.APP_CONFIG = {
      GEMINI_API_KEY: "YOUR_GOOGLE_GEMINI_API_KEY_HERE"
    };
    ```

    *   **Important:** Ensure `config.js` is listed in your `.gitignore` file to prevent accidentally committing your API key. If you don't have a `.gitignore` file, create one in the root directory and add `config.js` to it:
        ```
        # .gitignore
        config.js
        node_modules/
        # Add other files/folders to ignore as needed
        ```

3.  **No build step needed:**
    This project uses ES Modules and direct script includes, so no `npm install` or build process is required for the current setup.

### Running the Application

1.  **Open `index.html` in your browser:**
    Simply open the `index.html` file located in the root of the project directory with your web browser.
    *   You might want to use a simple local web server (like VS Code's "Live Server" extension or `npx serve .`) for a better development experience, as some browser features work more reliably when files are served over HTTP rather than `file:///` protocol.

## How to Use

1.  When the app loads, you'll be greeted by the **Exam Revision Bot**.
2.  You can choose to:
    *   Type "quiz" or "start quiz" to begin a multiple-choice quiz.
    *   Type any question or topic you want to understand, and the bot will switch to tutor mode to explain it.
3.  **Quiz Mode:**
    *   If you choose "quiz", you'll be prompted to select a subject.
    *   Click on a subject button.
    *   The bot will present a question with multiple options.
    *   Click on an option to answer.
    *   You'll receive immediate feedback and an explanation.
    *   After answering, you can type "next" for another question in the same subject, "subjects" to pick a new subject, or ask any other question to switch to tutor mode.
4.  **Tutor Mode:**
    *   Ask any academic question related to WAEC/NECO subjects.
    *   The bot will provide an explanation.

## API Key Security

*   **Client-Side Exposure:** The `config.js` method makes the API key accessible in the client-side JavaScript. While necessary for this type of local, serverless setup, be aware that anyone inspecting your browser's developer tools can see it if they have access to your running local instance.
*   **DO NOT DEPLOY PUBLICLY WITH THIS METHOD:** If you deploy this application to a public web server, you **MUST NOT** include your API key directly in the client-side code.
*   **Recommended Production Approach:** For a production environment, you should implement a backend proxy. Your frontend application would make requests to your backend, and your backend server (where the API key is securely stored as an environment variable) would then make requests to the Google Gemini API. This keeps your API key safe. If you transition this project to Next.js (as per the initial full-stack idea), Next.js API Routes are ideal for this.

## Future Enhancements

*   User accounts and progress tracking.
*   Timed quizzes.
*   More diverse question types (e.g., fill-in-the-blanks).
*   Ability to review past quiz performance.
*   Integration with learning resources.
*   Transition to a full-stack Next.js application for better API key management and scalability.

---

Happy studying!
