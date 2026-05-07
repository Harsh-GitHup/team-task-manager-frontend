import { useState, useEffect, useCallback } from "react";
import API from "../api";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const teamId = 1;

  const fetchMessages = useCallback(async () => {
    try {
      const res = await API.get(`/chat/${teamId}`);
      setMessages(res.data || []);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  }, [teamId]);

  useEffect(() => {
    // schedule fetch asynchronously to avoid synchronous setState inside effect
    const timer = setTimeout(() => {
      fetchMessages().catch((err) => console.error("fetchMessages error:", err));
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchMessages]);

  const sendMessage = async () => {
    if (!text) return;

    try {
      await API.post("/chat", {
        team_id: teamId,
        message: text,
      });

      setText("");
      await fetchMessages();
    } catch (err) {
      console.error("Send message failed:", err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-[2.5rem] border border-slate-700/50 bg-gradient-to-r from-slate-900/80 to-slate-800/80 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Team Chat</h1>
        <p className="mt-3 text-slate-400 text-lg">Send quick updates and coordinate with your team in real time. 💬</p>
      </div>

      <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/60 to-slate-800/60 p-6 shadow-lg shadow-cyan-500/5 backdrop-blur-sm">
        <div className="mb-5 h-96 overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950/80 p-5 text-slate-100 space-y-3">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <p className="text-6xl mb-3">💬</p>
              <p className="text-lg">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className="rounded-xl bg-gradient-to-r from-cyan-900/30 to-slate-900/50 p-4 border border-cyan-500/20 transition hover:border-cyan-500/40 hover:from-cyan-900/40 duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-cyan-300">👤 {m.email}</span>
                  <span className="text-xs text-slate-500">just now</span>
                </div>
                <div className="text-slate-100 text-base leading-relaxed">{m.message}</div>
              </div>
            ))
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto] mt-4">
          <input
            className="w-full rounded-xl border border-slate-600 bg-slate-950/50 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 transition backdrop-blur-sm"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-white font-semibold transition hover:shadow-lg hover:shadow-cyan-500/40 hover:-translate-y-1 duration-200"
          >
            Send 📤
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;