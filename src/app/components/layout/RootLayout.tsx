import { Outlet } from "react-router";
import { Navbar } from "./Navbar";
import { LessonRequestModal } from "../shared/LessonRequestModal";
import { useModal } from "../../providers/ModalProvider";

export function RootLayout() {
  const { selectedTutor, closeModal } = useModal();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Outlet />
      {selectedTutor && (
        <LessonRequestModal tutor={selectedTutor} onClose={closeModal} />
      )}
    </div>
  );
}
