import { useState, useEffect } from "react";
import { useDocuments } from "./useDocuments";
import type { DocumentRow } from "@/services/supabase";

export const useDocumentsWithCache = () => {
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
    const saved = localStorage.getItem("smartdocs_cache");
    if (saved) {
      try {
        setCachedDocs(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse cached documents", e);
      }
    }
  }, []);

  useEffect(() => {
    // Save to cache when documents are fetched successfully
    if (docsHook.documents.length > 0 && !docsHook.loading) {
      localStorage.setItem("smartdocs_cache", JSON.stringify(docsHook.documents));
      setCachedDocs(docsHook.documents);
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
