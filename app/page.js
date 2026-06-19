"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import Fuse from "fuse.js";
import {
  FileText,
  Plus,
  Trash2,
  Eye,
  Edit3,
  Menu,
  X,
  Moon,
  Sun,
  User,
  LogOut,
  Wifi,
  WifiOff,
  Loader2,
  Search,
  Tag,
  Download,
  Copy,
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  Image as ImageIcon,
  Link,
} from "lucide-react";
import { useNotes } from "../lib/useNotes";

export default function Home() {
  const {
    notes,
    activeNoteId,
    setActiveNoteId,
    addNote,
    updateNote,
    deleteNote,
    isOnline,
    user,
    signUp,
    signIn,
    signOut: originalSignOut,
    resetPassword,
    continueWithoutSignIn,
    loading,
  } = useNotes();

  const signOut = async () => {
    setEmail("");
    setPassword("");
    setAuthError("");
    setResetSuccess("");
    setAuthMode("login");
    await originalSignOut();
  };
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      return saved ? JSON.parse(saved) : true;
    }
    return true;
  });
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState(null);
  const [newTagInput, setNewTagInput] = useState("");
  const textareaRef = useRef(null);

  // Save dark mode to localStorage
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const fuse = useMemo(
    () =>
      new Fuse(notes, {
        keys: ["title", "content"],
        threshold: 0.3,
      }),
    [notes],
  );

  const allTags = useMemo(() => {
    const tags = new Set();
    notes.forEach((note) => {
      (note.tags || []).forEach((tag) => tags.add(tag));
    });
    return Array.from(tags);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    let result = notes;
    if (searchQuery.trim()) {
      result = fuse.search(searchQuery).map((result) => result.item);
    }
    if (activeTag) {
      result = result.filter((note) => (note.tags || []).includes(activeTag));
    }
    return result;
  }, [notes, searchQuery, fuse, activeTag]);

  const activeNote = notes.find((note) => note.id === activeNoteId) || notes[0];

  const addTag = (tag) => {
    if (!tag.trim() || (activeNote.tags || []).includes(tag)) return;
    updateNote(activeNote.id, { tags: [...(activeNote.tags || []), tag] });
  };

  const removeTag = (tag) => {
    updateNote(activeNote.id, {
      tags: (activeNote.tags || []).filter((t) => t !== tag),
    });
  };

  const exportMarkdown = () => {
    const content = `# ${activeNote?.title || "Untitled"}\n\n${activeNote?.content || ""}`;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeNote?.title || "untitled"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyHTML = async () => {
    const div = document.createElement("div");
    div.innerHTML = document.querySelector(".prose")?.innerHTML || "";
    const text = div.innerText;
    const html = div.innerHTML;
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/plain": new Blob([text], { type: "text/plain" }),
        "text/html": new Blob([html], { type: "text/html" }),
      }),
    ]);
    alert("Copied to clipboard!");
  };

  const insertMarkdown = (type) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    let newText = "";
    let newCursor = start;

    switch (type) {
      case "bold":
        newText =
          text.slice(0, start) +
          "**" +
          text.slice(start, end) +
          "**" +
          text.slice(end);
        newCursor = end + 2;
        break;
      case "italic":
        newText =
          text.slice(0, start) +
          "*" +
          text.slice(start, end) +
          "*" +
          text.slice(end);
        newCursor = end + 1;
        break;
      case "h1":
        newText =
          text.slice(0, start) +
          "# " +
          text.slice(start, end) +
          text.slice(end);
        newCursor = end + 2;
        break;
      case "h2":
        newText =
          text.slice(0, start) +
          "## " +
          text.slice(start, end) +
          text.slice(end);
        newCursor = end + 3;
        break;
      case "link":
        newText = text.slice(0, start) + "[Text](url)" + text.slice(end);
        newCursor = start + 1;
        break;
      case "image":
        newText =
          text.slice(0, start) + "![Alt text](image-url)" + text.slice(end);
        newCursor = start + 2;
        break;
      case "table":
        newText =
          text.slice(0, start) +
          `| Header 1 | Header 2 | Header 3 |
| -------- | -------- | -------- |
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |` +
          text.slice(end);
        newCursor = start + 1;
        break;
    }

    updateNote(activeNote.id, { content: newText });
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-slate-900" : "bg-white"}`}
      >
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center p-6 ${isDarkMode ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"}`}
      >
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 justify-center mb-8">
            <FileText size={36} className="text-blue-500" />
            <h1 className="text-3xl font-bold">InkQuill</h1>
          </div>

          <div
            className={`rounded-lg border p-8 ${isDarkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-slate-50"}`}
          >
            <h2 className="text-2xl font-semibold mb-2">
              {authMode === "login"
                ? "Welcome Back"
                : authMode === "signup"
                  ? "Create Account"
                  : "Reset Password"}
            </h2>
            <p
              className={`mb-8 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
            >
              {authMode === "login"
                ? "Sign in to access your notes"
                : authMode === "signup"
                  ? "Start taking notes today"
                  : "We'll send you a link to reset your password"}
            </p>

            {authError && (
              <div className="mb-6 p-4 rounded bg-red-100 text-red-700">
                {authError}
              </div>
            )}
            {resetSuccess && (
              <div className="mb-6 p-4 rounded bg-green-100 text-green-700">
                {resetSuccess}
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setAuthError("");
                setResetSuccess("");
                try {
                  if (authMode === "login") {
                    await signIn(email, password);
                  } else if (authMode === "signup") {
                    await signUp(email, password);
                  } else if (authMode === "reset") {
                    await resetPassword(email);
                    setResetSuccess(
                      "Password reset link sent! Check your email.",
                    );
                  }
                } catch (err) {
                  setAuthError(err.message);
                }
              }}
              className="space-y-6"
            >
              <div>
                <label className="block mb-2 font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode
                      ? "bg-slate-900 border-slate-600 text-white"
                      : "bg-white border-slate-300 text-slate-900"
                  }`}
                  required
                />
              </div>
              {authMode !== "reset" && (
                <div>
                  <label className="block mb-2 font-medium">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-4 py-3 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? "bg-slate-900 border-slate-600 text-white"
                        : "bg-white border-slate-300 text-slate-900"
                    }`}
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
              >
                {authMode === "login"
                  ? "Sign In"
                  : authMode === "signup"
                    ? "Sign Up"
                    : "Send Reset Link"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-700">
              {authMode === "login" && (
                <>
                  <p className="text-center mb-2">
                    <button
                      onClick={() => {
                        setAuthMode("reset");
                        setAuthError("");
                        setResetSuccess("");
                        setPassword("");
                      }}
                      className="text-blue-400 font-medium hover:text-blue-300"
                    >
                      Forgot Password?
                    </button>
                  </p>
                  <p className="text-center mb-4">
                    Don&apos;t have an account?{" "}
                    <button
                      onClick={() => {
                        setAuthMode("signup");
                        setAuthError("");
                        setResetSuccess("");
                        setEmail("");
                        setPassword("");
                      }}
                      className="text-blue-400 font-medium hover:text-blue-300"
                    >
                      Sign Up
                    </button>
                  </p>
                </>
              )}
              {authMode === "signup" && (
                <p className="text-center mb-4">
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setAuthMode("login");
                      setAuthError("");
                      setResetSuccess("");
                      setEmail("");
                      setPassword("");
                    }}
                    className="text-blue-400 font-medium hover:text-blue-300"
                  >
                    Sign In
                  </button>
                </p>
              )}
              {authMode === "reset" && (
                <p className="text-center mb-4">
                  Remember your password?{" "}
                  <button
                    onClick={() => {
                      setAuthMode("login");
                      setAuthError("");
                      setResetSuccess("");
                      setPassword("");
                    }}
                    className="text-blue-400 font-medium hover:text-blue-300"
                  >
                    Sign In
                  </button>
                </p>
              )}
              <button
                onClick={continueWithoutSignIn}
                className={`w-full py-3 rounded-lg font-medium transition-all ${
                  isDarkMode
                    ? "border border-slate-600 text-slate-300 hover:bg-slate-800"
                    : "border border-slate-300 text-slate-700 hover:bg-slate-100"
                }`}
              >
                Continue Without Signing In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col h-screen ${isDarkMode ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"}`}
    >
      <header
        className={`flex items-center justify-between px-4 py-3 border-b ${
          isDarkMode
            ? "border-slate-700 bg-slate-900"
            : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:opacity-80"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-blue-500" />
            <h1 className="text-lg font-bold">InkQuill</h1>
          </div>
          <div className="hidden md:flex items-center gap-2 ml-4">
            {isOnline ? (
              <Wifi size={16} className="text-green-400" />
            ) : (
              <WifiOff size={16} className="text-orange-400" />
            )}
            <span className="text-sm">{isOnline ? "Online" : "Offline"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg hover:opacity-80"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={signOut}
            className={`p-2 rounded-lg ${isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}
            title="Sign Out"
          >
            <LogOut size={20} />
          </button>
          <div className="hidden sm:flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <User size={18} />
              <span className="text-sm font-medium truncate max-w-[120px]">
                {user.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {isSidebarOpen && (
          <aside
            className={`w-full sm:w-72 border-r flex flex-col absolute sm:relative z-10 h-full ${
              isDarkMode
                ? "border-slate-700 bg-slate-900"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="p-4">
              <button
                onClick={addNote}
                className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-all mb-3 ${
                  isDarkMode
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                <Plus size={18} />
                New Note
              </button>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes..."
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode
                      ? "bg-slate-800 border-slate-600 text-white"
                      : "bg-white border-slate-300 text-slate-900"
                  }`}
                />
              </div>

              {allTags.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag
                      size={16}
                      className={
                        isDarkMode ? "text-slate-400" : "text-slate-500"
                      }
                    />
                    <span
                      className={`text-sm font-medium ${
                        isDarkMode ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      Tags
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setActiveTag(null)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        !activeTag
                          ? "bg-blue-500 text-white"
                          : isDarkMode
                            ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                            : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                      }`}
                    >
                      All
                    </button>
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setActiveTag(tag)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          activeTag === tag
                            ? "bg-blue-500 text-white"
                            : isDarkMode
                              ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => {
                    setActiveNoteId(note.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`p-4 cursor-pointer border-b transition-all ${
                    isDarkMode
                      ? "border-slate-700 hover:bg-slate-800"
                      : "border-slate-200 hover:bg-slate-100"
                  } ${
                    activeNoteId === note.id
                      ? isDarkMode
                        ? "bg-slate-800"
                        : "bg-slate-100"
                      : ""
                  }`}
                >
                  <h3 className="font-medium truncate">
                    {note.title || "Untitled"}
                  </h3>
                  <p
                    className={`text-sm mt-1 truncate ${
                      isDarkMode ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {note.content.split("\n")[0] || "No content"}
                  </p>
                  {(note.tags || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            isDarkMode
                              ? "bg-slate-700 text-slate-300"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </aside>
        )}

        <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
          <div className="w-full md:w-1/2 flex flex-col border-b md:border-b-0 md:border-r overflow-hidden">
            <div
              className={`px-4 py-3 border-b flex items-center justify-between ${
                isDarkMode
                  ? "border-slate-700 bg-slate-900"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <Edit3
                  size={18}
                  className={isDarkMode ? "text-slate-400" : "text-slate-500"}
                />
                <span
                  className={`font-medium ${
                    isDarkMode ? "text-slate-200" : "text-slate-700"
                  }`}
                >
                  Editor
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => insertMarkdown("bold")}
                  className={`p-2 rounded-lg hover:opacity-80 ${
                    isDarkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                  title="Bold"
                >
                  <Bold size={16} />
                </button>
                <button
                  onClick={() => insertMarkdown("italic")}
                  className={`p-2 rounded-lg hover:opacity-80 ${
                    isDarkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                  title="Italic"
                >
                  <Italic size={16} />
                </button>
                <button
                  onClick={() => insertMarkdown("h1")}
                  className={`p-2 rounded-lg hover:opacity-80 ${
                    isDarkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                  title="Heading 1"
                >
                  <Heading1 size={16} />
                </button>
                <button
                  onClick={() => insertMarkdown("h2")}
                  className={`p-2 rounded-lg hover:opacity-80 ${
                    isDarkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                  title="Heading 2"
                >
                  <Heading2 size={16} />
                </button>
                <button
                  onClick={() => insertMarkdown("table")}
                  className={`p-2 rounded-lg hover:opacity-80 ${
                    isDarkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                  title="Table"
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => insertMarkdown("link")}
                  className={`p-2 rounded-lg hover:opacity-80 ${
                    isDarkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                  title="Link"
                >
                  <Link size={16} />
                </button>
                <button
                  onClick={() => insertMarkdown("image")}
                  className={`p-2 rounded-lg hover:opacity-80 ${
                    isDarkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                  title="Image"
                >
                  <ImageIcon size={16} />
                </button>
              </div>
            </div>
            <input
              type="text"
              value={activeNote?.title || ""}
              onChange={(e) =>
                updateNote(activeNote.id, { title: e.target.value })
              }
              placeholder="Note title..."
              className={`px-4 py-3 text-lg font-semibold border-b ${
                isDarkMode
                  ? "bg-slate-900 border-slate-700 text-white"
                  : "bg-white border-slate-200 text-slate-900"
              } focus:outline-none`}
            />
            {/* Tags input */}
            <div
              className={`px-4 py-2 border-b flex items-center flex-wrap gap-2 ${
                isDarkMode
                  ? "bg-slate-900 border-slate-700"
                  : "bg-white border-slate-200"
              }`}
            >
              {(activeNote.tags || []).map((tag) => (
                <span
                  key={tag}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${
                    isDarkMode
                      ? "bg-slate-700 text-slate-200"
                      : "bg-slate-200 text-slate-800"
                  }`}
                >
                  {tag}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTag(tag);
                    }}
                    className="hover:opacity-70"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addTag(newTagInput);
                    setNewTagInput("");
                  }
                }}
                placeholder="Add tag..."
                className={`flex-1 min-w-[100px] bg-transparent outline-none text-sm ${
                  isDarkMode ? "text-slate-300" : "text-slate-700"
                }`}
              />
            </div>
            <textarea
              ref={textareaRef}
              value={activeNote?.content || ""}
              onChange={(e) =>
                updateNote(activeNote.id, { content: e.target.value })
              }
              placeholder="Start writing in Markdown..."
              className={`flex-1 w-full p-4 resize-none focus:outline-none ${
                isDarkMode
                  ? "bg-slate-900 text-slate-100"
                  : "bg-white text-slate-900"
              }`}
            />
          </div>

          <div className="w-full md:w-1/2 flex flex-col overflow-hidden">
            <div
              className={`px-4 py-3 border-b flex items-center justify-between ${
                isDarkMode
                  ? "border-slate-700 bg-slate-900"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <Eye
                  size={18}
                  className={isDarkMode ? "text-slate-400" : "text-slate-500"}
                />
                <span
                  className={`font-medium ${
                    isDarkMode ? "text-slate-200" : "text-slate-700"
                  }`}
                >
                  Preview
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={exportMarkdown}
                  className={`p-2 rounded-lg ${
                    isDarkMode
                      ? "hover:bg-slate-800 text-slate-300"
                      : "hover:bg-slate-100 text-slate-700"
                  }`}
                  title="Export as Markdown"
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={copyHTML}
                  className={`p-2 rounded-lg ${
                    isDarkMode
                      ? "hover:bg-slate-800 text-slate-300"
                      : "hover:bg-slate-100 text-slate-700"
                  }`}
                  title="Copy as HTML"
                >
                  <Copy size={18} />
                </button>
                <button
                  onClick={() => deleteNote(activeNote.id)}
                  className={`p-2 rounded-lg ${
                    isDarkMode
                      ? "hover:bg-slate-800 text-red-400"
                      : "hover:bg-slate-100 text-red-500"
                  }`}
                  title="Delete Note"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div
              className={`flex-1 p-4 md:p-8 overflow-y-auto ${
                isDarkMode ? "bg-slate-900" : "bg-white"
              }`}
            >
              <div
                className={`prose prose-slate max-w-none ${
                  isDarkMode ? "prose-invert" : ""
                }`}
              >
                <ReactMarkdown>
                  {activeNote?.content ||
                    "# Start writing...\n\nYour Markdown will appear here!"}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
