'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Aperture,
  BadgeCheck,
  Bookmark,
  BookmarkCheck,
  Camera,
  Check,
  Clapperboard,
  Copy,
  ExternalLink,
  Film,
  Focus,
  Library,
  Search,
  SlidersHorizontal,
  Sparkles,
  Video,
  Zap,
} from 'lucide-react';

import promptsData from '@/data/prompts.json';
import sourcesData from '@/data/sources.json';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

type Variable = { key: string; label: string; default: string };
type PromptRecord = {
  id: string;
  title: string;
  category: string;
  level: string;
  duration: string;
  aspectRatio: string;
  engine: string;
  tags: string[];
  summary: string;
  prompt: string;
  negativePrompt: string;
  variables: Variable[];
  thumbnailTheme: string;
  sourceIds: string[];
  researchNote?: string;
};
type SourceRecord = {
  id: string;
  title: string;
  publisher: string;
  date: string;
  url: string;
  principles: string[];
  version: string | null;
  access: string;
  accessedAt: string;
  type: string;
};

const prompts = promptsData as PromptRecord[];
const sources = sourcesData as SourceRecord[];
const sourceById = new Map(sources.map((source) => [source.id, source]));
const allCategories = Array.from(new Set(prompts.map((item) => item.category)));

const categoryIcons: Record<string, typeof Camera> = {
  '카메라/렌즈': Camera,
  '스테이징·블로킹': Focus,
  '액션 시퀀스': Zap,
  '대화 장면': Video,
  '차량·드론': Film,
  '제품 TV CF': Sparkles,
  '조명·룩': Aperture,
  'Eevee/Cycles 렌더': Clapperboard,
  애니메이션: Video,
  '편집·샷리스트': Clapperboard,
  '컬러·합성': Aperture,
  'QA/딜리버리': BadgeCheck,
};

const thumbnailMap: Record<string, { image: string; position: string }> = {
  camera: { image: '/previews/camera-action.png', position: '0% 0%' },
  blocking: { image: '/previews/camera-action.png', position: '100% 0%' },
  action: { image: '/previews/camera-action.png', position: '0% 100%' },
  dialogue: { image: '/previews/camera-action.png', position: '100% 0%' },
  vehicle: { image: '/previews/camera-action.png', position: '100% 100%' },
  product: { image: '/previews/product-lighting.png', position: '0% 0%' },
  lighting: { image: '/previews/product-lighting.png', position: '100% 0%' },
  render: { image: '/previews/render-post.png', position: '0% 0%' },
  animation: { image: '/previews/render-post.png', position: '100% 0%' },
  editing: { image: '/previews/render-post.png', position: '0% 100%' },
  color: { image: '/previews/render-post.png', position: '100% 100%' },
  delivery: { image: '/previews/render-post.png', position: '100% 100%' },
};

function replaceVariables(prompt: string, values: Record<string, string>) {
  return Object.entries(values).reduce((result, [key, value]) => {
    return result
      .replaceAll(`{{{{${key}}}}}`, value)
      .replaceAll(`{{${key}}}`, value);
  }, prompt);
}

