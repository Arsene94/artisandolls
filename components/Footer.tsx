export default function Footer() {
    return (
        <footer id="contact">
            <div className="footer-inner">
                <div className="footer-top">
                    <div className="footer-brand">
                        <a href="#" className="logo">Artisan<span>Dolls</span></a>
                        <p>Atelier de creație artistică specializat în păpuși de colecție personalizate, realizate manual cu materiale de cel mai înalt standard.</p>
                        <div className="footer-social">
                            <a href="#" className="social-link" aria-label="Instagram">
                                <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                            </a>
                            <a href="#" className="social-link" aria-label="Pinterest">
                                <svg viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.598-.299-1.482c0-1.388.806-2.428 1.808-2.428.853 0 1.267.64 1.267 1.408 0 .858-.546 2.14-.828 3.33-.236.995.499 1.806 1.476 1.806 1.772 0 3.137-1.868 3.137-4.564 0-2.387-1.716-4.055-4.164-4.055-2.835 0-4.5 2.127-4.5 4.326 0 .857.33 1.776.741 2.278a.3.3 0 01.069.286c-.076.313-.244.995-.277 1.134-.044.183-.146.222-.337.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.967-.527-2.292-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
                            </a>
                            <a href="#" className="social-link" aria-label="Facebook">
                                <svg viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                            </a>
                        </div>
                    </div>

                    <div className="footer-col">
                        <h4>Navigare</h4>
                        <ul className="footer-links">
                            <li><a href="#hero">Acasă</a></li>
                            <li><a href="#servicii">Servicii</a></li>
                            <li><a href="#galerie">Galerie</a></li>
                            <li><a href="#contact">Contact</a></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>Colecții</h4>
                        <ul className="footer-links">
                            <li><a href="#galerie">Ediții Limitate</a></li>
                            <li><a href="#galerie">Colecția Clasică</a></li>
                            <li><a href="#galerie">Seria Anotimpuri</a></li>
                            <li><a href="#galerie">Colecția Noir</a></li>
                            <li><a href="#galerie">Comenzi Speciale</a></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>Contact</h4>
                        <div className="contact-item">
                            <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            <span>Str. Artizanilor nr. 14<br />București, România</span>
                        </div>
                        <div className="contact-item">
                            <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/></svg>
                            <span>+40 721 000 000</span>
                        </div>
                        <div className="contact-item">
                            <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                            <span>atelier@artisandolls.ro</span>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p className="footer-copyright">© 2026 ArtisanDolls. Toate drepturile rezervate.</p>
                    <div className="footer-bottom-links">
                        <a href="#">Politica de Confidențialitate</a>
                        <a href="#">Termeni și Condiții</a>
                        <a href="#">Cookies</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
