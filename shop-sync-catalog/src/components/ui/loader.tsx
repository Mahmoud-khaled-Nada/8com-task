// components/ui/loader.tsx
import { Loader2 } from "lucide-react";

export const Loader = ({ size = 24 }: { size?: number }) => (
  <div className="flex items-center justify-center p-4">
    <Loader2 className="animate-spin text-muted-foreground" size={size} />
  </div>
);

export const Loading = () => {
  return (
    <div className="h-screen flex items-center justify-center">
      <Loader />
    </div>
  );
};
