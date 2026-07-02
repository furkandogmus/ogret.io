import { BrowserRouter, Routes, Route } from "react-router";
import { ModalProvider } from "./providers/ModalProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { NotificationProvider } from "./providers/NotificationProvider";
import { RootLayout } from "./components/layout/RootLayout";
import { LandingPage } from "./pages/LandingPage";
import { SearchPage } from "./pages/SearchPage";
import { TutorProfilePage } from "./pages/TutorProfilePage";
import { StudentDashboard } from "./pages/StudentDashboard";
import { TutorDashboard } from "./pages/TutorDashboard";
import { MessagesPage } from "./pages/MessagesPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { SubscriptionPage } from "./pages/SubscriptionPage";
import { VerificationPage } from "./pages/VerificationPage";
import { ProfileEditPage } from "./pages/ProfileEditPage";
import { WriteReferencePage } from "./pages/WriteReferencePage";
import { CreateListingWizardPage } from "./pages/CreateListingWizardPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <ModalProvider>
          <Routes>
            <Route path="/giris" element={<LoginPage />} />
            <Route path="/kayit" element={<RegisterPage />} />
            <Route path="/sifre-unuttum" element={<ForgotPasswordPage />} />
            <Route path="/sifre-sifirla" element={<ResetPasswordPage />} />
            <Route element={<RootLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/arama" element={<SearchPage />} />
              <Route path="/ogretmen/:id" element={<TutorProfilePage />} />
              <Route path="/ogretmen/:id/referans-yaz" element={<WriteReferencePage />} />
              <Route path="/tutors/:id/recommend" element={<WriteReferencePage />} />
              <Route path="/ogretmen/ilan-olustur" element={<CreateListingWizardPage />} />
              <Route path="/tutors/create-listing" element={<CreateListingWizardPage />} />
              <Route path="/ogrenci-panel" element={<StudentDashboard />} />
              <Route path="/ogretmen-panel" element={<TutorDashboard />} />
              <Route path="/mesajlar" element={<MessagesPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/abonelik" element={<SubscriptionPage />} />
              <Route path="/dogrulama" element={<VerificationPage />} />
              <Route path="/profil/duzenle" element={<ProfileEditPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
          </ModalProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
