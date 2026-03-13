const MSP_API_BASE = 'https://api.multisafepay.com/v1/json'

type MspOrderPayload = {
  type: 'redirect'
  order_id: string
  currency: string
  amount: number
  description: string
  payment_options: {
    notification_url: string
    redirect_url: string
    cancel_url: string
    close_window: boolean
  }
  customer?: {
    email: string
  }
  gateway?: string
}

type MspOrderResponse = {
  success: boolean
  data: {
    order_id: string
    payment_url: string
  }
}

type MspStatusResponse = {
  success: boolean
  data: {
    order_id: string
    status: string
    financial_status: string
    amount: number
    currency: string
    transaction_id: string
  }
}

export async function createMspOrder(payload: MspOrderPayload): Promise<MspOrderResponse> {
  const res = await fetch(`${MSP_API_BASE}/orders`, {
    method: 'POST',
    headers: {
      'api_key': process.env.MULTISAFEPAY_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(`MultiSafepay fout: ${res.status}`)
  }

  return res.json() as Promise<MspOrderResponse>
}

export async function getMspOrder(orderId: string): Promise<MspStatusResponse> {
  const res = await fetch(`${MSP_API_BASE}/orders/${orderId}`, {
    headers: { 'api_key': process.env.MULTISAFEPAY_API_KEY! },
  })

  if (!res.ok) {
    throw new Error(`MultiSafepay status fout: ${res.status}`)
  }

  return res.json() as Promise<MspStatusResponse>
}
