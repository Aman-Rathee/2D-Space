import { BrowserRouter, Outlet, Route, Routes } from "react-router"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Footer from "./components/Footer"
import GameCanvas from "./game/scenes/GameCanvas"
import SignupPage from "./pages/Signup"
import LoginPage from "./pages/Login"
import MySpaces from "./pages/MySpaces"
import JoinSpace from "./pages/JoinSpace"

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<GameCanvas />} />
            <Route path="/spaces" element={<MySpaces />} />
            <Route path="/join" element={<JoinSpace />} />
          </Route>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/space/:id" element={<GameCanvas />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App


const Layout = () => (
  <>
    <Navbar />
    <Outlet />
    <Footer />
  </>
);