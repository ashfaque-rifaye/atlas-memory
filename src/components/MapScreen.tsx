import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, JournalEntry } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

interface MapScreenProps {
  currentUser: UserProfile;
  entries: JournalEntry[];
}

interface PlaceNode {
  id: string;
  label: string;
  lat: number;
  lng: number;
  x: string;
  y: string;
  entries: number;
  mood: string;
  tint: string;
  size: string;
  stats: { k: string; v: string; tint?: string }[];
  insight: string;
  quote: string;
  quoteDate: string;
  quoteMood: string;
  address: string;
}

const PLACES: PlaceNode[] = [
  {
    id: 'blr',
    label: 'Bangalore',
    lat: 12.9716,
    lng: 77.5946,
    x: '50%',
    y: '22%',
    entries: 12,
    mood: 'Excitement',
    tint: 'var(--accent)',
    size: '26px',
    stats: [
      { k: 'journal entries', v: '12' },
      { k: 'positive', v: '8', tint: 'var(--accent)' },
      { k: 'neutral', v: '3' },
      { k: 'negative', v: '1', tint: 'var(--clay)' },
    ],
    insight: 'Your first month here was predominantly optimistic.',
    quote: '“First day at the new workspace.”',
    quoteDate: 'September 4',
    quoteMood: 'Mood · Excited',
    address: 'Bengaluru, Karnataka, India (12.9716° N, 77.5946° E)',
  },
  {
    id: 'che',
    label: 'Chennai',
    lat: 13.0827,
    lng: 80.2707,
    x: '48%',
    y: '76%',
    entries: 7,
    mood: 'Stress',
    tint: 'var(--clay)',
    size: '20px',
    stats: [
      { k: 'journal entries', v: '7' },
      { k: 'positive', v: '1', tint: 'var(--accent)' },
      { k: 'neutral', v: '2' },
      { k: 'negative', v: '4', tint: 'var(--clay)' },
    ],
    insight: 'Almost every Chennai entry mentions travel and a deadline in the same breath.',
    quote: '“Two flights in a week is not a schedule.”',
    quoteDate: 'August 22',
    quoteMood: 'Mood · Depleted',
    address: 'Chennai, Tamil Nadu, India (13.0827° N, 80.2707° E)',
  },
  {
    id: 'off',
    label: 'Office',
    lat: 12.9352,
    lng: 77.6946,
    x: '76%',
    y: '48%',
    entries: 3,
    mood: 'Mixed',
    tint: 'var(--text2)',
    size: '15px',
    stats: [
      { k: 'journal entries', v: '3' },
      { k: 'positive', v: '1', tint: 'var(--accent)' },
      { k: 'neutral', v: '1' },
      { k: 'negative', v: '1', tint: 'var(--clay)' },
    ],
    insight: 'Short entries, all written between meetings.',
    quote: '“I had a horrible meeting today.”',
    quoteDate: 'September 6',
    quoteMood: 'Mood · Frustrated',
    address: 'Outer Ring Road, Bellandur, Bengaluru',
  },
  {
    id: 'hom',
    label: 'Home',
    lat: 12.9784,
    lng: 77.6408,
    x: '22%',
    y: '52%',
    entries: 1,
    mood: 'Calm',
    tint: 'var(--text2)',
    size: '12px',
    stats: [
      { k: 'journal entries', v: '1' },
      { k: 'positive', v: '1', tint: 'var(--accent)' },
      { k: 'neutral', v: '0' },
      { k: 'negative', v: '0' },
    ],
    insight: 'One entry, written on a Sunday.',
    quote: '“Nothing happened today and it was fine.”',
    quoteDate: 'August 30',
    quoteMood: 'Mood · Calm',
    address: 'Indiranagar, Bengaluru',
  },
];

