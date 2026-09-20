"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, Users, TrendingUp, Clock } from "lucide-react";

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Demonstration-only values. Replace with aggregate application data in Phase 8.
const stats = [
    { label: "Total check-ins", value: "1,247", change: "+12% this week", icon: Users },
    { label: "Support matched", value: "89%", change: "match rate", icon: TrendingUp },
    { label: "Avg. response time", value: "2.4h", change: "-18min vs last week", icon: Clock },
    { label: "Active organizations", value: "14", change: "across Cyprus", icon: MapPin },
];

const categories = [
    { label: "Mental health", count: 423, pct: 34 },
    { label: "Social isolation", count: 318, pct: 25 },
    { label: "Financial stress", count: 237, pct: 19 },
    { label: "Housing & safety", count: 186, pct: 15 },
    { label: "Other", count: 83, pct: 7 },
];

// Demonstration-only contact requests. These are not real users or live provider cases.
const requests = [
    { id: "TP-1089", time: "2 min ago", category: "Mental health", status: "new", region: "Nicosia", ageGroup: "18-24" },
    { id: "TP-1088", time: "14 min ago", category: "Social isolation", status: "new", region: "Limassol", ageGroup: "25-30" },
    { id: "TP-1087", time: "31 min ago", category: "Financial stress", status: "reviewing", region: "Larnaca", ageGroup: "18-24" },
    { id: "TP-1086", time: "1h ago", category: "Mental health", status: "reviewing", region: "Nicosia", ageGroup: "25-30" },
    { id: "TP-1085", time: "2h ago", category: "Housing & safety", status: "matched", region: "Paphos", ageGroup: "18-24" },
    { id: "TP-1084", time: "3h ago", category: "Social isolation", status: "matched", region: "Limassol", ageGroup: "25-30" },
    { id: "TP-1083", time: "5h ago", category: "Mental health", status: "matched", region: "Nicosia", ageGroup: "18-24" },
];

const districts = [
    { name: "Nicosia", lat: 35.1856, lng: 33.3823, count: 487, intensity: 0.9 },
    { name: "Limassol", lat: 34.6786, lng: 33.0440, count: 356, intensity: 0.7 },
    { name: "Larnaca", lat: 34.9009, lng: 33.6249, count: 224, intensity: 0.5 },
    { name: "Paphos", lat: 34.7757, lng: 32.4241, count: 180, intensity: 0.4 },
    { name: "Famagusta", lat: 35.1264, lng: 33.9499, count: 0, intensity: 0 },
];

const weekly = [42, 58, 51, 73, 89, 95, 112];
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const maxVal = Math.max(...weekly);

const statusColor: Record<string, string> = {
    new: "bg-teal text-white",
    reviewing: "bg-clay/20 text-clay",
    matched: "bg-sage/30 text-teal",
};

const statusLabel: Record<string, string> = {
    new: "New",
    reviewing: "Reviewing",
    matched: "Matched",
};

