import React, { useState, useRef, useEffect } from "react";
import "./App.css";

/*
  PUBLIC_INTERFACE
  Main App component for Spot the Difference game.
  - Displays two images side by side.
  - Allows interactive marking of found differences.
  - Tracks differences remaining.
  - Shows feedback on win.
  - Supports restart/new game.
*/

const IMAGE_SIZE = 480; // px; assumed for demo; should match public/image sizes

// For demonstration: a static set of difference points (as [x, y] relative to image size, values in 0-1)
const DEMO_DIFFERENCES = [
  [0.12, 0.28],
  [0.25, 0.61],
  [0.32, 0.15],
  [0.39, 0.72],
  [0.48, 0.54],
  [0.57, 0.38],
  [0.66, 0.13],
  [0.73, 0.76],
  [0.81, 0.42],
  [0.93, 0.23],
];

// Minimum pixel distance to accept as a found difference (radius for hit check)
const DIFF_RADIUS_PX = 35;

// Demo images (could be public/image1.jpg, ... in real app)
const IMAGE_LEFT = "https://images.unsplash.com/photo-1611095564985-e5b498e3326e?auto=format&fit=crop&w=480&q=80";
const IMAGE_RIGHT = "https://images.unsplash.com/photo-1611095565275-2d981c25f3b0?auto=format&fit=crop&w=480&q=80";

function getDistance(x1, y1, x2, y2) {
  return Math.sqrt((x1-x2)**2 + (y1-y2)**2);
}

