import { useState, useEffect } from "react";
import { useDocuments } from "./useDocuments";
import type { DocumentRow } from "@/services/supabase";
import { useAuth } from "./useAuth";

export const useDocumentsWithCache = () => {
  const { user } = useAuth();
  const docsHook = useDocuments();
  const [cachedDocs, setCachedDocs] = useState<DocumentRow[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    // Load from cache on mount
    if (user) {
      const saved = localStorage.getItem(`smartdocs_cache_${user.id}`);
      if (saved) {
        try {
          setCachedDocs(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse cached documents", e);
        }
      } else {
        setCachedDocs([]);
      }
    } else {
      setCachedDocs([]);
    }
  }, [user?.id]);

  useEffect(() => {
    // Save to cache when documents are fetched successfully
    if (user && docsHook.documents.length > 0 && !docsHook.loading) {
      localStorage.setItem(`smartdocs_cache_${user.id}`, JSON.stringify(docsHook.documents));
      setCachedDocs(docsHook.documents);
    } else if (user && docsHook.documents.length === 0 && !docsHook.loading) {
      localStorage.removeItem(`smartdocs_cache_${user.id}`);
      setCachedDocs([]);
    }
  }, [docsHook.documents, docsHook.loading]);

  const activeDocuments = isOffline || (docsHook.loading && docsHook.documents.length === 0)
    ? cachedDocs
    : docsHook.documents;

  return {
    ...docsHook,
    documents: activeDocuments,
    isOffline,
    uploadProgress: docsHook.uploadProgress,
  };
};
