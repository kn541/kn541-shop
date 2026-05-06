/** 메인 카트 프리뷰 모달용 — CartPopup · MainProductCard 공유 */

export type MainCartPreviewPayload = {
  imageUrl: string
  titleLine1: string
  titleLine2: string
  price: number
  originalPrice: number
  discountRate: number
  productId: string
  name: string
  stockQty: number
  shippingFee: number
  freeShippingOver: number
  scType: number
}
