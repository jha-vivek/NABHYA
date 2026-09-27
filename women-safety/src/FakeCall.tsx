import { useEffect, useState } from "react";

function FakeCall() {
  const [callState, setCallState] = useState<
    "setup" | "ringing" | "connected"
  >("setup");

  const [callerName, setCallerName] = useState("Mom");
  const [callerNumber, setCallerNumber] = useState("+91 XXXXX XXXXX");
  const [callSeconds, setCallSeconds] = useState(0);

  useEffect(() => {
    if (callState !== "connected") {
      return;
    }

    const timer = window.setInterval(() => {
      setCallSeconds((current) => current + 1);
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [callState]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      secs
    ).padStart(2, "0")}`;
  };

  const startFakeCall = () => {
    setCallSeconds(0);
    setCallState("ringing");
  };

  const answerCall = () => {
    setCallSeconds(0);
    setCallState("connected");
  };

  const endCall = () => {
    setCallState("setup");
    setCallSeconds(0);
  };

  if (callState === "ringing") {
    return (
      <div className="fake-call-page fake-call-ringing">
        <div className="fake-call-card">
          <div className="fake-call-status">
            <span></span>
            INCOMING CALL
          </div>

          <div className="caller-avatar ringing">
            {callerName.charAt(0).toUpperCase()}
          </div>

          <h1>{callerName}</h1>

          <p className="caller-number">{callerNumber}</p>

          <p className="ringing-text">
            Incoming call...
          </p>

          <div className="fake-call-actions">
            <button
              className="fake-call-decline"
              onClick={endCall}
            >
              <span>✕</span>
              Decline
            </button>

            <button
              className="fake-call-answer"
              onClick={answerCall}
            >
              <span>✓</span>
              Answer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (callState === "connected") {
    return (
      <div className="fake-call-page fake-call-connected">
        <div className="fake-call-card">
          <div className="fake-call-status connected">
            <span></span>
            CALL CONNECTED
          </div>

          <div className="caller-avatar connected">
            {callerName.charAt(0).toUpperCase()}
          </div>

          <h1>{callerName}</h1>

          <p className="caller-number">{callerNumber}</p>

          <div className="call-duration">
            {formatTime(callSeconds)}
          </div>

          <p className="call-simulation-text">
            Simulated call
          </p>

          <button
            className="fake-call-end"
            onClick={endCall}
          >
            <span>✕</span>
            End Call
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fake-call-page">
      <div className="fake-call-setup-card">
        <div className="fake-call-header">
          <div className="fake-call-icon">📞</div>

          <div>
            <div className="fake-call-badge">
              DISCREET SAFETY TOOL
            </div>

            <h1>Fake Call</h1>

            <p>
              Create a simulated incoming call when you need
              a reason to leave an uncomfortable situation.
            </p>
          </div>
        </div>

        <div className="fake-call-divider"></div>

        <label>CALLER NAME</label>

        <input
          type="text"
          value={callerName}
          onChange={(e) => setCallerName(e.target.value)}
          placeholder="e.g. Mom"
        />

        <label>PHONE NUMBER</label>

        <input
          type="tel"
          value={callerNumber}
          onChange={(e) => setCallerNumber(e.target.value)}
          placeholder="+91 XXXXX XXXXX"
        />

        <div className="fake-call-preview">
          <div className="preview-caller-avatar">
            {callerName.trim()
              ? callerName.charAt(0).toUpperCase()
              : "?"}
          </div>

          <div>
            <strong>
              {callerName.trim() || "Caller Name"}
            </strong>

            <small>{callerNumber}</small>
          </div>

          <span>📞</span>
        </div>

        <button
          className="start-fake-call-button"
          onClick={startFakeCall}
          disabled={!callerName.trim()}
        >
          📞 Start Fake Call
        </button>

        <div className="fake-call-note">
          <span>🔒</span>

          <p>
            This is a simulated call. It does not contact the
            person whose name or number you enter.
          </p>
        </div>
      </div>
    </div>
  );
}

export default FakeCall;