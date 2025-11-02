/* Global interactions for all pages */
document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page;

    // Small util: fade in reveal items
    document.querySelectorAll(".reveal").forEach((el, i) => {
        setTimeout(() => el.classList.add("visible"), 80 + i * 130);
    });

    /* ---------------- INDEX - Slider (estilo tiktok/story) ---------------- */
    if (page === "index") {
        const slider = document.getElementById("storySlider");
        const slides = Array.from(slider.children);
        let idx = 0;

        const prev = document.getElementById("prevSlide");
        const next = document.getElementById("nextSlide");
        const progressRow = document.getElementById("progressRow");
        const progressBars = progressRow ? Array.from(progressRow.children) : null;

        function showSlide(i) {
            if (i < 0) i = slides.length - 1;
            if (i >= slides.length) i = 0;
            idx = i;
            const offset = slides[i].offsetLeft - slider.offsetLeft - (slider.clientWidth - slides[i].clientWidth) / 2;
            slider.scrollTo({ left: offset, behavior: 'smooth' });
            // highlight progress bars
            if (progressBars) progressBars.forEach((p, pi) => p.style.opacity = pi <= i ? '1' : '0.35');
            // subtle scale effect
            slides.forEach((s, si) => s.style.transform = si === i ? "scale(1)" : "scale(0.96)");
        }

        prev.addEventListener("click", () => showSlide(idx - 1));
        next.addEventListener("click", () => showSlide(idx + 1));

        // autoplay small loop like tiktok stories
        let auto = setInterval(() => showSlide(idx + 1), 4200);
        // pause on hover
        slider.addEventListener("mouseenter", () => clearInterval(auto));
        slider.addEventListener("mouseleave", () => auto = setInterval(() => showSlide(idx + 1), 4200));

        // CTA buttons inside slides
        document.querySelectorAll(".btn").forEach(b => {
            b.addEventListener("click", (ev) => {
                const cta = b.dataset.cta || b.id;
                if (cta === "sobre") location.href = "sobre.html";
                if (cta === "ler") alert("Resumo rápido: O Cortiço é sobre ... (adicione seu resumo aqui)");
                if (b.id === "openGallery") location.href = "galeria.html";
                if (b.id === "openPersonagens") location.href = "personagens.html";
            });
        });

        // initial show
        setTimeout(() => showSlide(0), 300);
    }

    /* ---------------- SOBRE - textual interactivity + ambient sound ---------------- */
    if (page === "sobre") {
        const toggler = document.getElementById("toggleSound");
        // ambient sound (loop) - small quiet audio
        const ambient = new Audio("https://cdn.pixabay.com/download/audio/2021/08/04/audio_9d3f7f7e0f.mp3?filename=ambient-crowd-ambient-100336.mp3");
        ambient.loop = true;
        ambient.volume = 0.12;
        toggler && toggler.addEventListener("click", () => {
            if (ambient.paused) { ambient.play(); toggler.textContent = "🔊"; }
            else { ambient.pause(); toggler.textContent = "🔈"; }
        });

        // interactive paragraph hover: type effect + color pulse
        document.querySelectorAll(".interactive-para").forEach(block => {
            block.addEventListener("mouseenter", () => {
                block.style.transition = "transform .25s ease, box-shadow .25s";
                block.style.boxShadow = "0 18px 40px rgba(0,0,0,0.45)";
                pulseWords(block);
            });
            block.addEventListener("mouseleave", () => {
                block.style.boxShadow = "";
            });
        });

        function pulseWords(el) {
            // highlight random words quickly to simulate "vida"
            const txt = el.querySelector("p") || el;
            const words = txt.innerText.split(" ");
            txt.innerHTML = words.map(w => `<span class="w">${w}</span>`).join(" ");
            const spans = txt.querySelectorAll("span.w");
            spans.forEach(s => s.style.transition = "all .28s ease");
            let i = 0;
            const intr = setInterval(() => {
                const r = Math.floor(Math.random() * spans.length);
                spans[r].style.color = `hsl(${Math.floor(Math.random() * 40 + 15)},85%,70%)`;
                spans[r].style.transform = "translateY(-6px)";
                setTimeout(() => { spans[r].style.color = ""; spans[r].style.transform = ""; }, 450);
                i++;
                if (i > 8) { clearInterval(intr); }
            }, 120);
        }
    }

    /* ---------------- PERSONAGENS - clicáveis com fala e som ---------------- */
    if (page === "personagens") {
        document.querySelectorAll(".char.card").forEach(card => {
            card.addEventListener("click", (e) => {
                // create speech bubble
                const line = card.dataset.line || "—";
                const bubble = document.createElement("div");
                bubble.className = "speech-bubble";
                bubble.textContent = line;
                bubble.style.position = 'absolute';
                bubble.style.left = card.getBoundingClientRect().left + window.scrollX + 'px';
                bubble.style.top = card.getBoundingClientRect().top + window.scrollY - 60 + 'px';
                bubble.style.background = 'linear-gradient(90deg, rgba(255,107,107,0.12), rgba(255,177,66,0.06))';
                bubble.style.padding = '10px 12px';
                bubble.style.borderRadius = '12px';
                bubble.style.boxShadow = '0 8px 26px rgba(0,0,0,0.5)';
                bubble.style.zIndex = 1500;
                document.body.appendChild(bubble);
                setTimeout(() => bubble.remove(), 3000);

                // sound feedback (small variety)
                const sound = card.dataset.sound || 'pop';
                playSfx(sound);
            });
        });

        // SFX loader
        function playSfx(name) {
            const map = {
                pop: "https://cdn.pixabay.com/download/audio/2021/09/02/audio_aa69f6cd13.mp3?filename=pop-94319.mp3",
                bell: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_3c4e1d23bd.mp3?filename=bell-ambient-99189.mp3",
                drum: "https://cdn.pixabay.com/download/audio/2022/02/02/audio_d061a9a0a5.mp3?filename=hand-drum-hit-114437.mp3"
            };
            const a = new Audio(map[name] || map.pop);
            a.volume = 0.18;
            a.play();
        }
    }

    /* ---------------- GALERIA - lightbox e parallax hover ---------------- */
    if (page === "galeria") {
        document.querySelectorAll(".gimg").forEach(g => {
            g.addEventListener("click", () => {
                const lb = document.getElementById("lightbox");
                const content = document.getElementById("lbContent");
                content.style.backgroundImage = g.style.backgroundImage;
                lb.classList.add("active");
                lb.setAttribute("aria-hidden", "false");
            });

            g.addEventListener("mousemove", (ev) => {
                const rect = g.getBoundingClientRect();
                const x = (ev.clientX - rect.left) / (rect.width) - .5;
                const y = (ev.clientY - rect.top) / (rect.height) - .5;
                g.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${y * -6}deg) translateZ(6px)`;
            });

            g.addEventListener("mouseleave", () => g.style.transform = '');
        });

        // lightbox close
        const lb = document.getElementById("lightbox");
        const lbClose = document.getElementById("lbClose");
        lbClose.addEventListener("click", () => { lb.classList.remove("active"); lb.setAttribute("aria-hidden", "true"); });
        lb.addEventListener("click", (e) => { if (e.target === lb) { lb.classList.remove("active"); lb.setAttribute("aria-hidden", "true"); } });
    }

});
