/**
 * 스타일 태그의 단일 출처입니다.
 * 추후 CMS 또는 API 응답으로 교체해도 폼 컴포넌트는 변경할 필요가 없습니다.
 */
export interface StyleOption {
  id: string
  label: string
  accentColor: string
}

export const styleOptions: StyleOption[] = [
  { id: 'modern', label: '모던', accentColor: '#8794a4' },
  { id: 'minimal', label: '미니멀', accentColor: '#e9e5df' },
  { id: 'vintage', label: '빈티지', accentColor: '#b57b4d' },
  { id: 'nordic', label: '북유럽', accentColor: '#ddc391' },
  { id: 'dark', label: '다크', accentColor: '#292929' },
]
