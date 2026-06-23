import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { JoinForm } from "../components";

export default function LoginPage() {
  const navigate = useNavigate();
  const username = localStorage.getItem("chatUsername") || "";

  useEffect(() => {
    if (username) {
      navigate("/chat");
    }
  }, [navigate, username]);

  const handleJoin = (joinedUsername) => {
    localStorage.setItem("chatUsername", joinedUsername);
    navigate("/chat");
  };

  return <JoinForm onJoin={handleJoin} />;
}
