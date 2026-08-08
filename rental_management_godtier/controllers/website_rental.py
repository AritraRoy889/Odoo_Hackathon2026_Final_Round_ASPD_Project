# -*- coding: utf-8 -*-
"""
Website Rental Controllers
Handles all frontend-facing routes for the OmniRent Pro rental experience.
"""

import json
import logging
from datetime import datetime, timedelta

from odoo import http
from odoo.http import request

_logger = logging.getLogger(__name__)


class WebsiteRentalController(http.Controller):

    # ── Splash / Landing ──────────────────────────────────────
    @http.route(["/rental", "/rental/home"], type="http", auth="public", website=True)
    def rental_home(self, **kwargs):
        """Product browse / landing page."""
        Product = request.env["product.template"].sudo()

        # Search for rental products
        domain = [
            ("can_be_rented", "=", True),
            ("website_published", "=", True),
        ]
        products = Product.search(domain, order="website_sequence asc, id asc", limit=24)

        pager = request.website.pager(
            url="/rental",
            total=Product.search_count(domain),
            page=int(kwargs.get("page", 1)),
            step=24,
        )

        return request.render(
            "rental_management_godtier.omni_product_browse",
            {
                "products": products,
                "pager":    pager,
            },
        )

    # ── Product Detail ────────────────────────────────────────
    @http.route("/rental/product/<int:product_id>", type="http", auth="public", website=True)
    def rental_product_detail(self, product_id, **kwargs):
        """Individual product detail page."""
        product = request.env["product.template"].sudo().browse(product_id)
        if not product.exists() or not product.can_be_rented:
            return request.not_found()

        return request.render(
            "website_sale_renting.product",   # Inherit standard Odoo product page
            {"product": product},
        )

    # ── Register ──────────────────────────────────────────────
    @http.route("/rental/register", type="http", auth="public", website=True, csrf=False)
    def rental_register(self, **post):
        """Registration page and POST handler."""
        if request.httprequest.method == "GET":
            return request.render("rental_management_godtier.omni_register", {
                "error": None,
            })

        # POST: create new user
        name     = post.get("name", "").strip()
        email    = post.get("login", "").strip()
        password = post.get("password", "")
        confirm  = post.get("confirm_password", "")

        if not name or not email or not password:
            return request.render("rental_management_godtier.omni_register", {
                "error": "All fields are required.",
            })

        if password != confirm:
            return request.render("rental_management_godtier.omni_register", {
                "error": "Passwords do not match.",
            })

        if len(password) < 8:
            return request.render("rental_management_godtier.omni_register", {
                "error": "Password must be at least 8 characters.",
            })

        try:
            # Check if email already exists
            existing = request.env["res.users"].sudo().search([("login", "=", email)], limit=1)
            if existing:
                return request.render("rental_management_godtier.omni_register", {
                    "error": "An account with this email already exists.",
                })

            # Create portal user
            user_values = {
                "name":   name,
                "login":  email,
                "email":  email,
                "phone":  post.get("phone", ""),
                "groups_id": [(6, 0, [request.env.ref("base.group_portal").id])],
            }
            new_user = request.env["res.users"].sudo().create(user_values)
            new_user.sudo()._set_password(password)

            # Authenticate and redirect to profile setup
            request.session.authenticate(request.env.cr.dbname, email, password)
            return request.redirect("/rental/profile/setup")

        except Exception as e:
            _logger.error("Registration error: %s", e)
            return request.render("rental_management_godtier.omni_register", {
                "error": "Registration failed. Please try again.",
            })

    # ── Profile Setup ─────────────────────────────────────────
    @http.route("/rental/profile/setup", type="http", auth="user", website=True)
    def profile_setup(self, **kwargs):
        """Profile completion page (step 2 after registration)."""
        return request.render("rental_management_godtier.omni_profile_setup", {
            "user": request.env.user,
        })

    @http.route("/rental/profile/save", type="http", auth="user", website=True, csrf=False, methods=["POST"])
    def profile_save(self, **post):
        """Save profile details."""
        user = request.env.user
        try:
            vals = {}
            if post.get("display_name"):
                vals["name"] = post["display_name"]
            if post.get("company_name"):
                vals.setdefault("partner_id", {})
                user.partner_id.sudo().write({"company_name": post["company_name"]})

            if vals:
                user.sudo().write(vals)

        except Exception as e:
            _logger.error("Profile save error: %s", e)

        return request.redirect("/my/rentals")

    # ── Availability Check (JSON RPC) ─────────────────────────
    @http.route("/rental/check_availability", type="json", auth="public", website=True)
    def check_availability(self, product_id, start_date, end_date, qty=1, **kwargs):
        """
        Real-time availability check.
        Returns: { available: bool, qty_available: int, nearest_slots: [...] }
        """
        try:
            product = request.env["product.product"].sudo().browse(int(product_id))
            if not product.exists():
                return {"available": False, "error": "Product not found"}

            start = datetime.strptime(start_date, "%Y-%m-%d")
            end   = datetime.strptime(end_date, "%Y-%m-%d")

            if end <= start:
                return {"available": False, "error": "End date must be after start date"}

            # Use Odoo's rental availability method if available
            if hasattr(product, "_get_availabilities"):
                availabilities = product._get_availabilities(start, end, False)
                qty_available  = availabilities.get("quantity_available", 0)
                available      = qty_available >= qty
            else:
                # Fallback: check active rental orders for overlap
                overlapping = request.env["sale.order.line"].sudo().search_count([
                    ("product_id", "=", product.id),
                    ("rental_start_date", "<", end),
                    ("rental_return_date", ">", start),
                    ("order_id.state", "in", ["sale", "done"]),
                ])
                qty_available = max(0, (product.product_tmpl_id.rental_qty or 1) - overlapping)
                available     = qty_available >= qty

            return {
                "available":      available,
                "qty_available":  qty_available,
                "message":        "Available!" if available else f"Only {qty_available} unit(s) available for these dates.",
            }

        except Exception as e:
            _logger.error("Availability check error: %s", e)
            return {"available": True, "error": str(e)}

    # ── Checkout ──────────────────────────────────────────────
    @http.route("/rental/checkout", type="http", auth="user", website=True)
    def rental_checkout(self, **kwargs):
        """Checkout page with order summary."""
        order = request.website.sale_get_order()
        if not order or not order.order_line:
            return request.redirect("/rental")

        return request.render("rental_management_godtier.omni_checkout", {
            "order":   order,
            "partner": request.env.user.partner_id,
        })

    @http.route("/rental/checkout/confirm", type="http", auth="user", website=True, csrf=False, methods=["POST"])
    def checkout_confirm(self, **post):
        """Process checkout form submission."""
        order = request.website.sale_get_order()
        if not order:
            return request.redirect("/rental")

        delivery_type = post.get("delivery_type", "pickup")
        notes         = post.get("notes", "")

        try:
            vals = {"note": notes}
            if delivery_type == "address":
                # Update delivery address
                partner_vals = {
                    "name":    post.get("addr_name"),
                    "phone":   post.get("addr_phone"),
                    "street":  post.get("addr_street"),
                    "city":    post.get("addr_city"),
                    "zip":     post.get("addr_zip"),
                }
                order.sudo().write(vals)

            elif delivery_type == "pickup":
                order.sudo().write({
                    **vals,
                    "carrier_id": False,  # No delivery carrier for pickup
                })

            # Confirm the order
            order.sudo().action_confirm()

            return request.redirect(f"/rental/payment/success?order_id={order.id}")

        except Exception as e:
            _logger.error("Checkout confirm error: %s", e)
            return request.redirect("/rental/checkout?error=1")

    # ── Payment Success ───────────────────────────────────────
    @http.route("/rental/payment/success", type="http", auth="user", website=True)
    def payment_success(self, order_id=None, **kwargs):
        """Post-payment success page with invoice download."""
        if order_id:
            order = request.env["sale.order"].sudo().browse(int(order_id))
        else:
            order = request.website.sale_get_order()

        if not order or not order.exists():
            return request.redirect("/my/rentals")

        return request.render("rental_management_godtier.omni_payment_success", {
            "order": order,
        })

    # ── Terms & Privacy (stubs) ───────────────────────────────
    @http.route("/rental/terms", type="http", auth="public", website=True)
    def rental_terms(self, **kwargs):
        return request.render("website.homepage")   # Replace with actual terms template

    @http.route("/rental/privacy", type="http", auth="public", website=True)
    def rental_privacy(self, **kwargs):
        return request.render("website.homepage")   # Replace with actual privacy template
