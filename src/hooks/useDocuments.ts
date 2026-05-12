import { useCallback, useEffect, useState } from "react";
import { supabase, type DocumentRow, type DocStatus } from "@/services/supabase";
import { useAuth } from "./useAuth";
import Tesseract from "tesseract.js";
import { saveFileLocal, getFileLocal, deleteFileLocal } from "@/lib/db";

const computeStatus = (expiry: string | null): DocStatus => {
  if (!expiry) return "safe";
  const now = new Date();
  const exp = new Date(expiry);
  const days = Math.floor((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return "expired";
  if (days <= 30) return "soon";
  return "safe";
};

export const useDocuments = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setDocuments((data ?? []) as DocumentRow[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Background Pre-fetching logic
  useEffect(() => {
    const prefetch = async () => {
      if (documents.length > 0 && !loading) {
        // Pre-fetch the most recent 10 documents
        const recentDocs = documents.slice(0, 10);
        for (const doc of recentDocs) {
          if (doc.file_url) {
            const cached = await getFileLocal(doc.file_url);
            if (!cached) {
              const { data, error } = await supabase.storage.from("documents").createSignedUrl(doc.file_url, 600);
              if (data?.signedUrl && !error) {
                try {
                  const res = await fetch(data.signedUrl);
                  if (res.ok) {
                    const blob = await res.blob();
                    await saveFileLocal(doc.file_url, blob);
                    console.log("Pre-fetched and cached:", doc.name);
                  }
                } catch (e) {
                  // Ignore fetch errors in background
                }
              }
            }
          }
        }
      }
    };
    
    // Wait 3 seconds after load before starting background sync
    const timer = setTimeout(prefetch, 3000);
    return () => clearTimeout(timer);
  }, [documents, loading]);

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!user) return null;
    const path = `${user.id}/${Date.now()}-${file.name}`;
    
    // Simulate upload progress since supabase.storage doesn't expose onProgress natively in JS client
    setUploadProgress(10);
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => (prev < 90 ? prev + Math.random() * 15 : prev));
    }, 200);

    const { error } = await supabase.storage.from("documents").upload(path, file, { upsert: false });
    
    clearInterval(progressInterval);
    setUploadProgress(100);

    if (error) {
      setError(error.message);
      setUploadProgress(0);
      return null;
    }
    
    setTimeout(() => setUploadProgress(0), 500);
    return path;
  };

  const getSignedUrl = async (path: string, expiresIn = 3600) => {
    // 1. Check local cache first
    const localBlob = await getFileLocal(path);
    if (localBlob) {
      console.log("Serving from local cache:", path);
      return URL.createObjectURL(localBlob);
    }

    // 2. Fetch from Supabase
    const { data, error } = await supabase.storage.from("documents").createSignedUrl(path, expiresIn);
    if (error || !data?.signedUrl) {
      console.warn("Could not find file in storage:", path);
      return null;
    }

    // 3. Lazy cache: Download and save for next time
    try {
      const response = await fetch(data.signedUrl);
      if (response.ok) {
        const blob = await response.blob();
        await saveFileLocal(path, blob);
      }
    } catch (e) {
      console.error("Failed to lazy cache file", e);
    }

    return data.signedUrl;
  };

  const addDocument = async (input: {
    name: string;
    category: string;
    expiry_date?: string | null;
    family_member_id?: string | null;
    priority?: boolean;
    file?: File | null;
    source?: string | null;
  }) => {
    if (!user) return { error: new Error("Not signed in") };
    let file_url: string | null = null;
    let detectedSource = input.source;

    if (input.file) {
      // Run OCR if it's an image
      if (input.file.type.startsWith("image/")) {
        try {
          const result = await Tesseract.recognize(input.file, "eng", {
            logger: m => console.log(m)
          });
          const text = result.data.text.toLowerCase();
          
          if (text.includes("aadhaar") || text.includes("uidai") || text.includes("government of india")) {
            detectedSource = "aadhaar";
          } else if (text.includes("pan") || text.includes("income tax")) {
            detectedSource = "pan";
          } else if (text.includes("passport") || text.includes("republic of india")) {
            detectedSource = "passport";
          } else if (text.includes("driving license") || text.includes("transport department")) {
            detectedSource = "license";
          } else if (text.includes("election commission") || text.includes("voter id")) {
            detectedSource = "voter_id";
          }
        } catch (e) {
          console.error("OCR failed:", e);
        }
      } else {
        // Fallback for PDFs and other docs
        const fname = input.file.name.toLowerCase();
        if (fname.includes("aadhaar")) detectedSource = "aadhaar";
        else if (fname.includes("pan")) detectedSource = "pan";
        else if (fname.includes("passport")) detectedSource = "passport";
        else if (fname.includes("license") || fname.includes("dl")) detectedSource = "license";
        else if (fname.includes("voter")) detectedSource = "voter_id";
      }

      file_url = await uploadFile(input.file);
    }
    const status = computeStatus(input.expiry_date ?? null);
    const { error } = await supabase.from("documents").insert({
      user_id: user.id,
      family_member_id: input.family_member_id ?? null,
      name: input.name,
      category: input.category,
      expiry_date: input.expiry_date ?? null,
      priority: !!input.priority,
      status,
      file_url,
      source: detectedSource ?? null,
    });
    if (!error) {
      if (input.file && file_url) {
        await saveFileLocal(file_url, input.file);
      }
      await fetchDocuments();
    }
    return { error };
  };

  const updateDocument = async (id: string, patch: Partial<DocumentRow>) => {
    if (patch.expiry_date !== undefined) {
      patch.status = computeStatus(patch.expiry_date);
    }
    const { error } = await supabase.from("documents").update(patch).eq("id", id);
    if (!error) await fetchDocuments();
    return { error };
  };

  const deleteDocument = async (id: string) => {
    const doc = documents.find((d) => d.id === id);
    if (doc?.file_url) {
      // 1. Delete from Supabase Storage
      const { error: storageError } = await supabase.storage.from("documents").remove([doc.file_url]);
      if (storageError) {
        console.error("Storage deletion failed:", storageError);
      }
      
      // 2. Delete from local cache
      await deleteFileLocal(doc.file_url);
    }
    // 3. Delete from Database
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (!error) await fetchDocuments();
    return { error };
  };

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    getSignedUrl,
    uploadProgress,
  };
};
