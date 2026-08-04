# React Chat App 🚀

A modern, ultra-fast real-time messaging application built with React, Vite, and Supabase. Features a stunning dark neon cyber aesthetic, seamless real-time syncing, and a fully responsive design.

## ✨ Features

- **Real-time Messaging**: Instant message delivery powered by Supabase realtime subscriptions with zero latency sync.
- **File Sharing**: Share photos, documents, and attachments seamlessly, stored securely via Supabase Storage.
- **Rich Expressiveness**: Express yourself with built-in emoji pickers and reactions for every message.
- **Contact Management**: Discover friends by username, manage contacts, or save personal notes.
- **Secure Authentication**: Robust email/password authentication backed by Supabase Auth with encrypted data handling.
- **Stunning UI/UX**: 100% responsive dark neon cyber design optimized for desktop, tablet, and mobile devices with interactive glassmorphism elements.

## 🛠️ Tech Stack

- **Frontend Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime, Storage)

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.
You will also need a Supabase project set up.

### Installation

1. **Clone the repository** (if applicable) and navigate to the project directory:
   ```bash
   cd react-chat
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root of your project and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## 📁 Project Structure

- `src/components/`: UI components including the Dashboard, Auth modal, Landing Page, and Settings.
- `src/styles.css`: Global styles containing the dark neon theme variables, glassmorphism utilities, and animations.
- `src/App.jsx`: Main application entry point managing global state and routing logic (Landing vs. Dashboard).
- `src/supabaseClient.js`: Supabase client initialization.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
