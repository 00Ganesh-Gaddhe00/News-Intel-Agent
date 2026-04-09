import { Newspaper } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
            <Newspaper className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">News Intel</h1>
            <p className="text-xs text-muted-foreground leading-tight">
              AI-Powered Intelligence Briefings
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
