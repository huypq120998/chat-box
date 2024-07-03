import { useNavigate } from "react-router-dom"

export function useRedirectChat() {
  const navigate = useNavigate()
  return {
    navigate: (id: string) => navigate(`/chat/${id}`),
  }
}
