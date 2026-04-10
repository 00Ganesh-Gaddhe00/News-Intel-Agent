import { Newspaper } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-6 h-16 flex items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-500/25">
            <Newspaper className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-[15px] leading-tight tracking-tight text-gray-900">
              News Intel
            </h1>
            <p className="text-[11px] text-gray-500 leading-tight tracking-wide uppercase">
              AI Intelligence
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
