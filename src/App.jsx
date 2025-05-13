import { useState } from 'react'
import './App.css'
import { Button } from "@/components/ui/button"
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Toaster } from '@/components/ui/ui-toaster'
import { DashboardShell } from './components/dashboard-shell'
import { LoginForm } from './components/login-form'
import { TeacherDashboard } from './components/teacher-dashboard'

function App() {

  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem("insUID");
  const hideNavbarRoutes = ["/login"];
  const isNavbarVisible = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
    <Toaster richColors />
    <Routes>
      <Route path='/' element={isAuthenticated ? <TeacherDashboard /> : <Navigate to={'/login'}/>}/>
      <Route path='/login' element={isAuthenticated ? <Navigate to={'/'}/> : <LoginForm/>}/>
    </Routes>
    </>
  )
}

export default App
