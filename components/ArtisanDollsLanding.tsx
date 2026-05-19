import HeroEffect from "@/components/HeroEffect";
import HeroRentalActions from "@/components/HeroRentalActions";
import type { PublicPlatformSettings } from "@/lib/settings/shared";

type ArtisanDollsLandingProps = {
    settings: PublicPlatformSettings;
};

export default function ArtisanDollsLanding({ settings }: ArtisanDollsLandingProps) {

  return (
    <>
        <HeroEffect />
      <section id="hero">
          <div className="hero-bg-pattern"></div>
          <div className="hero-content">
              <div className="hero-text">
                  <div className="eyebrow fade-in">{settings.business_name}</div>
                  <h1 className="fade-in fade-in-delay-1">
                      Păpuși <em>Artistice</em><br />de Colecție
                  </h1>
                  <p className="fade-in fade-in-delay-2">
                      Fiecare piesă este o operă de artă unică, realizată manual cu pasiune și rafinament. Descoperă colecția noastră exclusivă de păpuși colecționabile, personalizate la cel mai înalt nivel al meșteșugului artistic.
                  </p>
                  <HeroRentalActions
                      catalogEnabled={settings.catalog_enabled}
                      rentEnabled={settings.rent_enabled}
                      buyEnabled={settings.buy_enabled}
                  />
                  <div className="hero-stats fade-in fade-in-delay-4">
                      <div className="stat">
                          <div className="stat-number">240+</div>
                          <div className="stat-label">Piese Unice</div>
                      </div>
                      <div className="stat">
                          <div className="stat-number">12</div>
                          <div className="stat-label">Ani Experiență</div>
                      </div>
                      <div className="stat">
                          <div className="stat-number">98%</div>
                          <div className="stat-label">Clienți Mulțumiți</div>
                      </div>
                  </div>
              </div>
              <div className="hero-image-side fade-in fade-in-delay-2">
                  <div className="hero-image-frame">
                      <img src="https://placehold.co/440x520/090009/ff4fa3?text=Artisan+Dolls" alt="Păpușă artistică de colecție" />
                  </div>
              </div>
          </div>
          <div className="hero-scroll-indicator">
              <div className="scroll-line"></div>
              <span>Derulează</span>
          </div>
      </section>

      <section id="servicii">
          <div className="services-inner">
              <div className="services-header">
                  <div className="fade-in">
                      <span className="section-label">Servicii Premium</span>
                      <h2 className="section-title">Personalizare<br />Exclusivă</h2>
                      <div className="divider"></div>
                  </div>
                  <div className="fade-in fade-in-delay-1">
                      <p className="section-subtitle">Fiecare comandă este tratată ca un proiect artistic unic. Colaborăm îndeaproape cu clienții noștri pentru a crea piese care reflectă viziunea și dorințele lor cu precizie artizanală.</p>
                  </div>
              </div>

              <div className="services-cards">
                  <div className="service-card fade-in">
                      <span className="service-number">01</span>
                      <div className="service-icon">
                          <svg viewBox="0 0 24 24">
                              <circle cx="12" cy="8" r="4"/>
                              <path d="M12 14c-5 0-8 2-8 3v1h16v-1c0-1-3-3-8-3z"/>
                              <path d="M8 6.5C8.5 5 10 4 12 4s3.5 1 4 2.5"/>
                          </svg>
                      </div>
                      <h3>Personalizare Față</h3>
                      <p>Trăsături faciale sculptate manual, machiaj realist aplicat cu pensula, gene individuale și culori personalizate ale ochilor.</p>
                  </div>

                  <div className="service-card fade-in fade-in-delay-1">
                      <span className="service-number">02</span>
                      <div className="service-icon">
                          <svg viewBox="0 0 24 24">
                              <path d="M12 2C9.5 2 8 4 8 6v1.5C8 9 9 10 10 10.5V12H8v2h8v-2h-2v-1.5c1-.5 2-1.5 2-3V6c0-2-1.5-4-4-4z"/>
                              <path d="M7 14s-3 1-3 4v4h16v-4c0-3-3-4-3-4"/>
                          </svg>
                      </div>
                      <h3>Sculptură Corp</h3>
                      <p>Proporții anatomice precise, articulații funcționale și finisaje de înaltă calitate realizate din materiale premium durabile.</p>
                  </div>

                  <div className="service-card fade-in fade-in-delay-2">
                      <span className="service-number">03</span>
                      <div className="service-icon">
                          <svg viewBox="0 0 24 24">
                              <path d="M6 3h12l2 6H4L6 3z"/>
                              <path d="M4 9v11a1 1 0 001 1h14a1 1 0 001-1V9"/>
                              <path d="M9 9v4a3 3 0 006 0V9"/>
                          </svg>
                      </div>
                      <h3>Vestimentație Couture</h3>
                      <p>Costume cusute manual din țesături de lux — mătase, dantelă, catifea — cu accesorii miniaturale realizate artizanal.</p>
                  </div>

                  <div className="service-card fade-in fade-in-delay-3">
                      <span className="service-number">04</span>
                      <div className="service-icon">
                          <svg viewBox="0 0 24 24">
                              <path d="M12 2l1.5 4.5H18l-3.75 2.7 1.5 4.5L12 11l-3.75 2.7 1.5-4.5L6 6.5h4.5L12 2z"/>
                              <path d="M5 15s-1 3 0 5c1 1.5 4 2 7 2s6-.5 7-2c1-2 0-5 0-5"/>
                          </svg>
                      </div>
                      <h3>Accesorii & Decor</h3>
                      <p>Bijuterii miniaturale, peruke din păr natural, recuzită tematică și cutii de prezentare personalizate de colecție.</p>
                  </div>
              </div>
          </div>
      </section>

      <section id="galerie">
          <div className="gallery-inner">
              <div className="gallery-header fade-in">
                  <span className="section-label">Galerie de Artă</span>
                  <h2 className="section-title">Colecția Noastră</h2>
                  <div className="divider"></div>
                  <p className="section-subtitle">Explorează o selecție din creațiile noastre de suflet — fiecare piesă reflectă ore întregi de muncă dedicată și artă rafinată.</p>
              </div>

              <div className="gallery-grid">
                  <div className="gallery-item fade-in">
                      <img src="https://placehold.co/480x580/120612/ff9bd0?text=Eleonora" alt="Eleonora — Editie Limitata" />
                      <div className="gallery-overlay">
                          <span className="price-tag">Ediție Limitată</span>
                          <h4>Eleonora</h4>
                          <p>Ediție limitată — 8 exemplare</p>
                      </div>
                  </div>

                  <div className="gallery-item fade-in fade-in-delay-1">
                      <img src="https://placehold.co/480x280/1a0716/ff4fa3?text=Seraphine" alt="Seraphine" />
                      <div className="gallery-overlay">
                          <span className="price-tag">Personalizabil</span>
                          <h4>Séraphine</h4>
                          <p>Colecția Anotimpuri — Toamnă</p>
                      </div>
                  </div>

                  <div className="gallery-item fade-in fade-in-delay-2">
                      <img src="https://placehold.co/480x280/22091c/ffc1df?text=Violetta" alt="Violetta" />
                      <div className="gallery-overlay">
                          <span className="price-tag">Sold Out</span>
                          <h4>Violetta</h4>
                          <p>Seria Clasică — Vintage Couture</p>
                      </div>
                  </div>

                  <div className="gallery-item fade-in fade-in-delay-1">
                      <img src="https://placehold.co/480x580/090009/ff4fa3?text=Isabelle" alt="Isabelle" />
                      <div className="gallery-overlay">
                          <span className="price-tag">Comandă Specială</span>
                          <h4>Isabelle</h4>
                          <p>Colecția Noir — Ediție 2024</p>
                      </div>
                  </div>

                  <div className="gallery-item fade-in fade-in-delay-3">
                      <img src="https://placehold.co/480x280/130713/ff9bd0?text=Aurora" alt="Aurora" />
                      <div className="gallery-overlay">
                          <span className="price-tag">Disponibil</span>
                          <h4>Aurora</h4>
                          <p>Colecția Anotimpuri — Primăvară</p>
                      </div>
                  </div>

                  <div className="gallery-item fade-in fade-in-delay-4">
                      <img src="https://placehold.co/480x280/2a0821/ff9bd0?text=Celeste" alt="Celeste" />
                      <div className="gallery-overlay">
                          <span className="price-tag">Personalizabil</span>
                          <h4>Céleste</h4>
                          <p>Seria Fantaisie — Mână sculptată</p>
                      </div>
                  </div>
              </div>

              <div className="gallery-cta fade-in">
                  <a href="#contact" className="btn btn-primary">Vezi Toate Piesele</a>
              </div>
          </div>
      </section>

      <section id="cta-section">
          <div className="cta-inner">
              <span className="section-label fade-in">Creează Ceva Unic</span>
              <h2 className="section-title fade-in fade-in-delay-1">Piesa Ta de Artă<br />Te Așteaptă</h2>
              <div className="divider fade-in fade-in-delay-1"></div>
              <p className="fade-in fade-in-delay-2">Fiecare colecționar merită o piesă care să îi reprezinte viziunea. Contactează-ne astăzi și hai să transformăm ideea ta într-o operă de artă care va dura o viață.</p>
              <div className="cta-buttons fade-in fade-in-delay-3">
                  <a
                      href={
                          settings.whatsapp_phone
                              ? `https://wa.me/${settings.whatsapp_phone.replace(/[^\d]/g, "")}`
                              : settings.contact_phone
                                  ? `tel:${settings.contact_phone}`
                                  : settings.contact_email
                                      ? `mailto:${settings.contact_email}`
                                      : "#hero"
                      }
                      className="btn btn-gold"
                  >
                      Solicită o Ofertă
                  </a>
                  <a href="#galerie" className="btn btn-outline-light">Explorează Galeria</a>
              </div>
              <div className="cta-features fade-in fade-in-delay-4">
                  <div className="cta-feature">
                      <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                      Consultație gratuită
                  </div>
                  <div className="cta-feature">
                      <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                      Livrare securizată internațional
                  </div>
                  <div className="cta-feature">
                      <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                      Certificat de autenticitate
                  </div>
                  <div className="cta-feature">
                      <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                      Garanție 2 ani
                  </div>
              </div>
          </div>
      </section>
    </>
  );
}
