'use client';
import {useEffect} from "react";

export default function HeroEffect() {
    useEffect(() => {
        const fadeElements = document.querySelectorAll('.fade-in');

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.12,
                rootMargin: '0px 0px -48px 0px',
            },
        );

        fadeElements.forEach((element) => observer.observe(element));

        document.querySelectorAll('#hero .fade-in').forEach((element) => {
            element.classList.add('visible');
        });

        return () => {
            observer.disconnect();
        };
    }, []);

    return null;
}
