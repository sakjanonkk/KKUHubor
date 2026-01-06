"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const BOOKMARK_STORAGE_KEY = "kkuhubor_bookmarks";

interface BookmarkContextType {
  bookmarks: string[];
  addBookmark: (courseCode: string) => void;
  removeBookmark: (courseCode: string) => void;
  toggleBookmark: (courseCode: string) => void;
  isBookmarked: (courseCode: string) => boolean;
  clearBookmarks: () => void;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(
  undefined
);

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BOOKMARK_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setBookmarks(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load bookmarks:", error);
    }
    setIsLoaded(true);
  }, []);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(bookmarks));
      } catch (error) {
        console.error("Failed to save bookmarks:", error);
      }
    }
  }, [bookmarks, isLoaded]);

  const addBookmark = useCallback((courseCode: string) => {
    setBookmarks((prev) => {
      if (prev.includes(courseCode)) return prev;
      return [...prev, courseCode];
    });
  }, []);

  const removeBookmark = useCallback((courseCode: string) => {
    setBookmarks((prev) => prev.filter((code) => code !== courseCode));
  }, []);

  const toggleBookmark = useCallback((courseCode: string) => {
    setBookmarks((prev) => {
      if (prev.includes(courseCode)) {
        return prev.filter((code) => code !== courseCode);
      }
      return [...prev, courseCode];
    });
  }, []);

  const isBookmarked = useCallback(
    (courseCode: string) => bookmarks.includes(courseCode),
    [bookmarks]
  );

  const clearBookmarks = useCallback(() => {
    setBookmarks([]);
  }, []);

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        addBookmark,
        removeBookmark,
        toggleBookmark,
        isBookmarked,
        clearBookmarks,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error("useBookmarks must be used within a BookmarkProvider");
  }
  return context;
}
