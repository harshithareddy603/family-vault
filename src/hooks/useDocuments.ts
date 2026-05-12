import { useCallback, useEffect, useState } from "react";
import { supabase, type DocumentRow, type DocStatus } from "@/services/supabase";
import { useAuth } from "./useAuth";

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
    const { data, error } = await supabase.storage.from("documents").createSignedUrl(path, expiresIn);
    if (error) return null;
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
    if (input.file) {
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
      source: input.source ?? null,
    });
    if (!error) await fetchDocuments();
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
      await supabase.storage.from("documents").remove([doc.file_url]);
    }
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
