import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { UserResponse } from "../api/services";

interface ModalContextType {
  selectedTutor: UserResponse | null;
  openModal: (tutor: UserResponse) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [selectedTutor, setSelectedTutor] = useState<UserResponse | null>(null);

  const openModal = useCallback((tutor: UserResponse) => setSelectedTutor(tutor), []);
  const closeModal = useCallback(() => setSelectedTutor(null), []);

  return (
    <ModalContext.Provider value={{ selectedTutor, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within ModalProvider");
  return ctx;
}
