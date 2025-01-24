"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

export default function Home() {
  const [email, setEmail] = useState("");
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if email exists in localStorage
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setEmail(storedEmail);
      setIsEmailSubmitted(true);
    }
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Store email in Supabase
      const { error: supabaseError } = await supabase
        .from("emailg")
        .insert([{ email: email }]);

      if (supabaseError) throw supabaseError;

      // If successful, store in localStorage and update state
      localStorage.setItem("userEmail", email);
      setIsEmailSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to store email");
      console.error("Error storing email:", err);
    }
  };

  const handleTextOperation = async (operation: string) => {
    if (!text.trim()) {
      setError("Please enter some text first");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/process-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, operation }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process text");
      }

      setResult(data.result);
    } catch (err: any) {
      setError(err.message || "Failed to process text");
      console.error("Error processing text:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isEmailSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="max-w-md w-full space-y-8 p-8 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h2 className="text-center text-3xl font-bold text-black">
            Welcome to QuickGrammar
          </h2>
          <form onSubmit={handleEmailSubmit} className="mt-8 space-y-6">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Enter your email"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-white">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-black">Text Tools</h1>
            <p className="text-sm text-gray-600">{email}</p>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 bg-white"
            placeholder="Enter your text here..."
          />

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <div className="grid grid-cols-2 gap-4 mt-4 sm:grid-cols-4">
            {["Summarize", "Fix Grammar", "Rewrite", "Enlarge"].map((op) => (
              <button
                key={op}
                onClick={() =>
                  handleTextOperation(
                    op === "Fix Grammar" ? "grammar" : op.toLowerCase()
                  )
                }
                disabled={isLoading}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed border border-transparent"
              >
                {isLoading ? "Processing..." : op}
              </button>
            ))}
          </div>
        </div>

        {result && (
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold text-black mb-4">Result</h2>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-gray-800 whitespace-pre-wrap">{result}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
