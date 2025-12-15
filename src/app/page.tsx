"use client";

import { Header } from "@/components/header";
import { Workbench } from "@/components/workbench";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-zinc-950 p-2 sm:p-4 gap-2 sm:gap-4">
      <div className="flex-1 flex flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
        <Header />
        <Workbench />
        <Footer />
      </div>
    </div>
  );
}
