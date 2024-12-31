import { BrowserRouter, Route, Routes } from "react-router"
import Navbar from "./components/Navbar"
import Home from "./components/Home."
import Footer from "./components/Footer"

function App() {

  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/try" element={<Try />} /> */}
        </Routes>
        <Footer/>
      </BrowserRouter>
    </>
  )
}

export default App
