import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ClientDashboard } from './pages/ClientDashboard';
import { FreelancerDashboard } from './pages/FreelancerDashboard';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/client" element={<ClientDashboard />} />
          <Route path="/freelancer" element={<FreelancerDashboard />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
