/** @odoo-module **/
// ============================================================
// OWL Rental Dashboard Service — RPC data fetching
// ============================================================

import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

export class RentalDashboardService {
    constructor(env) {
        this.env = env;
        this.orm = env.services.orm;
    }

    async fetchKPIs() {
        try {
            const result = await this.orm.call(
                "sale.order",
                "get_rental_dashboard_kpis",
                [],
                {}
            );
            return result;
        } catch (e) {
            console.error("fetchKPIs failed:", e);
            return this._getMockKPIs();
        }
    }

    async fetchChartData(period = "30d") {
        try {
            const result = await this.orm.call(
                "sale.order",
                "get_rental_chart_data",
                [period],
                {}
            );
            return result;
        } catch (e) {
            console.error("fetchChartData failed:", e);
            return this._getMockChartData();
        }
    }

    async fetchRecentRentals(limit = 20, status = "all") {
        try {
            const domain = status === "all"
                ? [["is_rental_order", "=", true]]
                : [["is_rental_order", "=", true], ["rental_status", "=", status]];

            return await this.orm.searchRead(
                "sale.order",
                domain,
                ["name", "partner_id", "rental_status", "amount_total", "date_order"],
                { limit, order: "date_order desc" }
            );
        } catch (e) {
            console.error("fetchRecentRentals failed:", e);
            return [];
        }
    }

    async processReturn(orderId) {
        return await this.orm.call(
            "sale.order",
            "action_process_rental_return",
            [[orderId]],
            {}
        );
    }

    async sendOverdueReminder(orderIds) {
        return await this.orm.call(
            "sale.order",
            "action_send_overdue_reminder",
            [orderIds],
            {}
        );
    }

    // ── Fallback Mock Data ─────────────────────────────────────
    _getMockKPIs() {
        return {
            active_rentals:      42,
            due_today:           7,
            upcoming_pickups:    13,
            upcoming_returns:    9,
            overdue_rentals:     3,
            revenue_total:       485200,
            deposits_held:       128500,
            late_fee_collected:  9800,
            // trend vs last period (%)
            trends: {
                active_rentals:   +12,
                revenue_total:    +8.5,
                deposits_held:    +5,
                overdue_rentals:  -2,
            },
        };
    }

    _getMockChartData() {
        const labels = Array.from({length: 30}, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (29 - i));
            return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
        });

        return {
            revenue: {
                labels,
                data: Array.from({length: 30}, () => Math.floor(Math.random() * 25000 + 5000)),
            },
            statusDist: {
                labels: ["Active", "Returned", "Overdue", "Pickup Due"],
                data:   [42, 215, 3, 13],
                colors: ["#10B981", "#94A3B8", "#EF4444", "#7C3AED"],
            },
            timeline: {
                labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                pickups: [3, 7, 2, 5, 8, 4, 1],
                returns: [5, 4, 9, 3, 6, 7, 2],
            },
        };
    }
}

registry.category("services").add("rental_dashboard_service", {
    async: false,
    start(env) {
        return new RentalDashboardService(env);
    },
});
