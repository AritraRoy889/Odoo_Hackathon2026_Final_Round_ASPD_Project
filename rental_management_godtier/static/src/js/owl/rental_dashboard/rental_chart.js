/** @odoo-module **/
// ============================================================
// OWL Rental Chart Component — Chart.js integration
// ============================================================

import { Component, useRef, onMounted, onPatched, onWillUnmount } from "@odoo/owl";
import { loadJS } from "@web/core/assets";

export class RentalChart extends Component {
    static template = "rental_management_godtier.RentalChart";

    static props = {
        type:     { type: String },           // "revenue" | "status" | "timeline"
        data:     { type: Object },
        title:    { type: String, optional: true },
        height:   { type: Number, optional: true, default: 240 },
    };

    setup() {
        this.canvasRef = useRef("chartCanvas");
        this.chartInstance = null;

        onMounted(async () => {
            await this._loadChartJS();
            this._createChart();
        });

        onPatched(() => {
            if (this.chartInstance) {
                this._updateChart();
            }
        });

        onWillUnmount(() => {
            if (this.chartInstance) {
                this.chartInstance.destroy();
                this.chartInstance = null;
            }
        });
    }

    async _loadChartJS() {
        if (typeof Chart !== "undefined") return;
        await loadJS("https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js");
    }

    _getChartDefaults() {
        return {
            responsive:          true,
            maintainAspectRatio: false,
            animation: { duration: 1000, easing: "easeInOutQuart" },
            plugins: {
                legend: {
                    display: this.props.type === "status",
                    labels: {
                        color:    "#94A3B8",
                        font:     { family: "'Inter', sans-serif", size: 12 },
                        padding:  16,
                        usePointStyle: true,
                        pointStyleWidth: 8,
                    },
                },
                tooltip: {
                    backgroundColor: "rgba(10, 15, 30, 0.95)",
                    borderColor:     "rgba(148,163,184,0.15)",
                    borderWidth:     1,
                    titleColor:      "#F1F5F9",
                    bodyColor:       "#94A3B8",
                    padding:         12,
                    cornerRadius:    10,
                    titleFont:       { family: "'Space Grotesk', sans-serif", weight: "600" },
                    callbacks: {
                        label: (ctx) => {
                            const val = ctx.parsed.y !== undefined ? ctx.parsed.y : ctx.parsed;
                            if (this.props.type === "revenue") return ` ₹${Number(val).toLocaleString("en-IN")}`;
                            return ` ${val}`;
                        },
                    },
                },
            },
            scales: this.props.type !== "status" ? {
                x: {
                    grid:     { color: "rgba(148,163,184,0.06)", drawBorder: false },
                    ticks:    { color: "#64748B", font: { size: 11 } },
                    border:   { display: false },
                },
                y: {
                    grid:     { color: "rgba(148,163,184,0.06)", drawBorder: false },
                    ticks:    { color: "#64748B", font: { size: 11 } },
                    border:   { display: false },
                    beginAtZero: true,
                },
            } : undefined,
        };
    }

    _buildConfig() {
        const { type, data } = this.props;

        if (type === "revenue") {
            return {
                type: "bar",
                data: {
                    labels:   data.labels || [],
                    datasets: [{
                        label:           "Revenue (₹)",
                        data:            data.data || [],
                        backgroundColor: this._createGradient("rgba(124,58,237,0.7)", "rgba(6,182,212,0.4)"),
                        borderColor:     "rgba(124,58,237,0.9)",
                        borderWidth:     1,
                        borderRadius:    6,
                        borderSkipped:   false,
                    }],
                },
                options: this._getChartDefaults(),
            };
        }

        if (type === "status") {
            return {
                type: "doughnut",
                data: {
                    labels:   data.labels || [],
                    datasets: [{
                        data:             data.data || [],
                        backgroundColor:  data.colors || ["#10B981", "#94A3B8", "#EF4444", "#7C3AED"],
                        borderColor:      "#0A0F1E",
                        borderWidth:      3,
                        hoverBorderWidth: 4,
                        hoverOffset:      8,
                    }],
                },
                options: {
                    ...this._getChartDefaults(),
                    cutout: "68%",
                    plugins: {
                        ...this._getChartDefaults().plugins,
                        legend: { ...this._getChartDefaults().plugins.legend, position: "bottom" },
                    },
                },
            };
        }

        if (type === "timeline") {
            return {
                type: "line",
                data: {
                    labels:   data.labels || [],
                    datasets: [
                        {
                            label:           "Pickups",
                            data:            data.pickups || [],
                            borderColor:     "#7C3AED",
                            backgroundColor: "rgba(124,58,237,0.08)",
                            borderWidth:     2,
                            tension:         0.4,
                            fill:            true,
                            pointBackgroundColor: "#7C3AED",
                            pointRadius:     4,
                            pointHoverRadius: 6,
                        },
                        {
                            label:           "Returns",
                            data:            data.returns || [],
                            borderColor:     "#06B6D4",
                            backgroundColor: "rgba(6,182,212,0.06)",
                            borderWidth:     2,
                            tension:         0.4,
                            fill:            true,
                            pointBackgroundColor: "#06B6D4",
                            pointRadius:     4,
                            pointHoverRadius: 6,
                        },
                    ],
                },
                options: this._getChartDefaults(),
            };
        }

        return null;
    }

    _createGradient(colorTop, colorBottom) {
        const canvas = this.canvasRef.el;
        if (!canvas) return colorTop;
        const ctx = canvas.getContext("2d");
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, colorTop);
        gradient.addColorStop(1, colorBottom);
        return gradient;
    }

    _createChart() {
        const canvas = this.canvasRef.el;
        if (!canvas || typeof Chart === "undefined") return;

        const config = this._buildConfig();
        if (!config) return;

        this.chartInstance = new Chart(canvas, config);
    }

    _updateChart() {
        if (!this.chartInstance) return;

        const { data, type } = this.props;

        if (type === "revenue" || type === "timeline") {
            this.chartInstance.data.labels = data.labels || [];
            if (type === "timeline") {
                this.chartInstance.data.datasets[0].data = data.pickups || [];
                this.chartInstance.data.datasets[1].data = data.returns || [];
            } else {
                this.chartInstance.data.datasets[0].data = data.data || [];
            }
        } else if (type === "status") {
            this.chartInstance.data.labels = data.labels || [];
            this.chartInstance.data.datasets[0].data   = data.data || [];
            this.chartInstance.data.datasets[0].backgroundColor = data.colors || [];
        }

        this.chartInstance.update("active");
    }
}