export function MapScreen({ currentUser, entries }: MapScreenProps) {
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('blr');
  const [mapMode, setMapMode] = useState<'abstract' | 'geographic'>('abstract');
  const [mapType, setMapType] = useState<'dark' | 'satellite'>('dark');
  const [geoZoom, setGeoZoom] = useState<number>(7);
  const [centerOffset, setCenterOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const selectedPlace = PLACES.find((p) => p.id === selectedPlaceId) || PLACES[0];

  // Recenter geographic map when a place is clicked
  useEffect(() => {
    if (selectedPlace) {
      // Offset relative to South India view
      const baseLat = 13.0;
      const baseLng = 78.9;
      const dLat = (selectedPlace.lat - baseLat) * 35;
      const dLng = (selectedPlace.lng - baseLng) * 35;
      setCenterOffset({ x: dLng, y: -dLat });
    }
  }, [selectedPlaceId]);

  return (
    <div data-screen-label="Memory map">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end gap-4 mb-6.5">
        <div>
          <div
            className="font-mono uppercase"
            style={{
              fontSize: '11px',
              letterSpacing: '.14em',
              color: 'var(--text3)',
            }}
          >
            Memory map · Google Maps Platform
          </div>
          <h1
            className="font-medium mt-2 m-0"
            style={{
              fontSize: 'clamp(26px, 3vw, 34px)',
              letterSpacing: '-0.03em',
            }}
          >
            Where things happened to you.
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <div
            className="flex p-0.5"
            style={{
              border: '1px solid var(--line)',
              borderRadius: '2px',
              background: 'var(--panel)',
            }}
          >
            <button
              onClick={() => setMapMode('abstract')}
              className="cursor-pointer px-3 py-1 font-mono text-[11px] transition-colors"
              style={{
                borderRadius: '2px',
                border: 'none',
                background: mapMode === 'abstract' ? 'var(--accent-dim)' : 'transparent',
                color: mapMode === 'abstract' ? 'var(--text)' : 'var(--text3)',
              }}
            >
              Abstract
            </button>
            <button
              onClick={() => setMapMode('geographic')}
              className="cursor-pointer px-3 py-1 font-mono text-[11px] transition-colors"
              style={{
                borderRadius: '2px',
                border: 'none',
                background: mapMode === 'geographic' ? 'var(--accent-dim)' : 'transparent',
                color: mapMode === 'geographic' ? 'var(--text)' : 'var(--text3)',
              }}
            >
              Geographic (Google Maps)
            </button>
          </div>

          <div className="font-mono hidden sm:block" style={{ fontSize: '11px', color: 'var(--text3)' }}>
            location capture · on · 23 of 61 entries
          </div>
        </div>
      </div>

      {/* Two Panes */}
      <div className="flex flex-wrap gap-5 items-stretch">
        {/* Left Pane: Map Viewport */}
        <div
          className="relative flex items-center justify-center overflow-hidden"
          style={{
            flex: '1 1 420px',
            minWidth: '300px',
            border: '1px solid var(--line)',
            borderRadius: '3px',
            background: 'var(--panel)',
            padding: mapMode === 'abstract' ? 'clamp(20px, 3vw, 30px)' : '0',
            minHeight: '440px',
          }}
        >
          {mapMode === 'abstract' ? (
            /* Abstract Coordinate Map */
            <div className="relative w-full max-w-[460px] aspect-square">
              {/* Crosshairs */}
              <div
                className="absolute left-0 right-0 top-1/2"
                style={{ height: '1px', background: 'var(--hair)' }}
              />
              <div
                className="absolute top-0 bottom-0 left-1/2"
                style={{ width: '1px', background: 'var(--hair)' }}
              />

              {/* Abstract Nodes */}
              {PLACES.map((p) => {
                const isSelected = selectedPlaceId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlaceId(p.id)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 border-none bg-transparent cursor-pointer p-1.5 transition-opacity hover:opacity-80"
                    style={{
                      left: p.x,
                      top: p.y,
                    }}
                  >
                    <div
                      style={{
                        borderRadius: '50%',
                        background: p.tint,
                        width: p.size,
                        height: p.size,
                        boxShadow: isSelected ? '0 0 0 6px var(--accent-dim)' : 'none',
                      }}
                    />
                    <div
                      className="whitespace-nowrap"
                      style={{
                        fontSize: '12.5px',
                        color: isSelected ? 'var(--text)' : 'var(--text2)',
                      }}
                    >
                      {p.label}
                    </div>
                    <div
                      className="font-mono whitespace-nowrap"
                      style={{ fontSize: '10px', color: 'var(--text3)' }}
                    >
                      {p.mood}
                    </div>
                  </button>
                );
              })}

              {/* Legend */}
              <div
                className="absolute font-mono"
                style={{
                  left: '0',
                  bottom: '0',
                  fontSize: '10px',
                  lineHeight: 1.8,
                  color: 'var(--text3)',
                }}
              >
                <div>dot size · entries</div>
                <div>vertical · mood</div>
              </div>
            </div>
          ) : (
            /* Geographic Google Maps Viewport */
            <div className="relative w-full h-full min-h-[440px] flex flex-col bg-[#11100D]">
              {/* Map Canvas Background / Vector Rendering */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  background:
                    mapType === 'satellite'
                      ? 'radial-gradient(ellipse at 40% 50%, #1c2720 0%, #0d1410 70%, #070a08 100%)'
                      : 'radial-gradient(circle at center, #191612 0%, #110f0c 100%)',
                }}
              >
                {/* SVG Geographic Grids & Coastlines for South India */}
                <svg
                  className="w-full h-full opacity-40"
                  viewBox="0 0 500 500"
                  style={{ transform: `scale(${geoZoom / 6}) translate(${centerOffset.x}px, ${centerOffset.y}px)`, transition: 'transform 0.4s ease' }}
                >
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--line)" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="500" height="500" fill="url(#grid)" />

                  {/* Peninsular India coastlines silhouette */}
                  <path
                    d="M 120,40 Q 180,180 200,280 L 260,420 Q 320,380 380,260 Q 420,160 460,80"
                    fill="none"
                    stroke="var(--line)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />

                  {/* Bangalore to Chennai connection corridor */}
                  <line
                    x1="220"
                    y1="250"
                    x2="350"
                    y2="230"
                    stroke="var(--hair)"
                    strokeWidth="1"
                    strokeDasharray="2 3"
                  />
                </svg>

                {/* Interactive Geographic Location Pins */}
                {PLACES.map((p) => {
                  const isSelected = selectedPlaceId === p.id;
                  // Projected coordinates for South India viewport
                  const px = p.id === 'che' ? 70 : p.id === 'blr' ? 44 : p.id === 'off' ? 48 : 41;
                  const py = p.id === 'che' ? 46 : p.id === 'blr' ? 50 : p.id === 'off' ? 53 : 48;

                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPlaceId(p.id)}
                      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 border-none bg-transparent cursor-pointer transition-transform hover:scale-110"
                      style={{
                        left: `${px}%`,
                        top: `${py}%`,
                        zIndex: isSelected ? 20 : 10,
                      }}
                    >
                      <div
                        className="flex items-center justify-center transition-all"
                        style={{
                          width: isSelected ? '28px' : '20px',
                          height: isSelected ? '28px' : '20px',
                          borderRadius: '50%',
                          background: p.tint,
                          boxShadow: isSelected
                            ? '0 0 0 6px var(--accent-dim), 0 0 16px rgba(147,188,161,0.5)'
                            : '0 0 0 3px rgba(0,0,0,0.6)',
                        }}
                      >
                        <div
                          style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: '#000',
                          }}
                        />
                      </div>
                      <div
                        className="px-1.5 py-0.5 rounded-[2px] font-mono whitespace-nowrap"
                        style={{
                          fontSize: '11px',
                          background: isSelected ? 'var(--panel)' : 'rgba(10,10,10,0.75)',
                          color: isSelected ? 'var(--text)' : 'var(--text2)',
                          border: `1px solid ${isSelected ? 'var(--accent-line)' : 'var(--line)'}`,
                        }}
                      >
                        {p.label} · {p.entries}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Geographic Controls Overlay */}
              <div className="absolute top-4 left-4 z-20 flex gap-2">
                <button
                  onClick={() => setMapType('dark')}
                  className="px-2.5 py-1 text-[10px] font-mono cursor-pointer rounded-[2px]"
                  style={{
                    border: '1px solid var(--line)',
                    background: mapType === 'dark' ? 'var(--accent-dim)' : 'rgba(20,20,20,0.85)',
                    color: mapType === 'dark' ? 'var(--text)' : 'var(--text3)',
                  }}
                >
                  Vector Dark
                </button>
                <button
                  onClick={() => setMapType('satellite')}
                  className="px-2.5 py-1 text-[10px] font-mono cursor-pointer rounded-[2px]"
                  style={{
                    border: '1px solid var(--line)',
                    background: mapType === 'satellite' ? 'var(--accent-dim)' : 'rgba(20,20,20,0.85)',
                    color: mapType === 'satellite' ? 'var(--text)' : 'var(--text3)',
                  }}
                >
                  Satellite
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5">
                <button
                  onClick={() => setGeoZoom((z) => Math.min(12, z + 1))}
                  className="w-7 h-7 flex items-center justify-center font-mono text-sm cursor-pointer rounded-[2px]"
                  style={{
                    border: '1px solid var(--line)',
                    background: 'var(--panel)',
                    color: 'var(--text)',
                  }}
                >
                  +
                </button>
                <button
                  onClick={() => setGeoZoom((z) => Math.max(4, z - 1))}
                  className="w-7 h-7 flex items-center justify-center font-mono text-sm cursor-pointer rounded-[2px]"
                  style={{
                    border: '1px solid var(--line)',
                    background: 'var(--panel)',
                    color: 'var(--text)',
                  }}
                >
                  −
                </button>
              </div>

              {/* Geocoding telemetry */}
              <div
                className="absolute bottom-4 left-4 z-20 font-mono text-[10px]"
                style={{ color: 'var(--text3)' }}
              >
                Project: {firebaseConfig.projectId} · Maps API Ready
              </div>
            </div>
          )}
        </div>

        {/* Right Pane: Place Details */}
        <div
          className="flex flex-col"
          style={{
            flex: '0 1 340px',
            minWidth: '280px',
            border: '1px solid var(--line)',
            borderRadius: '3px',
            padding: 'clamp(20px, 3vw, 26px)',
          }}
        >
          <div
            className="font-mono uppercase"
            style={{
              fontSize: '10.5px',
              letterSpacing: '.12em',
              color: 'var(--text3)',
            }}
          >
            Your {selectedPlace.label} memories
          </div>

          <div
            className="font-medium"
            style={{
              fontSize: 'clamp(24px, 2.6vw, 30px)',
              letterSpacing: '-0.03em',
              margin: '14px 0 6px',
            }}
          >
            {selectedPlace.entries} journal entries
          </div>

          <div
            className="font-mono text-[11px] mb-5 text-pretty"
            style={{ color: 'var(--text3)' }}
          >
            {selectedPlace.address}
          </div>

          <div className="font-mono grid gap-2.5" style={{ fontSize: '12.5px' }}>
            {selectedPlace.stats.map((s, idx) => (
              <div key={idx} className="flex justify-between gap-3.5">
                <span style={{ color: 'var(--text3)' }}>{s.k}</span>
                <span style={{ color: s.tint || 'var(--text)' }}>{s.v}</span>
              </div>
            ))}
          </div>

          <div style={{ margin: '24px 0', height: '1px', background: 'var(--hair)' }} />

          <div style={{ fontSize: '16px', lineHeight: 1.6, textWrap: 'pretty' }}>
            {selectedPlace.insight}
          </div>

          <div
            className="mt-6"
            style={{
              borderLeft: '1.5px solid var(--accent)',
              paddingLeft: '14px',
            }}
          >
            <div
              className="font-mono mb-1.5"
              style={{ fontSize: '10.5px', color: 'var(--text3)' }}
            >
              {selectedPlace.quoteDate}
            </div>
            <div
              className="italic"
              style={{
                fontSize: '15.5px',
                lineHeight: 1.55,
                textWrap: 'pretty',
              }}
            >
              {selectedPlace.quote}
            </div>
            <div
              className="font-mono mt-2"
              style={{ fontSize: '11px', color: 'var(--clay)' }}
            >
              {selectedPlace.quoteMood}
            </div>
          </div>

          <div
            className="mt-auto pt-6"
            style={{
              fontSize: '12.5px',
              lineHeight: 1.6,
              color: 'var(--text3)',
              textWrap: 'pretty',
            }}
          >
            Location is never captured silently. Each entry asks once, and you can strip coordinates from history in Settings.
          </div>
        </div>
      </div>
    </div>
  );
}
