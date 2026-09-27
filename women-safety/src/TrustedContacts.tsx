import { useEffect, useState } from "react";

type Contact = {
  id: number;
  name: string;
  phone: string;
  relation: string;
  primary: boolean;
};

function TrustedContacts() {
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const savedContacts = localStorage.getItem("nabhya_contacts");

    return savedContacts ? JSON.parse(savedContacts) : [];
  });

  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relation, setRelation] = useState("");

  // Save contacts whenever they change
  useEffect(() => {
    localStorage.setItem(
      "nabhya_contacts",
      JSON.stringify(contacts)
    );
  }, [contacts]);

  const addContact = () => {
    if (!name.trim() || !phone.trim() || !relation.trim()) {
      alert("Please fill all details.");
      return;
    }

    const newContact: Contact = {
      id: Date.now(),
      name: name.trim(),
      phone: phone.trim(),
      relation: relation.trim(),
      primary: contacts.length === 0,
    };

    setContacts((currentContacts) => [
      ...currentContacts,
      newContact,
    ]);

    setName("");
    setPhone("");
    setRelation("");
    setShowForm(false);
  };

  const removeContact = (id: number) => {
    const confirmed = window.confirm(
      "Remove this trusted contact?"
    );

    if (!confirmed) return;

    setContacts((currentContacts) =>
      currentContacts.filter((contact) => contact.id !== id)
    );
  };

  return (
    <div className="contacts-page">

      {/* HEADER */}

      <div className="contacts-header">

        <div className="security-badge">
          <span>🛡️</span>
          TRUSTED NETWORK
        </div>

        <h1>Your Emergency Circle</h1>

        <p>
          People who can be contacted when you need help.
        </p>

      </div>


      {/* SECURITY STATUS */}

      <div className="network-status">

        <div className="status-icon">
          🛡️
        </div>

        <div>
          <strong>
            Emergency Network
          </strong>

          <p>
            {contacts.length === 0
              ? "No trusted contacts connected"
              : `${contacts.length} trusted contact${
                  contacts.length > 1 ? "s" : ""
                } connected`}
          </p>
        </div>

        <div className="status-indicator">
          <span></span>
          ACTIVE
        </div>

      </div>


      {/* CONTACTS */}

      {contacts.length > 0 && (

        <div className="contacts-list">

          <div className="section-heading">
            <h2>Trusted Contacts</h2>

            <span>
              {contacts.length}
            </span>
          </div>


          {contacts.map((contact) => (

            <div
              className="contact-card"
              key={contact.id}
            >

              <div className="contact-avatar">
                {contact.name
                  .charAt(0)
                  .toUpperCase()}
              </div>


              <div className="contact-details">

                <div className="contact-name-row">

                  <h3>
                    {contact.name}
                  </h3>

                  {contact.primary && (
                    <span className="primary-badge">
                      PRIMARY
                    </span>
                  )}

                </div>

                <p>
                  📞 {contact.phone}
                </p>

                <small>
                  {contact.relation}
                </small>

              </div>


              <button
                className="remove-contact"
                onClick={() =>
                  removeContact(contact.id)
                }
              >
                Remove
              </button>

            </div>

          ))}

        </div>

      )}


      {/* EMPTY STATE */}

      {contacts.length === 0 && !showForm && (

        <div className="empty-contacts">

          <div className="empty-icon">
            👥
          </div>

          <h2>
            Build Your Safety Circle
          </h2>

          <p>
            Add people you trust. Nabhya can use
            your trusted network during an emergency.
          </p>

          <button
            className="add-contact-button"
            onClick={() => setShowForm(true)}
          >
            <span>＋</span>
            Add Trusted Contact
          </button>

        </div>

      )}


      {/* ADD BUTTON */}

      {contacts.length > 0 && !showForm && (

        <button
          className="add-contact-button"
          onClick={() => setShowForm(true)}
        >
          <span>＋</span>
          Add Emergency Contact
        </button>

      )}


      {/* FORM */}

      {showForm && (

        <div className="contact-form">

          <div className="form-header">

            <div className="form-icon">
              +
            </div>

            <div>
              <h2>
                Add Trusted Contact
              </h2>

              <p>
                Add someone Nabhya can reach in an emergency.
              </p>
            </div>

          </div>


          <label>
            FULL NAME
          </label>

          <input
            type="text"
            placeholder="e.g. Mom"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />


          <label>
            PHONE NUMBER
          </label>

          <input
            type="tel"
            placeholder="+91 XXXXX XXXXX"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
          />


          <label>
            RELATIONSHIP
          </label>

          <input
            type="text"
            placeholder="e.g. Mother"
            value={relation}
            onChange={(e) =>
              setRelation(e.target.value)
            }
          />


          <div className="form-buttons">

            <button
              className="cancel-contact"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>

            <button
              className="save-contact"
              onClick={addContact}
            >
              🛡️ Save Contact
            </button>

          </div>

        </div>

      )}


      {/* SECURITY NOTE */}

      <div className="security-note">
        <span>🔒</span>

        <p>
          Your trusted contacts are stored locally
          on this device for now.
        </p>
      </div>

    </div>
  );
}

export default TrustedContacts;