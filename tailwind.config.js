/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,ts,jsx,tsx}", // Adjust this path based on your project structure
      "./components/**/*.{js,ts,jsx,tsx}",
      "./app/**/*.{js,ts,jsx,tsx}", // For Next.js or app-directory based projects
    ],
    theme: {
      extend: {
        colors: {
          primary: '#1e40af',     // Blue
          secondary: '#9333ea',   // Purple
          accent: '#10b981',      // Optional accent color (green)
        },
      },
    },
    plugins: [
      require("tailwindcss-animate"), // For animations used in shadcn/ui components
    ],
  }
  