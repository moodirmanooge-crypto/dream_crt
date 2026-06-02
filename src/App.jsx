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

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

<Route
  path="/journal"
  element={<JournalTrading />}
/>

<Route
  path="/community"
  element={<Community />}
/>

<Route
  path="/profile"
  element={<TraderProfile />}
/>

<Route
  path="/admin"
  element={<Admin />}
/>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
  path="/course/:id"
  element={<CoursePlayer />}
/>

      </Routes>

    </BrowserRouter>

  );

}

export default App;