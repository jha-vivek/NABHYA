import { useEffect, useState } from "react";
import { getCurrentLocation } from "./LocationService";

type TrustedContact = {
  id: number;
  name: string;
  phone: string;
  relation: string;
  primary: boolean;
};

type CheckInLocation = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

function SafetyCheckIn() {
  const [duration, setDuration] = useState(30);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [location, setLocation] = useState<CheckInLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [selectedContact, setSelectedContact] =
    useState<TrustedContact | null>(null);

  useEffect(() => {
    const savedContacts = localStorage.getItem("nabhya_contacts");

    if (savedContacts) {
      try {
        const parsedContacts = JSON.parse(savedContacts);
        setContacts(parsedContacts);

        const primaryContact = parsedContacts.find(
          (contact: TrustedContact) => contact.primary
        );

        if (primaryContact) {
          setSelectedContact(primaryContact);
        }
      } catch (error) {
        console.error("Unable to load trusted contacts:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (!isActive || remainingSeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setIsActive(false);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isActive, remainingSeconds]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      secs
    ).padStart(2, "0")}`;
  };

  const startCheckIn = async () => {
    setLocationLoading(true);
    setIsCompleted(false);

    try {
      const currentLocation = await getCurrentLocation();

      setLocation(currentLocation);
      setRemainingSeconds(duration * 60);
      setIsActive(true);
    } catch (error) {
      console.error(error);

      alert(
        "Nabhya could not access your location. Please allow location permission and try again."
      );
    } finally {
      setLocationLoading(false);
    }
  };

  const markSafe = () => {
    setIsActive(false);
    setRemainingSeconds(0);
    setIsCompleted(true);
  };

  const cancelCheckIn = () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel the safety check-in?"
    );

    if (!confirmed) return;

    setIsActive(false);
    setRemainingSeconds(0);
    setLocation(null);
    setIsCompleted(false);
  };

  const resetCheckIn = () => {
    setIsActive(false);
    setRemainingSeconds(0);
    setLocation(null);
    setIsCompleted(false);
  };

  const timerExpired =
    !isActive &&
    remainingSeconds === 0 &&
    location !== null &&
    !isCompleted;

  if (isCompleted) {
    return (
      <div className="checkin-page">
        <div className="checkin-success-card">
          <div className="checkin-success-icon">✓</div>

          <div className="checkin-badge success">
            CHECK-IN COMPLETE
          </div>

          <h1>You're Safe</h1>

          <p>
            Your safety check-in has been completed successfully.
          </p>

          {selectedContact && (
            <div className="checkin-contact-info">
              <span>👤</span>
              <div>
                <strong>{selectedContact.name}</strong>
                <small>{selectedContact.relation}</small>
              </div>
            </div>
          )}

          <button
            className="checkin-primary-button"
            onClick={resetCheckIn}
          >
            Start New Check-in
          </button>
        </div>
      </div>
    );
  }

  if (timerExpired) {
    return (
      <div className="checkin-page">
        <div className="checkin-expired-card">
          <div className="checkin-expired-icon">!</div>

          <div className="checkin-badge danger">
            CHECK-IN EXPIRED
          </div>

          <h1>Check-in Time Ended</h1>

          <p>
            Your safety timer reached zero. If you are in danger,
            activate SOS immediately.
          </p>

          <div className="expired-contact-box">
            <strong>Emergency Contact</strong>

            {selectedContact ? (
              <>
                <span>{selectedContact.name}</span>
                <small>{selectedContact.phone}</small>
              </>
            ) : (
              <small>No trusted contact selected</small>
            )}
          </div>

          <button
            className="checkin-sos-button"
            onClick={() => {
              alert(
                "Please activate the main SOS button on the dashboard for emergency assistance."
              );
            }}
          >
            🚨 Activate SOS
          </button>

          <button
            className="checkin-secondary-button"
            onClick={resetCheckIn}
          >
            Start New Check-in
          </button>
        </div>
      </div>
    );
  }

  if (isActive) {
    return (
      <div className="checkin-page">
        <div className="checkin-active-card">
          <div className="checkin-live-badge">
            <span></span>
            CHECK-IN ACTIVE
          </div>

          <h1>You're on the Move</h1>

          <p>
            Your safety timer is running. Let someone know you're
            safe when you reach your destination.
          </p>

          <div className="checkin-timer">
            {formatTime(remainingSeconds)}
          </div>

          <div className="checkin-timer-label">
            TIME REMAINING
          </div>

          <div className="checkin-status-grid">
            <div className="checkin-status-box">
              <span>📍</span>
              <strong>Location</strong>
              <small>Detected</small>
            </div>

            <div className="checkin-status-box">
              <span>👤</span>
              <strong>Contact</strong>
              <small>
                {selectedContact
                  ? selectedContact.name
                  : "Not selected"}
              </small>
            </div>
          </div>

          {location && (
            <div className="checkin-location-box">
              <strong>📍 Check-in Location</strong>

              <small>
                {location.latitude.toFixed(6)},{" "}
                {location.longitude.toFixed(6)}
              </small>

              <span>
                Accuracy: {Math.round(location.accuracy)} meters
              </span>
            </div>
          )}

          <button
            className="im-safe-button"
            onClick={markSafe}
          >
            ✓ I'm Safe
          </button>

          <button
            className="cancel-checkin-button"
            onClick={cancelCheckIn}
          >
            Cancel Check-in
          </button>

          <div className="checkin-info-note">
            <span>🔒</span>
            <p>
              Your current location is being used for this
              check-in session.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkin-page">
      <div className="checkin-header">
        <div className="checkin-security-badge">
          🛡️ SAFETY CHECK-IN
        </div>

        <h1>Safe Arrival Timer</h1>

        <p>
          Let someone know you're safe when you reach your
          destination.
        </p>
      </div>

      <div className="checkin-setup-card">
        <div className="checkin-section">
          <div className="checkin-section-title">
            <span>⏱️</span>
            <div>
              <h2>Set Timer</h2>
              <p>How long should your journey take?</p>
            </div>
          </div>

          <div className="duration-options">
            {[15, 30, 60].map((minutes) => (
              <button
                key={minutes}
                className={
                  duration === minutes
                    ? "duration-option active"
                    : "duration-option"
                }
                onClick={() => setDuration(minutes)}
              >
                <strong>{minutes}</strong>
                <span>minutes</span>
              </button>
            ))}
          </div>
        </div>

        <div className="checkin-divider"></div>

        <div className="checkin-section">
          <div className="checkin-section-title">
            <span>👥</span>

            <div>
              <h2>Emergency Contact</h2>
              <p>Who should be associated with this check-in?</p>
            </div>
          </div>

          {contacts.length > 0 ? (
            <div className="checkin-contact-options">
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  className={
                    selectedContact?.id === contact.id
                      ? "checkin-contact-option active"
                      : "checkin-contact-option"
                  }
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="checkin-contact-avatar">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <strong>{contact.name}</strong>
                    <small>
                      {contact.relation} • {contact.phone}
                    </small>
                  </div>

                  {selectedContact?.id === contact.id && (
                    <span className="selected-check">✓</span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="no-checkin-contacts">
              <span>👥</span>
              <div>
                <strong>No trusted contacts yet</strong>
                <small>
                  Add a trusted contact before starting a
                  check-in.
                </small>
              </div>
            </div>
          )}
        </div>

        <div className="checkin-divider"></div>

        <div className="checkin-preview">
          <div className="preview-icon">⏰</div>

          <div>
            <strong>{duration}-minute check-in</strong>

            <p>
              Your current location will be recorded when the
              check-in starts.
            </p>
          </div>
        </div>

        <button
          className="start-checkin-button"
          onClick={startCheckIn}
          disabled={locationLoading || contacts.length === 0}
        >
          {locationLoading ? (
            <>📍 Getting Location...</>
          ) : (
            <>🛡️ Start Safety Check-in</>
          )}
        </button>

        {contacts.length === 0 && (
          <p className="checkin-contact-warning">
            Add at least one trusted contact to start a
            check-in.
          </p>
        )}
      </div>

      <div className="checkin-security-note">
        <span>🔒</span>

        <p>
          Safety Check-in is currently a local prototype.
          Automatic SMS, WhatsApp, or emergency notifications
          will be connected through the Nabhya backend later.
        </p>
      </div>
    </div>
  );
}

export default SafetyCheckIn;