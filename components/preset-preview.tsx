'use client';
import { useRef, useState } from 'react';
import {
  ArrowLeftRight,
  Expand,
  ExternalLink,
  FileText,
  X,
} from 'lucide-react';
import studiesData from '../data/preview-studies.json';

type Item = {
  id: string;
  title: string;
  thumbnailTheme: string;
  summary: string;
  prompt: string;
};
type Study = (typeof studiesData)['camera-01'];
export const studies: Record<string, Study> = studiesData;
export const renderedPreviewIds = new Set(Object.keys(studies));
const asset = (id: string, side: 'before' | 'after') =>
  '/previews/studies/' + id + '-' + side + '.webp';

export function previewInfo(item: Item) {
  const brief =
    item.prompt.split('연출 및 제작 지시\n')[1]?.split('\n\n')[0] ??
    item.summary;
  return {
    steps: brief
      .split(/(?<=[.!?])\s+/)
      .filter(Boolean)
      .slice(0, 3),
  };
}

export function PreviewPoster({
  item,
  active = false,
}: {
  item: Item;
  active?: boolean;
}) {
  const study = studies[item.id];
  if (!study)
    return (
      <div className="brief-poster">
        <span className="brief-number">{item.id.replace('-', ' / ')}</span>
        <span className="brief-eyebrow">
          <FileText size={14} /> 제작 브리프
        </span>
        <p>{previewInfo(item).steps[0]}</p>
        <span className="brief-status">실제 효과 렌더 미제공</span>
      </div>
    );
  return (
    <div className="study-poster">
      <img
        src={asset(item.id, 'before').replace('.webp', '-thumb.webp')}
        alt={item.title + ' · ' + study.beforeLabel}
        width={480}
        height={270}
        loading="lazy"
        decoding="async"
      />
      <img
        className="study-poster-after"
        style={{ clipPath: `inset(0 ${active ? 0 : 50}% 0 0)` }}
        src={asset(item.id, 'after').replace('.webp', '-thumb.webp')}
        alt=""
        width={480}
        height={270}
        loading="lazy"
        decoding="async"
      />
      {!active && <span className="study-poster-divider" />}
      <span className="study-poster-tag">
        {active ? '적용 결과' : '적용 / 기준'}
      </span>
    </div>
  );
}

