import { useEffect, useState } from "react";

function DangerPhrase() {
  const [phrase, setPhrase] = useState("");
  const [savedPhrase, setSavedPhrase] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("nabhya_danger_phrase");

    if (saved) {
      setSavedPhrase(saved);
      setPhrase(saved);
    }
  }, []);

  const savePhrase = () => {
    const cleanPhrase = phrase.trim();

    if (cleanPhrase.length < 3) {
      alert("Please enter a longer danger phrase.");
      return;
    }

    localStorage.setItem(
      "nabhya_danger_phrase",
      cleanPhrase
    );

    setSavedPhrase(cleanPhrase);

    alert("Danger phrase saved successfully.");
  };

  const removePhrase = () => {
    const confirmed = window.confirm(
      "Remove your saved danger phrase?"
    );

    if (!confirmed) return;

    localStorage.removeItem("nabhya_danger_phrase");

    setPhrase("");
    setSavedPhrase("");
    setDetected(false);
    setIsListening(false);
  };

  const startListening = () => {
    if (!savedPhrase) {
      alert("Please save a danger phrase first.");
      return;
    }

    setDetected(false);
    setIsListening(true);
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const simulateDetection = () => {
    if (!isListening || !savedPhrase) return;

    setDetected(true);
    setIsListening(false);
  };

  return (
    <div className="danger-phrase-page">
      <div className="danger-phrase-header">
        <div className="danger-phrase-badge">
          🎙️ DISCREET SOS
        </div>

        <h1>Danger Phrase</h1>

        <p>
          Set a private phrase that can be used as a trigger
          for an emergency response.
        </p>
      </div>

      <div className="danger-phrase-card">
        <div className="danger-section-title">
          <span>🔐</span>

          <div>
            <h2>Your Secret Phrase</h2>

            <p>
              Choose a phrase that feels natural to say.
            </p>
          </div>
        </div>

        <label>DANGER PHRASE</label>

        <input
          type="text"
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
          placeholder='e.g. "Mujhe ghar jaana hai"'
        />

        <button
          className="save-danger-phrase"
          onClick={savePhrase}
        >
          🔒 Save Danger Phrase
        </button>

        {savedPhrase && (
          <div className="saved-danger-phrase">
            <div className="saved-danger-icon">✓</div>

            <div>
              <strong>Danger phrase saved</strong>

              <span>
                Your phrase is stored on this device.
              </span>
            </div>
          </div>
        )}
      </div>

      {savedPhrase && (
        <div className="danger-monitor-card">
          <div className="monitor-header">
            <div>
              <span className="monitor-badge">
                PROTOTYPE MODE
              </span>

              <h2>Phrase Detection</h2>

              <p>
                Test the emergency trigger workflow.
              </p>
            </div>

            <div
              className={
                isListening
                  ? "microphone-icon active"
                  : "microphone-icon"
              }
            >
              🎙️
            </div>
          </div>

          <div
            className={
              isListening
                ? "listening-status active"
                : "listening-status"
            }
          >
            <span></span>

            {isListening
              ? "Listening for your danger phrase..."
              : "Detection is currently off"}
          </div>

          {!isListening ? (
            <button
              className="start-listening-button"
              onClick={startListening}
            >
              🎙️ Start Detection
            </button>
          ) : (
            <>
              <button
                className="stop-listening-button"
                onClick={stopListening}
              >
                Stop Detection
              </button>

              <button
                className="simulate-detection-button"
                onClick={simulateDetection}
              >
                🚨 Simulate Phrase Detection
              </button>
            </>
          )}

          {detected && (
            <div className="danger-detected-box">
              <div className="detected-icon">🚨</div>

              <div>
                <strong>Danger Phrase Detected</strong>

                <p>
                  Emergency workflow has been triggered in
                  this prototype.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <button
        className="remove-danger-phrase"
        onClick={removePhrase}
        disabled={!savedPhrase}
      >
        Remove Saved Phrase
      </button>

      <div className="danger-phrase-note">
        <span>⚠️</span>

        <p>
          This browser prototype does not continuously listen
          for your voice in the background. The detection
          button above simulates the future mobile-app
          functionality.
        </p>
      </div>
    </div>
  );
}

export default DangerPhrase;