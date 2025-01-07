import { BrowserRouter, Outlet, Route, Routes } from "react-router"
import Navbar from "./components/Navbar"
import Home from "./components/Home"
import Footer from "./components/Footer"
import GameCanvas from "./game/scenes/GameCanvas"
import SignupPage from "./components/Signup"
import LoginPage from "./components/Login"
import CreateSpace from "./components/CreateSpace"
import MySpaces from "./components/MySpaces"

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<GameCanvas />} />
            <Route path="/space/create" element={<CreateSpace />} />
            <Route path="/spaces" element={<MySpaces />} />
          </Route>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/space:id" element={<GameCanvas />} />
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