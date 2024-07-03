export const defaultHeader = (): any => {
  let token = localStorage.getItem("_token")
  if (token && !token.includes("Bearer")) {
    token = `Bearer ${token}`
  }
  return {
    Authorization: token,
    "Type-Authorization": localStorage.getItem("_typeAuthorization"),
  }
}
