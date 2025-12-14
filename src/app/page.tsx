"use client";

import { Header } from "@/components/header";
import { Workbench } from "@/components/workbench";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-zinc-950">
      <Header />
      <Workbench />
      <Footer />
    </div>
  );
}
