import { Navigate, Route, Routes } from 'react-router-dom'

import { LayoutResultPage } from '@/pages/layout-result-page'
import { StylingRequestPage } from '@/pages/styling-request-page'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<StylingRequestPage />} />
      <Route path="/results" element={<LayoutResultPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
