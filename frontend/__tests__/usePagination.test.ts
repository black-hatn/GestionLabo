import { renderHook, act } from '@testing-library/react'
import { usePagination } from '@/hooks/usePagination'

describe('usePagination', () => {
  it('initializes with correct values', () => {
    const { result } = renderHook(() => usePagination(1, 10))
    expect(result.current.page).toBe(1)
    expect(result.current.limit).toBe(10)
  })

  it('can go to next page', () => {
    const { result } = renderHook(() => usePagination(1, 10))
    act(() => {
      result.current.nextPage()
    })
    expect(result.current.page).toBe(2)
  })

  it('can go to previous page', () => {
    const { result } = renderHook(() => usePagination(2, 10))
    act(() => {
      result.current.prevPage()
    })
    expect(result.current.page).toBe(1)
  })

  it('prevents going below page 1', () => {
    const { result } = renderHook(() => usePagination(1, 10))
    act(() => {
      result.current.prevPage()
    })
    expect(result.current.page).toBe(1)
  })

  it('can change page limit', () => {
    const { result } = renderHook(() => usePagination(1, 10))
    act(() => {
      result.current.setPageLimit(25)
    })
    expect(result.current.limit).toBe(25)
    expect(result.current.page).toBe(1)
  })
})
