type Helpline = {
  number: string;
  title: string;
  description: string;
  icon: string;
  emergency?: boolean;
};

const helplines: Helpline[] = [
  {
    number: "112",
    title: "Emergency Assistance",
    description:
      "For immediate police, fire, ambulance, or other emergency assistance.",
    icon: "🚨",
    emergency: true,
  },
  {
    number: "181",
    title: "Women Helpline",
    description:
      "Women-focused helpline for support and assistance.",
    icon: "👩",
  },
];

function EmergencyHelpline() {
  const callNumber = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="helpline-page">
      <div className="helpline-header">
        <div className="helpline-badge">
          🆘 EMERGENCY SUPPORT
        </div>

        <h1>Need Immediate Help?</h1>

        <p>
          Use these emergency numbers when you need immediate
          assistance.
        </p>
      </div>

      <div className="helpline-list">
        {helplines.map((helpline) => (
          <div
            className={
              helpline.emergency
                ? "helpline-card emergency"
                : "helpline-card"
            }
            key={helpline.number}
          >
            <div className="helpline-icon">
              {helpline.icon}
            </div>

            <div className="helpline-content">
              <span className="helpline-label">
                {helpline.emergency
                  ? "EMERGENCY"
                  : "WOMEN'S SUPPORT"}
              </span>

              <h2>{helpline.title}</h2>

              <p>{helpline.description}</p>

              <div className="helpline-number">
                {helpline.number}
              </div>
            </div>

            <button
              className="call-helpline-button"
              onClick={() => callNumber(helpline.number)}
            >
              📞 Call
            </button>
          </div>
        ))}
      </div>

      <div className="helpline-warning">
        <span>⚠️</span>

        <div>
          <strong>Emergency situation?</strong>

          <p>
            If you are in immediate danger, use SOS or call
            emergency services directly.
          </p>
        </div>
      </div>

      <div className="helpline-note">
        <span>🔒</span>

        <p>
          Nabhya does not make the call itself. Tapping a number
          opens your device's phone/dialer when supported.
        </p>
      </div>
    </div>
  );
}

export default EmergencyHelpline;