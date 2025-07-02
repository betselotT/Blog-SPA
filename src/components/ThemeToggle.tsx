"use client"

import type React from "react"
import { Sun, Moon } from "lucide-react"
import { Button } from "./ui/button"
import { useTheme } from "../contexts/ThemeContext"

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size="sm"
      className="relative overflow-hidden bg-transparent border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
    >
      <div className="relative flex items-center space-x-2">
        <Sun
          className={`w-4 h-4 transition-all duration-300 ${
            theme === "light" ? "text-yellow-500 scale-100" : "text-gray-400 scale-75"
          }`}
        />
        <div
          className={`w-8 h-4 bg-gray-200 dark:bg-gray-700 rounded-full relative transition-all duration-300 ${
            theme === "dark" ? "bg-blue-600" : ""
          }`}
        >
          <div
            className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all duration-300 shadow-sm ${
              theme === "dark" ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </div>
        <Moon
          className={`w-4 h-4 transition-all duration-300 ${
            theme === "dark" ? "text-blue-400 scale-100" : "text-gray-400 scale-75"
          }`}
        />
      </div>
    </Button>
  )
}

export default ThemeToggle
