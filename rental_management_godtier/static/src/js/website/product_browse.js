/** @odoo-module **/
// ============================================================
// Product Browse — Real-time pricing & cart management
// ============================================================

import { jsonrpc } from "@web/core/network/rpc_service";

class OmniProductBrowse {
    constructor() {
        this.cart       = JSON.parse(localStorage.getItem("omni_cart") || "[]");
        this.wishlist   = new Set(JSON.parse(localStorage.getItem("omni_wishlist") || "[]"));
        this.activeCategory  = "all";
        this.activeDuration  = "day";
        this.currentSort     = "popular";
        this.searchQuery     = "";
        this.onlyAvailable   = false;

        // Base deposit per product (loaded from DOM data attrs)
        this.depositMap = {};
        // Price per unit per product
        this.priceMap   = {};

        // Rental pricing multipliers
        this.unitMultiplier = {
            hour:  1,
            day:   8,
            week:  40,
            month: 160,
        };
    }

    init() {
        this._loadProductData();
        this._updateCartBadge();
        this._restoreWishlists();
        this._setMinDates();
    }

    // ── Data Loaders ───────────────────────────────────────────
    _loadProductData() {
        document.querySelectorAll(".product-card").forEach(card => {
            const id    = card.dataset.productId;
            const price = parseFloat(card.dataset.price) || 0;
            this.priceMap[id] = price;
        });
    }

    _setMinDates() {
        const today = new Date().toISOString().split("T")[0];
        document.querySelectorAll(".omni-date-start").forEach(el => {
            el.min = today;
        });
    }

