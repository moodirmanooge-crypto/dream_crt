import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Admin from "./pages/Admin.jsx";
import CoursePlayer from "./pages/CoursePlayer.jsx";
import JournalTrading from "./pages/JournalTrading.jsx";
import Community from "./pages/Community.jsx";
import TraderProfile from "./pages/TraderProfile.jsx";
import Payment from "./pages/Payment.jsx";
import About from "./pages/About.jsx";
import TradingTemplate from "./pages/TradingTemplate.jsx";
import MyCourses from "./pages/mycourses.jsx";
import Contact from "./pages/contact.jsx";
import TradeHistory from "./pages/TradeHistory.jsx";
import Archives from "./pages/archiven.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/journal" element={<JournalTrading />} />
        <Route path="/community" element={<Community />} />
        <Route path="/profile" element={<JournalTrading />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/trader/:uid" element={<TraderProfile />} />
        <Route path="/template" element={<TradingTemplate />} />
        <Route path="/course/:id" element={<CoursePlayer />} />
        <Route path="/mycourses" element={<MyCourses />} />
        <Route path="/history" element={<TradeHistory />} />
        <Route path="/archives" element={<Archives />} />
        <Route path="/Achievements" element={<Archives />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;