import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import CoursePlayer from "./pages/CoursePlayer";
import JournalTrading from "./pages/JournalTrading";
import Community from "./pages/Community";
import TraderProfile from "./pages/TraderProfile";
import Payment from "./pages/Payment";
import About from "./pages/About";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* HOME */}

        <Route
          path="/"
          element={<Home />}
        />

        {/* ABOUT */}

        <Route
          path="/about"
          element={<About />}
        />

        {/* LOGIN */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* REGISTER */}

        <Route
          path="/register"
          element={<Register />}
        />

        {/* ADMIN */}

        <Route
          path="/admin"
          element={<Admin />}
        />

        {/* JOURNAL */}

        <Route
          path="/journal"
          element={<JournalTrading />}
        />

        {/* COMMUNITY */}

        <Route
          path="/community"
          element={<Community />}
        />

        {/* PROFILE */}

        <Route
          path="/profile"
          element={<JournalTrading />}
        />

        {/* PAYMENT */}

        <Route
          path="/payment"
          element={<Payment />}
        />

        {/* TRADER PROFILE */}

        <Route
          path="/trader/:uid"
          element={<TraderProfile />}
        />

        {/* COURSE PLAYER */}

        <Route
          path="/course/:id"
          element={<CoursePlayer />}
        />

      </Routes>

    </BrowserRouter>

  );

}

export default App;