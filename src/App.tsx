import "./App.css";
import SpeedReader from "./SpeedReader";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  return (
    <div
      style={{ width: "50vw", minWidth: 320, maxWidth: 900, margin: "0 auto" }}
    >
      <Header />
      <SpeedReader />
      <Footer />
    </div>
  );
}

export default App;
