import type { DesignJob, FurnitureItem, Theme } from '@/api/roomfit'

export const demoSourceImageUrl = '/images/demo-room-source.jpg'

export const demoThemes: Theme[] = [
  { code: 'modern_light', name: '모던', description: '밝고 정돈된 모던 스타일', preview_image_url: '' },
  { code: 'minimal', name: '미니멀', description: '여백을 살린 미니멀 스타일', preview_image_url: '' },
  { code: 'warm_natural', name: '내추럴', description: '따뜻한 우드와 패브릭 중심의 스타일', preview_image_url: '' },
  { code: 'scandinavian', name: '북유럽', description: '밝은 색감의 실용적인 스타일', preview_image_url: '' },
  { code: 'industrial', name: '인더스트리얼', description: '금속과 짙은 소재를 활용한 스타일', preview_image_url: '' },
]

const demoFurniture: FurnitureItem[] = [
  {
    product_id: 'demo-sofa', name: '크림 패브릭 3인 소파', category: '소파', brand: 'Roomfit Demo', merchant: '데모 쇼룸',
    image_url: '/images/demo-room-styled.png', shopping_url: 'https://example.com', unit_price: 689000, quantity: 1, subtotal: 689000, currency: 'KRW', availability: 'in_stock', match_type: 'similar',
    placement_reason: '벽면 중심에 두어 넓고 편안한 휴식 공간을 만들었어요.', placement: { center_x: 51, center_y: 66, width: 39, height: 21, rotation_degrees: 0 },
  },
  {
    product_id: 'demo-table', name: '오크 타원형 커피 테이블', category: '테이블', brand: 'Roomfit Demo', merchant: '데모 쇼룸',
    image_url: '/images/demo-room-styled.png', shopping_url: 'https://example.com', unit_price: 219000, quantity: 1, subtotal: 219000, currency: 'KRW', availability: 'in_stock', match_type: 'similar',
    placement_reason: '소파 앞 중앙에 배치해 동선을 방해하지 않으면서도 실용성을 더했어요.', placement: { center_x: 52, center_y: 80, width: 28, height: 12, rotation_degrees: 0 },
  },
  {
    product_id: 'demo-chair', name: '카라멜 라운지 체어', category: '암체어', brand: 'Roomfit Demo', merchant: '데모 쇼룸',
    image_url: '/images/demo-room-styled.png', shopping_url: 'https://example.com', unit_price: 349000, quantity: 1, subtotal: 349000, currency: 'KRW', availability: 'in_stock', match_type: 'similar',
    placement_reason: '오른쪽 창가에 단독 좌석을 만들어 독서와 휴식을 위한 코너를 구성했어요.', placement: { center_x: 84, center_y: 76, width: 16, height: 25, rotation_degrees: 0 },
  },
  {
    product_id: 'demo-rug', name: '내추럴 베이지 러그', category: '러그', brand: 'Roomfit Demo', merchant: '데모 쇼룸',
    image_url: '/images/demo-room-styled.png', shopping_url: 'https://example.com', unit_price: 149000, quantity: 1, subtotal: 149000, currency: 'KRW', availability: 'in_stock', match_type: 'similar',
    placement_reason: '거실 영역을 부드럽게 구분하고 가구들을 시각적으로 연결해 줍니다.', placement: { center_x: 57, center_y: 88, width: 59, height: 18, rotation_degrees: 0 },
  },
]

export function createDemoDesign(maxAmount: number): DesignJob {
  const total = demoFurniture.reduce((sum, item) => sum + item.subtotal, 0)
  return {
    design_id: 'demo-design', status: 'succeeded', progress: 100, poll_after_ms: null, error: null,
    result: {
      summary: '임시 데모 데이터로 만든 따뜻한 모던 거실 배치안이에요. 백엔드 연동 전에도 결과 화면과 상호작용을 확인할 수 있습니다.',
      rendered_image: { url: '/images/demo-room-styled.png', width: 1536, height: 1024, expires_at: '' },
      budget: { estimated_furniture_total: total, requested_max_amount: maxAmount, within_budget: total <= maxAmount },
      furniture_items: demoFurniture,
      warnings: ['현재는 백엔드 스타일 목록이 비어 있어 임시 데모 데이터로 표시하고 있습니다.'],
    },
  }
}
