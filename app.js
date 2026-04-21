(function () {
    "use strict";

    /* ---------- DATA ---------- */
    const EXPERTISE = [
        {
            idx: "SYS.01", icon: "target", title: "Social Ad Strategy",
            desc: "Full-funnel paid media across Meta, Google, YouTube & TikTok engineered around CAC & LTV — not reach.",
            stat: "3.8x avg ROAS",
        },
        {
            idx: "SYS.02", icon: "search", title: "Lead Gen Audits",
            desc: "Forensic breakdown of your acquisition stack. We find the leaks in your funnel and patch them with data.",
            stat: "48h diagnostic",
        },
        {
            idx: "SYS.03", icon: "database", title: "CRM Integration",
            desc: "Plug leads into HubSpot, GoHighLevel, Salesforce — synced, scored, and routed in real time.",
            stat: "0ms lag",
        },
        {
            idx: "SYS.04", icon: "camera", title: "UGC Production",
            desc: "Creator-led, performance-tested video creative shot, edited and iterated weekly for your winning angles.",
            stat: "20+ creators",
        },
    ];

    const METRICS = [
        { k: "CTR", v: "4.82%", d: "+1.2" },
        { k: "CPA", v: "₹612", d: "-34%" },
        { k: "ROAS", v: "4.1x", d: "+0.8" },
        { k: "Leads", v: "1,284", d: "today" },
        { k: "Spend", v: "₹3.2L", d: "24h" },
        { k: "Health", v: "OPTIMAL", d: "ok" },
    ];

    const BARS = [30, 42, 38, 55, 48, 62, 70, 58, 78, 85, 72, 95, 88, 100, 92];

    const PLANS = [
        {
            name: "Lead Kickstart", price: "₹65,000", cadence: "/month",
            tagline: "For brands proving the channel.", featured: false,
            tier: "Tier 01", cta: "Start Kickstart",
            features: [
                "2 ad platforms managed",
                "Weekly creative iteration",
                "Landing page optimisation",
                "CRM integration (1 tool)",
                "Bi-weekly strategy call",
            ],
        },
        {
            name: "Growth Partner", price: "₹1,80,000", cadence: "/month",
            tagline: "For brands scaling past ₹1Cr/mo revenue.", featured: true,
            tier: "Tier 02", cta: "Deploy Growth Engine",
            features: [
                "All paid channels managed",
                "Dedicated UGC pod (4+ creators)",
                "Custom data pipeline & dashboard",
                "LTV / cohort modelling",
                "Weekly war-room access",
                "SLA-backed response times",
            ],
        },
    ];

    const CASES = [
        {
            client: "D2C · Skincare",
            headline: "From ₹4L to ₹42L / mo in 90 days",
            img: "assests/images/growth_revinue.png",
            metrics: [{ k: "ROAS", v: "4.8x" }, { k: "CAC", v: "-61%" }, { k: "Revenue", v: "10.5x" }],
        },
        {
            client: "Ed-Tech · SaaS",
            headline: "15,400 qualified leads in Q2",
            img: "assests/images/sitting.png",
            metrics: [{ k: "Leads", v: "15.4K" }, { k: "CPL", v: "₹132" }, { k: "Close rate", v: "+38%" }],
        },
        {
            client: "Fintech · App",
            headline: "2M installs at ₹31 blended CPI",
            img: "assests/images/fintech_app.png",
            metrics: [{ k: "Installs", v: "2.01M" }, { k: "CPI", v: "₹31" }, { k: "D7 retention", v: "44%" }],
        },
    ];

    const LOGOS = ["Meta Ads", "Google Ads", "TikTok", "YouTube", "HubSpot", "Shopify", "GA4", "GoHighLevel"];

    /* ---------- HELPERS ---------- */
    const $ = (id) => document.getElementById(id);
    const el = (html) => {
        const d = document.createElement("div");
        d.innerHTML = html.trim();
        return d.firstElementChild;
    };

    /* ---------- RENDER EXPERTISE ---------- */
    const expertiseGrid = $("expertise-grid");
    EXPERTISE.forEach((it) => {
        expertiseGrid.appendChild(el(`
            <div class="bento-card">
                <div class="card-top">
                    <span class="mono">${it.idx}</span>
                    <i class="arrow" data-lucide="arrow-up-right"></i>
                </div>
                <div class="icon-box"><i data-lucide="${it.icon}"></i></div>
                <h3>${it.title}</h3>
                <p>${it.desc}</p>
                <div class="card-foot">// ${it.stat}</div>
            </div>
        `));
    });

    /* ---------- RENDER METRICS + BAR CHART ---------- */
    const metricsGrid = $("metrics-grid");
    METRICS.forEach((m) => {
        metricsGrid.appendChild(el(`
            <div class="metric">
                <div class="k">${m.k}</div>
                <div class="v">${m.v}</div>
                <div class="d">${m.d}</div>
            </div>
        `));
    });
    const chartBars = $("chart-bars");
    BARS.forEach((h, i) => {
        const bar = document.createElement("div");
        bar.className = "bar" + (i === 13 ? " active" : "");
        bar.style.height = h + "%";
        chartBars.appendChild(bar);
    });

    /* ---------- RENDER PRICING ---------- */
    const pricingGrid = $("pricing-grid");
    PLANS.forEach((p) => {
        const badge = p.featured
            ? `<div class="badge"><i data-lucide="zap"></i> Most Scaled</div>` : "";
        const items = p.features.map((f) =>
            `<li><i data-lucide="check"></i>${f}</li>`).join("");
        pricingGrid.appendChild(el(`
            <div class="plan ${p.featured ? "featured" : ""}">
                ${badge}
                <div class="tier-label">${p.tier}</div>
                <h3>${p.name}</h3>
                <p class="tagline">${p.tagline}</p>
                <div class="price">
                    <span class="amount">${p.price}</span>
                    <span class="cadence">${p.cadence}</span>
                </div>
                <ul class="list">${items}</ul>
                <a href="#contact" class="plan-cta">${p.cta}</a>
            </div>
        `));
    });

    /* ---------- RENDER CASE STUDIES ---------- */
    const casesList = $("cases-list");
    CASES.forEach((c, i) => {
        const metricsHtml = c.metrics.map((m) => `
            <div class="case-metric">
                <div class="v">${m.v}</div>
                <div class="k">${m.k}</div>
            </div>
        `).join("");
        casesList.appendChild(el(`
            <div class="case">
                <div class="case-num">CS.${String(i + 1).padStart(2, "0")}</div>
                <div class="case-img"><img src="${c.img}" alt="${c.client}" /></div>
                <div class="case-body">
                    <div>
                        <div class="client">${c.client}</div>
                        <h3 class="headline">${c.headline}</h3>
                    </div>
                    <a href="#contact" class="teardown">Read full teardown <i data-lucide="arrow-up-right"></i></a>
                </div>
                <div class="case-metrics">${metricsHtml}</div>
            </div>
        `));
    });

    /* ---------- RENDER MARQUEE ---------- */
    const track = $("marquee-track");
    const items = [...LOGOS, ...LOGOS];
    items.forEach((l) => {
        track.appendChild(el(`<div class="marquee-item"><span class="bullet"></span>${l}</div>`));
    });

    /* ---------- HEADER SCROLL STATE ---------- */
    const header = $("site-header");
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    onScroll();

    /* ---------- MOBILE MENU ---------- */
    const toggle = $("menu-toggle");
    const mobile = $("mobile-menu");
    toggle.addEventListener("click", () => mobile.classList.toggle("open"));
    mobile.querySelectorAll("a").forEach((a) =>
        a.addEventListener("click", () => mobile.classList.remove("open")));

    /* ---------- CONTACT FORM + TOASTS ---------- */
    const toastRoot = $("toast-root");
    function toast(kind, msg) {
        const iconName = kind === "success" ? "check-circle-2" : "alert-circle";
        const node = el(`<div class="toast ${kind}"><i data-lucide="${iconName}"></i><span>${msg}</span></div>`);
        toastRoot.appendChild(node);
        lucide.createIcons();
        setTimeout(() => {
            node.style.transition = "opacity .3s, transform .3s";
            node.style.opacity = "0";
            node.style.transform = "translateY(-10px)";
            setTimeout(() => node.remove(), 300);
        }, 2800);
    }

    const form = $("contact-form");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        if (!data.name.trim() || !data.email.trim() || !data.message.trim()) {
            toast("error", "Please fill name, email and message.");
            return;
        }
        if (!/^S+@S+.S+$/.test(data.email)) {
            toast("error", "Please enter a valid email.");
            return;
        }
        const btn = form.querySelector("button");
        const original = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = "Deploying...";
        setTimeout(() => {
            toast("success", "Signal received. We'll deploy a response within 24h.");
            form.reset();
            btn.disabled = false;
            btn.innerHTML = original;
            lucide.createIcons();
        }, 800);
    });

    /* ---------- YEAR ---------- */
    $("year").textContent = new Date().getFullYear();

    /* ---------- LUCIDE ICONS ---------- */
    if (window.lucide) lucide.createIcons();
})();
