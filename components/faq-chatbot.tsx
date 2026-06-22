"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Bot, Send, Sparkles, Trash2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { categories, faqData } from "@/lib/faq-data"
import { getResponse, suggestQuestions } from "@/lib/nlp"
import { cn } from "@/lib/utils"

type Message = {
  id: string
  role: "user" | "bot"
  text: string
  category?: string
  score?: number
  matched?: boolean
  suggestions?: string[]
}

const WELCOME: Message = {
  id: "welcome",
  role: "bot",
  text: "Hi! I'm your FAQ assistant. Ask me anything about your account, billing, shipping, or technical support.",
}

const STARTER_PROMPTS = [
  "How do I reset my password?",
  "What payment methods do you accept?",
  "Do you ship internationally?",
  "Is my data secure?",
]

export function FaqChatbot() {
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState("")
  const [category, setCategory] = useState("All")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, isTyping])

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text: trimmed }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    // Simulate a short "thinking" delay for a natural chat feel.
    setTimeout(() => {
      const result = getResponse(trimmed, 0.15, category)
      const suggestions = !result.matched
        ? suggestQuestions(trimmed, 3, category).map((s) => s.question)
        : undefined

      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: "bot",
        text: result.answer,
        category: result.matched ? result.category : undefined,
        score: result.score,
        matched: result.matched,
        suggestions,
      }
      setMessages((prev) => [...prev, botMsg])
      setIsTyping(false)
    }, 450)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    send(input)
  }

  function clearChat() {
    setMessages([WELCOME])
  }

  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-3xl flex-col">
      {/* Header */}
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-tight">FAQ Assistant</h1>
            <p className="text-xs text-muted-foreground">NLP-powered support chatbot</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={clearChat} className="text-muted-foreground">
          <Trash2 className="mr-1.5 h-4 w-4" />
          Clear
        </Button>
      </header>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 border-b border-border px-4 py-2.5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              category === cat
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="flex h-full flex-col gap-4 px-4 py-6">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} onSuggestionClick={send} />
          ))}

          {/* Starter prompts (only on fresh chat) */}
          {messages.length === 1 && (
            <div className="mt-2 flex flex-col gap-2">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                Try asking
              </p>
              <div className="flex flex-wrap gap-2">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => send(prompt)}
                    className="rounded-lg border border-border bg-card px-3 py-2 text-left text-sm text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isTyping && <TypingIndicator />}
        </div>
      </ScrollArea>

      {/* Composer */}
      <form onSubmit={handleSubmit} className="border-t border-border p-4">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1"
            aria-label="Type your question"
          />
          <Button type="submit" size="icon" disabled={!input.trim()} aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {faqData.length} FAQs loaded · Matching with TF-IDF + cosine similarity
        </p>
      </form>
    </div>
  )
}

function MessageBubble({
  message,
  onSuggestionClick,
}: {
  message: Message
  onSuggestionClick: (text: string) => void
}) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex items-start gap-2.5", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className={cn("flex max-w-[80%] flex-col gap-1.5", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "rounded-tr-sm bg-primary text-primary-foreground"
              : "rounded-tl-sm bg-muted text-foreground",
          )}
        >
          {message.text}
        </div>

        {/* Match metadata */}
        {!isUser && message.matched && (
          <div className="flex items-center gap-2 px-1">
            {message.category && (
              <Badge variant="secondary" className="text-[10px]">
                {message.category}
              </Badge>
            )}
            {typeof message.score === "number" && (
              <span className="text-[10px] text-muted-foreground">
                {Math.round(message.score * 100)}% match
              </span>
            )}
          </div>
        )}

        {/* Suggestions for unmatched queries */}
        {!isUser && message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-1 flex flex-col gap-1.5">
            <p className="px-1 text-xs text-muted-foreground">Did you mean:</p>
            {message.suggestions.map((s) => (
              <button
                key={s}
                onClick={() => onSuggestionClick(s)}
                className="rounded-lg border border-border bg-card px-3 py-1.5 text-left text-xs text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
      </div>
    </div>
  )
}
