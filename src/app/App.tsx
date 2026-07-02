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
import { EmailVerificationPage } from "./pages/EmailVerificationPage";
import { ProfileEditPage } from "./pages/ProfileEditPage";
import { WriteReferencePage } from "./pages/WriteReferencePage";
import { CreateListingWizardPage } from "./pages/CreateListingWizardPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { FaqPage } from "./pages/FaqPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";
import { BlogIndexPage } from "./pages/blog/BlogIndexPage";
import { BlogPostPage } from "./pages/blog/BlogPostPage";
import { AuthGuard } from "./components/shared/AuthGuard";

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
              <Route path="/ogretmen/ilan-olustur" element={<AuthGuard role="TUTOR"><CreateListingWizardPage /></AuthGuard>} />
              <Route path="/tutors/create-listing" element={<AuthGuard role="TUTOR"><CreateListingWizardPage /></AuthGuard>} />
              <Route path="/ogrenci-panel" element={<AuthGuard><StudentDashboard /></AuthGuard>} />
              <Route path="/ogretmen-panel" element={<AuthGuard><TutorDashboard /></AuthGuard>} />
              <Route path="/mesajlar" element={<AuthGuard><MessagesPage /></AuthGuard>} />
              <Route path="/admin" element={<AuthGuard role="ADMIN"><AdminDashboard /></AuthGuard>} />
              <Route path="/abonelik" element={<SubscriptionPage />} />
              <Route path="/email-dogrula" element={<EmailVerificationPage />} />
              <Route path="/blog" element={<BlogIndexPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/sikca-sorulan-sorular" element={<FaqPage />} />
              <Route path="/hakkimizda" element={<AboutPage />} />
              <Route path="/iletisim" element={<ContactPage />} />
              <Route path="/gizlilik" element={<PrivacyPage />} />
              <Route path="/kullanim-kosullari" element={<TermsPage />} />
              <Route path="/dogrulama" element={<VerificationPage />} />
              <Route path="/profil/duzenle" element={<AuthGuard><ProfileEditPage /></AuthGuard>} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
          </ModalProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
