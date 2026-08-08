# -*- coding: utf-8 -*-
{
    'name': 'OmniRent Pro — God-Tier Rental Management',
    'version': '17.0.1.0.0',
    'category': 'Rental',
    'summary': 'Enterprise-grade tech & hardware rental platform with portal, e-commerce, and live admin dashboard.',
    'description': """
        OmniRent Pro — rental_management_godtier
        =========================================
        A full-featured Odoo rental module targeting high-performance
        tech hardware (AI rigs, cinema cameras, VR headsets, drones).

        Features:
        - Animated splash screen & SSO authentication
        - Product browsing with real-time pricing
        - Smart checkout with delivery / store-pickup selection
        - Mandatory security deposit calculation
        - Post-payment invoice download
        - Customer portal at /my/rentals
        - OWL 2.0 real-time admin dashboard with Chart.js KPIs
        - Automated overdue reminders & return processing
    """,
    'author': 'ASPD Team — Odoo Hackathon 2026',
    'website': 'https://github.com/AritraRoy889/Odoo_Hackathon2026_Final_Round_ASPD_Project',
    'license': 'LGPL-3',

    'depends': [
        'base',
        'web',
        'website',
        'portal',
        'sale_management',
        'sale_renting',
        'account',
        'stock',
        'mail',
    ],

    'data': [
        # Security
        # 'security/ir.model.access.csv',

        # Website QWeb Templates
        'views/website/splash_template.xml',
        'views/website/auth_templates.xml',
        'views/website/product_browse_template.xml',
        'views/website/checkout_template.xml',
        'views/website/payment_success_template.xml',

        # Portal Dashboard
        'views/portal/portal_dashboard_template.xml',

        # Backend OWL Action
        'views/backend/rental_dashboard_view.xml',
    ],

    'assets': {
        # ── Website / Portal assets ──────────────────────────────────────────
        'web.assets_frontend': [
            # Google Fonts
            'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap',

            # SCSS (compiled by Odoo's asset pipeline)
            'rental_management_godtier/static/src/scss/_variables.scss',
            'rental_management_godtier/static/src/scss/_splash.scss',
            'rental_management_godtier/static/src/scss/_auth.scss',
            'rental_management_godtier/static/src/scss/_product_browse.scss',
            'rental_management_godtier/static/src/scss/_checkout.scss',
            'rental_management_godtier/static/src/scss/_portal_dashboard.scss',

            # Website JS
            'rental_management_godtier/static/src/js/website/splash.js',
            'rental_management_godtier/static/src/js/website/product_browse.js',
            'rental_management_godtier/static/src/js/website/checkout.js',
        ],

        # ── Backend / Admin assets ───────────────────────────────────────────
        'web.assets_backend': [
            # Chart.js CDN loaded via template; SCSS for admin
            'rental_management_godtier/static/src/scss/_admin_dashboard.scss',

            # OWL Components
            'rental_management_godtier/static/src/js/owl/rental_dashboard/rental_dashboard_service.js',
            'rental_management_godtier/static/src/js/owl/rental_dashboard/kpi_card.js',
            'rental_management_godtier/static/src/js/owl/rental_dashboard/rental_chart.js',
            'rental_management_godtier/static/src/js/owl/rental_dashboard/action_buttons.js',
            'rental_management_godtier/static/src/js/owl/rental_dashboard/rental_dashboard.js',

            # OWL Templates
            'rental_management_godtier/static/src/js/owl/rental_dashboard/rental_dashboard.xml',
        ],
    },

    'installable': True,
    'application': True,
    'auto_install': False,
}