export function StudyComparison({ id, title }: { id: string; title: string }) {
  const study = studies[id];
  const [position, setPosition] = useState(50);
  const [mode, setMode] = useState<'wipe' | 'pair' | 'before' | 'after'>(
    'wipe',
  );
  const [zoomSide, setZoomSide] = useState<'before' | 'after'>('after');
  const dialog = useRef<HTMLDialogElement>(null);
  if (!study) return null;
  return (
    <section
      className="study-comparison"
      aria-label={title + ' 실제 렌더 비교'}
    >
      <div className="study-heading">
        <span>RENDER STUDY</span>
        <span>Cycles · 1600 × 900</span>
      </div>
      <div className="study-modes" role="group" aria-label="비교 방식">
        {(
          [
            ['wipe', '전후 슬라이더'],
            ['pair', '나란히'],
            ['before', '기준'],
            ['after', '적용'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setMode(value)}
            aria-pressed={mode === value}
          >
            {label}
          </button>
        ))}
        <button
          className="study-expand"
          aria-label="렌더 크게 보기"
          onClick={() => dialog.current?.showModal()}
        >
          <Expand size={15} />
          <span>확대</span>
        </button>
      </div>
      {mode === 'pair' ? (
        <div className="study-pair">
          {(['before', 'after'] as const).map((side) => (
            <figure key={side}>
              <img
                src={asset(id, side)}
                alt={
                  title +
                  ' · ' +
                  study[(side + 'Label') as 'beforeLabel' | 'afterLabel']
                }
                width={1600}
                height={900}
              />
              <figcaption>
                {study[(side + 'Label') as 'beforeLabel' | 'afterLabel']}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <div className="study-canvas">
          <img
            src={asset(id, mode === 'after' ? 'after' : 'before')}
            alt={
              title +
              ' · ' +
              (mode === 'after' ? study.afterLabel : study.beforeLabel)
            }
            width={1600}
            height={900}
          />
          {mode === 'wipe' && (
            <>
              <img
                className="study-overlay"
                style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
                src={asset(id, 'after')}
                alt={title + ' · ' + study.afterLabel}
                width={1600}
                height={900}
              />
              <div className="study-divider" style={{ left: position + '%' }}>
                <span>
                  <ArrowLeftRight size={18} />
                </span>
              </div>
            </>
          )}
          <div className="study-frame-labels" aria-hidden="true">
            {(mode === 'wipe' || mode === 'after') && (
              <span>{study.afterLabel}</span>
            )}
            {(mode === 'wipe' || mode === 'before') && (
              <span>{study.beforeLabel}</span>
            )}
          </div>
        </div>
      )}
      {mode === 'wipe' && (
        <label className="study-range">
          <span>기준</span>
          <input
            type="range"
            min={0}
            max={100}
            value={position}
            onChange={(event) => setPosition(Number(event.target.value))}
            aria-label="적용 이미지 표시 비율"
            aria-valuetext={`적용 ${position}%`}
          />
          <span>적용</span>
        </label>
      )}
      <div className="study-reading">
        <span>바꾼 조건</span>
        <p>{study.change}</p>
        <span>확인할 차이</span>
        <p>{study.observe}</p>
      </div>
      <details className="study-method">
        <summary>재현 조건과 미리보기 범위</summary>
        <p>{study.scope}</p>
        <p>
          Blender 5.2.1 · Cycles 64 samples · 디노이즈 · AgX / Medium High
          Contrast. 조명 비교는 카메라·재질·노출을 고정합니다. Suzanne 표준
          조각과 직접 모델링한 시험 세트를 사용합니다.
        </p>
        <a
          href="https://github.com/ChoonwooLim/cineprompt-atlas/blob/main/scripts/render-effect-studies.py"
          target="_blank"
          rel="noreferrer"
        >
          렌더 재현 스크립트 <ExternalLink size={12} />
        </a>
      </details>
      <dialog
        ref={dialog}
        className="study-lightbox"
        aria-label={title + ' 확대 렌더'}
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current?.close();
        }}
      >
        <div className="study-lightbox-inner">
          <header>
            <strong>{title}</strong>
            <button
              aria-label="확대 닫기"
              onClick={() => dialog.current?.close()}
            >
              <X size={20} />
            </button>
          </header>
          <div
            className="study-modes"
            role="group"
            aria-label="확대 이미지 선택"
          >
            <button
              aria-pressed={zoomSide === 'before'}
              onClick={() => setZoomSide('before')}
            >
              기준
            </button>
            <button
              aria-pressed={zoomSide === 'after'}
              onClick={() => setZoomSide('after')}
            >
              적용
            </button>
            <a href={asset(id, zoomSide)} target="_blank" rel="noreferrer">
              원본 이미지 열기 <ExternalLink size={13} />
            </a>
          </div>
          <img
            src={asset(id, zoomSide)}
            width={1600}
            height={900}
            alt={study[(zoomSide + 'Label') as 'beforeLabel' | 'afterLabel']}
          />
          <p>{study[(zoomSide + 'Label') as 'beforeLabel' | 'afterLabel']}</p>
        </div>
      </dialog>
    </section>
  );
}

export function PreviewPlayer({ item }: { item: Item }) {
  if (studies[item.id])
    return <StudyComparison key={item.id} id={item.id} title={item.title} />;
  return (
    <section className="brief-detail" aria-label="미리보기 제공 상태">
      <div>
        <FileText size={18} />
        <strong>이 항목은 제작 브리프로 제공됩니다</strong>
      </div>
      <p>
        효과를 판단할 수 있는 실제 렌더가 아직 없습니다. 아래 지시와 완료
        기준으로 장면을 제작·검토하세요.
      </p>
      <ol>
        {previewInfo(item).steps.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ol>
    </section>
  );
}

export function CameraLab() {
  const [id, setId] = useState('camera-04');
  const examples = [
    ['camera-04', '초점 이동'],
    ['camera-03', '돌리 줌'],
    ['lighting-03', '하드 라이트'],
    ['lighting-11', '유리 반사'],
    ['lighting-13', '실루엣 → 형태'],
  ];
  return (
    <section className="camera-lab">
      <div>
        <p className="lab-kicker">CONTROLLED COMPARISON</p>
        <h2>무엇이 달라졌는지, 직접 비교하세요.</h2>
        <p>초점·원근·조명·반사가 바뀌는 지점을 같은 화면에서 확인하세요.</p>
      </div>
      <div className="lab-tabs">
        {examples.map(([value, label]) => (
          <button
            key={value}
            aria-pressed={id === value}
            onClick={() => setId(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <StudyComparison
        key={id}
        id={id}
        title={examples.find((x) => x[0] === id)![1]}
      />
    </section>
  );
}
