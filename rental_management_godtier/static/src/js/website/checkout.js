/** @odoo-module **/
// ============================================================
// Checkout JS — Delivery selection, address form, totals
// ============================================================

class OmniCheckout {
    constructor() {
        this.selectedDelivery = null;
        this.deliveryFee = 299;
    }

    init() {
        // Set today's date as min for any date inputs
        const today = new Date().toISOString().split("T")[0];
        document.querySelectorAll("input[type='date']").forEach(el => { el.min = today; });
    }

    // ── Delivery Selection ────────────────────────────────────
    selectDelivery(type, card) {
        this.selectedDelivery = type;

        // Update card visuals
        document.querySelectorAll(".delivery-card").forEach(c => c.classList.remove("is-selected"));
        card.classList.add("is-selected");

        // Update hidden input
        const hiddenInput = document.getElementById("hidden-delivery-type");
        if (hiddenInput) hiddenInput.value = type;

        // Show/hide forms
        const addressForm = document.getElementById("address-form");
        const pickupInfo  = document.getElementById("pickup-info");
        const feeRow      = document.getElementById("delivery-fee-row");

        if (type === "address") {
            addressForm?.classList.add("is-visible");
            pickupInfo?.classList.remove("is-visible");
            if (feeRow) {
                feeRow.style.display = "flex";
                this._updateTotal(true);
            }
        } else {
            addressForm?.classList.remove("is-visible");
            pickupInfo?.classList.add("is-visible");
            if (feeRow) {
                feeRow.style.display = "none";
                this._updateTotal(false);
            }
        }
    }

    _updateTotal(addDelivery) {
        const totalEl = document.getElementById("checkout-total");
        if (!totalEl) return;

        const currentText = totalEl.textContent.replace(/[₹,]/g, "");
        let currentTotal  = parseFloat(currentText) || 0;

        if (addDelivery) {
            currentTotal += this.deliveryFee;
        } else {
            currentTotal -= this.deliveryFee;
        }

        totalEl.textContent = `₹${Math.round(currentTotal).toLocaleString("en-IN")}`;
        totalEl.style.animation = "none";
        totalEl.offsetHeight; // force reflow
        totalEl.style.animation = "price-flash 0.4s ease";
    }

    // ── Form Validation ────────────────────────────────────────
    validateAndSubmit() {
        if (!this.selectedDelivery) {
            // Highlight delivery section
            const opts = document.querySelector(".omni-checkout__delivery-options");
            if (opts) {
                opts.style.outline = "2px solid #EF4444";
                opts.style.borderRadius = "12px";
                setTimeout(() => { opts.style.outline = ""; }, 2500);
            }
            this._showToast("⚠️ Please select a delivery method to continue.", "error");
            return false;
        }

        if (this.selectedDelivery === "address") {
            const requiredFields = ["addr-name", "addr-phone", "addr-street", "addr-city", "addr-zip"];
            let isValid = true;

            requiredFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field && !field.value.trim()) {
                    field.classList.add("is-error");
                    isValid = false;
                    setTimeout(() => field.classList.remove("is-error"), 3000);
                }
            });

            if (!isValid) {
                this._showToast("⚠️ Please fill in all required address fields.", "error");
                return false;
            }
        }

        // Show loading state on button
        const btn = document.getElementById("pay-btn");
        if (btn) {
            btn.innerHTML = `<span class="spinner" style="width:18px;height:18px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;display:inline-block;animation:spin 0.7s linear infinite;"></span> Processing...`;
            btn.disabled = true;
        }

        return true;
    }

    // ── Toast Notification ────────────────────────────────────
    _showToast(message, type = "info") {
        const existing = document.getElementById("omni-toast");
        if (existing) existing.remove();

        const colors = {
            error:   { bg: "rgba(239,68,68,0.9)", border: "rgba(239,68,68,0.5)" },
            success: { bg: "rgba(16,185,129,0.9)", border: "rgba(16,185,129,0.5)" },
            info:    { bg: "rgba(59,130,246,0.9)", border: "rgba(59,130,246,0.5)" },
        };
        const c = colors[type] || colors.info;

        const toast = document.createElement("div");
        toast.id = "omni-toast";
        toast.style.cssText = `
            position:fixed; bottom:32px; left:50%; transform:translateX(-50%) translateY(20px);
            background:${c.bg}; border:1px solid ${c.border};
            backdrop-filter:blur(12px); border-radius:12px;
            padding:14px 24px; color:#fff; font-size:0.9rem; font-weight:500;
            z-index:9999; opacity:0; transition:all 0.3s ease;
            max-width:420px; text-align:center; box-shadow:0 8px 32px rgba(0,0,0,0.4);
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = "1";
            toast.style.transform = "translateX(-50%) translateY(0)";
        }, 50);

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateX(-50%) translateY(20px)";
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }
}

// ── Mount ─────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    if (!document.querySelector(".omni-checkout")) return;
    window.omniCheckout = new OmniCheckout();
    window.omniCheckout.init();
});
