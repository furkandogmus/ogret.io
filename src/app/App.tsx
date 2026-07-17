import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import { ModalProvider } from "./providers/ModalProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { NotificationProvider } from "./providers/NotificationProvider";
import { RootLayout } from "./components/layout/RootLayout";
import { AuthGuard } from "./components/shared/AuthGuard";

const LandingPage = lazy(() => import("./pages/LandingPage").then(m => ({ default: m.LandingPage })));
const SearchPage = lazy(() => import("./pages/SearchPage").then(m => ({ default: m.SearchPage })));
const TutorProfilePage = lazy(() => import("./pages/TutorProfilePage").then(m => ({ default: m.TutorProfilePage })));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard").then(m => ({ default: m.StudentDashboard })));
const TutorDashboard = lazy(() => import("./pages/TutorDashboard").then(m => ({ default: m.TutorDashboard })));
const MessagesPage = lazy(() => import("./pages/MessagesPage").then(m => ({ default: m.MessagesPage })));
const LoginPage = lazy(() => import("./pages/LoginPage").then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("./pages/RegisterPage").then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage").then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage").then(m => ({ default: m.ResetPasswordPage })));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const SubscriptionPage = lazy(() => import("./pages/SubscriptionPage").then(m => ({ default: m.SubscriptionPage })));
const VerificationPage = lazy(() => import("./pages/VerificationPage").then(m => ({ default: m.VerificationPage })));
const EmailVerificationPage = lazy(() => import("./pages/EmailVerificationPage").then(m => ({ default: m.EmailVerificationPage })));
const ProfileEditPage = lazy(() => import("./pages/ProfileEditPage").then(m => ({ default: m.ProfileEditPage })));
const WriteReferencePage = lazy(() => import("./pages/WriteReferencePage").then(m => ({ default: m.WriteReferencePage })));
const CreateListingWizardPage = lazy(() => import("./pages/CreateListingWizardPage").then(m => ({ default: m.CreateListingWizardPage })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then(m => ({ default: m.NotFoundPage })));
const FaqPage = lazy(() => import("./pages/FaqPage").then(m => ({ default: m.FaqPage })));
const AboutPage = lazy(() => import("./pages/AboutPage").then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import("./pages/ContactPage").then(m => ({ default: m.ContactPage })));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage").then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import("./pages/TermsPage").then(m => ({ default: m.TermsPage })));
const BlogIndexPage = lazy(() => import("./pages/blog/BlogIndexPage").then(m => ({ default: m.BlogIndexPage })));
const BlogPostPage = lazy(() => import("./pages/blog/BlogPostPage").then(m => ({ default: m.BlogPostPage })));
const DisputesPage = lazy(() => import("./pages/DisputesPage").then(m => ({ default: m.DisputesPage })));
const LegalPage = lazy(() => import("./pages/LegalPage").then(m => ({ default: m.LegalPage })));
const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage").then(m => ({ default: m.HowItWorksPage })));
const PricingPage = lazy(() => import("./pages/PricingPage").then(m => ({ default: m.PricingPage })));
const StudentsPage = lazy(() => import("./pages/StudentsPage").then(m => ({ default: m.StudentsPage })));

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <ModalProvider>
          <Suspense fallback={
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
              <div style={{ width: 40, height: 40, border: "3px solid #e5e7eb", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          }>
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
              <Route path="/nasil-calisir" element={<HowItWorksPage />} />
              <Route path="/fiyatlandirma" element={<PricingPage />} />
              <Route path="/ogrenciler" element={<StudentsPage />} />
              <Route path="/sikca-sorulan-sorular" element={<FaqPage />} />
              <Route path="/hakkimizda" element={<AboutPage />} />
              <Route path="/iletisim" element={<ContactPage />} />
              <Route path="/gizlilik" element={<PrivacyPage />} />
              <Route path="/kullanim-kosullari" element={<TermsPage />} />
              <Route path="/anlasmazlik" element={<DisputesPage />} />
              <Route path="/yasal" element={<LegalPage />} />
              <Route path="/yasal/:slug" element={<LegalPage />} />
              <Route path="/dogrulama" element={<VerificationPage />} />
              <Route path="/profil/duzenle" element={<AuthGuard><ProfileEditPage /></AuthGuard>} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
          </Suspense>
          </ModalProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
