/** @odoo-module **/
// ============================================================
// Splash Screen — Particle Canvas + Loading Sequence
// ============================================================

import { loadJS } from "@web/core/assets";

class OmniSplash {
    constructor() {
        this.canvas = document.getElementById("omni-particle-canvas");
        this.ctx    = this.canvas ? this.canvas.getContext("2d") : null;
        this.particles = [];
        this.animFrame = null;
        this.statusMessages = [
            "Initializing systems...",
            "Loading product catalog...",
            "Connecting to rental engine...",
            "Preparing your dashboard...",
            "Ready to launch! 🚀",
        ];
        this.msgIndex = 0;
    }

    init() {
        if (!this.canvas) return;
        this.resize();
        this.createParticles(120);
        this.animate();
        this.startLoadingSequence();
        window.addEventListener("resize", () => this.resize());
    }

    resize() {
        this.canvas.width  = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles(count) {
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x:      Math.random() * this.canvas.width,
                y:      Math.random() * this.canvas.height,
                radius: Math.random() * 1.5 + 0.3,
                vx:     (Math.random() - 0.5) * 0.4,
                vy:     (Math.random() - 0.5) * 0.4,
                alpha:  Math.random() * 0.6 + 0.1,
                // Random hue between violet and cyan
                color:  Math.random() > 0.5
                    ? `rgba(167, 139, 250, ${Math.random() * 0.6 + 0.1})`
                    : `rgba(103, 232, 249, ${Math.random() * 0.5 + 0.1})`,
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(p => {
            // Move
            p.x += p.vx;
            p.y += p.vy;

            // Wrap edges
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;

            // Draw
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.fill();
        });

        // Connect nearby particles
        this.connectParticles();
        this.animFrame = requestAnimationFrame(() => this.animate());
    }

    connectParticles() {
        const maxDist = 100;
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const a = this.particles[i];
                const b = this.particles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < maxDist) {
                    const alpha = (1 - dist / maxDist) * 0.15;
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(124, 58, 237, ${alpha})`;
                    this.ctx.lineWidth   = 0.6;
                    this.ctx.moveTo(a.x, a.y);
                    this.ctx.lineTo(b.x, b.y);
                    this.ctx.stroke();
                }
            }
        }
    }

    startLoadingSequence() {
        const statusEl = document.getElementById("omni-status-text");
        const ctaEl    = document.getElementById("omni-splash-cta");

        const interval = setInterval(() => {
            this.msgIndex++;
            if (statusEl && this.msgIndex < this.statusMessages.length) {
                statusEl.textContent = this.statusMessages[this.msgIndex];
            }
            if (this.msgIndex >= this.statusMessages.length - 1) {
                clearInterval(interval);
                // Show CTA buttons
                setTimeout(() => {
                    if (ctaEl) ctaEl.classList.add("is-visible");
                }, 300);
            }
        }, 520);
    }

    destroy() {
        if (this.animFrame) cancelAnimationFrame(this.animFrame);
        window.removeEventListener("resize", this.resize);
    }
}

// ── Mount on DOMContentLoaded ─────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    const splashEl = document.getElementById("omni-splash");
    if (!splashEl) return;

    const splash = new OmniSplash();
    splash.init();

    // Expose globally for inline onclick handlers
    window.omniSplash = splash;
});

// ── Password Toggle (shared across auth pages) ───────────────
window.togglePasswordVisibility = function (inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.type = input.type === "password" ? "text" : "password";
};

// ── Avatar Preview (profile setup) ───────────────────────────
window.previewAvatar = function (event) {
    const file    = event.target.files[0];
    const preview = document.getElementById("avatar-preview");
    const placeholder = document.getElementById("avatar-placeholder");
    const dataInput   = document.getElementById("avatar-data-input");

    if (!file || !preview) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        preview.src     = e.target.result;
        preview.style.display = "block";
        if (placeholder) placeholder.style.display = "none";
        if (dataInput) dataInput.value = e.target.result;
    };
    reader.readAsDataURL(file);
};
