"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export default function SocketTest() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<string>("Not connected");
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${msg}`]);
    console.log(msg);
  };

  const testConnection = () => {
    setLogs([]);
    addLog("🔄 Starting connection test...");
    
    const url = "http://localhost:4000";
    addLog(`📡 Connecting to: ${url}`);
    
    const newSocket = io(url, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 3,
      timeout: 10000,
    });

    newSocket.on("connect", () => {
      addLog(`✅ Connected! Socket ID: ${newSocket.id}`);
      setStatus("Connected ✅");
    });

    newSocket.on("disconnect", (reason) => {
      addLog(`❌ Disconnected: ${reason}`);
      setStatus("Disconnected ❌");
    });

    newSocket.on("connect_error", (err) => {
      addLog(`❌ Connection Error: ${err.message}`);
      addLog(`   Error type: ${err.type || 'unknown'}`);
      addLog(`   Error description: ${err.description || 'none'}`);
      setStatus("Connection Failed ❌");
    });

    newSocket.on("connect_timeout", () => {
      addLog(`⏱️ Connection Timeout`);
      setStatus("Timeout ❌");
    });

    newSocket.on("reconnect_attempt", (attempt) => {
      addLog(`🔄 Reconnection attempt ${attempt}...`);
    });

    newSocket.on("reconnect_failed", () => {
      addLog(`❌ Reconnection failed after all attempts`);
    });

    setSocket(newSocket);
  };

  const disconnect = () => {
    if (socket) {
      addLog("🔌 Disconnecting...");
      socket.close();
      setSocket(null);
      setStatus("Manually disconnected");
    }
  };

  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">🔌 Socket Connection Test</h1>

        {/* Status Card */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Connection Status</h2>
              <p className="text-2xl">{status}</p>
            </div>
            <div className="space-x-4">
              <button
                onClick={testConnection}
                disabled={socket?.connected}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold"
              >
                🚀 Test Connection
              </button>
              <button
                onClick={disconnect}
                disabled={!socket || !socket.connected}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold"
              >
                🔌 Disconnect
              </button>
            </div>
          </div>
        </div>

        {/* Server Info */}
        <div className="bg-blue-900 border border-blue-600 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📋 Expected Server</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>URL: <span className="text-yellow-300">http://localhost:4000</span></div>
            <div>Transports: <span className="text-yellow-300">websocket, polling</span></div>
            <div>CORS: <span className="text-yellow-300">Enabled</span></div>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">📝 Connection Logs</h2>
          <div className="bg-black rounded p-4 h-96 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-500">Click "Test Connection" to start...</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">🔧 Troubleshooting</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              <strong>Check if signaling server is running:</strong>
              <pre className="bg-black p-2 mt-1 rounded text-sm">
                cd medisphere-signaling-server{"\n"}
                npm run dev
              </pre>
            </li>
            <li>
              <strong>Should see:</strong> "Signaling server running on 4000"
            </li>
            <li>
              <strong>Test the server directly:</strong> 
              <a href="http://localhost:4000/health" target="_blank" className="text-blue-300 ml-2">
                http://localhost:4000/health
              </a>
              <div className="text-sm text-gray-400 ml-6">Should return: {`{"ok":true}`}</div>
            </li>
            <li>
              <strong>Check browser console (F12)</strong> for CORS or network errors
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
