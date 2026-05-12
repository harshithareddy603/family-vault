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
    if (n.includes("aadhaar") || c.includes("aadhaar") || s.includes("aadhaar") || c === "id") {
      return "https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/c/cf/Aadhaar_Logo.svg/200px-Aadhaar_Logo.svg.png";
    }
    if (n.includes("pan") || c.includes("pan") || s.includes("pan")) {
      return "https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Income_Tax_Department_India_Logo.png/200px-Income_Tax_Department_India_Logo.png";
    }
    if (n.includes("passport") || c === "passport" || s.includes("passport")) {
      return "https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Emblem_of_India.svg/200px-Emblem_of_India.svg.png";
    }
    if (n.includes("voter") || c === "voter" || s.includes("voter_id")) {
      return "https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Election_Commission_of_India_logo.svg/200px-Election_Commission_of_India_logo.svg.png";
    }
    if (c === "driving license" || c === "license" || n.includes("license") || s.includes("license")) {
      return "https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Seal_of_the_Ministry_of_Road_Transport_and_Highways_India.png/200px-Seal_of_the_Ministry_of_Road_Transport_and_Highways_India.png";
    }
    return null;
  };

  const url = getLogoUrl();

  if (url && !imgError) {
    return (
      <img 
        src={url} 
        alt={category} 
        className={`${className} object-contain`} 
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
      />
    );
  }

  // Fallback logic for non-official docs or if image fails
  if (n.includes("aadhaar") || c.includes("aadhaar") || s.includes("aadhaar") || c === "id") {
    return <Fingerprint className={`${className} text-purple-600`} />;
  }
  if (n.includes("pan") || c.includes("pan") || s.includes("pan")) {
    return <Landmark className={`${className} text-blue-600`} />;
  }
  if (n.includes("passport") || c === "passport" || s.includes("passport")) {
    return <Globe className={`${className} text-sky-500`} />;
  }
  if (n.includes("voter") || c === "voter" || s.includes("voter_id")) {
    return <CreditCard className={`${className} text-teal-600`} />;
  }
  if (c === "driving license" || c === "license" || n.includes("license") || s.includes("license")) {
    return <Car className={`${className} text-amber-600`} />;
  }

  if (c === "medical") return <HeartPulse className={`${className} text-rose-500`} />;
  if (c === "property") return <Building2 className={`${className} text-indigo-500`} />;
  if (c === "education") return <GraduationCap className={`${className} text-emerald-500`} />;
  if (c === "insurance") return <Car className={`${className} text-amber-500`} />;
  
  return <FileText className={`${className} text-blue-500`} />;
};
