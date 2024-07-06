import gsap from "https://cdn.skypack.dev/gsap@3.12.0";
import { ScrollTrigger } from "https://cdn.skypack.dev/gsap@3.12.0/ScrollTrigger";

if (!CSS.supports("animation-timeline: view()")) {
    gsap.registerPlugin(ScrollTrigger);

    // Set up all the scroll animations with ScrollTrigger instead.
    // Blanket styles
    gsap.set(".fixed", {
        position: "fixed",
        inset: 0
    });
    gsap.set(".static", {
        position: "absolute",
        inset: 0,
        zIndex: 6
    });

    const sections = document.querySelectorAll("section");

    sections.forEach((section, index) => {
        const fixed = section.querySelector(".fixed");
        const img = section.querySelector("img");
        const h2 = section.querySelector("h2");

        // Apply different transformations and animations for each section
        gsap.set(fixed, {
            transformOrigin: "50% 0%"
        });

        gsap.to(fixed, {
            scale: "0.35 0.5",
            yPercent: -10,
            scrollTrigger: {
                scrub: 0.5,
                trigger: section,
                start: "top top",
                end: "bottom 50%"
            }
        });

        gsap.to(fixed, {
            opacity: 0,
            scrollTrigger: {
                scrub: 0.5,
                trigger: section,
                start: "top top",
                end: "bottom 75%"
            }
        });

        gsap.set(fixed, {
            clipPath: "ellipse(220% 200% at 50% 300%)",
            zIndex: 3
        });

        gsap.to(fixed, {
            clipPath: "ellipse(220% 200% at 50% 175%)",
            scrollTrigger: {
                scrub: 0.5,
                trigger: section,
                start: "top bottom",
                end: "top top"
            }
        });

        gsap.from(img, {
            scale: 5,
            scrollTrigger: {
                scrub: 0.5,
                trigger: section,
                start: "top bottom",
                end: "top top"
            }
        });

        if (h2) {
            gsap.from(h2, {
                yPercent: 100,
                scrollTrigger: {
                    scrub: 0.5,
                    trigger: section,
                    start: "top 50%",
                    end: "top 0%"
                }
            });

            gsap.to(h2, {
                filter: "blur(4rem)",
                color: "transparent",
                scrollTrigger: {
                    scrub: 0.5,
                    trigger: section,
                    start: "bottom bottom",
                    end: "bottom 50%"
                }
            });
        }

        // Scroll indicator trickery
        const INDICATORS = document.querySelectorAll(".indicator");
        const ARTICLES = document.querySelectorAll("article");
        INDICATORS.forEach((indicator, index) => {
            // Here need to animate the indicator based on the position of the card
            gsap.to(indicator, {
                flex: 3,
                repeat: 1,
                yoyo: true,
                scrollTrigger: {
                    scrub: true,
                    trigger: ARTICLES[index],
                    scroller: "body",
                    start: "top bottom",
                    end: "bottom top"
                }
            });
        });
    });
}
