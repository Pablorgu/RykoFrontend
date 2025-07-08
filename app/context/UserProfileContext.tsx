import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface UserProfile {
  fecha?: string | Date | null
  genero?: string | null
  pais?: string | null
  peso?: string
  altura?: string
  objetivo?: string | null
  calorias?: string
  intolerancias?: string[]
}

interface UserProfileContextType {
  profile: UserProfile
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined)

export const UserProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile>({})

  return (
    <UserProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </UserProfileContext.Provider>
  )
}

export const useUserProfile = () => {
  const context = useContext(UserProfileContext)
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider')
  }
  return context
}