function CyprusMap() {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<mapboxgl.Map | null>(null);

    useEffect(() => {
        if (!mapRef.current || mapInstance.current || !mapboxToken) return;

        const map = new mapboxgl.Map({
            accessToken: mapboxToken,
            container: mapRef.current,
            style: "mapbox://styles/mapbox/light-v11",
            center: [33.2, 35.0],
            zoom: 7.8,
            interactive: true,
        });

        mapInstance.current = map;

        // Demonstration points are fixed district centroids only.
        // They do not represent users, addresses, GPS positions, or real check-ins.
        const allPoints = districts
            .filter((district) => district.count >= 10)
            .map((district) => ({
                type: "Feature" as const,
                geometry: {
                    type: "Point" as const,
                    coordinates: [district.lng, district.lat],
                },
                properties: { weight: district.intensity },
            }));

        map.on("load", () => {
            map.addSource("heatmap-points", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: allPoints,
                },
            });

            map.addLayer({
                id: "heatmap-layer",
                type: "heatmap",
                source: "heatmap-points",
                paint: {
                    "heatmap-weight": ["get", "weight"],
                    "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 6, 1, 10, 3],
                    "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 6, 25, 10, 50],
                    "heatmap-opacity": 0.75,
                    "heatmap-color": [
                        "interpolate",
                        ["linear"],
                        ["heatmap-density"],
                        0, "rgba(241,232,220,0)",
                        0.2, "rgba(184,203,191,0.8)",   // low — sage green
                        0.45, "rgba(220,167,122,0.85)",  // medium — clay amber
                        0.7, "rgba(217,119,6,0.9)",     // high — orange
                        1, "rgba(185,28,28,0.95)",    // critical — red
                    ],
                },
            });

            // District labels
            districts
                .filter((d) => d.count >= 10)
                .forEach((d) => {
                    const el = document.createElement("div");
                    el.innerHTML = `
              <div style="background:white;border:1px solid #E2D8CC;border-radius:10px;padding:6px 10px;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
                <div style="font-size:11px;font-weight:700;color:#2E3330;">${d.name}</div>
                <div style="font-size:11px;color:#2F6F68;font-weight:600;">${d.count}+ check-ins</div>
              </div>
            `;
                    new mapboxgl.Marker({ element: el })
                        .setLngLat([d.lng, d.lat])
                        .addTo(map);
                });
        });

        return () => {
            map.remove();
            mapInstance.current = null;
        };
    }, []);

    if (!mapboxToken) return <p className="p-6 text-sm text-muted">Map preview unavailable. Demonstration district totals are listed below.</p>;

    return <div ref={mapRef} className="h-full w-full rounded-xl" />;
}

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<"all" | "new" | "reviewing" | "matched">("all");

    const filtered = activeTab === "all"
        ? requests
        : requests.filter((r) => r.status === activeTab);

    return (
        <div className="min-h-screen bg-warm-bg">

            {/* Top bar */}
            <header className="border-b border-border bg-surface px-6 py-4 lg:px-10">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="text-base font-semibold text-text">
                            Talk<span className="text-teal">Point</span>
                        </span>
                        <span className="text-border">|</span>
                        <span className="text-sm text-muted">Dashboard design preview</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-teal animate-pulse" />
                        <span className="text-xs text-muted">Demonstration Data</span>
                        <div className="ml-4 flex h-8 w-8 items-center justify-center rounded-full bg-warm-surface text-xs font-bold text-teal">
                            YC
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">

                {/* Page title */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-text">Overview</h1>
                    <p className="mt-1 text-sm text-muted">Fictional organisation · Synthetic 30-day period</p>
                </div>

                <p className="mb-6 text-sm text-muted">Demonstration Data only. No provider account is signed in. No real requests, partnerships or live monitoring. This screen is a design reference, not an operational workspace.</p>
                <ul className="mb-6 text-sm text-muted" aria-label="Demonstration district totals">{districts.map((d) => <li key={d.name}>{d.name}: {d.count >= 10 ? d.count : "Suppressed (below demo threshold)"}</li>)}</ul>

                {/* Stats */}
                <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {stats.map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <div key={i} className="rounded-2xl border border-border bg-surface p-5">
                                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-warm-surface">
                                    <Icon size={16} className="text-teal" />
                                </div>
                                <p className="mb-1 text-xs text-muted">{s.label}</p>
                                <p className="text-2xl font-bold text-text">{s.value}</p>
                                <p className="mt-1 text-xs font-medium text-teal">{s.change}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Map + Categories */}
                <div className="mb-6 grid gap-6 lg:grid-cols-3">

                    {/* Map */}
                    <div className="lg:col-span-2 rounded-2xl border border-border bg-surface overflow-hidden">
                        <div className="border-b border-border px-5 py-4">
                            <p className="text-sm font-semibold text-text">Geographic distribution</p>
                            <p className="text-xs text-muted mt-0.5">
                                Illustrative district-level data · not real population data
                            </p>
                        </div>
                        <div className="h-72">
                            <CyprusMap />
                        </div>
                        <div className="flex items-center gap-6 border-t border-border px-5 py-3">
                            <span className="text-xs text-muted font-medium">Demo volume:</span>
                            {[
                                { label: "Low", color: "#B8CBBF" },
                                { label: "Medium", color: "#DCA77A" },
                                { label: "High", color: "#D97706" },
                                { label: "Very high", color: "#B91C1C" },
                            ].map((s) => (
                                <div key={s.label} className="flex items-center gap-1.5">
                                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                                    <span className="text-xs text-muted">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="rounded-2xl border border-border bg-surface p-6">
                        <p className="mb-1 text-sm font-semibold text-text">Support needs</p>
                        <p className="mb-5 text-xs text-muted">By category · last 30 days</p>
                        <div className="flex flex-col gap-4">
                            {categories.map((c, i) => (
                                <div key={i}>
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <span className="text-xs text-text">{c.label}</span>
                                        <span className="text-xs font-semibold text-muted">{c.count}</span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-warm-surface">
                                        <div
                                            className="h-1.5 rounded-full bg-teal"
                                            style={{ width: `${c.pct}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Weekly chart */}
                <div className="mb-6 rounded-2xl border border-border bg-surface p-6">
                    <p className="mb-1 text-sm font-semibold text-text">Check-ins this week</p>
                    <p className="mb-6 text-xs text-muted">Daily volume across all categories</p>
                    <div className="flex items-end gap-3 h-32">
                        {weekly.map((val, i) => (
                            <div key={i} className="flex flex-1 flex-col items-center gap-2">
                                <span className="text-xs font-medium text-muted">{val}</span>
                                <div
                                    className="w-full rounded-lg bg-teal transition-all"
                                    style={{
                                        height: `${(val / maxVal) * 100}%`,
                                        minHeight: "4px",
                                        opacity: 0.4 + (i / weekly.length) * 0.6,
                                    }}
                                />
                                <span className="text-[10px] text-muted">{weekDays[i]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Requests table */}
                <div className="rounded-2xl border border-border bg-surface">
                    <div className="flex items-center justify-between border-b border-border px-6 py-4">
                        <div>
                            <p className="text-sm font-semibold text-text">Incoming requests</p>
                            <p className="text-xs text-muted">Demonstration requests · not real users</p>
                        </div>
                        <span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold text-teal">
                            {requests.filter(r => r.status === "new").length} new
                        </span>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-border px-6">
                        {(["all", "new", "reviewing", "matched"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`mr-6 py-3 text-xs font-semibold capitalize transition border-b-2 ${activeTab === tab
                                    ? "border-teal text-teal"
                                    : "border-transparent text-muted hover:text-text"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="divide-y divide-border">
                        {filtered.map((r) => (
                            <div key={r.id} className="flex items-center gap-4 px-6 py-4 hover:bg-warm-bg transition-colors">
                                <div className="hidden sm:block w-20 text-xs font-mono text-muted">{r.id}</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-text">{r.category}</p>
                                    <p className="text-xs text-muted">{r.region} · Age {r.ageGroup} · {r.time}</p>
                                </div>
                                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusColor[r.status]}`}>
                                    {statusLabel[r.status]}
                                </span>

                            </div>
                        ))}
                    </div>

                    <div className="border-t border-border px-6 py-3">
                        <p className="text-xs text-muted">
                            Showing {filtered.length} of {requests.length} requests · All rows on this screen are demonstration data
                        </p>
                    </div>
                </div>

            </main>
        </div>
    );
}