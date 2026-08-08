/** @odoo-module **/
// ============================================================
// OWL Rental Dashboard — Root Component
// ============================================================

import { Component, useState, useEffect, onMounted } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { registry } from "@web/core/registry";
import { KpiCard } from "./kpi_card";
import { RentalChart } from "./rental_chart";
import { ActionButtons } from "./action_buttons";

export class RentalDashboard extends Component {
    static template    = "rental_management_godtier.RentalDashboard";
    static components  = { KpiCard, RentalChart, ActionButtons };

    setup() {
        this.state = useState({
            kpis:          null,
            chartData:     null,
            recentRentals: [],
            isLoading:     true,
            isRefreshing:  false,
            selectedPeriod: "30d",
            activeTab:     "all",
            error:         null,
            lastUpdated:   null,
        });

        // Services
        this.rentalSvc    = useService("rental_dashboard_service");
        this.notification = useService("notification");
        this.action       = useService("action");

        // Load data on mount
        onMounted(() => this.loadDashboard());

        // Auto-refresh every 60 seconds
        let refreshTimer;
        onMounted(() => {
            refreshTimer = setInterval(() => this.refreshData(), 60_000);
        });
    }

    // ── Data Loading ──────────────────────────────────────────
    async loadDashboard() {
        this.state.isLoading = true;
        this.state.error     = null;

        try {
            const [kpis, chartData, rentals] = await Promise.all([
                this.rentalSvc.fetchKPIs(),
                this.rentalSvc.fetchChartData(this.state.selectedPeriod),
                this.rentalSvc.fetchRecentRentals(25, this.state.activeTab),
            ]);

            this.state.kpis          = kpis;
            this.state.chartData     = chartData;
            this.state.recentRentals = rentals;
            this.state.lastUpdated   = new Date().toLocaleTimeString("en-IN");
        } catch (e) {
            this.state.error = "Failed to load dashboard data. Please refresh.";
            console.error("Dashboard load error:", e);
        } finally {
            this.state.isLoading = false;
        }
    }

    async refreshData() {
        if (this.state.isRefreshing) return;
        this.state.isRefreshing = true;
        await this.loadDashboard();
        this.state.isRefreshing = false;
    }

    // ── KPI Config ────────────────────────────────────────────
    get kpiCards() {
        const k = this.state.kpis;
        if (!k) return [];

        return [
            {
                key:    "active",
                title:  "Active Rentals",
                value:  k.active_rentals,
                icon:   "📦",
                color:  "violet",
                trend:  k.trends?.active_rentals ?? null,
                prefix: "",
                suffix: "",
            },
            {
                key:    "due_today",
                title:  "Due Today",
                value:  k.due_today,
                icon:   "⏰",
                color:  "amber",
                trend:  null,
            },
            {
                key:    "pickups",
                title:  "Upcoming Pickups",
                value:  k.upcoming_pickups,
                icon:   "🚀",
                color:  "cyan",
                trend:  null,
            },
            {
                key:    "returns",
                title:  "Upcoming Returns",
                value:  k.upcoming_returns,
                icon:   "↩️",
                color:  "blue",
                trend:  null,
            },
            {
                key:    "overdue",
                title:  "Overdue Rentals",
                value:  k.overdue_rentals,
                icon:   "⚠️",
                color:  "red",
                trend:  k.trends?.overdue_rentals ?? null,
            },
            {
                key:    "revenue",
                title:  "Total Revenue",
                value:  k.revenue_total,
                icon:   "💰",
                color:  "green",
                trend:  k.trends?.revenue_total ?? null,
                prefix: "₹",
            },
            {
                key:    "deposits",
                title:  "Deposits Held",
                value:  k.deposits_held,
                icon:   "🛡️",
                color:  "indigo",
                trend:  k.trends?.deposits_held ?? null,
                prefix: "₹",
            },
            {
                key:    "late_fees",
                title:  "Late Fee Collected",
                value:  k.late_fee_collected,
                icon:   "📋",
                color:  "pink",
                trend:  null,
                prefix: "₹",
            },
        ];
    }

    // ── Period Change ─────────────────────────────────────────
    async selectPeriod(period) {
        this.state.selectedPeriod = period;
        const chartData = await this.rentalSvc.fetchChartData(period);
        this.state.chartData = chartData;
    }

    // ── Table Tab ─────────────────────────────────────────────
    async setActiveTab(tab) {
        this.state.activeTab = tab;
        this.state.recentRentals = await this.rentalSvc.fetchRecentRentals(25, tab);
    }

    // ── Navigate to Record ────────────────────────────────────
    async openOrder(orderId) {
        await this.action.doAction({
            type:      "ir.actions.act_window",
            res_model: "sale.order",
            res_id:    orderId,
            views:     [[false, "form"]],
        });
    }

    // ── Status label helper ───────────────────────────────────
    getRentalStatusLabel(status) {
        const map = {
            draft:    "Draft",
            sent:     "Quotation Sent",
            sale:     "Confirmed",
            pickup:   "Pickup Due",
            return:   "Active",
            returned: "Returned",
            cancel:   "Cancelled",
        };
        return map[status] || status;
    }

    getRentalStatusClass(status) {
        const map = {
            return:   "status-badge--active",
            returned: "status-badge--returned",
            cancel:   "status-badge--returned",
            pickup:   "status-badge--confirmed",
        };
        return `status-badge ${map[status] || "status-badge--pending"}`;
    }
}

// ── Register as Client Action ─────────────────────────────────
registry.category("actions").add("rental_management_godtier.rental_dashboard", RentalDashboard);
