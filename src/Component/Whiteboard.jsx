import { useEffect, useRef, useState } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const wsRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const lineWidth = 3;

  const drawFromSocket = (data) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (data.type === "DRAW") {
      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.lineWidth;

      if (data.isStart) {
        ctx.beginPath();
        ctx.moveTo(data.x, data.y);
      } else {
        ctx.lineTo(data.x, data.y);
        ctx.stroke();
      }
    }

    if (data.type === "CLEAR") {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = 1200;
    canvas.height = 500;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);


  useEffect(() => {
    wsRef.current = new WebSocket("ws://localhost:8080");

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      drawFromSocket(data);
    };

    return () => wsRef.current.close();
  }, []);

  const startDrawing = (e) => {
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    const ctx = canvasRef.current.getContext("2d");

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);

    sendDrawData(x, y, true);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    const ctx = canvasRef.current.getContext("2d");

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineTo(x, y);
    ctx.stroke();

    sendDrawData(x, y, false);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const sendDrawData = (x, y, isStart) => {
    if (!wsRef.current) return;

    wsRef.current.send(
      JSON.stringify({
        type: "DRAW",
        x,
        y,
        color,
        lineWidth,
        isStart
      })
    );
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    wsRef.current.send(JSON.stringify({ type: "CLEAR" }));
  };


  return (
    <div style={{ padding: "20px" }}>
      <h2>🖌️ Collaborative Drawing App</h2>

      <div style={{ marginBottom: "10px" }}>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <button onClick={clearCanvas} style={{ marginLeft: "10px" }}>
          Clear
        </button>
      </div>

      <canvas
        ref={canvasRef}
        style={{ border: "1px solid black", cursor: "crosshair" }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
}
