"use client"

import type React from "react"
import { useState } from "react"
import { Copy, Check, AlertTriangle, ExternalLink } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Alert, AlertDescription } from "./ui/alert"

const FirestoreSetup: React.FC = () => {
  const [copiedRule, setCopiedRule] = useState<string | null>(null)

  const securityRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Posts collection rules
    match /posts/{postId} {
      // Anyone authenticated can read posts
      allow read: if request.auth != null;
      
      // Only authenticated users can create posts
      // The authorId must match the authenticated user's ID
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.authorId;
      
      // Only the post author can update or delete their posts
      allow update, delete: if request.auth != null 
        && request.auth.uid == resource.data.authorId;
    }
    
    // Comments collection rules
    match /comments/{commentId} {
      // Anyone authenticated can read comments
      allow read: if request.auth != null;
      
      // Only authenticated users can create comments
      // The authorId must match the authenticated user's ID
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.authorId;
      
      // Only the comment author can delete their comments
      allow delete: if request.auth != null 
        && request.auth.uid == resource.data.authorId;
    }
  }
}`

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopiedRule(type)
    setTimeout(() => setCopiedRule(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="shadow-xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl transition-colors duration-300">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-8 h-8 text-orange-500" />
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Firestore Setup Required
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Configure your Firestore database to enable the blog functionality
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Permission Denied Error:</strong> Your Firestore database needs security rules to allow
                authenticated users to read and write data.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Step 1: Open Firebase Console</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Go to your Firebase project console and navigate to Firestore Database.
              </p>
              <Button
                onClick={() => window.open("https://console.firebase.google.com/", "_blank")}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Firebase Console</span>
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Step 2: Configure Security Rules
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                In the Firestore console, go to the "Rules" tab and replace the existing rules with the following:
              </p>

              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{securityRules}</code>
                </pre>
                <Button
                  onClick={() => copyToClipboard(securityRules, "rules")}
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  {copiedRule === "rules" ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Step 3: Publish Rules</h3>
              <p className="text-gray-600 dark:text-gray-300">
                After pasting the rules, click the "Publish" button in the Firebase console to apply them.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Step 4: Create Database (if needed)
              </h3>
              <p className="text-gray-600 dark:text-gray-300">If you haven't created a Firestore database yet:</p>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                <li>Go to Firestore Database in Firebase Console</li>
                <li>Click "Create database"</li>
                <li>Choose "Start in test mode" (we'll secure it with the rules above)</li>
                <li>Select your preferred location</li>
                <li>Click "Done"</li>
              </ol>
            </div>

            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>What these rules do:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Allow authenticated users to read all posts and comments</li>
                  <li>Allow users to create posts and comments (with proper author attribution)</li>
                  <li>Only allow users to edit/delete their own content</li>
                  <li>Prevent unauthorized access and data tampering</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="pt-4 border-t border-gray-200">
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                I've Set Up the Rules - Reload App
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default FirestoreSetup
