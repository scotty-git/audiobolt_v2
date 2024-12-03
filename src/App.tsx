import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { OnboardingBuilder } from './pages/OnboardingBuilder/OnboardingBuilder';
import { UserOnboarding } from './pages/UserOnboarding/UserOnboarding';
import { BuilderPage } from './pages/BuilderPage';
import { QuestionnairePage } from './pages/QuestionnairePage';
import { QuestionnaireSelection } from './pages/QuestionnaireSelection/QuestionnaireSelection';
import { SubmissionsPage } from './pages/SubmissionsPage';
import { TemplateManagementPage } from './pages/TemplateManagementPage/TemplateManagementPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ResetTemplate } from './pages/ResetTemplate';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import ResetPassword from './pages/auth/ResetPassword';
import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/auth">
              <Route path="signin" element={<SignIn />} />
              <Route path="signup" element={<SignUp />} />
              <Route path="reset-password" element={<ResetPassword />} />
            </Route>
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected routes with Layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute roles={['user', 'admin']}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* Home accessible to both users and admins */}
              <Route index element={<HomePage />} />

              {/* Onboarding routes */}
              <Route path="onboarding">
                {/* Admin only routes */}
                <Route
                  path="builder"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <OnboardingBuilder />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="builder/:id"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <OnboardingBuilder />
                    </ProtectedRoute>
                  }
                />
                {/* User routes */}
                <Route
                  path="user"
                  element={
                    <ProtectedRoute roles={['user', 'admin']}>
                      <UserOnboarding />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Questionnaire routes */}
              <Route path="questionnaires">
                {/* Admin only routes */}
                <Route
                  path="builder"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <BuilderPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="builder/:id"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <BuilderPage />
                    </ProtectedRoute>
                  }
                />
                {/* User routes */}
                <Route
                  path="user"
                  element={
                    <ProtectedRoute roles={['user', 'admin']}>
                      <QuestionnaireSelection />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="user/:templateId"
                  element={
                    <ProtectedRoute roles={['user', 'admin']}>
                      <QuestionnairePage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Admin only routes */}
              <Route
                path="submissions"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <SubmissionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="templates"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <TemplateManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="reset-template"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <ResetTemplate />
                  </ProtectedRoute>
                }
              />

              {/* Catch all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;