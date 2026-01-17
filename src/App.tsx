import CityMap from "./Map";

function App() {
  return (
    <div className="relative w-screen h-screen bg-black">
      {/* 1. The 3D Map */}
      <CityMap />

      {/* 2. Simple Overlay UI */}
      <div className="absolute top-6 left-6 pointer-events-none z-10">
        <h1 className="text-4xl font-black text-white tracking-tighter drop-shadow-md">
          METRO<span className="text-cyan-400">VERSE</span>
        </h1>
        <div className="text-xs text-gray-400 font-mono mt-1">
          SYSTEM ONLINE // V2.0
        </div>
      </div>
    </div>
  );
}

export default App;
