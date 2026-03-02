import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AdvancedDashboard from './pages/AdvancedDashboard.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/advanced" element={<AdvancedDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