    // ── Category Filter ────────────────────────────────────────
    setCategory(chip, category) {
        this.activeCategory = category;
        document.querySelectorAll("#category-chips .chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        this._applyFilters();
    }

    setDuration(unit) {
        this.activeDuration = unit;
    }

    toggleAvailable(checked) {
        this.onlyAvailable = checked;
        this._applyFilters();
    }

    filterProducts(query) {
        this.searchQuery = query.toLowerCase();
        this._applyFilters();
    }

    sortProducts(value) {
        this.currentSort = value;
        this._applyFilters();
    }

    _applyFilters() {
        const grid  = document.getElementById("product-grid");
        const cards = Array.from(grid.querySelectorAll(".product-card"));
        let visible = 0;

        cards.forEach(card => {
            const cat      = (card.dataset.category || "").toLowerCase();
            const name     = card.querySelector(".product-card__name")?.textContent.toLowerCase() || "";
            const badge    = card.querySelector(".product-card__badge");
            const unavail  = badge && badge.classList.contains("product-card__badge--unavailable");

            const catMatch  = this.activeCategory === "all" || cat.includes(this.activeCategory);
            const srchMatch = !this.searchQuery || name.includes(this.searchQuery);
            const availMatch = !this.onlyAvailable || !unavail;

            const show = catMatch && srchMatch && availMatch;
            card.style.display = show ? "" : "none";
            if (show) visible++;
        });

        const countEl = document.getElementById("product-count");
        if (countEl) countEl.textContent = visible;
    }

    // ── Period Selector ────────────────────────────────────────
    selectPeriod(pill) {
        const productId = pill.dataset.productId;
        const unit      = pill.dataset.unit;

        // Update pill UI
        const card = pill.closest(".product-card");
        card.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");

        this._recalcPrice(productId, unit);
    }

    // ── Date Change ────────────────────────────────────────────
    onDateChange(input) {
        const productId = input.dataset.productId;
        const card      = input.closest(".product-card");
        const startEl   = card.querySelector(".omni-date-start");
        const endEl     = card.querySelector(".omni-date-end");
        const activePill= card.querySelector(".pill.active");
        const unit      = activePill ? activePill.dataset.unit : "day";

        // Enforce end >= start
        if (startEl.value && endEl.value && endEl.value < startEl.value) {
            endEl.value = startEl.value;
        }

        if (startEl.value && endEl.value) {
            const start    = new Date(startEl.value);
            const end      = new Date(endEl.value);
            const diffMs   = end - start;
            const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

            this._recalcPriceForDays(productId, unit, diffDays);
        }
    }

    _recalcPrice(productId, unit) {
        const basePrice = this.priceMap[productId] || 0;
        const mult      = this.unitMultiplier[unit] || 1;
        const unitPrice = basePrice * (unit === "hour" ? 0.125 : unit === "week" ? 5 : unit === "month" ? 18 : 1);

        const priceEl = document.getElementById(`price-display-${productId}`);
        if (priceEl) {
            priceEl.textContent = `₹${Math.round(unitPrice).toLocaleString("en-IN")}`;
            priceEl.classList.add("updating");
            setTimeout(() => priceEl.classList.remove("updating"), 400);
        }

        // Reset total
        const totalEl = document.getElementById(`total-display-${productId}`);
        if (totalEl) totalEl.textContent = "—";
    }

    _recalcPriceForDays(productId, unit, days) {
        const basePrice  = this.priceMap[productId] || 0;
        let unitRate;

        switch (unit) {
            case "hour":  unitRate = basePrice * 0.125; break;
            case "day":   unitRate = basePrice; break;
            case "week":  unitRate = basePrice * 5;  break;
            case "month": unitRate = basePrice * 18; break;
            default:      unitRate = basePrice;
        }

        const total      = unitRate * days;
        const depositEl  = document.getElementById(`deposit-display-${productId}`);
        const deposit    = depositEl ? parseFloat(depositEl.textContent.replace(/,/g, "")) : 5000;
        const grandTotal = total + deposit;

        const totalEl = document.getElementById(`total-display-${productId}`);
        if (totalEl) {
            totalEl.textContent = `₹${Math.round(grandTotal).toLocaleString("en-IN")}`;
            totalEl.classList.add("updating");
            setTimeout(() => totalEl.classList.remove("updating"), 400);
        }
    }

    // ── Check Availability via RPC ─────────────────────────────
    async checkAvailability(productId, startDate, endDate, qty = 1) {
        try {
            const result = await jsonrpc("/rental/check_availability", {
                product_id: productId,
                start_date: startDate,
                end_date:   endDate,
                qty:        qty,
            });
            return result;
        } catch (e) {
            console.error("Availability check failed:", e);
            return { available: true };
        }
    }

    // ── Cart ───────────────────────────────────────────────────
    async addToCart(btn) {
        const productId = btn.dataset.productId;
        const card      = btn.closest(".product-card");
        const startEl   = card.querySelector(".omni-date-start");
        const endEl     = card.querySelector(".omni-date-end");
        const pill      = card.querySelector(".pill.active");
        const unit      = pill ? pill.dataset.unit : "day";
        const name      = card.querySelector(".product-card__name")?.textContent || "Product";
        const img       = card.querySelector(".product-card__image-wrap img")?.src || "";

        // Validate dates
        if (!startEl.value || !endEl.value) {
            startEl.classList.toggle("is-error", !startEl.value);
            endEl.classList.toggle("is-error", !endEl.value);
            setTimeout(() => {
                startEl.classList.remove("is-error");
                endEl.classList.remove("is-error");
            }, 2000);
            return;
        }

        // Button loading state
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="spinner"></span> Adding...';
        btn.disabled = true;

        try {
            // Check availability
            const avail = await this.checkAvailability(productId, startEl.value, endEl.value);

            if (!avail.available) {
                btn.innerHTML = "❌ Not Available";
                setTimeout(() => { btn.innerHTML = originalText; btn.disabled = false; }, 2000);
                return;
            }

            const diff  = Math.max(1, Math.ceil((new Date(endEl.value) - new Date(startEl.value)) / 86400000));
            const price = this.priceMap[productId] || 0;
            const total = price * diff;

            const item = {
                productId,
                name,
                img,
                startDate: startEl.value,
                endDate:   endEl.value,
                unit,
                days:      diff,
                price,
                total,
            };

            // Check if already in cart
            const existIdx = this.cart.findIndex(c => c.productId === productId);
            if (existIdx >= 0) {
                this.cart[existIdx] = item;
            } else {
                this.cart.push(item);
            }

            localStorage.setItem("omni_cart", JSON.stringify(this.cart));

            btn.innerHTML = "✓ Added!";
            btn.classList.add("added");
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.remove("added");
                btn.disabled = false;
            }, 1800);

            this._updateCartBadge();
            this._renderCartDrawer();
            this.openCart();

        } catch (e) {
            btn.innerHTML = originalText;
            btn.disabled  = false;
        }
    }

    _renderCartDrawer() {
        const container = document.getElementById("cart-items-container");
        const subtotalEl = document.getElementById("cart-subtotal");
        if (!container) return;

        if (this.cart.length === 0) {
            container.innerHTML = `<p style="color:#94A3B8; text-align:center; padding:40px 0;">Your cart is empty</p>`;
            if (subtotalEl) subtotalEl.textContent = "₹0";
            return;
        }

        let subtotal = 0;
        container.innerHTML = this.cart.map(item => {
            subtotal += item.total;
            return `
              <div class="cart-item" style="display:flex;gap:12px;padding:12px;background:rgba(30,41,59,0.4);border-radius:12px;border:1px solid rgba(148,163,184,0.08);">
                <img src="${item.img}" alt="${item.name}" style="width:56px;height:56px;border-radius:8px;object-fit:cover;background:#1E293B;flex-shrink:0;" onerror="this.style.display='none'"/>
                <div style="flex:1;">
                  <div style="font-size:0.875rem;font-weight:500;color:#F1F5F9;">${item.name}</div>
                  <div style="font-size:0.75rem;color:#94A3B8;margin-top:4px;">
                    📅 ${item.startDate} → ${item.endDate}
                  </div>
                  <div style="font-size:0.875rem;font-weight:600;color:#A78BFA;margin-top:6px;">
                    ₹${Math.round(item.total).toLocaleString("en-IN")}
                  </div>
                </div>
                <button onclick="omniProductBrowse.removeFromCart('${item.productId}')" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:6px;color:#FCA5A5;cursor:pointer;padding:4px 8px;font-size:0.75rem;">✕</button>
              </div>
            `;
        }).join("");

        if (subtotalEl) subtotalEl.textContent = `₹${Math.round(subtotal).toLocaleString("en-IN")}`;
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(c => c.productId !== productId);
        localStorage.setItem("omni_cart", JSON.stringify(this.cart));
        this._updateCartBadge();
        this._renderCartDrawer();
    }

    _updateCartBadge() {
        const badge = document.getElementById("omni-cart-badge");
        if (badge) {
            badge.textContent = this.cart.length;
            badge.style.display = this.cart.length > 0 ? "flex" : "none";
        }
    }

    openCart() {
        document.getElementById("cart-drawer")?.classList.add("is-open");
        document.getElementById("cart-overlay")?.classList.add("is-open");
        this._renderCartDrawer();
    }

    closeCart() {
        document.getElementById("cart-drawer")?.classList.remove("is-open");
        document.getElementById("cart-overlay")?.classList.remove("is-open");
    }

    // ── Wishlist ───────────────────────────────────────────────
    toggleWishlist(el) {
        const id = el.dataset.productId;
        if (this.wishlist.has(id)) {
            this.wishlist.delete(id);
            el.innerHTML = "♡";
            el.classList.remove("active");
        } else {
            this.wishlist.add(id);
            el.innerHTML = "♥";
            el.classList.add("active");
        }
        localStorage.setItem("omni_wishlist", JSON.stringify([...this.wishlist]));
    }

    _restoreWishlists() {
        this.wishlist.forEach(id => {
            const el = document.querySelector(`.product-card__wishlist[data-product-id="${id}"]`);
            if (el) {
                el.innerHTML = "♥";
                el.classList.add("active");
            }
        });
    }
}

// ── Mount on DOMContentLoaded ─────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    if (!document.querySelector(".omni-browse")) return;
    window.omniProductBrowse = new OmniProductBrowse();
    window.omniProductBrowse.init();
});
