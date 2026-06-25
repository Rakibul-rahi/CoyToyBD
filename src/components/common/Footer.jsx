import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";

const styles = {
  footer: {
    background: "#07091a",
    borderTop: "1px solid #1a2040",
    fontFamily: "'Inter', sans-serif",
    color: "#c8d0f0",
    padding: "56px 24px 28px",
    position: "relative",
    overflow: "hidden",
    marginTop: "80px",
  },
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(63,227,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(63,227,255,0.03) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    pointerEvents: "none",
  },
  inner: {
    maxWidth: "1200px",
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  },
  colGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "40px",
  },
  brandName: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: "22px",
    fontWeight: 700,
    letterSpacing: "4px",
    color: "#ff3fc7",
    margin: "0 0 6px",
    textShadow: "0 0 20px rgba(255,63,199,0.4)",
  },
  brandTag: {
    fontSize: "11px",
    letterSpacing: "3px",
    color: "#3fe3ff",
    textTransform: "uppercase",
    margin: "0 0 16px",
    opacity: 0.7,
  },
  brandDesc: {
    fontSize: "13.5px",
    color: "#6b779e",
    lineHeight: 1.85,
    margin: 0,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "20px",
    padding: "6px 12px",
    border: "1px solid #1a2040",
    borderRadius: "4px",
    fontSize: "11px",
    letterSpacing: "1.5px",
    color: "#3fe3ff",
    background: "rgba(63,227,255,0.05)",
  },
  colTitle: {
    fontSize: "11px",
    letterSpacing: "2.5px",
    textTransform: "uppercase",
    color: "#3fe3ff",
    fontWeight: 600,
    margin: "0 0 20px",
    paddingBottom: "10px",
    borderBottom: "1px solid rgba(63,227,255,0.15)",
  },
  navList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  navLink: {
    fontSize: "14px",
    color: "#6b779e",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  socialBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "11px 14px",
    borderRadius: "6px",
    border: "1px solid #1a2040",
    color: "#c8d0f0",
    textDecoration: "none",
    fontSize: "13.5px",
    fontWeight: 500,
    marginBottom: "10px",
    transition: "border-color 0.2s, background 0.2s, transform 0.2s",
  },
  trustItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "13.5px",
    color: "#6b779e",
    padding: "9px 0",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  checkCircle: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    background: "rgba(63,227,255,0.08)",
    border: "1px solid rgba(63,227,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: "#3fe3ff",
    fontSize: "10px",
  },
  bottom: {
    marginTop: "44px",
    paddingTop: "20px",
    borderTop: "1px solid #1a2040",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
  },
  copyright: {
    fontSize: "12px",
    color: "#3e4560",
    letterSpacing: "0.5px",
    margin: 0,
  },
  bottomLinks: {
    display: "flex",
    gap: "20px",
  },
  bottomLink: {
    fontSize: "12px",
    color: "#3e4560",
    textDecoration: "none",
  },
};

const socialIconBg = {
  facebook: {
    background: "rgba(24,119,242,0.12)",
    color: "#1877f2",
  },
  instagram: {
    background: "rgba(225,48,108,0.12)",
    color: "#e1306c",
  },
  whatsapp: {
    background: "rgba(37,211,102,0.12)",
    color: "#25d366",
  },
};

const socialHover = {
  facebook: {
    borderColor: "#1877f2",
    background: "rgba(24,119,242,0.08)",
  },
  instagram: {
    borderColor: "#e1306c",
    background: "rgba(225,48,108,0.08)",
  },
  whatsapp: {
    borderColor: "#25d366",
    background: "rgba(37,211,102,0.08)",
  },
};

function SocialButton({ href, icon, label, platform }) {
  const handleMouseEnter = (e) => {
    e.currentTarget.style.borderColor = socialHover[platform].borderColor;
    e.currentTarget.style.background = socialHover[platform].background;
    e.currentTarget.style.transform = "translateY(-2px)";
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.borderColor = "#1a2040";
    e.currentTarget.style.background = "transparent";
    e.currentTarget.style.transform = "translateY(0)";
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={styles.socialBtn}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "15px",
          flexShrink: 0,
          ...socialIconBg[platform],
        }}
      >
        {icon}
      </span>
      {label}
    </a>
  );
}

function TrustItem({ children }) {
  return (
    <div style={styles.trustItem}>
      <span style={styles.checkCircle}>✓</span>
      {children}
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      <div style={styles.grid} aria-hidden="true" />

      <div style={styles.inner}>
        <div style={styles.colGrid}>
          {/* Brand */}
          <div>
            <h2 style={styles.brandName}>COYTOY</h2>
            <p style={styles.brandTag}>Bangladesh</p>
            <p style={styles.brandDesc}>
              Toys that spark imagination, creativity, and joyful moments for
              every child.
            </p>

            <div style={styles.badge}>
              <span
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: "#3fe3ff",
                  boxShadow: "0 0 6px #3fe3ff",
                  display: "inline-block",
                }}
              />
              OPEN FOR ORDERS
            </div>
          </div>

          {/* Navigate */}
          <div>
            <h3 style={styles.colTitle}>Navigate</h3>

            <ul style={styles.navList}>
              {[
                { to: "/", label: "Home" },
                { to: "/shop", label: "Shop" },
                { to: "/cart", label: "Cart" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} style={styles.navLink}>
                    <span
                      style={{
                        width: "12px",
                        height: "1px",
                        background: "#6b779e",
                        display: "inline-block",
                      }}
                    />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 style={styles.colTitle}>Connect</h3>

            <SocialButton
              href="https://www.facebook.com/coytoybangladesh"
              icon={<FaFacebookF />}
              label="Facebook"
              platform="facebook"
            />

            <SocialButton
              href="https://www.instagram.com/coytoy_/"
              icon={<FaInstagram />}
              label="Instagram"
              platform="instagram"
            />

            <SocialButton
              href="https://wa.me/8801623098084"
              icon={<FaWhatsapp />}
              label="WhatsApp"
              platform="whatsapp"
            />
          </div>

          {/* Why Us */}
          <div>
            <h3 style={styles.colTitle}>Why Us</h3>
            <TrustItem>Genuine Products</TrustItem>
            <TrustItem>Fast Response</TrustItem>
            <TrustItem>Secure Ordering</TrustItem>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={styles.bottom}>
          <p style={styles.copyright}>
            © {year}{" "}
            <span style={{ color: "#ff3fc7", opacity: 0.7 }}>CoyToyBD</span>.
            All rights reserved.
          </p>

          <div style={styles.bottomLinks}>
            {["Privacy", "Terms", "Contact"].map((item) => (
              <a key={item} href="#" style={styles.bottomLink}>
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}