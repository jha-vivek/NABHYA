type EmergencyCenterProps = {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  contactsCount: number;
  onEndSOS: () => void;
};

function EmergencyCenter({
  latitude,
  longitude,
  accuracy,
  contactsCount,
  onEndSOS,
}: EmergencyCenterProps) {
  const hasLocation =
    latitude !== null && longitude !== null;

  const openDirections = () => {
    if (!hasLocation) {
      alert("Current location is not available yet.");
      return;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    window.open(url, "_blank");
  };

  const shareLocation = async () => {
    if (!hasLocation) {
      alert("Current location is not available yet.");
      return;
    }

    const locationUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    const shareText =
      `Nabhya Emergency Location\n\n` +
      `I may need help.\n` +
      `My current location:\n${locationUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Nabhya Emergency Location",
          text: shareText,
          url: locationUrl,
        });
      } catch (error) {
        console.error("Location sharing cancelled:", error);
      }

      return;
    }

    try {
      await navigator.clipboard.writeText(shareText);

      alert(
        "Emergency location copied. You can now send it to your trusted contact."
      );
    } catch (error) {
      console.error("Unable to copy location:", error);

      alert(shareText);
    }
  };

  const callEmergency = () => {
    window.location.href = "tel:112";
  };

  return (
    <div className="emergency-center">
      <div className="emergency-center-header">
        <div className="emergency-live-badge">
          <span></span>
          SOS ACTIVE
        </div>

        <div className="emergency-center-icon">
          🚨
        </div>

        <h1>Emergency Center</h1>

        <p>
          Nabhya is keeping your emergency session active.
        </p>
      </div>

      <div className="emergency-status-grid">
        <div className="emergency-status-card">
          <span>📍</span>

          <strong>
            {hasLocation ? "Location Ready" : "Location Pending"}
          </strong>

          <small>
            {hasLocation
              ? `Accuracy: ${Math.round(
                  accuracy ?? 0
                )} m`
              : "Waiting for location"}
          </small>
        </div>

        <div className="emergency-status-card">
          <span>👥</span>

          <strong>Trusted Contacts</strong>

          <small>
            {contactsCount} contact
            {contactsCount === 1 ? "" : "s"} available
          </small>
        </div>
      </div>

      {hasLocation ? (
        <div className="emergency-location-card">
          <div className="location-card-header">
            <div>
              <span className="location-live-badge">
                LIVE LOCATION
              </span>

              <h2>Current Location</h2>
            </div>

            <span className="location-pin">📍</span>
          </div>

          <div className="coordinates">
            <div>
              <small>LATITUDE</small>
              <strong>{latitude.toFixed(6)}</strong>
            </div>

            <div>
              <small>LONGITUDE</small>
              <strong>{longitude.toFixed(6)}</strong>
            </div>
          </div>

          <button
            className="location-share-button"
            onClick={shareLocation}
          >
            📤 Share Emergency Location
          </button>

          <button
            className="location-map-button"
            onClick={openDirections}
          >
            🗺️ Open Location in Maps
          </button>
        </div>
      ) : (
        <div className="emergency-location-card unavailable">
          <div className="location-unavailable-icon">
            📍
          </div>

          <h2>Location Unavailable</h2>

          <p>
            Nabhya could not get your current location.
            Please check your browser location permission.
          </p>
        </div>
      )}

      <div className="emergency-actions">
        <button
          className="emergency-call-button"
          onClick={callEmergency}
        >
          <span>📞</span>

          <div>
            <strong>Call Emergency Services</strong>
            <small>Open emergency call</small>
          </div>
        </button>

        <button
          className="emergency-share-button"
          onClick={shareLocation}
          disabled={!hasLocation}
        >
          <span>📤</span>

          <div>
            <strong>Share My Location</strong>
            <small>Send your current location</small>
          </div>
        </button>
      </div>

      <div className="emergency-contact-status">
        <div className="contact-status-icon">
          👥
        </div>

        <div>
          <strong>Trusted Network</strong>

          <p>
            {contactsCount > 0
              ? `${contactsCount} trusted contact${
                  contactsCount > 1 ? "s" : ""
                } available for this emergency session.`
              : "No trusted contacts are currently connected."}
          </p>
        </div>
      </div>

      <div className="emergency-warning">
        <span>⚠️</span>

        <p>
          If you are in immediate danger, call emergency
          services directly. Location sharing from this
          prototype does not automatically notify your
          contacts yet.
        </p>
      </div>

      <button
        className="emergency-end-button"
        onClick={onEndSOS}
      >
        End Emergency Mode
      </button>
    </div>
  );
}

export default EmergencyCenter;