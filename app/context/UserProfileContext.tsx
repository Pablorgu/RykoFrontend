import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface UserProfile {
  birthdate?: string | Date | null
  gender?: string | null
  country?: string | null
  weight?: string
  height?: string
  aim?: string | null
  calorieGoal?: string
  intolerances?: string[]
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