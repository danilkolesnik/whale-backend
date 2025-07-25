import { useEffect } from "react"
import { Route, Routes } from "react-router-dom"
import Earn from "./pages/Earn"
import Market from "./pages/Market"
import Rating from "./pages/Rating"
import Main from "./pages/Main"
import i18n from "./i18n"

function App() {
  const lang = localStorage.getItem('lang') || 'en';
  const newUser = localStorage.getItem('new')
  i18n.changeLanguage(lang);

  useEffect(() =>{
    if(!newUser){
      localStorage.setItem('new', 'true')
      return
    }
    localStorage.setItem('new', 'false')
  },[])
  return (
    <Routes>
      <Route path="/" element={<Main />}/>
      <Route path="/earn" element={<Earn />}/>
      <Route path="/market" element={<Market />}/>
        <Route path="/rating" element={<Rating />}/>
      </Routes>
  )
}

export default App