function PromptDetail({
  item,
  isFavorite,
  onFavorite,
}: {
  item: PromptRecord;
  isFavorite: boolean;
  onFavorite: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(item.variables.map((variable) => [variable.key, variable.default])),
  );
  const compiled = replaceVariables(item.prompt, values);
  const itemSources = item.sourceIds
    .map((id) => sourceById.get(id))
    .filter((source): source is SourceRecord => Boolean(source));

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(`${compiled}\n\n피할 결과\n${item.negativePrompt}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <SheetContent className="w-full overflow-hidden border-white/10 bg-[#121418] p-0 text-white sm:max-w-2xl">
      <SheetHeader className="border-b border-white/8 px-6 py-6 pr-14">
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge className="border-white/10 bg-white/5 text-[#b7bdc6]">{item.category}</Badge>
          <Badge className="border-[#e5ff54]/20 bg-[#e5ff54]/8 text-[#dff957]">{item.engine}</Badge>
          <Badge className="border-white/10 bg-white/5 text-[#b7bdc6]">{item.duration} · {item.aspectRatio}</Badge>
        </div>
        <SheetTitle className="text-2xl font-semibold tracking-tight text-white">{item.title}</SheetTitle>
        <SheetDescription className="leading-6 text-[#9299a3]">{item.summary}</SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <p className="font-mono text-xs tracking-[0.14em] text-[#e5ff54]">PROJECT VARIABLES</p>
            <Button onClick={onFavorite} variant="ghost" size="sm" className="text-[#aeb4bd] hover:bg-white/8 hover:text-white">
              {isFavorite ? <BookmarkCheck className="text-[#e5ff54]" /> : <Bookmark />}
              {isFavorite ? '저장됨' : '즐겨찾기'}
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {item.variables.map((variable) => (
              <label key={variable.key} className={variable.key === 'brief' ? 'sm:col-span-2' : ''}>
                <span className="mb-1.5 block text-xs text-[#7d8590]">{variable.label}</span>
                <Input
                  value={values[variable.key] ?? ''}
                  onChange={(event) => setValues((current) => ({ ...current, [variable.key]: event.target.value }))}
                  className="h-10 border-white/10 bg-white/[0.04] text-white focus-visible:border-[#e5ff54]/70"
                />
              </label>
            ))}
          </div>
        </section>

        <section className="mt-7">
          <p className="mb-2 font-mono text-xs tracking-[0.14em] text-[#e5ff54]">MASTER PROMPT</p>
          <pre className="whitespace-pre-wrap rounded-md border border-white/10 bg-black/25 p-4 font-sans text-[15px] leading-7 text-[#d6dae0]">{compiled}</pre>
        </section>

        <section className="mt-5">
          <p className="mb-2 font-mono text-xs tracking-[0.14em] text-[#8d95a0]">NEGATIVE / QA GUARDRAILS</p>
          <p className="rounded-md border border-white/8 bg-white/[0.025] p-4 text-sm leading-6 text-[#aab0b9]">{item.negativePrompt}</p>
        </section>

        <Button onClick={copyPrompt} className="mt-5 h-11 w-full bg-[#e5ff54] text-black hover:bg-[#d9f24f]">
          {copied ? <Check /> : <Copy />} {copied ? '복사했습니다' : '변수를 적용한 전체 프롬프트 복사'}
        </Button>

        <section className="mt-8 border-t border-white/8 pt-6">
          <p className="font-mono text-xs tracking-[0.14em] text-[#8d95a0]">EVIDENCE LINKS</p>
          <div className="mt-3 space-y-2">
            {itemSources.map((source) => (
              <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="flex items-start justify-between gap-3 rounded-md border border-white/8 bg-white/[0.025] p-3 text-sm text-[#b8bec7] transition hover:border-[#e5ff54]/35 hover:text-white">
                <span><strong className="font-medium">{source.publisher}</strong><span className="mt-0.5 block text-xs leading-5 text-[#7f8792]">{source.title}</span></span>
                <ExternalLink className="mt-0.5 size-4 shrink-0" />
              </a>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-[#69717c]">{item.researchNote}</p>
        </section>
      </div>
    </SheetContent>
  );
}

export default function Home() {
  const [category, setCategory] = useState('전체 라이브러리');
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('전체 난이도');
  const [engine, setEngine] = useState('모든 엔진');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cineprompt-favorites') ?? '[]') as string[];
      setFavorites(new Set(saved));
    } catch {
      setFavorites(new Set());
    }
  }, []);

  useEffect(() => {
    const modelContext = (document as Document & {
      modelContext?: {
        registerTool: (tool: {
          name: string;
          title: string;
          description: string;
          inputSchema: object;
          annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
          execute: (input: unknown) => unknown;
        }, options: { signal: AbortSignal }) => void | Promise<void>;
      };
    }).modelContext;
    if (!modelContext?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(modelContext.registerTool({
      name: 'filter_prompt_library',
      title: '프롬프트 라이브러리 필터',
      description: '화면의 Blender 프리비즈 프롬프트를 검색어, 카테고리, 난이도와 렌더 엔진으로 필터링합니다.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string' }, category: { type: 'string' }, level: { type: 'string' }, engine: { type: 'string' }, favoritesOnly: { type: 'boolean' },
        },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        const next = (input ?? {}) as Record<string, unknown>;
        if (next.query !== undefined && typeof next.query !== 'string') throw new Error('query는 문자열이어야 합니다.');
        if (next.category !== undefined && (typeof next.category !== 'string' || (next.category !== '전체 라이브러리' && !allCategories.includes(next.category)))) throw new Error('지원하지 않는 카테고리입니다.');
        if (next.level !== undefined && (typeof next.level !== 'string' || !['전체 난이도', '입문', '중급', '고급'].includes(next.level))) throw new Error('지원하지 않는 난이도입니다.');
        if (next.engine !== undefined && (typeof next.engine !== 'string' || !['모든 엔진', 'EEVEE', 'Cycles', '공통'].includes(next.engine))) throw new Error('지원하지 않는 렌더 엔진입니다.');
        if (next.favoritesOnly !== undefined && typeof next.favoritesOnly !== 'boolean') throw new Error('favoritesOnly는 boolean이어야 합니다.');
        if (typeof next.query === 'string') setQuery(next.query);
        if (typeof next.category === 'string' && (next.category === '전체 라이브러리' || allCategories.includes(next.category))) setCategory(next.category);
        if (typeof next.level === 'string' && ['전체 난이도', '입문', '중급', '고급'].includes(next.level)) setLevel(next.level);
        if (typeof next.engine === 'string' && ['모든 엔진', 'EEVEE', 'Cycles', '공통'].includes(next.engine)) setEngine(next.engine);
        if (typeof next.favoritesOnly === 'boolean') setFavoritesOnly(next.favoritesOnly);
        return { applied: true };
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem('cineprompt-favorites', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const visible = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return prompts.filter((item) => {
      const haystack = `${item.title} ${item.summary} ${item.category} ${item.tags.join(' ')}`.toLowerCase();
      return (category === '전체 라이브러리' || item.category === category)
        && (level === '전체 난이도' || item.level === level)
        && (engine === '모든 엔진' || item.engine === engine)
        && (!favoritesOnly || favorites.has(item.id))
        && (!keyword || haystack.includes(keyword));
    });
  }, [category, engine, favorites, favoritesOnly, level, query]);

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-white/8 bg-[#0c0d0f]" collapsible="offcanvas">
        <SidebarHeader className="border-b border-white/8 p-5">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-md bg-[#e5ff54] text-black"><Clapperboard className="size-5" /></div>
            <div><p className="font-mono text-[11px] tracking-[0.18em] text-[#9ca3af]">BLENDER PREVIZ</p><p className="text-base font-semibold tracking-tight text-white">CinePrompt Atlas</p></div>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2 py-4">
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 text-xs tracking-wider text-[#6f7681]">카테고리</SidebarGroupLabel>
            <SidebarGroupContent><SidebarMenu>
              <SidebarMenuItem><SidebarMenuButton isActive={category === '전체 라이브러리'} onClick={() => setCategory('전체 라이브러리')} className="h-10 text-[#aeb4bd] data-active:bg-[#e5ff54] data-active:text-black hover:bg-white/8 hover:text-white"><Library /><span>전체 라이브러리</span><SidebarMenuBadge>{prompts.length}</SidebarMenuBadge></SidebarMenuButton></SidebarMenuItem>
              {allCategories.map((label) => {
                const Icon = categoryIcons[label] ?? Film;
                return <SidebarMenuItem key={label}><SidebarMenuButton isActive={category === label} onClick={() => setCategory(label)} className="h-10 text-[#aeb4bd] data-active:bg-[#e5ff54] data-active:text-black hover:bg-white/8 hover:text-white"><Icon /><span>{label}</span><SidebarMenuBadge>{prompts.filter((item) => item.category === label).length}</SidebarMenuBadge></SidebarMenuButton></SidebarMenuItem>;
              })}
            </SidebarMenu></SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-white/8 p-4"><div className="rounded-md border border-white/10 bg-white/[0.03] p-3"><p className="font-mono text-[11px] text-[#e5ff54]">72 PROMPTS · 24 SOURCES</p><p className="mt-1 text-xs leading-5 text-[#7f8792]">공개 제작 원칙을 검증해 독창적인 한국어 프롬프트로 재구성</p></div></SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0 bg-[#111316] text-white">
        <header className="sticky top-0 z-20 flex min-h-16 flex-wrap items-center gap-3 border-b border-white/8 bg-[#111316]/92 px-4 py-3 backdrop-blur-xl md:px-7">
          <SidebarTrigger className="text-[#9ca3af] hover:bg-white/8 hover:text-white" />
          <div className="relative min-w-[220px] max-w-2xl flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6f7681]" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="렌즈, 장면, 무드, 렌더 엔진 검색" className="h-10 border-white/10 bg-white/[0.04] pl-10 text-base text-white placeholder:text-[#69707a] focus-visible:border-[#e5ff54]/70 md:text-sm" /></div>
          <Button onClick={() => setFavoritesOnly((value) => !value)} variant="outline" className={`border-white/10 text-[#d7dbe0] hover:bg-white/8 hover:text-white ${favoritesOnly ? 'bg-[#e5ff54] text-black hover:bg-[#d9f24f] hover:text-black' : 'bg-white/[0.03]'}`}>{favoritesOnly ? <BookmarkCheck /> : <Bookmark />} <span className="hidden sm:inline">즐겨찾기</span>{favorites.size > 0 && <span>{favorites.size}</span>}</Button>
          <a href="#sources" className="hidden items-center gap-2 text-sm text-[#8d95a0] hover:text-white lg:flex"><ExternalLink className="size-4" /> 출처 {sources.length}</a>
        </header>

        <main className="mx-auto w-full max-w-[1500px] px-4 py-6 md:px-7 md:py-8">
          <section className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div><div className="mb-2 flex items-center gap-2 font-mono text-xs tracking-[0.14em] text-[#e5ff54]"><span className="inline-block h-px w-7 bg-[#e5ff54]" /> PRODUCTION PROMPT LIBRARY</div><h1 className="max-w-3xl text-3xl font-semibold tracking-[-0.035em] text-white md:text-4xl">아이디어를 촬영 가능한 Blender 프리비즈로</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-[#89919c]">카메라부터 납품 검수까지, 공개된 제작 원칙을 바탕으로 구성한 실행형 프롬프트입니다. 특정 스튜디오의 내부 자료나 결과 보증이 아닙니다.</p></div>
            <div className="flex items-center gap-2 text-sm text-[#8b929d]"><SlidersHorizontal className="size-4" /><span>{visible.length}개 표시</span></div>
          </section>

          <section aria-label="필터" className="mb-5 flex flex-wrap gap-2 border-y border-white/8 py-3">
            <NativeSelect value={level} onChange={(event) => setLevel(event.target.value)} className="min-w-32 text-[#c4c9d0]"><NativeSelectOption value="전체 난이도">전체 난이도</NativeSelectOption><NativeSelectOption value="입문">입문</NativeSelectOption><NativeSelectOption value="중급">중급</NativeSelectOption><NativeSelectOption value="고급">고급</NativeSelectOption></NativeSelect>
            <NativeSelect value={engine} onChange={(event) => setEngine(event.target.value)} className="min-w-32 text-[#c4c9d0]"><NativeSelectOption value="모든 엔진">모든 엔진</NativeSelectOption><NativeSelectOption value="EEVEE">EEVEE</NativeSelectOption><NativeSelectOption value="Cycles">Cycles</NativeSelectOption><NativeSelectOption value="공통">공통</NativeSelectOption></NativeSelect>
            {(category !== '전체 라이브러리' || level !== '전체 난이도' || engine !== '모든 엔진' || query || favoritesOnly) && <Button variant="ghost" className="h-9 text-[#8e96a1] hover:bg-white/8 hover:text-white" onClick={() => { setCategory('전체 라이브러리'); setLevel('전체 난이도'); setEngine('모든 엔진'); setQuery(''); setFavoritesOnly(false); }}>필터 초기화</Button>}
          </section>

          <section aria-label="프롬프트 목록" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((item, index) => {
              const visual = thumbnailMap[item.thumbnailTheme] ?? thumbnailMap.camera;
              return (
                <Sheet key={item.id}>
                  <SheetTrigger render={<button className="group overflow-hidden rounded-lg border border-white/10 bg-[#17191d] text-left transition hover:-translate-y-0.5 hover:border-[#e5ff54]/45 hover:bg-[#1b1e22] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5ff54]" />}>
                    <div aria-hidden="true" className="prompt-thumb" style={{ backgroundImage: `url(${visual.image})`, backgroundPosition: visual.position }}><span className="shot-number">{item.id.toUpperCase()}</span><span className="lens-readout">{item.aspectRatio} / 24FPS</span></div>
                    <div className="p-4"><div className="mb-3 flex flex-wrap gap-2"><Badge className="border-white/10 bg-white/5 text-[#b7bdc6]">{item.category}</Badge><Badge className="border-[#e5ff54]/20 bg-[#e5ff54]/8 text-[#dff957]">{item.engine}</Badge>{favorites.has(item.id) && <Badge className="border-transparent bg-transparent px-1 text-[#e5ff54]"><BookmarkCheck /></Badge>}</div><h2 className="text-lg font-semibold tracking-tight text-white">{item.title}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-[#8e96a1]">{item.summary}</p><div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3 text-xs text-[#6f7681]"><span>{item.level} · {item.duration}</span><span className="font-mono tracking-wider text-[#aeb4bd]">OPEN PROMPT →</span></div></div>
                  </SheetTrigger>
                  <PromptDetail item={item} isFavorite={favorites.has(item.id)} onFavorite={() => toggleFavorite(item.id)} />
                </Sheet>
              );
            })}
          </section>

          {visible.length === 0 && <div className="mt-12 border-y border-white/8 py-14 text-center"><p className="text-lg text-white">검색 결과가 없습니다.</p><p className="mt-2 text-sm text-[#777f8a]">필터를 초기화하거나 다른 촬영 용어를 입력해 보세요.</p></div>}

          <section id="sources" className="mt-16 scroll-mt-24 border-t border-white/10 pt-10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-xs tracking-[0.14em] text-[#e5ff54]">SOURCES / REFERENCES</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">검증에 사용한 공개 자료</h2></div><p className="max-w-xl text-sm leading-6 text-[#7e8691]">Blender 공식 문서와 전문 촬영·프리비즈·컬러 관리 자료를 우선했습니다. 각 프롬프트 상세 화면에서 직접 연결된 근거를 볼 수 있습니다.</p></div>
            <div className="mt-6 grid gap-x-8 gap-y-3 md:grid-cols-2">
              {sources.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="group flex items-start justify-between gap-4 border-b border-white/8 py-3 text-sm"><span><span className="font-mono text-xs text-[#68707b]">{source.id}</span><strong className="ml-3 font-medium text-[#cbd0d6] group-hover:text-white">{source.publisher}</strong><span className="mt-1 block text-xs leading-5 text-[#737b86]">{source.title}{source.version ? ` · v${source.version}` : ''}</span></span><ExternalLink className="mt-1 size-4 shrink-0 text-[#5d6570] group-hover:text-[#e5ff54]" /></a>)}
            </div>
          </section>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
