import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export default function SubmissionForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    game_url: "",
    category: "",
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!form.title || !form.game_url) return;
    onSubmit(form);
  };

  return (
    <div className="space-y-3">
      <input
        placeholder="Game Title"
        value={form.title}
        onChange={(e) => handleChange("title", e.target.value)}
        className="w-full rounded-xl bg-black/30 p-3 text-sm text-white outline-none border border-white/10"
      />

      <input
        placeholder="Game URL (iframe/web)"
        value={form.game_url}
        onChange={(e) => handleChange("game_url", e.target.value)}
        className="w-full rounded-xl bg-black/30 p-3 text-sm text-white outline-none border border-white/10"
      />

      <input
        placeholder="Category (optional)"
        value={form.category}
        onChange={(e) => handleChange("category", e.target.value)}
        className="w-full rounded-xl bg-black/30 p-3 text-sm text-white outline-none border border-white/10"
      />

      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => handleChange("description", e.target.value)}
        className="w-full rounded-xl bg-black/30 p-3 text-sm text-white outline-none border border-white/10"
      />

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 text-black"
      >
        {loading ? "Submitting..." : "Submit Game"}
      </Button>
    </div>
  );
}