import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import { ModalProvider } from "./providers/ModalProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { NotificationProvider } from "./providers/NotificationProvider";
import { RootLayout } from "./components/layout/RootLayout";
import { CookieConsent } from "./components/shared/CookieConsent";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const TutorProfilePage = lazy(() => import("./pages/TutorProfilePage"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const TutorDashboard = lazy(() => import("./pages/TutorDashboard"));
const MessagesPage = lazy(() => import("./pages/MessagesPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const SubscriptionPage = lazy(() => import("./pages/SubscriptionPage"));
const VerificationPage = lazy(() => import("./pages/VerificationPage"));
const ProfileEditPage = lazy(() => import("./pages/ProfileEditPage"));
const WriteReferencePage = lazy(() => import("./pages/WriteReferencePage"));
const CreateListingWizardPage = lazy(() => import("./pages/CreateListingWizardPage"));
const BlogListPage = lazy(() => import("./pages/BlogListPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Yükleniyor...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <ModalProvider>
          <Suspense fallback={<PageLoader />}>
          <CookieConsent />
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
              <Route path="/blog" element={<BlogListPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/legal/:slug" element={<LegalPage />} />
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
