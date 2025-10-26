import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function App() {
  const [posts, setPosts] = useState([]);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    setPosts(data || []);
  }

  async function createPost() {
    const title = prompt("Título:");
    const content = prompt("Conteúdo:");
    await supabase.from("posts").insert([{ title, content, user_id: session.user.id }]);
    fetchPosts();
  }

  async function signIn() {
    const email = prompt("Email:");
    const password = prompt("Senha:");
    await supabase.auth.signInWithPassword({ email, password });
  }

  async function signUp() {
    const email = prompt("Novo email:");
    const password = prompt("Nova senha:");
    await supabase.auth.signUp({ email, password });
  }

  return (
    <div className="p-4">
      <h1>📝 Mini Blog com Supabase</h1>

      {!session ? (
        <>
          <button onClick={signIn}>Entrar</button>
          <button onClick={signUp}>Cadastrar</button>
        </>
      ) : (
        <>
          <button onClick={createPost}>Novo Post</button>
          <button onClick={() => supabase.auth.signOut()}>Sair</button>
        </>
      )}

      <ul>
        {posts.map((p) => (
          <li key={p.id}>
            <b>{p.title}</b>
            <p>{p.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}