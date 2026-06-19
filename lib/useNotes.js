"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "./db";
import { supabase } from "./supabase";

const initialNote = {
  id: Date.now(),
  title: "Welcome to Ink & Quill",
  content:
    "# Welcome to Ink & Quill\n\nThis is your new digital notebook. Write in Markdown on the left, and see the preview on the right!\n\n## Features\n\n- ✅ Live Markdown preview\n- 📝 Clean, modern interface\n- 📱 Responsive design\n- 🌐 Offline-ready with local storage\n- ☁️ Cloud sync with Supabase\n- 🏷️ Tag your notes\n\n### Getting Started\n\nStart typing in the editor to see the magic happen!",
  updatedAt: new Date(),
  syncedAt: null,
  tags: [],
};

export function useNotes() {
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load notes from Dexie
  const loadNotes = useCallback(async () => {
    const allNotes = await db.notes.toArray();
    if (allNotes.length === 0) {
      await db.notes.add(initialNote);
      setNotes([initialNote]);
      setActiveNoteId(initialNote.id);
    } else {
      setNotes(allNotes);
      setActiveNoteId(allNotes[0].id);
    }
    setLoading(false);
  }, []);

  // Sync notes with Supabase
  const syncNotes = useCallback(async () => {
    if (!user || user.id === "demo-user" || !navigator.onLine) return;

    try {
      // Get local notes that haven't been synced yet
      const localNotes = await db.notes
        .filter(
          (note) =>
            !note.syncedAt ||
            new Date(note.updatedAt) > new Date(note.syncedAt),
        )
        .toArray();

      // Push local changes to Supabase
      for (const note of localNotes) {
        const { error } = await supabase.from("notes").upsert({
          id: note.id,
          user_id: user.id,
          title: note.title,
          content: note.content,
          tags: note.tags,
          updated_at: note.updatedAt.toISOString(),
        });
        if (!error) {
          await db.notes.update(note.id, { syncedAt: new Date() });
        }
      }

      // Pull new notes from Supabase
      const { data: supabaseNotes, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id);

      if (!error && supabaseNotes) {
        for (const sbNote of supabaseNotes) {
          const localNote = await db.notes.get(sbNote.id);
          if (
            !localNote ||
            new Date(sbNote.updated_at) > new Date(localNote.updatedAt)
          ) {
            await db.notes.put({
              id: sbNote.id,
              title: sbNote.title,
              content: sbNote.content,
              tags: sbNote.tags || [],
              updatedAt: new Date(sbNote.updated_at),
              syncedAt: new Date(),
            });
          }
        }
        const allNotes = await db.notes.toArray();
        setNotes(allNotes);
      }
    } catch (e) {
      console.error("Sync error:", e);
    }
  }, [user]);

  // Add a new note
  const addNote = useCallback(async () => {
    const newNote = {
      id: Date.now(),
      title: "Untitled Note",
      content: "",
      updatedAt: new Date(),
      syncedAt: null,
      tags: [],
    };
    await db.notes.add(newNote);
    setNotes((prev) => [...prev, newNote]);
    setActiveNoteId(newNote.id);
    await syncNotes();
  }, [syncNotes]);

  // Update a note
  const updateNote = useCallback(
    async (id, updates) => {
      const updatedNote = {
        ...updates,
        updatedAt: new Date(),
        syncedAt: null,
      };
      await db.notes.update(id, updatedNote);
      setNotes((prev) =>
        prev.map((note) =>
          note.id === id ? { ...note, ...updatedNote } : note,
        ),
      );
      await syncNotes();
    },
    [syncNotes],
  );

  // Delete a note
  const deleteNote = useCallback(
    async (id) => {
      if (notes.length > 1) {
        await db.notes.delete(id);
        setNotes((prev) => prev.filter((note) => note.id !== id));

        if (activeNoteId === id) {
          const remainingNotes = await db.notes.toArray();
          setActiveNoteId(remainingNotes[0].id);
        }

        if (user && user.id !== "demo-user" && navigator.onLine) {
          await supabase
            .from("notes")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);
        }
      }
    },
    [notes, activeNoteId, user],
  );

  // Auth functions
  const signUp = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }, []);

  const signOut = useCallback(async () => {
    if (user?.id === "demo-user") {
      setUser(null);
    } else {
      await supabase.auth.signOut();
    }
  }, [user]);

  const resetPassword = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }, []);

  // Demo mode (without Supabase)
  const continueWithoutSignIn = () => {
    setUser({ id: "demo-user", email: "demo@example.com" });
  };

  // Setup event listeners and initial load
  useEffect(() => {
    const init = async () => {
      await loadNotes();
    };
    init();

    // Online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Supabase auth listener (only if we have credentials)
    let authListener;
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setUser(session?.user || null);
          if (session?.user) {
            await syncNotes();
          }
        },
      );
      authListener = data;
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      authListener?.subscription?.unsubscribe();
    };
  }, [loadNotes, syncNotes]);

  // Sync when online status changes
  useEffect(() => {
    const sync = async () => {
      if (isOnline && user) {
        await syncNotes();
      }
    };
    sync();
  }, [isOnline, user, syncNotes]);

  return {
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
    signOut,
    resetPassword,
    continueWithoutSignIn,
    loading,
  };
}
