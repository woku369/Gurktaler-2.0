import { useState } from "react";
import { Star, Package, FlaskConical, Users, BookOpen } from "lucide-react";

type DesignVariant = "heritage" | "distillery" | "botanical";

const variants = {
  heritage: {
    name: "Heritage Classic",
    description: "Warme Brauntöne, goldene Akzente, klassische Eleganz",
    colors: {
      primary: "#8B6F47",
      secondary: "#2C5F2D",
      accent: "#D4AF37",
      bg: "#F5F3EF",
      text: "#3E2723",
      cardBg: "#FFFFFF",
      border: "#D4C4B0",
    },
    font: {
      heading: "Georgia, serif",
      body: "Inter, sans-serif",
    },
  },
  distillery: {
    name: "Distillery Modern",
    description: "Kupfer & Stahl, industriell-elegant, Destillerie-Atmosphäre",
    colors: {
      primary: "#B87333",
      secondary: "#4A6363",
      accent: "#CD7F32",
      bg: "#F8F6F3",
      text: "#2C3333",
      cardBg: "#FFFFFF",
      border: "#C9B8A3",
    },
    font: {
      heading: "Playfair Display, serif",
      body: "Source Sans Pro, sans-serif",
    },
  },
  botanical: {
    name: "Botanical Heritage",
    description: "Kräutergrün, Naturstein, organisch & handwerklich",
    colors: {
      primary: "#5F7161",
      secondary: "#6D8B74",
      accent: "#B5A886",
      bg: "#F7F6F2",
      text: "#3C3C3C",
      cardBg: "#FFFFFF",
      border: "#C8C5B8",
    },
    font: {
      heading: "Merriweather, serif",
      body: "Lato, sans-serif",
    },
  },
};

