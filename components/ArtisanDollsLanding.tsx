import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import HeroEffect from "@/components/HeroEffect";
import HeroRentalActions from "@/components/HeroRentalActions";
import type { Doll } from "@/lib/dolls";
import type { PublicPlatformSettings } from "@/lib/settings/shared";
import { getSupabaseImageUrlServer } from "@/lib/supabase/images-server";

type ArtisanDollsLandingProps = {
    settings: PublicPlatformSettings;
    galleryDolls: Doll[];
    heroDoll: Doll | null;
};

function getContactHref(settings: PublicPlatformSettings) {
    if (settings.whatsapp_phone) {
        return `https://wa.me/${settings.whatsapp_phone.replace(/[^\d]/g, "")}`;
    }

    if (settings.contact_phone) {
        return `tel:${settings.contact_phone}`;
    }

    if (settings.contact_email) {
        return `mailto:${settings.contact_email}`;
    }

    return "#hero";
}

export default async function ArtisanDollsLanding({
                                                      settings,
                                                      galleryDolls,
                                                      heroDoll,
                                                  }: ArtisanDollsLandingProps) {
    const t = await getTranslations("home");

    const heroImage = heroDoll
        ? await getSupabaseImageUrlServer(heroDoll.image, "hero")
        : `https://placehold.co/440x520/090009/ff4fa3?text=${encodeURIComponent(t("hero.fallbackImageText"))}`;

    const galleryCards = await Promise.all(
        galleryDolls.slice(0, 6).map(async (doll) => {
            const image = doll.image
                ? await getSupabaseImageUrlServer(doll.image, "card")
                : `https://placehold.co/480x580/120612/ff9bd0?text=${encodeURIComponent(doll.name)}`;

            return {
                ...doll,
                image,
            };
        })
    );

    return (
        <>
            <HeroEffect />
            <section id="hero">
                <div className="hero-bg-pattern"></div>
                <div className="hero-content">
                    <div className="hero-text">
                        <div className="eyebrow fade-in">{settings.business_name}</div>
                        <h1 className="fade-in fade-in-delay-1">
                            {t("hero.titlePrefix")} <em>{t("hero.titleEmphasis")}</em>
                            <br />
                            {t("hero.titleSuffix")}
                        </h1>
                        <p className="fade-in fade-in-delay-2">
                            {t("hero.description")}
                        </p>
                        <HeroRentalActions
                            catalogEnabled={settings.catalog_enabled}
                            rentEnabled={settings.rent_enabled}
                            buyEnabled={settings.buy_enabled}
                        />
                        <div className="hero-stats fade-in fade-in-delay-4">
                            <div className="stat">
                                <div className="stat-number">240+</div>
                                <div className="stat-label">{t("stats.pieces")}</div>
                            </div>
                            <div className="stat">
                                <div className="stat-number">12</div>
                                <div className="stat-label">{t("stats.years")}</div>
                            </div>
                            <div className="stat">
                                <div className="stat-number">98%</div>
                                <div className="stat-label">{t("stats.clients")}</div>
                            </div>
                        </div>
                    </div>
                    <div className="hero-image-side fade-in fade-in-delay-2">
                        <div className="hero-image-frame">
                            <Image
                                src={heroImage}
                                alt={heroDoll?.name ?? t("hero.imageAlt")}
                                width={440}
                                height={520}
                                sizes="(max-width: 900px) 100vw, 440px"
                                priority
                                unoptimized={heroImage.includes("placehold.co")}
                            />
                            {heroDoll && (
                                <div className="hero-product-caption">
                                    <span>{t("hero.featuredLabel")}</span>
                                    <strong>{heroDoll.name}</strong>
                                    <small>{heroDoll.collection}</small>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="hero-scroll-indicator">
                    <div className="scroll-line"></div>
                    <span>{t("hero.scroll")}</span>
                </div>
            </section>

            <section id="servicii">
                <div className="services-inner">
                    <div className="services-header">
                        <div className="fade-in">
                            <span className="section-label">{t("services.label")}</span>
                            <h2 className="section-title">
                                {t("services.titleLine1")}
                                <br />
                                {t("services.titleLine2")}
                            </h2>
                            <div className="divider"></div>
                        </div>
                        <div className="fade-in fade-in-delay-1">
                            <p className="section-subtitle">{t("services.subtitle")}</p>
                        </div>
                    </div>

                    <div className="services-cards">
                        <div className="service-card fade-in">
                            <span className="service-number">01</span>
                            <div className="service-icon">
                                <svg viewBox="0 0 24 24">
                                    <circle cx="12" cy="8" r="4" />
                                    <path d="M12 14c-5 0-8 2-8 3v1h16v-1c0-1-3-3-8-3z" />
                                    <path d="M8 6.5C8.5 5 10 4 12 4s3.5 1 4 2.5" />
                                </svg>
                            </div>
                            <h3>{t("services.faceTitle")}</h3>
                            <p>{t("services.faceDescription")}</p>
                        </div>

                        <div className="service-card fade-in fade-in-delay-1">
                            <span className="service-number">02</span>
                            <div className="service-icon">
                                <svg viewBox="0 0 24 24">
                                    <path d="M12 2C9.5 2 8 4 8 6v1.5C8 9 9 10 10 10.5V12H8v2h8v-2h-2v-1.5c1-.5 2-1.5 2-3V6c0-2-1.5-4-4-4z" />
                                    <path d="M7 14s-3 1-3 4v4h16v-4c0-3-3-4-3-4" />
                                </svg>
                            </div>
                            <h3>{t("services.bodyTitle")}</h3>
                            <p>{t("services.bodyDescription")}</p>
                        </div>

                        <div className="service-card fade-in fade-in-delay-2">
                            <span className="service-number">03</span>
                            <div className="service-icon">
                                <svg viewBox="0 0 24 24">
                                    <path d="M6 3h12l2 6H4L6 3z" />
                                    <path d="M4 9v11a1 1 0 001 1h14a1 1 0 001-1V9" />
                                    <path d="M9 9v4a3 3 0 006 0V9" />
                                </svg>
                            </div>
                            <h3>{t("services.coutureTitle")}</h3>
                            <p>{t("services.coutureDescription")}</p>
                        </div>

                        <div className="service-card fade-in fade-in-delay-3">
                            <span className="service-number">04</span>
                            <div className="service-icon">
                                <svg viewBox="0 0 24 24">
                                    <path d="M12 2l1.5 4.5H18l-3.75 2.7 1.5 4.5L12 11l-3.75 2.7 1.5-4.5L6 6.5h4.5L12 2z" />
                                    <path d="M5 15s-1 3 0 5c1 1.5 4 2 7 2s6-.5 7-2c1-2 0-5 0-5" />
                                </svg>
                            </div>
                            <h3>{t("services.accessoriesTitle")}</h3>
                            <p>{t("services.accessoriesDescription")}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="galerie">
                <div className="gallery-inner">
                    <div className="gallery-header fade-in">
                        <span className="section-label">{t("gallery.label")}</span>
                        <h2 className="section-title">{t("gallery.title")}</h2>
                        <div className="divider"></div>
                        <p className="section-subtitle">{t("gallery.subtitle")}</p>
                    </div>

                    {galleryCards.length > 0 ? (
                        <div className="gallery-grid">
                            {galleryCards.map((doll, index) => (
                                <article
                                    key={doll.id}
                                    className={`gallery-item fade-in fade-in-delay-${Math.min(index, 4)}`}
                                >
                                    <Image
                                        src={doll.image}
                                        alt={t("gallery.imageAlt", { name: doll.name })}
                                        width={600}
                                        height={580}
                                        sizes="(max-width: 760px) 100vw, 33vw"
                                        unoptimized={doll.image.includes("placehold.co")}
                                    />
                                    <div className="gallery-overlay">
                                        <span className="price-tag">{doll.badge}</span>
                                        <h4>{doll.name}</h4>
                                        <p>{doll.description}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="gallery-empty fade-in">
                            <span className="section-label">{t("gallery.emptyTitle")}</span>
                            <p>{t("gallery.emptyDescription")}</p>
                        </div>
                    )}

                    <div className="gallery-cta fade-in">
                        <Link href="/catalog" className="btn btn-primary">
                            {t("gallery.viewAll")}
                        </Link>
                    </div>
                </div>
            </section>

            <section id="cta-section">
                <div className="cta-inner">
                    <span className="section-label fade-in">{t("cta.label")}</span>
                    <h2 className="section-title fade-in fade-in-delay-1">
                        {t("cta.titleLine1")}
                        <br />
                        {t("cta.titleLine2")}
                    </h2>
                    <div className="divider fade-in fade-in-delay-1"></div>
                    <p className="fade-in fade-in-delay-2">{t("cta.description")}</p>
                    <div className="cta-buttons fade-in fade-in-delay-3">
                        <a href={getContactHref(settings)} className="btn btn-gold">
                            {t("cta.quote")}
                        </a>
                        <a href="#galerie" className="btn btn-outline-light">
                            {t("cta.explore")}
                        </a>
                    </div>
                    <div className="cta-features fade-in fade-in-delay-4">
                        <div className="cta-feature">
                            <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                            {t("cta.consultation")}
                        </div>
                        <div className="cta-feature">
                            <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                            {t("cta.delivery")}
                        </div>
                        <div className="cta-feature">
                            <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                            {t("cta.certificate")}
                        </div>
                        <div className="cta-feature">
                            <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                            {t("cta.warranty")}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
