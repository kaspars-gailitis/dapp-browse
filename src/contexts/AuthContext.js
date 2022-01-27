import React, { useContext, useState } from 'react'

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {

  const [user, setUser] = useState(undefined)
  const [instance, setInstance] = useState({})
  const [name, setName] = useState("")


  const value = {
    user, setUser,
    instance, setInstance,
    name, setName
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}