# -*- coding: utf-8 -*-
"""
Portal Controller — /my/rentals dashboard
"""

import logging
from odoo import http
from odoo.http import request
from odoo.addons.portal.controllers.portal import CustomerPortal, pager as portal_pager

_logger = logging.getLogger(__name__)

ITEMS_PER_PAGE = 15


class RentalPortalController(CustomerPortal):
    """Extends Odoo's CustomerPortal to add /my/rentals route."""

    def _prepare_home_portal_values(self, counters):
        values = super()._prepare_home_portal_values(counters)
        if "rental_count" in counters:
            values["rental_count"] = request.env["sale.order"].search_count([
                ("is_rental_order", "=", True),
                ("partner_id", "child_of", request.env.user.partner_id.id),
            ])
        return values

    # ── /my/rentals ──────────────────────────────────────────
    @http.route([
        "/my/rentals",
        "/my/rentals/page/<int:page>",
    ], type="http", auth="user", website=True)
    def portal_rental_dashboard(self, page=1, status=None, **kwargs):
        """Customer portal rental dashboard."""
        env     = request.env
        partner = env.user.partner_id

        # Base domain
        domain = [
            ("is_rental_order", "=", True),
            ("partner_id", "child_of", partner.id),
        ]

        # Status filter
        if status == "active":
            domain.append(("rental_status", "in", ["pickup", "return"]))
        elif status == "overdue":
            domain.append(("rental_status", "=", "return"))
            # TODO: add date filter for overdue
        elif status == "returned":
            domain.append(("rental_status", "=", "returned"))

        # Counts for stats bar
        all_orders     = env["sale.order"].search(domain)
        active_count   = len(all_orders.filtered(lambda o: o.rental_status in ("pickup", "return")))
        past_count     = len(all_orders.filtered(lambda o: o.rental_status == "returned"))
        overdue_count  = 0  # TODO: compute from return date
        deposit_held   = sum(
            o.amount_total * 0.3
            for o in all_orders
            if o.rental_status in ("pickup", "return")
        )

        # Pager
        total = env["sale.order"].search_count(domain)
        pager = portal_pager(
            url="/my/rentals",
            url_args={},
            total=total,
            page=page,
            step=ITEMS_PER_PAGE,
        )

        orders = env["sale.order"].search(
            domain,
            order="date_order desc",
            limit=ITEMS_PER_PAGE,
            offset=pager["offset"],
        )

        values = {
            "orders":        orders,
            "pager":         pager,
            "active_count":  active_count,
            "past_count":    past_count,
            "overdue_count": overdue_count,
            "deposit_held":  deposit_held,
            "page_name":     "my_rentals",
            "default_url":   "/my/rentals",
        }

        return request.render("rental_management_godtier.portal_rental_dashboard", values)

    # ── Profile Update ────────────────────────────────────────
    @http.route("/my/profile/update", type="http", auth="user", website=True, csrf=False, methods=["POST"])
    def profile_update(self, **post):
        """Update portal user profile details."""
        user    = request.env.user
        partner = user.partner_id

        try:
            partner_vals = {}
            if post.get("name"):
                partner_vals["name"] = post["name"]
            if post.get("phone"):
                partner_vals["phone"] = post["phone"]
            if post.get("email"):
                partner_vals["email"] = post["email"]
            if post.get("street"):
                partner_vals["street"] = post["street"]
            if post.get("city"):
                partner_vals["city"] = post["city"]
            if post.get("zip"):
                partner_vals["zip"] = post["zip"]

            if partner_vals:
                partner.sudo().write(partner_vals)

        except Exception as e:
            _logger.error("Profile update error: %s", e)

        return request.redirect("/my/rentals")

    # ── Avatar Upload ─────────────────────────────────────────
    @http.route("/my/avatar/upload", type="http", auth="user", website=True, csrf=False, methods=["POST"])
    def avatar_upload(self, **post):
        """Upload and save user profile avatar."""
        user = request.env.user
        try:
            avatar_data = post.get("avatar_data")
            if avatar_data and avatar_data.startswith("data:image"):
                # Strip data URL prefix
                import base64
                img_data = avatar_data.split(",")[1]
                user.sudo().write({"image_1920": img_data})
        except Exception as e:
            _logger.error("Avatar upload error: %s", e)

        return request.redirect("/my/rentals")
