/** @odoo-module **/
// ============================================================
// OWL KPI Card Component
// ============================================================

import { Component, useState, onMounted } from "@odoo/owl";

export class KpiCard extends Component {
    static template = "rental_management_godtier.KpiCard";

    static props = {
        title:   { type: String },
        value:   { type: [Number, String] },
        icon:    { type: String, optional: true, default: "📊" },
        color:   { type: String, optional: true, default: "violet" },
        trend:   { type: [Number, null], optional: true, default: null },
        prefix:  { type: String, optional: true, default: "" },
        suffix:  { type: String, optional: true, default: "" },
        onClick: { type: Function, optional: true },
    };

    setup() {
        this.state = useState({
            displayValue: 0,
            isAnimating:  false,
        });

        onMounted(() => this._animateCounter());
    }

    // ── Counter Animation ─────────────────────────────────────
    _animateCounter() {
        const target  = typeof this.props.value === "number" ? this.props.value : 0;
        const duration = 1200;
        const start    = performance.now();
        this.state.isAnimating = true;

        const step = (now) => {
            const elapsed  = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const ease     = 1 - Math.pow(1 - progress, 3);
            this.state.displayValue = Math.round(target * ease);

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                this.state.displayValue = target;
                this.state.isAnimating  = false;
            }
        };

        requestAnimationFrame(step);
    }

    // ── Computed ──────────────────────────────────────────────
    get formattedValue() {
        const val = this.state.displayValue;
        if (typeof this.props.value === "string") return this.props.value;
        if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
        if (val >= 1_00_000) return `${(val / 1_00_000).toFixed(1)}L`;
        if (val >= 1_000)   return val.toLocaleString("en-IN");
        return String(val);
    }

    get trendClass() {
        if (this.props.trend === null) return "kpi-card__trend--neutral";
        return this.props.trend >= 0 ? "kpi-card__trend--up" : "kpi-card__trend--down";
    }

    get trendIcon() {
        if (this.props.trend === null) return "—";
        return this.props.trend >= 0 ? "↑" : "↓";
    }

    get trendText() {
        if (this.props.trend === null) return "N/A";
        return `${Math.abs(this.props.trend)}%`;
    }

    get cardClass() {
        return `kpi-card kpi-card--${this.props.color}`;
    }

    onClick() {
        if (this.props.onClick) this.props.onClick();
    }
}
