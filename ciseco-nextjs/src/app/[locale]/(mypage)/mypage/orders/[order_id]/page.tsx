export default function OrderDetailPage({
  params: { order_id },
}: {
  params: { order_id: string }
}) {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>주문 상세</h1>
      <p style={{ fontSize: 16, color: '#999', marginTop: 8 }}>주문번호: {order_id}</p>
      <p style={{ fontSize: 16, color: '#999', marginTop: 4 }}>Phase 5 확장 또는 별도 폐이즈에서 구현됩니다.</p>
    </div>
  )
}
