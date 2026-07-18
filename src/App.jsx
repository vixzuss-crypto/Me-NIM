import Navbar from './components/Navbar';
import Home from './pages/home';

export default function App() {
  return (
    // Pake min-h-screen biar tingginya ngikutin konten, jangan pake h-screen!
    <div className="min-h-screen w-full bg-slate-950 text-white">
      <Navbar /> 
      <Home />
    </div>
  );
}