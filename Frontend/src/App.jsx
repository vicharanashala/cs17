import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Page0_Overview from './pages/Page0_Overview';
import Page1_FAQ from './pages/Page1_FAQ';
import Page2_Forum from './pages/Page2_Forum';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Navigate to='/faq' replace />} />
        <Route path='/overview' element={<Page0_Overview />} />
        <Route path='/faq' element={<Page1_FAQ />} />
        <Route path='/forum' element={<Page2_Forum />} />
        <Route path='/login' element={<Login />} />
        <Route path='/admin' element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
