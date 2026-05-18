'use client';

import {useEffect, useState} from "react";

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 40);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <>
            <header id="header" className={scrolled ? "scrolled" : ""}>
                <a href="#" className="logo">Artisan<span>Dolls</span></a>
                <nav>
                    <a href="#hero">Acasă</a>
                    <a href="#servicii">Servicii</a>
                    <a href="#galerie">Galerie</a>
                    <a href="#contact">Contact</a>
                </nav>
                <button className={`hamburger ${mobileOpen ? "open" : ""}`} id="hamburger" aria-label="Meniu" onClick={() => setMobileOpen((open) => !open)}>
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </header>
            <div className={`mobile-nav ${mobileOpen ? "open" : ""}`} id="mobileNav">
                <a href="#hero" className="mobile-link" onClick={() => setMobileOpen(false)}>Acasă</a>
                <a href="#servicii" className="mobile-link" onClick={() => setMobileOpen(false)}>Servicii</a>
                <a href="#galerie" className="mobile-link" onClick={() => setMobileOpen(false)}>Galerie</a>
                <a href="#contact" className="mobile-link" onClick={() => setMobileOpen(false)}>Contact</a>
            </div>
        </>
    )
}