// PUBLIC_INTERFACE
function App() {
  // The game state: for full app, consider a reducer or context for larger games
  const [foundIndices, setFoundIndices] = useState([]);     // Array of difference indices found (0-9)
  const [message, setMessage] = useState("");               // Feedback message (e.g., for miss, win, etc.)
  const [gameOver, setGameOver] = useState(false);          // Win state

  // Refs to measure image position for click coordinates
  const leftImgRef = useRef(null);

  // Reset the game state
  // PUBLIC_INTERFACE
  function handleRestart() {
    setFoundIndices([]);
    setMessage("");
    setGameOver(false);
  }

  // Map a click event to [x, y] in 0-1 relative space, given the image node ref
  function getRelativeCoords(event, imgRef) {
    const rect = imgRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    // Clamp to [0,1]
    return [Math.max(0, Math.min(x, 1)), Math.max(0, Math.min(y, 1))];
  }

  // PUBLIC_INTERFACE
  // Handle user marking a difference by clicking on the left image
  function handleImageClick(event) {
    if (gameOver) return;
    const [xClick, yClick] = getRelativeCoords(event, leftImgRef);

    // Find the closest unmatched difference within DIFF_RADIUS_PX
    let best = -1;
    let minDist = Infinity;
    DEMO_DIFFERENCES.forEach(([dx, dy], i) => {
      if (foundIndices.includes(i)) return;
      const px = dx * leftImgRef.current.width;
      const py = dy * leftImgRef.current.height;
      const dist = getDistance(xClick * leftImgRef.current.width, yClick * leftImgRef.current.height, px, py);
      if (dist < minDist) {
        minDist = dist;
        best = i;
      }
    });
    if (best !== -1 && minDist <= DIFF_RADIUS_PX) {
      // Correct!
      setFoundIndices(fi => {
        const updated = [...fi, best];
        if (updated.length === DEMO_DIFFERENCES.length) {
          setGameOver(true);
          setMessage("🎉 Congratulations! You found all differences!");
        } else {
          setMessage("✅ Good eye! Difference found.");
        }
        return updated;
      });
    } else {
      setMessage("❌ No difference found there. Try again!");
    }
  }

  // For demo: fake 'new game' just resets state; replace with real new images/differences
  function handleNewGame() {
    handleRestart();
    // Here, fetch new images/differences if dynamic backend exists
    // For now, use same demo
  }

  // Optional: hide feedback message after a few seconds
  useEffect(() => {
    if (message && !gameOver) {
      const timeout = setTimeout(() => setMessage(""), 1700);
      return () => clearTimeout(timeout);
    }
  }, [message, gameOver]);

  // Theming support: Use system CSS var colors plus project accent color
  useEffect(() => {
    document.documentElement.style.setProperty('--primary', '#1e40af');
    document.documentElement.style.setProperty('--secondary', '#6b7280');
    document.documentElement.style.setProperty('--accent', '#fbbf24');
  }, []);

  // --- Render ---
  return (
    <div className="App">
      <header className="game-header" style={{
        background: "var(--primary)", color: "white", borderBottom: "2px solid var(--accent)", boxShadow: "0 2px 8px rgba(30, 64, 175,.12)"
      }}>
        <h1 className="game-title" style={{marginBottom: 8, fontWeight: 800, letterSpacing: 0.3}}>Spot the Difference</h1>
        <div className="game-controls">
          <span><b>{DEMO_DIFFERENCES.length - foundIndices.length}</b> differences remaining</span>
          <button className="restart-btn" onClick={handleRestart}>Restart</button>
          <button className="newgame-btn" style={{marginLeft: 10}} onClick={handleNewGame}>New Game</button>
        </div>
        <div className="progress-bar" aria-label="Differences found" role="progressbar"
          aria-valuenow={foundIndices.length}
          aria-valuemax={DEMO_DIFFERENCES.length}
          style={{
            margin: "12px auto 0 auto", width: 180, height: 8, background: "#fff4", borderRadius: 5, overflow: "hidden"
          }}>
          <div style={{
            height: "100%", width: `${(100*foundIndices.length/DEMO_DIFFERENCES.length)}%`, background: "var(--accent)", borderRadius: 5, transition: "width 0.3s"
          }}/>
        </div>
      </header>
      <main className="game-main" style={{
        display: "flex", flexDirection: "row", gap: 20, justifyContent: "center", alignItems: "center", minHeight: "66vh", background: "var(--bg-primary)", marginTop: 0, padding: "3vh 0"
      }}>
        <section className="image-panel" aria-label="Left image (interactive)" style={{position:"relative"}}>
          <img
            src={IMAGE_LEFT}
            ref={leftImgRef}
            width={IMAGE_SIZE}
            height={IMAGE_SIZE}
            alt="Left - Spot differences"
            className="game-image"
            style={{
              border: `3px solid var(--primary)`,
              boxShadow: "0 4px 24px rgba(30,64,175,0.07)",
              borderRadius: 10,
              cursor: gameOver ? "not-allowed" : "crosshair",
              userSelect: "none"
            }}
            onClick={handleImageClick}
            draggable={false}
          />
          {/* Markers for found differences (left image) */}
          {foundIndices.map(idx => {
            const [dx, dy] = DEMO_DIFFERENCES[idx];
            return (
              <DifferenceMarker key={idx} x={dx} y={dy} isActive={true} />
            );
          })}
          {/* Show marker on click miss? Optionally could add */}
        </section>
        <section className="image-panel" aria-label="Right image" style={{position:"relative"}}>
          <img
            src={IMAGE_RIGHT}
            width={IMAGE_SIZE}
            height={IMAGE_SIZE}
            alt="Right - Spot differences"
            className="game-image"
            style={{
              border: `3px solid var(--secondary)`,
              boxShadow: "0 4px 18px rgba(107,114,128,0.07)",
              borderRadius: 10,
              userSelect: "none"
            }}
            draggable={false}
          />
          {/* Synchronize markers on right for found differences */}
          {foundIndices.map(idx => {
            const [dx, dy] = DEMO_DIFFERENCES[idx];
            return (
              <DifferenceMarker key={idx} x={dx} y={dy} color="var(--accent)" isActive={true}/>
            );
          })}
        </section>
      </main>
      <section style={{minHeight:30, marginTop: 10 }}>
        {message && (
          <div className="feedback-message"
               style={{
                margin: "0 auto", background: "#fbbf2477", color: "#202020", borderRadius: 7, padding: "12px 28px",
                 fontWeight: 500, fontSize: 18, display: "inline-block", minWidth: 160, letterSpacing: 0.1, boxShadow: "0 2px 8px #eab30811"
               }}>
            {message}
          </div>
        )}
      </section>
      {gameOver && (
        <section className="win-modal" tabIndex={-1} aria-modal="true"
          style={{
            position: "fixed", top:0, left:0, width: "100vw", height:"100vh", background: "rgba(0,0,0,0.30)",
            zIndex: 88, display: "flex", alignItems: "center", justifyContent: "center"
          }}>
          <div style={{
            background: "#fff", minWidth: 350, maxWidth: "88vw", borderRadius: 11, boxShadow: "0 4px 36px #40404033",
            padding: "32px 25px 18px 25px", textAlign: "center", position: "relative"
          }}>
            <h2 style={{color: "var(--primary)", fontWeight: 700}}>You won! 🏆</h2>
            <div style={{fontSize: 19, color: "#888", marginBottom: 18}}>You found all {DEMO_DIFFERENCES.length} differences.<br/>Great job!</div>
            <button onClick={handleNewGame} className="newgame-btn" style={{marginRight:10}}>Play Again</button>
            <button onClick={() => setGameOver(false)} style={{background: "#aaa"}}>Dismiss</button>
          </div>
        </section>
      )}
      <footer style={{
        marginTop: 30, padding: "13px 0 18px 0", fontSize: 15, color: "var(--secondary)", letterSpacing: 0.01,
        background: "none"}}>
        <span>Difference Detective &copy; {new Date().getFullYear()} | Made with <span style={{color:"var(--accent)"}}>Spot the Difference</span></span>
      </footer>
    </div>
  );
}

/*
  PUBLIC_INTERFACE
  DifferenceMarker visualizes a found difference as a marker overlay.
  x, y are in 0-1 range relative to image.
*/
function DifferenceMarker({ x, y, color="var(--accent)", isActive }) {
  const size = 32;
  return (
    <div
      className="difference-marker"
      aria-label="Found difference location"
      style={{
        position: "absolute",
        left: `calc(${x*100}% - ${size/2}px)`,
        top: `calc(${y*100}% - ${size/2}px)`,
        width: size,
        height: size,
        borderRadius: "50%",
        border: `3px solid ${color}`,
        background: isActive ? `${color}33` : "#fff4",
        boxShadow: isActive ? `0 2px 10px ${color}33` : "none",
        pointerEvents: "none",
        zIndex: 30,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.2s"
      }}
    >
      <span role="img" aria-label="Check" style={{fontSize: 19, filter:"drop-shadow(0px 1px 8px #fff)"}}>✔️</span>
    </div>
  );
}

export default App;