export default function DesignPreview() {
  const [selectedVariant, setSelectedVariant] =
    useState<DesignVariant>("heritage");
  const variant = variants[selectedVariant];

  return (
    <div style={{ backgroundColor: variant.colors.bg, minHeight: "100vh" }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: variant.colors.cardBg,
          borderBottom: `3px solid ${variant.colors.border}`,
          padding: "2rem",
        }}
      >
        <h1
          style={{
            fontFamily: variant.font.heading,
            fontSize: "2rem",
            fontWeight: 700,
            color: variant.colors.text,
            marginBottom: "0.5rem",
          }}
        >
          🥃 Gurktaler 2.0 - Design Preview
        </h1>
        <p
          style={{
            fontFamily: variant.font.body,
            color: variant.colors.text,
            opacity: 0.7,
          }}
        >
          Tradition trifft Innovation - Wähle deinen Stil
        </p>
      </div>

      {/* Variant Selector */}
      <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem",
            marginBottom: "3rem",
          }}
        >
          {(Object.keys(variants) as DesignVariant[]).map((key) => {
            const v = variants[key];
            const isSelected = selectedVariant === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedVariant(key)}
                style={{
                  backgroundColor: isSelected
                    ? v.colors.primary
                    : v.colors.cardBg,
                  color: isSelected ? "#FFFFFF" : v.colors.text,
                  border: `2px solid ${
                    isSelected ? v.colors.primary : v.colors.border
                  }`,
                  borderRadius: "12px",
                  padding: "1.5rem",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.3s ease",
                  boxShadow: isSelected
                    ? "0 8px 16px rgba(0,0,0,0.15)"
                    : "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <h3
                  style={{
                    fontFamily: v.font.heading,
                    fontSize: "1.25rem",
                    marginBottom: "0.5rem",
                    fontWeight: 600,
                  }}
                >
                  {v.name}
                </h3>
                <p
                  style={{
                    fontFamily: v.font.body,
                    fontSize: "0.875rem",
                    opacity: isSelected ? 0.9 : 0.7,
                    lineHeight: 1.5,
                  }}
                >
                  {v.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Preview Content */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "2rem",
          }}
        >
          {/* Main Content Area */}
          <div>
            {/* Project Card Example */}
            <div
              style={{
                backgroundColor: variant.colors.cardBg,
                border: `2px solid ${variant.colors.border}`,
                borderRadius: "12px",
                padding: "1.5rem",
                marginBottom: "1.5rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <h2
                    style={{
                      fontFamily: variant.font.heading,
                      fontSize: "1.5rem",
                      color: variant.colors.text,
                      marginBottom: "0.5rem",
                    }}
                  >
                    Gurktaler Honig-Schnaps
                  </h2>
                  <span
                    style={{
                      display: "inline-block",
                      backgroundColor: variant.colors.primary,
                      color: "#FFFFFF",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "20px",
                      fontSize: "0.75rem",
                      fontFamily: variant.font.body,
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                    }}
                  >
                    AKTIV
                  </span>
                </div>
                <button
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <Star
                    style={{
                      width: "24px",
                      height: "24px",
                      color: variant.colors.accent,
                      fill: variant.colors.accent,
                    }}
                  />
                </button>
              </div>
              <p
                style={{
                  fontFamily: variant.font.body,
                  color: variant.colors.text,
                  opacity: 0.8,
                  lineHeight: 1.6,
                  marginBottom: "1rem",
                }}
              >
                Ein traditionelles Rezept aus den Kärntner Bergen, verfeinert
                mit regionalem Honig und handverlesenen Alpenkräutern.
                Destilliert in kleinen Chargen.
              </p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {["Tradition", "Regional", "Handwerk"].map((tag) => (
                  <span
                    key={tag}
                    style={{
                      backgroundColor: variant.colors.secondary,
                      color: "#FFFFFF",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontFamily: variant.font.body,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "1rem",
              }}
            >
              {[
                { icon: Package, label: "Produkte", value: "24" },
                { icon: FlaskConical, label: "Rezepturen", value: "18" },
                { icon: Users, label: "Kontakte", value: "42" },
                { icon: BookOpen, label: "Notizen", value: "156" },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  style={{
                    backgroundColor: variant.colors.cardBg,
                    border: `2px solid ${variant.colors.border}`,
                    borderRadius: "12px",
                    padding: "1.5rem",
                    textAlign: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: variant.colors.primary,
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1rem",
                    }}
                  >
                    <Icon
                      style={{
                        width: "24px",
                        height: "24px",
                        color: "#FFFFFF",
                      }}
                    />
                  </div>
                  <p
                    style={{
                      fontFamily: variant.font.heading,
                      fontSize: "1.75rem",
                      fontWeight: 700,
                      color: variant.colors.text,
                      margin: "0 0 0.25rem 0",
                    }}
                  >
                    {value}
                  </p>
                  <p
                    style={{
                      fontFamily: variant.font.body,
                      fontSize: "0.875rem",
                      color: variant.colors.text,
                      opacity: 0.7,
                      margin: 0,
                    }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* Button Examples */}
            <div
              style={{
                marginTop: "2rem",
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <button
                style={{
                  backgroundColor: variant.colors.primary,
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.875rem 2rem",
                  fontFamily: variant.font.body,
                  fontSize: "1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  transition: "transform 0.2s",
                }}
              >
                Primär-Button
              </button>
              <button
                style={{
                  backgroundColor: "transparent",
                  color: variant.colors.primary,
                  border: `2px solid ${variant.colors.primary}`,
                  borderRadius: "8px",
                  padding: "0.875rem 2rem",
                  fontFamily: variant.font.body,
                  fontSize: "1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Sekundär-Button
              </button>
              <button
                style={{
                  backgroundColor: variant.colors.accent,
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.875rem 2rem",
                  fontFamily: variant.font.body,
                  fontSize: "1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Akzent-Button
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Color Palette */}
            <div
              style={{
                backgroundColor: variant.colors.cardBg,
                border: `2px solid ${variant.colors.border}`,
                borderRadius: "12px",
                padding: "1.5rem",
                marginBottom: "1.5rem",
              }}
            >
              <h3
                style={{
                  fontFamily: variant.font.heading,
                  fontSize: "1.25rem",
                  color: variant.colors.text,
                  marginBottom: "1rem",
                }}
              >
                Farbpalette
              </h3>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {[
                  { name: "Primär", color: variant.colors.primary },
                  { name: "Sekundär", color: variant.colors.secondary },
                  { name: "Akzent", color: variant.colors.accent },
                  { name: "Hintergrund", color: variant.colors.bg },
                  { name: "Rahmen", color: variant.colors.border },
                ].map(({ name, color }) => (
                  <div
                    key={name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: color,
                        borderRadius: "8px",
                        border: `2px solid ${variant.colors.border}`,
                      }}
                    />
                    <div>
                      <p
                        style={{
                          fontFamily: variant.font.body,
                          fontSize: "0.875rem",
                          color: variant.colors.text,
                          margin: 0,
                          fontWeight: 600,
                        }}
                      >
                        {name}
                      </p>
                      <p
                        style={{
                          fontFamily: "monospace",
                          fontSize: "0.75rem",
                          color: variant.colors.text,
                          opacity: 0.6,
                          margin: 0,
                        }}
                      >
                        {color}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography Sample */}
            <div
              style={{
                backgroundColor: variant.colors.cardBg,
                border: `2px solid ${variant.colors.border}`,
                borderRadius: "12px",
                padding: "1.5rem",
              }}
            >
              <h3
                style={{
                  fontFamily: variant.font.heading,
                  fontSize: "1.25rem",
                  color: variant.colors.text,
                  marginBottom: "1rem",
                }}
              >
                Typographie
              </h3>
              <div style={{ marginBottom: "1rem" }}>
                <p
                  style={{
                    fontFamily: variant.font.body,
                    fontSize: "0.75rem",
                    color: variant.colors.text,
                    opacity: 0.6,
                    margin: "0 0 0.25rem 0",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  Überschrift
                </p>
                <p
                  style={{
                    fontFamily: variant.font.heading,
                    fontSize: "1.5rem",
                    color: variant.colors.text,
                    margin: 0,
                  }}
                >
                  {variant.font.heading.split(",")[0]}
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontFamily: variant.font.body,
                    fontSize: "0.75rem",
                    color: variant.colors.text,
                    opacity: 0.6,
                    margin: "0 0 0.25rem 0",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  Fließtext
                </p>
                <p
                  style={{
                    fontFamily: variant.font.body,
                    fontSize: "1rem",
                    color: variant.colors.text,
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {variant.font.body.split(",")[0]}
                </p>
              </div>
            </div>

            {/* Vintage Badge */}
            <div
              style={{
                marginTop: "1.5rem",
                backgroundColor: variant.colors.primary,
                color: "#FFFFFF",
                borderRadius: "12px",
                padding: "1.5rem",
                textAlign: "center",
                border: `3px solid ${variant.colors.accent}`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-20px",
                  right: "-20px",
                  width: "80px",
                  height: "80px",
                  backgroundColor: variant.colors.accent,
                  opacity: 0.2,
                  borderRadius: "50%",
                }}
              />
              <p
                style={{
                  fontFamily: variant.font.heading,
                  fontSize: "1rem",
                  fontWeight: 700,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  margin: "0 0 0.5rem 0",
                }}
              >
                Seit 1865
              </p>
              <p
                style={{
                  fontFamily: variant.font.body,
                  fontSize: "0.875rem",
                  opacity: 0.9,
                  margin: 0,
                }}
              >
                Tradition & Qualität
              </p>
            </div>
          </div>
        </div>

        {/* Implementation Note */}
        <div
          style={{
            marginTop: "3rem",
            backgroundColor: variant.colors.secondary,
            color: "#FFFFFF",
            borderRadius: "12px",
            padding: "1.5rem",
            border: `2px solid ${variant.colors.border}`,
          }}
        >
          <h3
            style={{
              fontFamily: variant.font.heading,
              fontSize: "1.25rem",
              marginBottom: "0.75rem",
            }}
          >
            💡 Nächste Schritte
          </h3>
          <ul
            style={{
              fontFamily: variant.font.body,
              fontSize: "0.95rem",
              lineHeight: 1.8,
              margin: 0,
              paddingLeft: "1.5rem",
            }}
          >
            <li>Design-Variante auswählen</li>
            <li>Farben in TailwindCSS übernehmen</li>
            <li>
              Google Fonts einbinden ({variant.font.heading.split(",")[0]} +{" "}
              {variant.font.body.split(",")[0]})
            </li>
            <li>Komponenten sukzessive anpassen (Layout, Cards, Buttons)</li>
            <li>
              Optional: Icon-Set wechseln (Phosphor Icons für mehr Vintage-Feel)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
