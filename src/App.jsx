import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'  
//pages import
import Home from './pages/Home'
import DoseCalculator from './pages/DoseCalculator'
import About from './pages/About'
import Contact from './pages/Contact'
import FAQS from './pages/FAQS'
//calculator imports
import PediatricDoseCalculator from './pages/Calculators/PediatricDoseCalculator'
import AugmentinPediatricCalculator from './pages/Calculators/AugmentinPediatricCalculator'
import AccutaneCumulativeDoseCalculator from './pages/Calculators/AccutaneCumulativeDoseCalculator'
import ParacetamolPediatricCalculator from './pages/Calculators/ParacetamolPediatricCalculator'
import AmoxicillinDoseCalculator from './pages/Calculators/AmoxicillinDoseCalculator'
import AzithromycinDoseCalculator from './pages/Calculators/AzithromycinDoseCalculator'
import InsulinDoseCalculator from './pages/Calculators/InsulinDoseCalculator'
import OpioidConversionCalculator from './pages/Calculators/OpioidConversionCalculator'
import AnionGapCalculator from './pages/Calculators/AnionGapCalculator'
import PediatricDexamethasoneCalculator from './pages/Calculators/PediatricDexamethasoneCalculator'
import AcetaminophenLethalDoseCalculator from './pages/Calculators/AcetaminophenLethalDoseCalculator'
import TSHLevothyroxineDoseCalculator from './pages/Calculators/TSHLevothyroxineDoseCalculator'
import PediatricTylenolCalculator from './pages/Calculators/PediatricTylenolCalculator'
import PrednisolonePediatricCalculator from './pages/Calculators/PrednisolonePediatricCalculator'
//legal imports
import PrivacyPolicy from './pages/Legal/PrivacyPolicy'
import TermsOfService from './pages/Legal/Term'
import Disclaimer  from './pages/Legal/Disclaimer'
import Cookie  from './pages/Legal/Cookie'


const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        {/* main pages */}
        <Route path="/" element={<Home />} />
        <Route path="/calculators" element={<DoseCalculator />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/faqs" element={<FAQS />} />
        {/* legal Pages */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/disclaimer" element={<Disclaimer  />} />
        <Route path="/cookies" element={<Cookie  />} />


        {/* calculators */}
        <Route path='/calculators/Pediatric-Dose-Calculator' element={<PediatricDoseCalculator />} />
        <Route path='/calculators/Augmentin-Pediatric-Dose-Calculator' element={<AugmentinPediatricCalculator />} />
        <Route path='/calculators/Accutane-Cumulative-Dose-Calculator' element={<AccutaneCumulativeDoseCalculator />} />
        <Route path='/calculators/Paracetamol-Pediatric-Calculator' element={<ParacetamolPediatricCalculator />} />
        <Route path='/calculators/Amoxicillin-Dose-Calculator' element={<AmoxicillinDoseCalculator />} />
        <Route path='/calculators/Azithromycin-Dose-Calculator' element={<AzithromycinDoseCalculator />} />
        <Route path='/calculators/Insulin-Dose-Calculator' element={<InsulinDoseCalculator />} />
        <Route path='/calculators/Opioid-Conversion-Calculator' element={<OpioidConversionCalculator />} />
        <Route path='/calculators/Anion-Gap-Calculator' element={<AnionGapCalculator />} />
        <Route path='/calculators/Pediatric-Dexamethasone-Calculator' element={<PediatricDexamethasoneCalculator />} />
        <Route path='/calculators/Acetaminophen-Lethal-Dose-Calculator' element={<AcetaminophenLethalDoseCalculator />} />
        <Route path='/calculators/TSH-Levothyroxine-Dose-Calculator' element={<TSHLevothyroxineDoseCalculator />} />
        <Route path='/calculators/Pediatric-Tylenol-Calculator' element={<PediatricTylenolCalculator />} />
        <Route path='/calculators/Prednisolone-Pediatric-Calculator' element={<PrednisolonePediatricCalculator />} />
      </Routes>

      <Footer/>
    </>
  )
}

export default App