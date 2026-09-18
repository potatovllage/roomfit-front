import { useState } from 'react'
import { ChevronLeft, LoaderCircle } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'

import { type FurnitureItem, useDesignJobQuery } from '@/api/roomfit'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createDemoDesign } from '@/config/demo-data'
import { useRoomfitStore } from '@/stores/roomfit-store'

const formatWon = (value: number) => `${new Intl.NumberFormat('ko-KR').format(value)}원`

function NumberPin({ number }: { number: number }) {
  return <span className="flex size-7 items-center justify-center rounded-full border-2 border-white bg-[#171717] text-[13px] font-bold text-white shadow-sm">{number}</span>
}

function FurnitureCard({ item, index, selected, onSelect }: { item: FurnitureItem; index: number; selected: boolean; onSelect: () => void }) {
  return <article className={cn('grid gap-4 rounded-xl border border-[#e0e0e0] bg-white p-5 transition-opacity sm:grid-cols-[28px_96px_220px_minmax(170px,1fr)_166px] sm:items-start', !selected && 'opacity-45')}>
    <button type="button" onClick={onSelect} aria-label={`${item.name} 위치 보기`}><NumberPin number={index + 1} /></button>
    <img src={item.image_url} alt="" className="aspect-square w-20 rounded-lg bg-[#e0e0e0] object-cover sm:w-24" />
    <div className="min-w-0 pt-1"><h3 className="truncate text-base font-bold text-[#171717]">{item.name}</h3><p className="mt-1 text-[13px] text-[#5e5e5e]">{item.category}{item.brand ? ` · ${item.brand}` : ''}</p></div>
    <div className="space-y-2 text-sm text-[#171717]"><div className="flex items-center gap-2"><span className="min-w-0 flex-1">{item.merchant}</span><span className={cn('rounded-full px-2.5 py-1 text-[11px]', item.availability === 'in_stock' ? 'bg-[#e1efe3] text-[#3f7d4f]' : 'bg-[#f6dede] text-[#8f8f8f]')}>{item.availability === 'in_stock' ? '구매 가능' : '재고 확인 필요'}</span><strong className="text-[15px]">{formatWon(item.subtotal)}</strong></div><p className="text-[13px] text-[#5e5e5e]">{item.placement_reason}</p><span className="inline-flex rounded-full bg-[#f2f2f2] px-2.5 py-1 text-xs">{item.match_type === 'exact' ? '정확히 매칭된 상품' : '유사 스타일 상품'}</span></div>
    <Button asChild className="h-12 rounded-lg bg-[#171717] text-[15px] hover:bg-[#303030]"><a href={item.shopping_url} target="_blank" rel="noreferrer">이동하기</a></Button>
  </article>
}

export function LayoutResultPage() {
  const navigate = useNavigate()
  const [selectedFurniture, setSelectedFurniture] = useState(0)
  const { designId, budget, isDemoDesign, setDesignId, setIsDemoDesign } = useRoomfitStore()
  const designQuery = useDesignJobQuery(isDemoDesign ? null : designId)
  if (!designId) return <Navigate to="/" replace />

  const job = isDemoDesign ? createDemoDesign(budget) : designQuery.data
  if (designQuery.isPending || (job && !['succeeded', 'failed'].includes(job.status))) return <main className="grid min-h-screen place-items-center bg-white px-5 text-center text-[#171717]"><div><LoaderCircle className="mx-auto size-9 animate-spin" /><h1 className="mt-5 text-xl font-bold">AI가 배치안을 만들고 있어요</h1><p className="mt-2 text-sm text-[#5e5e5e]">{job?.status === 'analyzing' ? '방 사진을 분석하고 있어요.' : job?.status === 'selecting_products' ? '가구를 찾고 있어요.' : job?.status === 'rendering' ? '가구 배치 이미지를 만들고 있어요.' : '요청을 준비하고 있어요.'}</p><p className="mt-3 text-sm font-medium">{job?.progress ?? 0}%</p></div></main>
  if (designQuery.isError || job?.status === 'failed' || !job?.result) return <main className="grid min-h-screen place-items-center bg-white px-5 text-center"><div><h1 className="text-xl font-bold text-[#171717]">배치안을 만들지 못했어요</h1><p className="mt-2 text-sm text-[#5e5e5e]">{job?.error?.message ?? (designQuery.error instanceof Error ? designQuery.error.message : '잠시 후 다시 시도해 주세요.')}</p><Button onClick={() => { setDesignId(null); navigate('/') }} className="mt-6 bg-[#171717]">다시 시도하기</Button></div></main>

  const result = job.result
  const selectedItem = result.furniture_items[selectedFurniture]
  return <main className="min-h-screen bg-white px-5 py-12 text-[#171717] sm:px-8 lg:py-20"><section className="mx-auto max-w-[1200px]">
    <Button variant="ghost" onClick={() => { setDesignId(null); setIsDemoDesign(false); navigate('/') }} className="mb-8 -ml-3 text-[#454545]"><ChevronLeft />다시 배치하기</Button>
    <div className="mb-8 space-y-3"><h1 className="text-3xl font-bold tracking-[-0.04em]">AI가 이렇게 배치해봤어요</h1><p className="text-sm text-[#454545]">{result.summary}</p></div>
    <div className="relative h-[260px] overflow-hidden bg-[#f0f0f0] sm:h-[420px]" style={{ backgroundImage: `url(${result.rendered_image.url})`, backgroundPosition: 'center', backgroundSize: 'cover' }}>
      {result.furniture_items.map((item, index) => <button key={item.product_id} type="button" aria-label={`${item.name} 보기`} onClick={() => setSelectedFurniture(index)} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${item.placement.center_x * 100}%`, top: `${item.placement.center_y * 100}%` }}><NumberPin number={index + 1} /></button>)}
      {selectedItem && <div className="absolute left-[calc(30%+24px)] top-[calc(23%+16px)] hidden w-[350px] rounded-lg bg-white p-4 shadow-[0_2px_8px_rgba(31,36,33,.08)] sm:block"><div className="flex items-center gap-2"><img src={selectedItem.image_url} alt="" className="size-14 rounded-xl bg-[#e0e0e0] object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{selectedItem.name}</p><p className="text-xs text-[#454545]">{selectedItem.merchant}</p></div><strong className="text-sm">{formatWon(selectedItem.subtotal)}</strong></div><Button asChild className="mt-3 h-12 w-full rounded-lg bg-[#171717] hover:bg-[#303030]"><a href={selectedItem.shopping_url} target="_blank" rel="noreferrer">이동하기</a></Button></div>}
    </div>
    <h2 className="mb-8 mt-8 text-lg font-bold">이 배치에 포함된 가구 {result.furniture_items.length}개</h2>
    <div className="space-y-8">{result.furniture_items.map((item, index) => <FurnitureCard key={item.product_id} item={item} index={index} selected={selectedFurniture === index} onSelect={() => setSelectedFurniture(index)} />)}</div>
    <div className={cn('mt-8 flex flex-col gap-1 rounded-xl p-4 text-sm font-medium sm:flex-row sm:items-center', result.budget.within_budget ? 'bg-[#e1efe3] text-[#3f7d4f]' : 'bg-[#f6dede] text-[#8f3f3f]')}><span className="flex-1">합계</span><strong className="text-[15px]">{formatWon(result.budget.estimated_furniture_total)} (예산 {formatWon(Math.max(budget - result.budget.estimated_furniture_total, 0))} 남음)</strong></div>
    {result.warnings.length > 0 && <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-[#5e5e5e]">{result.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>}
  </section></main>
}
