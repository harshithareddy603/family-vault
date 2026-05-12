import { useState } from "react";
import { FileText, HeartPulse, Building2, GraduationCap, Car, Fingerprint, Landmark, Globe, CreditCard } from "lucide-react";

interface DocumentLogoProps {
  name: string;
  category: string;
  source: string | null;
  className?: string;
}

export const DocumentLogo = ({ name, category, source, className = "h-6 w-6" }: DocumentLogoProps) => {
  const [imgError, setImgError] = useState(false);
  const n = name.toLowerCase();
  const c = category.toLowerCase();
  const s = source?.toLowerCase() || "";
  
  const getLogoUrl = () => {
    // Official high-reliability logos
    const logos: Record<string, string> = {
      aadhaar: "https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/Aadhaar_Logo.svg/100px-Aadhaar_Logo.svg.png",
      pan: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Income_Tax_Department_India_Logo.png/100px-Income_Tax_Department_India_Logo.png",
      passport: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Emblem_of_India.svg/100px-Emblem_of_India.svg.png",
      voter: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Election_Commission_of_India_logo.svg/100px-Election_Commission_of_India_logo.svg.png",
      license: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Seal_of_the_Ministry_of_Road_Transport_and_Highways_India.png/100px-Seal_of_the_Ministry_of_Road_Transport_and_Highways_India.png"
    };

    // Use a robust proxy with caching and SSL to ensure these load every time
    const proxy = (url: string) => `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=100&h=100&fit=contain&cbg=white&errorgradient=true`;

    if (s === "aadhaar" || n.includes("aadhaar") || n.includes("adhar") || c.includes("aadhaar")) return proxy(logos.aadhaar);
    if (s === "pan" || n.includes("pan card") || (n.includes("pan") && n.length < 10) || c.includes("pan")) return proxy(logos.pan);
    if (s === "passport" || n.includes("passport") || c.includes("passport")) return proxy(logos.passport);
    if (s === "voter_id" || n.includes("voter") || c.includes("voter")) return proxy(logos.voter);
    if (s === "license" || n.includes("license") || c.includes("driving")) return proxy(logos.license);

    return null;
  };

  const url = getLogoUrl();

  if (url && !imgError) {
    return (
      <div className={`${className} bg-white rounded-sm p-0.5 flex items-center justify-center shadow-sm overflow-hidden border border-slate-100`}>
        <img 
          src={url} 
          alt={category} 
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Fallback Icons with premium colors
  if (s === "aadhaar" || n.includes("aadhaar") || n.includes("adhar") || c.includes("aadhaar")) {
    return <div className={`${className} bg-purple-50 text-purple-600 rounded-sm flex items-center justify-center`}><Fingerprint className="h-4 w-4" /></div>;
  }
  if (s === "pan" || n.includes("pan card") || (n.includes("pan") && n.length < 10) || c.includes("pan")) {
    return <div className={`${className} bg-blue-50 text-blue-600 rounded-sm flex items-center justify-center`}><Landmark className="h-4 w-4" /></div>;
  }
  if (s === "passport" || n.includes("passport") || c.includes("passport")) {
    return <div className={`${className} bg-sky-50 text-sky-600 rounded-sm flex items-center justify-center`}><Globe className="h-4 w-4" /></div>;
  }
  if (s === "voter_id" || n.includes("voter") || c.includes("voter")) {
    return <div className={`${className} bg-teal-50 text-teal-600 rounded-sm flex items-center justify-center`}><CreditCard className="h-4 w-4" /></div>;
  }
  if (s === "license" || n.includes("license") || c.includes("driving")) {
    return <div className={`${className} bg-amber-50 text-amber-600 rounded-sm flex items-center justify-center`}><Car className="h-4 w-4" /></div>;
  }

  // Category fallbacks
  const getIcon = () => {
    if (c === "medical" || n.includes("medical") || n.includes("health")) return { icon: <HeartPulse className="h-4 w-4" />, color: "bg-rose-50 text-rose-500" };
    if (c === "property" || n.includes("house") || n.includes("land")) return { icon: <Building2 className="h-4 w-4" />, color: "bg-indigo-50 text-indigo-500" };
    if (c === "education" || n.includes("degree") || n.includes("marks")) return { icon: <GraduationCap className="h-4 w-4" />, color: "bg-emerald-50 text-emerald-500" };
    if (c === "insurance" || n.includes("policy")) return { icon: <Car className="h-4 w-4" />, color: "bg-amber-50 text-amber-500" };
    if (c === "id") return { icon: <Fingerprint className="h-4 w-4" />, color: "bg-slate-50 text-slate-400" };
    return { icon: <FileText className="h-4 w-4" />, color: "bg-blue-50 text-blue-500" };
  };

  const { icon, color } = getIcon();
  return <div className={`${className} ${color} rounded-sm flex items-center justify-center shadow-sm`}>{icon}</div>;
  
  return <FileText className={`${className} text-blue-500`} />;
};
