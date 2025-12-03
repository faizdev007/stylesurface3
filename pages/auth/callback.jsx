import { useEffect } from "react";

export default function Callback() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (!code) {
      alert("No code found");
      return;
    }

    // send this code to backend to generate refresh token
    fetch("/api/zoho-generate-refresh-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then((res) => res.json())
      .then((data) => console.log(data));
  }, []);

  return <h2>Generating Zoho Token…</h2>;
}
