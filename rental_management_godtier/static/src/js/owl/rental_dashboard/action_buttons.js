/** @odoo-module **/
// ============================================================
// OWL Action Buttons Component
// ============================================================

import { Component, useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class ActionButtons extends Component {
    static template = "rental_management_godtier.ActionButtons";

    static props = {
        overdueCount:   { type: Number, optional: true, default: 0 },
        dueReturnCount: { type: Number, optional: true, default: 0 },
        duePickupCount: { type: Number, optional: true, default: 0 },
        onRefresh:      { type: Function, optional: true },
    };

    setup() {
        this.state = useState({
            loading: {
                return:   false,
                reminder: false,
                overdue:  false,
                invoice:  false,
            },
            lastActionResult: null,
        });

        this.notification = useService("notification");
        this.action       = useService("action");
        this.orm          = useService("orm");
        this.dialog       = useService("dialog");
    }

    // ── Process Returns ───────────────────────────────────────
    async processReturns() {
        this.state.loading.return = true;
        try {
            // Open Odoo action to list orders due for return
            await this.action.doAction({
                type:        "ir.actions.act_window",
                name:        "📦 Process Returns",
                res_model:   "sale.order",
                view_mode:   "list,form",
                domain:      [["rental_status", "=", "return"], ["is_rental_order", "=", true]],
                views:       [[false, "list"], [false, "form"]],
                context:     { active_test: true },
            });
        } catch (e) {
            this.notification.add("Failed to open returns list.", { type: "danger" });
        } finally {
            this.state.loading.return = false;
        }
    }

    // ── Send Overdue Reminders ────────────────────────────────
    async sendOverdueReminders() {
        this.state.loading.reminder = true;
        try {
            const overdueOrders = await this.orm.search(
                "sale.order",
                [
                    ["is_rental_order", "=", true],
                    ["rental_status", "=", "return"],
                    // Past return date
                ],
                { limit: 100 }
            );

            if (overdueOrders.length === 0) {
                this.notification.add("No overdue orders found.", { type: "info" });
                return;
            }

            await this.orm.call(
                "sale.order",
                "action_send_overdue_reminder",
                [overdueOrders],
                {}
            );

            this.notification.add(
                `✅ Overdue reminder sent to ${overdueOrders.length} customer(s).`,
                { type: "success", sticky: false }
            );

            if (this.props.onRefresh) this.props.onRefresh();

        } catch (e) {
            this.notification.add(
                "Failed to send reminders. Please try again.",
                { type: "danger" }
            );
        } finally {
            this.state.loading.reminder = false;
        }
    }

    // ── View Overdue Rentals ──────────────────────────────────
    async viewOverdueRentals() {
        this.state.loading.overdue = true;
        try {
            await this.action.doAction({
                type:        "ir.actions.act_window",
                name:        "⚠️ Overdue Rentals",
                res_model:   "sale.order",
                view_mode:   "list,form",
                domain:      [
                    ["is_rental_order", "=", true],
                    ["rental_status", "=", "return"],
                ],
                views:       [[false, "list"], [false, "form"]],
                context:     {},
            });
        } finally {
            this.state.loading.overdue = false;
        }
    }

    // ── Generate Invoices ─────────────────────────────────────
    async generateInvoices() {
        this.state.loading.invoice = true;
        try {
            // Trigger invoice creation for all confirmed rental orders
            const result = await this.orm.call(
                "sale.order",
                "action_view_invoice",
                [],
                {}
            );
            if (result) await this.action.doAction(result);
        } catch (e) {
            this.notification.add("Failed to generate invoices.", { type: "danger" });
        } finally {
            this.state.loading.invoice = false;
        }
    }

    get isAnyLoading() {
        return Object.values(this.state.loading).some(Boolean);
    }
}
