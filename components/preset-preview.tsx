'use client';
import { useEffect, useState, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

export const renderedCameraIds = new Set(
  Array.from(
    { length: 20 },
    (_, i) => 'camera-' + String(i + 1).padStart(2, '0'),
  ).filter((id) => !['camera-04', 'camera-18'].includes(id)),
);
type Item = {
  id: string;
  title: string;
  thumbnailTheme: string;
  summary: string;
  prompt: string;
};
const signatures: Record<string, string[]> = {
  blocking: [
    'A → B',
    'A ↔ B ↔ C',
    'HIDE → REVEAL',
    'A → ← B',
    'FLOW / HERO',
    'ROOM 1 → 2 → 3',
    'EXIT A / EXIT B',
    'FAR → NEAR',
    'LOW ↔ HIGH',
    'A / B / C',
    'FRONT + BACK',
    'FLOW → GAP',
    'A + B →',
    'A → B → C → D',
    'LOW POV',
    'IN | OUT',
    'DOOR 1 → 2 → 3',
    'A → PROP ← B',
    'HIDDEN / VISIBLE',
    'B → EXIT',
  ],
  action: [
    'CHASE → EXIT',
    'READY / DODGE / REACT',
    'DOWN / UP / LAND',
    'EVENT → REACTION',
    'LEFT / RIGHT / OVER',
    'HERO / THREAT / GOAL',
    'ENTRY → REORIENT',
    'FLOOR 1 → 2',
    'NOTICE → DODGE',
    'RUN / STOP / PICK',
    'A ↘ ↙ B',
    'HEIGHT → FALL',
    'COVER → COVER',
    'CONTACT → RECOVER',
    'A ↗ ↙ B',
    'EVENT → A → B → C',
    'DISTANCE ↓ / TIME ↓',
    'PHASE / CLEARANCE',
    'TILT ↔ BALANCE',
    'ACTION → HOLD',
  ],
  dialogue: [
    'WIDE / A / B / WIDE',
    'A → B / HOLD',
    'WALK → STOP',
    'OTS → SINGLE',
    'AXIS / CROSS',
    'DRIVER / PASSENGER',
    'A / INTERRUPT / B',
    'LEFT ↔ RIGHT',
    'HAND → RESPONSE',
    'A ↔ B / C',
    'DIRECT / REFLECTION',
    'EYES → BODY',
    'PROP / MATCH',
    'SHORT / LONG',
    'FAR → CLOSE',
    'SIT / STAND',
    'VOICE → DOOR',
    'TWO → ONE',
    'MOVE → HOLD',
    'SCREEN / EYELINE',
  ],
  vehicle: [
    'TRACK / 12m/s',
    'BRAKE / APEX / EXIT',
    '2m → 20m',
    'GATE 1 / 2 / 3',
    'LEAD → PASS',
    'ROUTE A + B',
    'STOP → GO',
    'GO → STOP',
    'HIDE → REVEAL',
    'OUTSIDE → TUNNEL',
    'A > B',
    'REVERSE → PARK',
    'TURN / RADIUS',
    'WINDOW / PARALLAX',
    'HIGH → LOW',
    'RIDGE → REVEAL',
    'WALK / FOLLOW',
    'BODY + REFLECTION',
    'TURN / HOLD',
    'TRACK → AERIAL',
  ],
  product: [
    'EDGE → LABEL',
    'EDGE / MODULE / BODY',
    'CAN / DROPLETS',
    'SOLE / MID / UPPER',
    'METAL / GEM',
    '6s / 30s',
    'GLASS / DIAL / HAND',
    'SHOULDER → LABEL',
    'BODY / CUP / PAD',
    'HINGE / INTERIOR',
    'CAP ↑ ↓',
    'BOX / TRAY / PRODUCT',
    'LAYER ↑ ↓',
    'STEAM / HANDLE',
    'SOUND / FORM',
    'MATERIAL / INTERIOR',
    'LENS / FRAME',
    'COLOR A / B',
    'SET / SCALE',
    'PRODUCT / COPY',
  ],
  lighting: [
    'WINDOW / FILL',
    'NEON / SEPARATION',
    'HARD / SHADOW',
    'HIGH KEY / BEAUTY',
    'BACKLIGHT / DEPTH',
    'BEAM / VOLUME',
    'CANDLE / FACE',
    'DOOR / SPILL',
    'BLUE HOUR / INTERIOR',
    'BACKLIGHT / DUST',
    'GLASS / DARK EDGE',
    'METAL / CARD',
    'SILHOUETTE → FACE',
    'SCREEN / FACE',
    'LEAVES / SHADOW',
    'FRONT / MID / BACK',
    'CEILING / FILL',
    'RAIN / REFLECTION',
    'ONE LIGHT / TWO',
    'DAY / NIGHT',
  ],
  render: [
    '960 × 540',
    '0.1 / 0.03 / 0.01',
    'EEVEE / CYCLES',
    'RAW / DENOISE',
    'DENSITY / COST',
    'GLASS / NOISE',
    'LOW / MID / HIGH',
    'SHUTTER / TRAIL',
    'RGB / ALPHA',
    'HAIR / HIGHLIGHT',
    'METAL / ROUGH / GLASS',
    'VOLUME / TIME',
    'NEAR / MID / FAR',
    'BG / HERO / FX',
    'START / EVENT / END',
    'CPU / GPU',
    'VISIBLE / REFLECTED',
    'SUBDIV / DISTANCE',
    'PREVIEW / FINAL',
    'DONE / MISSING',
  ],
  animation: [
    'POSE 1 / 2 / 3',
    'CONTACT / SLIDE',
    'TABLE → HAND',
    'BREATH / GAZE',
    'LINEAR / EASE',
    'NORMAL / SLOW',
    'LEAN → STAND',
    'GRIP → LIFT',
    'LIGHT / HEAVY',
    'CONTACT → ROTATE',
    'EYE → HEAD → BODY',
    'A → A+B → B',
    'FOOT / STEP',
    'YES / MAYBE / NO',
    'WALL → STEP',
    'PLACE → SETTLE',
    'RUN → WALK',
    'SEARCH → FIND',
    'LEVER / LID / TRAY',
    'END = START',
  ],
  editing: [
    '5 BEATS / 10 SHOTS',
    'ACTION / MATCH',
    'A / B / A / B',
    'AUDIO / J / L',
    '30s → 15s',
    'SHOT / FRAME / LENS',
    'WIDE / MID / CLOSE',
    'OBJECT / REACTION',
    'LOOK / POV / REACT',
    'EARLY / MID / LATE',
    'A + B / SYNC',
    'PREP / MAKE / CHECK',
    'LONG → SHORT',
    'EVENT / PAUSE / REACT',
    'OCCLUDE / CUT',
    'CIRCLE → CIRCLE',
    'BEAT / CUT',
    'BEFORE / AFTER',
    'SHORT / MID / LONG',
    'HANDLE / IN / OUT',
  ],
  color: [
    'EXPOSURE / AgX',
    'SCENE LINEAR / EXR',
    'ID / MASK',
    'DEPTH / FOG',
    'PLATE / CG',
    'OCIO / ACES',
    'GRAY / WHITE',
    'COLOR / DATA',
    'EXPOSURE / HIGHLIGHT',
    'SKIN / BACKGROUND',
    'STRAIGHT / PREMULT',
    'CONTACT / SHADOW',
    'NEAR / FAR',
    'VECTOR / MOTION',
    'LABEL / MASK',
    'UNDISTORT / REDISTORT',
    'GRAIN / PIXELS',
    'INPUT → VIEW → OUTPUT',
    'BLACK / MATCH',
    'SOURCE / DECODED',
  ],
  delivery: [
    'CAM / FPS / PATH',
    'EXPECTED / FOUND',
    'DISTANCE / CLIP',
    '16:9 / 9:16 / 1:1',
    'BLEND / ASSETS / SCRIPT',
    'SHOT / FRAME / NOTE',
    'RELATIVE / RESOLVE',
    'FOUND / MISSING',
    'IN / OUT / HANDLE',
    'SHOT / VERSION / FRAME',
    'AUDIO / LENGTH',
    'FACE / HAND / PRODUCT',
    'EXISTS → NEW VERSION',
    'BLENDER / ADDONS',
    'FRAMES / FPS / SYNC',
    'WIDTH / HEIGHT / PAR',
    'START / MID / END',
    'ASSET → SHOTS',
    'SAVE / REOPEN / CHECK',
    'PATH / SIZE / HASH',
  ],
};
const colors: Record<string, string> = {
  camera: '#d8eb96',
  blocking: '#a5d0db',
  action: '#f0a58a',
  dialogue: '#c5b8e7',
  vehicle: '#8dcac7',
  product: '#e7c891',
  lighting: '#efbb7c',
  render: '#b1c7e5',
  animation: '#9ed8bd',
  editing: '#b4b9f0',
  color: '#eda9c1',
  delivery: '#abd7c5',
};
export function previewInfo(item: Item) {
  const n = Number(item.id.split('-').at(-1)) - 1;
  const brief =
    item.prompt.split('연출 및 제작 지시\n')[1]?.split('\n\n')[0] ??
    item.summary;
  const sentences = brief.split(/(?<=[.!?])\s+/).filter(Boolean);
  return {
    n,
    theme: item.thumbnailTheme,
    accent: colors[item.thumbnailTheme] ?? '#d8eb96',
    steps: [
      sentences[0] ?? item.summary,
      sentences[1] ?? '장면의 핵심 변화를 확인합니다.',
      sentences[2] ?? '완성 구도와 연결 상태를 확인합니다.',
    ],
  };
}
function Person({
  x,
  y = 220,
  color = '#d8eb96',
  scale = 1,
  lean = 0,
}: {
  x: number;
  y?: number;
  color?: string;
  scale?: number;
  lean?: number;
}) {
  return (
    <g
      transform={
        'translate(' +
        x +
        ' ' +
        y +
        ') scale(' +
        scale +
        ') rotate(' +
        lean +
        ')'
      }
    >
      <ellipse cy="5" rx="23" ry="6" fill="#000" opacity=".35" />
      <circle cy="-66" r="11" fill={color} />
      <path d="M-13-49 Q0-56 13-49 L19-14 H-19Z" fill={color} />
      <path
        d="M-10-18 L-13 0 M10-18 L13 0 M-12-42 L-27-25 M12-42 L27-25"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
      />
    </g>
  );
}
function Product({
  name,
  t = 0,
  color = '#e7c891',
}: {
  name: string;
  t?: number;
  color?: string;
}) {
  const shared = {
    fill: color,
    stroke: '#fff',
    strokeOpacity: 0.3,
    strokeWidth: 1.5,
  };
  return (
    <g
      transform={'translate(320 165) rotate(' + Math.sin(t * Math.PI) * 5 + ')'}
    >
      <ellipse cy="69" rx="79" ry="13" fill="#000" opacity=".4" />
      {/반지|주얼리|시계|손목/.test(name) ? (
        <>
          <circle r="55" fill="none" stroke={color} strokeWidth="14" />
          {/시계|손목/.test(name) ? (
            <>
              <circle r="43" fill="#1b2830" />
              <path d="M0-32V0L24 10" stroke={color} strokeWidth="4" />
              {Array.from({ length: 12 }, (_, i) => (
                <path
                  key={i}
                  d="M0-38V-32"
                  transform={'rotate(' + i * 30 + ')'}
                  stroke={color}
                />
              ))}
            </>
          ) : (
            <path d="M-18-53L0-79 20-53 0-32Z" {...shared} />
          )}
        </>
      ) : /폰|가전|스피커|패키지|상자/.test(name) ? (
        <>
          <rect x="-44" y="-66" width="88" height="125" rx="12" {...shared} />
          <rect x="-35" y="-54" width="70" height="93" rx="5" fill="#17272e" />
          <circle cy="49" r="4" fill="#17272e" />
          <path d="M-25-20L22-44V16L-25 38Z" fill={color} opacity=".3" />
        </>
      ) : /운동화|신발/.test(name) ? (
        <>
          <path d="M-85 26L-54-36-20-31 8 0 65 15 85 40H-85Z" {...shared} />
          <path
            d="M-85 40H85M-40-16L-3-8M-45-5L8 3"
            stroke="#18222b"
            strokeWidth="6"
          />
        </>
      ) : /헤드폰|안경/.test(name) ? (
        <>
          <path
            d="M-54 15V-20A54 54 0 01108 0V15"
            fill="none"
            stroke={color}
            strokeWidth="12"
          />
          <rect x="-63" y="-5" width="25" height="55" rx="10" {...shared} />
          <rect x="38" y="-5" width="25" height="55" rx="10" {...shared} />
        </>
      ) : /가구|의자/.test(name) ? (
        <>
          <rect x="-60" y="-45" width="120" height="70" rx="10" {...shared} />
          <path d="M-55 25V68M55 25V68" stroke={color} strokeWidth="10" />
        </>
      ) : (
        <>
          <rect
            x="-42"
            y="-45"
            width="84"
            height="105"
            rx={/캔|커피/.test(name) ? 20 : 9}
            {...shared}
          />
          <rect
            x="-24"
            y={-72 - t * 16}
            width="48"
            height="27"
            rx="4"
            fill="#a7b8bd"
          />
          <rect x="-31" y="-7" width="62" height="39" rx="2" fill="#162b32" />
          <path d="M-20 6H20M-14 16H14" stroke={color} strokeWidth="3" />
        </>
      )}
    </g>
  );
}
export function PreviewScene({
  item,
  time = 0.35,
}: {
  item: Item;
  time?: number;
}) {
  const { n, theme, accent } = previewInfo(item);
  const t = Math.max(0, Math.min(1, time));
  const e = t * t * (3 - 2 * t);
  const stage = Math.min(2, Math.floor(t * 3));
  const camera = ['camera', 'vehicle'].includes(theme),
    cast = ['blocking', 'action', 'dialogue', 'animation'].includes(theme),
    compare = ['lighting', 'render', 'color'].includes(theme);
  let zoom = 1,
    dx = 0,
    dy = 0,
    roll = 0;
  if (theme === 'camera') {
    if ([0, 7, 16].includes(n)) zoom = 1 + e * 0.6;
    if ([1, 15, 19].includes(n)) dx = 70 * (0.5 - e);
    if ([6, 10, 11].includes(n)) dy = 70 * (e - 0.5);
    if ([4, 9, 12, 13, 18].includes(n)) dx = 100 * Math.sin(e * Math.PI - 1.5);
    if (n === 14) roll = e * 15;
    if (n === 5) zoom = 1 + stage * 0.2;
  }
  return (
    <svg
      viewBox="0 0 640 320"
      role="img"
      aria-label={item.title + ' 원리 도식'}
      className="preview-scene"
    >
      <rect width="640" height="320" fill="#111c25" />
      <path d="M0 235L320 110 640 235V320H0Z" fill="#1c2b33" />
      {Array.from({ length: 9 }, (_, i) => (
        <path
          key={i}
          d={'M320 110L' + (i * 100 - 80) + ' 320M0 ' + (240 + i * 12) + 'H640'}
          stroke="#6b8b98"
          strokeOpacity=".13"
        />
      ))}
      <g
        transform={
          'translate(' +
          (320 + dx) +
          ' ' +
          (160 + dy) +
          ') scale(' +
          zoom +
          ') rotate(' +
          roll +
          ') translate(-320 -160)'
        }
      >
        {camera ? (
          <>
            {[0, 1, 2].map((v) => (
              <g
                key={v}
                transform={
                  'translate(' +
                  (theme === 'camera' && [2, 8].includes(n)
                    ? (e - 0.5) * (v + 1) * 18
                    : 0) +
                  ' 0)'
                }
              >
                <path
                  d={
                    'M' +
                    (80 + v * 65) +
                    ' 250V' +
                    (55 + v * 25) +
                    'H' +
                    (560 - v * 65) +
                    'V250'
                  }
                  fill="none"
                  stroke={accent}
                  strokeOpacity={0.18 + v * 0.08}
                  strokeWidth={14 - v * 3}
                />
              </g>
            ))}
            {theme === 'vehicle' ? (
              <g
                transform={
                  'translate(' +
                  (140 + e * 290) +
                  ' 198) rotate(' +
                  (n === 1 || n === 12 ? Math.sin(e * Math.PI) * -12 : 0) +
                  ')'
                }
              >
                <path d="M-80 0L-55-33H20L53-10 80-3V25H-80Z" fill={accent} />
                <path d="M-44-27H14L38-8H-55Z" fill="#17262c" />
                <circle
                  cx="-48"
                  cy="25"
                  r="16"
                  fill="#0b1016"
                  stroke={accent}
                />
                <circle cx="47" cy="25" r="16" fill="#0b1016" stroke={accent} />
              </g>
            ) : (
              <>
                <Person x={320} color={accent} />
                <Person
                  x={430 + (n === 15 ? e * 70 : 0)}
                  y={210}
                  color="#557787"
                  scale={0.7}
                />
                {n === 3 && (
                  <rect
                    x={t < 0.5 ? 284 : 407}
                    y={t < 0.5 ? 119 : 148}
                    width={t < 0.5 ? 72 : 49}
                    height={t < 0.5 ? 92 : 67}
                    fill="none"
                    stroke={accent}
                    strokeDasharray="5 4"
                  />
                )}
                {n === 17 && (
                  <path d="M460 80H570V252H460Z" fill="#9cb3bf" opacity=".3" />
                )}
              </>
            )}
            <path
              d={'M85 284 Q320 ' + (n === 19 ? 200 : 284) + ' 555 284'}
              stroke={accent}
              strokeWidth="2"
              strokeDasharray="5 5"
              fill="none"
            />
            <circle
              cx={85 + 470 * e}
              cy={284 - (n === 19 ? Math.sin(e * Math.PI) * 42 : 0)}
              r="5"
              fill={accent}
            />
          </>
        ) : cast ? (
          <>
            {/문|출구|입장|퇴장/.test(item.title) && (
              <path
                d="M465 230V75H565V230M490 90V230"
                stroke={accent}
                strokeWidth="8"
                fill="none"
                opacity=".5"
              />
            )}
            {/계단|높이/.test(item.title) && (
              <path
                d="M290 240H350V215H405V190H460V165H515V140H570"
                fill="none"
                stroke={accent}
                strokeWidth="13"
                opacity=".45"
              />
            )}
            {/테이블|식탁|소품|상자|서류|컵|가방/.test(item.title) && (
              <g>
                <path
                  d="M205 191H430M225 191V242M407 191V242"
                  stroke="#698690"
                  strokeWidth="12"
                />
                <rect
                  x={270 + e * 60}
                  y="165"
                  width="33"
                  height="22"
                  rx="3"
                  fill={accent}
                />
              </g>
            )}
            {/기둥|차폐|엄폐|장애|통로/.test(item.title) && (
              <>
                <rect x="265" y="100" width="44" height="151" fill="#3a535f" />
                <rect x="460" y="100" width="44" height="151" fill="#3a535f" />
              </>
            )}
            {theme === 'dialogue' ? (
              <>
                <Person
                  x={stage === 0 ? 240 : stage === 1 ? 280 : 370}
                  scale={stage === 0 ? 1 : 1.22}
                  color={accent}
                />
                <Person
                  x={stage === 0 ? 400 : stage === 1 ? 490 : 150}
                  scale={stage === 0 ? 1 : 1.1}
                  color="#7195a5"
                />
                <path
                  d="M278 120H359M351 112L359 120 351 128"
                  stroke={accent}
                  fill="none"
                  strokeDasharray="4 4"
                />
              </>
            ) : (
              <>
                <Person
                  x={160 + e * (theme === 'animation' ? 60 : 230)}
                  y={
                    /도약|낙하/.test(item.title)
                      ? 220 - Math.sin(e * Math.PI) * 85
                      : /계단/.test(item.title)
                        ? 230 - e * 70
                        : 225
                  }
                  color={accent}
                  lean={
                    theme === 'animation'
                      ? Math.sin(e * Math.PI * 2) * (n === 3 ? 3 : 12)
                      : Math.sin(e * Math.PI) * 8
                  }
                />
                <Person
                  x={480 - e * (n % 3 === 0 ? 200 : 65)}
                  y={230}
                  color="#668594"
                  scale={0.9}
                />
                {/군중|전투|세 |셋|네 |삼각/.test(item.title) &&
                  [0, 1, 2, 3].map((i) => (
                    <Person
                      key={i}
                      x={90 + i * 145}
                      y={180}
                      scale={0.5}
                      color="#5b7b88"
                    />
                  ))}
                <path
                  d={
                    'M125 270Q' +
                    (300 + n * 3) +
                    ' ' +
                    (n % 2 ? 220 : 300) +
                    ' 500 270'
                  }
                  stroke={accent}
                  fill="none"
                  strokeDasharray="5 6"
                />
                <circle cx={125 + 375 * e} cy="270" r="5" fill={accent} />
              </>
            )}
          </>
        ) : theme === 'color' ? (
          <>
            <rect
              x="46"
              y="68"
              width="250"
              height="176"
              rx="5"
              fill="#20313b"
              stroke="#4b6673"
            />
            <rect
              x="344"
              y="68"
              width="250"
              height="176"
              rx="5"
              fill="#253746"
              stroke={accent}
            />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <g key={i}>
                <rect
                  x={59 + i * 37}
                  y="86"
                  width="32"
                  height="53"
                  fill={
                    'hsl(' + (i * 48 + n * 11) + ' 35% ' + (25 + i * 7) + '%)'
                  }
                />
                <rect
                  x={357 + i * 37}
                  y="86"
                  width="32"
                  height="53"
                  fill={
                    'hsl(' +
                    (i * 48 + n * 11 + e * (n === 0 ? 0 : 18)) +
                    ' ' +
                    (35 + e * 15) +
                    '% ' +
                    (25 + i * 7 + e * 8) +
                    '%)'
                  }
                />
              </g>
            ))}
            {[0, 1, 2].map((i) => (
              <g key={i}>
                <path
                  d={
                    'M60 ' +
                    (224 - i * 9) +
                    'Q' +
                    (145 + n * 3) +
                    ' ' +
                    (170 - i * 18) +
                    ' 280 ' +
                    (159 + i * 12)
                  }
                  fill="none"
                  stroke={['#e2a2a8', '#a8dbaf', '#9dbfe9'][i]}
                  strokeWidth="2"
                />
                <path
                  d={
                    'M358 ' +
                    (224 - i * 9) +
                    'Q' +
                    (443 + n * 3) +
                    ' ' +
                    (170 - i * 18 - e * 30) +
                    ' 578 ' +
                    (159 + i * 12 - e * 12)
                  }
                  fill="none"
                  stroke={['#e2a2a8', '#a8dbaf', '#9dbfe9'][i]}
                  strokeWidth="2"
                />
              </g>
            ))}
            <text x="48" y="266" fill="#a9bcc7" fontSize="13">
              입력 / 기준
            </text>
            <text x="345" y="266" fill={accent} fontSize="13">
              변환 원리 / 비교
            </text>
          </>
        ) : theme === 'render' ? (
          <>
            {[0, 1, 2].map((i) => (
              <g key={i} transform={'translate(' + (45 + i * 190) + ' 70)'}>
                <rect
                  width="170"
                  height="164"
                  rx="6"
                  fill="#253742"
                  stroke={accent}
                  strokeOpacity=".45"
                />
                <circle
                  cx="85"
                  cy="77"
                  r={38 + (n % 3) * 5}
                  fill={accent}
                  opacity={0.35 + i * 0.22}
                />
                {/알파|투명/.test(item.title) &&
                  Array.from({ length: 16 }, (_, k) => (
                    <rect
                      key={k}
                      x={(k % 4) * 40}
                      y={Math.floor(k / 4) * 40}
                      width="40"
                      height="40"
                      fill={k % 2 ? '#ffffff20' : '#00000020'}
                    />
                  ))}
                {Array.from(
                  { length: Math.round(((1 - e) * 30) / (i + 1)) + 3 },
                  (_, k) => (
                    <circle
                      key={k}
                      cx={15 + ((k * 31 + n * 7) % 140)}
                      cy={15 + ((k * 47 + n * 11) % 130)}
                      r="1.5"
                      fill="#fff"
                      opacity=".45"
                    />
                  ),
                )}
                <text x="12" y="151" fill="#d5e3ec" fontSize="12">
                  {['기준', '비교 A', '비교 B'][i]}
                </text>
              </g>
            ))}
            <path
              d={'M45 263H' + (45 + e * 550)}
              stroke={accent}
              strokeWidth="3"
            />
          </>
        ) : theme === 'product' || compare ? (
          <>
            {theme === 'lighting' && (
              <>
                <path
                  d={
                    'M' +
                    ((n % 3 === 0 ? 120 : n % 3 === 1 ? 320 : 520) +
                      (n === 7 ? Math.sin(e * 18) * 10 : e * 30)) +
                    ' 35L245 255H400Z'
                  }
                  fill={accent}
                  opacity={0.08 + e * 0.12}
                />
                <circle
                  cx={
                    (n % 3 === 0 ? 120 : n % 3 === 1 ? 320 : 520) +
                    (n === 7 ? Math.sin(e * 18) * 10 : e * 30)
                  }
                  cy="45"
                  r="15"
                  fill={accent}
                />
              </>
            )}
            <g opacity={theme === 'lighting' ? 0.35 + e * 0.65 : 1}>
              <Product
                name={theme === 'product' ? item.title : '향수'}
                color={accent}
                t={theme === 'product' ? e : 0}
              />
            </g>
            {theme === 'product' && (
              <>
                <path
                  d={'M' + (225 + e * 180) + ' 80V232'}
                  stroke="#fff"
                  strokeWidth="3"
                  opacity=".3"
                />
                <path d="M225 263H415" stroke={accent} opacity=".5" />
              </>
            )}
            {compare && (
              <>
                <rect
                  width={640 * (1 - t)}
                  height="320"
                  fill={theme === 'color' ? '#476396' : '#091016'}
                  opacity={theme === 'color' ? 0.3 : 0.38}
                />
                <path
                  d={'M' + 640 * (1 - t) + ' 0V320'}
                  stroke="#eff6f1"
                  strokeWidth="2"
                />
                <circle cx={640 * (1 - t)} cy="260" r="12" fill="#eff6f1" />
                <text x="20" y="275" fill="#fff" fontSize="12">
                  기준
                </text>
                <text x="585" y="275" fill="#fff" fontSize="12">
                  변화
                </text>
                {theme === 'render' &&
                  Array.from({ length: 90 }, (_, i) => (
                    <circle
                      key={i}
                      cx={(i * 71) % Math.max(1, 640 * (1 - t))}
                      cy={((i * 43) % 240) + 35}
                      r={1 + (n % 3)}
                      fill="#eee"
                      opacity=".3"
                    />
                  ))}
              </>
            )}
          </>
        ) : theme === 'editing' ? (
          <>
            {[0, 1, 2].map((i) => (
              <g key={i} transform={'translate(' + (44 + i * 192) + ' 58)'}>
                <rect
                  width="168"
                  height="106"
                  rx="5"
                  fill={stage === i ? '#32434e' : '#1b2b36'}
                  stroke={stage === i ? accent : '#42545f'}
                />
                <g transform="translate(-205 -39) scale(.7)">
                  <Person x={380 + i * 40} y={265} color={accent} />
                </g>
                <text x="12" y="21" fill={accent} fontSize="12">
                  SHOT {String(i + 1).padStart(2, '0')}
                </text>
              </g>
            ))}
            {Array.from({ length: 4 + (n % 4) }, (_, i) => (
              <rect
                key={i}
                x={44 + i * (552 / (4 + (n % 4)))}
                y="210"
                width={548 / (4 + (n % 4)) - 5}
                height="28"
                rx="3"
                fill={i % 2 ? accent : '#6b8198'}
                opacity=".75"
              />
            ))}
            <path d="M44 253H596" stroke="#637985" />
            <path
              d={'M' + (44 + e * 550) + ' 196V275'}
              stroke="#fff"
              strokeWidth="2"
            />
          </>
        ) : (
          <>
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i} transform={'translate(' + (50 + i * 111) + ' 82)'}>
                <rect
                  width="93"
                  height="112"
                  rx="5"
                  fill="#243640"
                  stroke={i === n % 5 ? '#e8ac85' : accent}
                  strokeOpacity=".6"
                />
                <path
                  d="M15 25H72M15 37H58M15 49H65"
                  stroke={accent}
                  opacity=".6"
                />
                <text
                  x="15"
                  y="95"
                  fill={i <= e * 5 ? accent : '#e8ac85'}
                  fontSize="24"
                >
                  {i <= e * 5 ? '✓' : '—'}
                </text>
                <text x="15" y="137" fill="#9caeb7" fontSize="12">
                  {String(i + n + 1).padStart(3, '0')}
                </text>
              </g>
            ))}
            <rect x="50" y="255" width="537" height="4" rx="2" fill="#3b4b54" />
            <rect x="50" y="255" width={537 * e} height="4" fill={accent} />
          </>
        )}
      </g>
      <path
        d="M16 42V16H42M598 16H624V42M16 278V304H42M598 304H624V278"
        stroke={accent}
        strokeOpacity=".5"
        fill="none"
      />
      <text x="32" y="38" fill={accent} fontSize="12" fontFamily="monospace">
        {item.id.toUpperCase()}
      </text>
      <text x="32" y="301" fill={accent} fontSize="11" fontFamily="monospace">
        {signatures[theme]?.[n]}
      </text>
      <text
        x="608"
        y="300"
        fill="#a7b8c1"
        fontSize="11"
        textAnchor="end"
        fontFamily="monospace"
      >
        {String(Math.round(t * 96)).padStart(3, '0')} / 096
      </text>
    </svg>
  );
}
function usePlayback(playing: boolean, setTime: (n: number) => void) {
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      setTime(((now - start) % 6000) / 6000);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, setTime]);
}
export function PreviewPoster({
  item,
  active = false,
}: {
  item: Item;
  active?: boolean;
}) {
  const [time, setTime] = useState(0.35);
  const video = useRef<HTMLVideoElement>(null);
  const rendered = renderedCameraIds.has(item.id);
  usePlayback(active && !rendered, setTime);
  useEffect(() => {
    if (!video.current) return;
    if (active) {
      video.current.play().catch(() => {});
    } else {
      video.current.pause();
      video.current.currentTime = 0;
    }
  }, [active]);
  return rendered ? (
    <video
      ref={video}
      playsInline
      muted
      loop
      preload="none"
      poster={'/previews/lab/' + item.id + '.jpg'}
      src={active ? '/previews/lab/' + item.id + '.mp4' : undefined}
      aria-label={item.title + ' Blender 기법 예제'}
      className="preview-scene"
    />
  ) : (
    <PreviewScene item={item} time={active ? time : 0.35} />
  );
}
export function PreviewPlayer({ item }: { item: Item }) {
  const renderedVideo = useRef<HTMLVideoElement>(null);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  usePlayback(playing, setTime);
  const info = previewInfo(item);
  const rendered = renderedCameraIds.has(item.id);
  const phase = Math.min(2, Math.floor(time * 3));
  useEffect(() => {
    const stop = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener('visibilitychange', stop);
    return () => document.removeEventListener('visibilitychange', stop);
  }, []);
  return (
    <section className="preview-player" aria-label="기능 미리보기">
      <div className="preview-heading">
        <span>FUNCTION PREVIEW</span>
        <span>{rendered ? 'Blender 기법 예제' : '원리 설명용 도식'}</span>
      </div>
      {rendered ? (
        <video
          ref={renderedVideo}
          onTimeUpdate={(event) => {
            const v = event.currentTarget;
            if (v.duration) setTime(v.currentTime / v.duration);
          }}
          onPlay={(event) =>
            document.querySelectorAll('video').forEach((v) => {
              if (v !== event.currentTarget) v.pause();
            })
          }
          controls
          playsInline
          loop
          muted
          preload="metadata"
          poster={'/previews/lab/' + item.id + '.jpg'}
          src={'/previews/lab/' + item.id + '.mp4'}
          className="preview-scene"
          aria-label={item.title + ' 실제 Blender 예제'}
        />
      ) : (
        <PreviewScene item={item} time={time} />
      )}
      {!rendered && (
        <div className="preview-controls">
          <Button
            aria-label={playing ? '미리보기 일시정지' : '미리보기 재생'}
            onClick={() => setPlaying(!playing)}
            variant="ghost"
            size="icon"
          >
            {playing ? <Pause size={18} /> : <Play size={18} />}
          </Button>
          <span id={item.id + '-progress-label'} className="sr-only">
            미리보기 진행
          </span>
          <Slider
            aria-labelledby={item.id + '-progress-label'}
            min={0}
            max={1}
            step={0.001}
            value={[time]}
            onValueChange={(v) => {
              setPlaying(false);
              setTime(Array.isArray(v) ? v[0] : v);
            }}
            className="flex-1 py-4"
          />
          <Button
            aria-label="미리보기 처음으로"
            variant="ghost"
            size="icon"
            onClick={() => {
              setPlaying(false);
              setTime(0);
            }}
          >
            <RotateCcw size={16} />
          </Button>
        </div>
      )}
      <div className="preview-beats">
        {['장면 설정', '핵심 변화', '결과 확인'].map((v, i) => (
          <button
            key={v}
            aria-pressed={phase === i}
            onClick={() => {
              setPlaying(false);
              setTime(i === 2 ? 1 : i / 3);
              if (renderedVideo.current) {
                const v = renderedVideo.current;
                v.pause();
                if (Number.isFinite(v.duration))
                  v.currentTime = (i === 2 ? 0.999 : i / 3) * v.duration;
              }
            }}
          >
            <span>0{i + 1}</span>
            {v}
          </button>
        ))}
      </div>
      <p className="preview-caption">{info.steps[phase]}</p>
      <p className="preview-note">
        {rendered
          ? 'Blender 5.2.1 · Workbench · 800×450 · 24fps. 공통 씬으로 핵심 카메라 기법을 보여주는 예제이며, 프리셋 전체의 완성 결과는 아닙니다.'
          : '브리프의 핵심 원리를 단순화한 도식입니다. 전체 동작·물리·렌더 품질을 검증한 결과는 아닙니다.'}
      </p>
    </section>
  );
}
export function CameraLab() {
  const [mode, setMode] = useState('dolly');
  return (
    <section className="camera-lab" aria-label="카메라 기법 비교">
      <div>
        <p className="lab-kicker">CAMERA STUDY / 01</p>
        <h2>같은 장면, 다른 카메라.</h2>
        <p>돌리·줌·돌리 줌의 공간감 차이를 실제 Blender 렌더로 비교하세요.</p>
      </div>
      <div className="lab-tabs">
        {[
          ['dolly', '돌리 인'],
          ['zoom', '줌 인'],
          ['dolly-zoom', '돌리 줌'],
        ].map(([id, label]) => (
          <button
            key={id}
            aria-pressed={mode === id}
            onClick={() => setMode(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <video
        key={mode}
        onPlay={(event) =>
          document.querySelectorAll('video').forEach((v) => {
            if (v !== event.currentTarget) v.pause();
          })
        }
        controls
        playsInline
        loop
        muted
        preload="none"
        poster={'/previews/lab/' + mode + '.jpg'}
        src={'/previews/lab/' + mode + '.mp4'}
        aria-label={mode + ' Blender 카메라 예제'}
      />
      <div className="lab-explanation">
        <strong>
          {mode === 'dolly'
            ? '카메라 위치 변화 · 렌즈 50mm 고정'
            : mode === 'zoom'
              ? '카메라 위치 고정 · 렌즈 50→80mm'
              : '카메라 전진 · 렌즈 50→31.25mm'}
        </strong>
        <span>
          {mode === 'dolly'
            ? '피사체가 커지면서 앞뒤 물체의 상대적 크기도 달라집니다.'
            : mode === 'zoom'
              ? '화각이 좁아집니다. 카메라 위치가 같아 원근 관계는 유지됩니다.'
              : '중앙 피사체의 크기를 거의 유지하면서 배경의 원근감이 달라집니다.'}
        </span>
      </div>
      <p className="preview-note">
        Blender 5.2.1 · Workbench · 800×450 · 24fps · 4초 · 공통 비교 씬. 개별
        프리셋 전체를 실행한 결과와는 구분됩니다.
      </p>
    </section>
  );
}
