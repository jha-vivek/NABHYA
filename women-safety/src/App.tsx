import { useEffect, useState } from "react";
import "./App.css";
import TrustedContacts from "./TrustedContacts";
import SafetyMap from "./SafetyMap";
import SafetyCheckIn from "./SafetyCheckIn";
import FakeCall from "./FakeCall";
import EmergencyHelpline from "./EmergencyHelpline";
import DangerPhrase from "./DangerPhrase";
import EmergencyCenter from "./EmergencyCenter";
import { getCurrentLocation } from "./LocationService";

type TrustedContact = {
  id: number;
  name: string;
  phone: string;
  relation: string;
  primary: boolean;
};

function App() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [showSafetyMap, setShowSafetyMap] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showFakeCall, setShowFakeCall] = useState(false);
  const [showHelpline, setShowHelpline] = useState(false);
  const [showDangerPhrase, setShowDangerPhrase] = useState(false);
  const [sosActive, setSosActive] = useState(false);

  const [sosLocation, setSosLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);

  const [trustedContacts, setTrustedContacts] = useState<
    TrustedContact[]
  >([]);

  useEffect(() => {
    const savedContacts = localStorage.getItem("nabhya_contacts");

    if (savedContacts) {
      try {
        setTrustedContacts(JSON.parse(savedContacts));
      } catch (error) {
        console.error(
          "Unable to load trusted contacts:",
          error
        );
      }
    }
  }, []);

  const activateSOS = async () => {
    setShowConfirmation(false);

    try {
      const location = await getCurrentLocation();

      setSosLocation(location);
      setSosActive(true);
    } catch (error) {
      console.error(error);

      alert(
        "SOS started, but location could not be detected. Please allow location access."
      );

      setSosLocation(null);
      setSosActive(true);
    }
  };

  const endSOS = () => {
    setSosActive(false);
    setSosLocation(null);
  };

  const goToDashboard = () => {
    setShowContacts(false);
    setShowSafetyMap(false);
    setShowCheckIn(false);
    setShowFakeCall(false);
    setShowHelpline(false);
    setShowDangerPhrase(false);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">🛡️ Nabhya</div>

        <button className="menu-button">☰</button>
      </header>

      {showContacts ? (
        <main className="dashboard">
          <button
            className="back-button"
            onClick={goToDashboard}
          >
            ← Back to Dashboard
          </button>

          <TrustedContacts />
        </main>
      ) : showSafetyMap ? (
        <main className="dashboard">
          <button
            className="back-button"
            onClick={goToDashboard}
          >
            ← Back to Dashboard
          </button>

          <SafetyMap />
        </main>
      ) : showCheckIn ? (
        <main className="dashboard">
          <button
            className="back-button"
            onClick={goToDashboard}
          >
            ← Back to Dashboard
          </button>

          <SafetyCheckIn />
        </main>
      ) : showFakeCall ? (
        <main className="dashboard">
          <button
            className="back-button"
            onClick={goToDashboard}
          >
            ← Back to Dashboard
          </button>

          <FakeCall />
        </main>
      ) : showHelpline ? (
        <main className="dashboard">
          <button
            className="back-button"
            onClick={goToDashboard}
          >
            ← Back to Dashboard
          </button>

          <EmergencyHelpline />
        </main>
      ) : showDangerPhrase ? (
        <main className="dashboard">
          <button
            className="back-button"
            onClick={goToDashboard}
          >
            ← Back to Dashboard
          </button>

          <DangerPhrase />
        </main>
      ) : (
        <main className="dashboard">
          <section className="welcome">
            <p className="small-text">WELCOME BACK</p>

            <h1>Your safety matters.</h1>

            <p className="subtitle">
              Quick access to emergency and safety tools.
            </p>
          </section>

          <section className="location-test">
            <h2>📍 Location Test</h2>

            <p>
              Check whether Nabhya can access your current
              location.
            </p>

            <button
              onClick={async () => {
                try {
                  const location = await getCurrentLocation();

                  alert(
                    `Location detected!\n\nLatitude: ${location.latitude}\nLongitude: ${location.longitude}\nAccuracy: ${Math.round(
                      location.accuracy
                    )} meters`
                  );
                } catch (error) {
                  console.error(error);

                  alert(
                    "Unable to get your location. Please allow location permission."
                  );
                }
              }}
            >
              Detect My Location
            </button>
          </section>

          <section className="sos-section">
            <button
              className="sos-button"
              onClick={() => setShowConfirmation(true)}
            >
              SOS
            </button>

            <p className="sos-text">
              Press for emergency assistance
            </p>
          </section>

          <section className="quick-actions">
            <button
              className="action-card"
              onClick={() => setShowContacts(true)}
            >
              <span>👥</span>

              <strong>Trusted Contacts</strong>

              <small>Manage emergency contacts</small>
            </button>

            <button
              className="action-card"
              onClick={() => setShowSafetyMap(true)}
            >
              <span>📍</span>

              <strong>Safety Map</strong>

              <small>Find nearby help</small>
            </button>

            <button
              className="action-card"
              onClick={() => setShowCheckIn(true)}
            >
              <span>⏰</span>

              <strong>Safety Check-in</strong>

              <small>Let someone know you're safe</small>
            </button>

            <button
              className="action-card"
              onClick={() => setShowFakeCall(true)}
            >
              <span>📞</span>

              <strong>Fake Call</strong>

              <small>Create a simulated call</small>
            </button>

            <button
              className="action-card"
              onClick={() => setShowDangerPhrase(true)}
            >
              <span>🎙️</span>

              <strong>Danger Phrase</strong>

              <small>Set a discreet SOS phrase</small>
            </button>
          </section>

          <section className="emergency-info">
            <h2>Need help?</h2>

            <p>
              Use SOS or access emergency services when you feel
              unsafe.
            </p>

            <button
              className="help-button"
              onClick={() => setShowHelpline(true)}
            >
              View Emergency Help
            </button>
          </section>
        </main>
      )}

      {showConfirmation && (
        <div className="sos-overlay">
          <div className="sos-confirmation">
            <h2>Are you in danger?</h2>

            <p>
              Activate SOS only if you need emergency
              assistance.
            </p>

            <div className="confirmation-buttons">
              <button
                className="cancel-button"
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </button>

              <button
                className="activate-button"
                onClick={activateSOS}
              >
                Activate SOS
              </button>
            </div>
          </div>
        </div>
      )}

      {sosActive && (
        <div className="sos-active-overlay">
          <div className="sos-active-card emergency-center-wrapper">
            <EmergencyCenter
              latitude={sosLocation?.latitude ?? null}
              longitude={sosLocation?.longitude ?? null}
              accuracy={sosLocation?.accuracy ?? null}
              contactsCount={trustedContacts.length}
              onEndSOS={endSOS}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;