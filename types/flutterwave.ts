export interface FlutterwaveConfig {
    public_key: string
    tx_ref: string
    amount: number
    currency: string
    payment_options: string
    meta: {
      userId: string
    }
    customer: {
      email: string
      name: string
    }
    customizations: {
      title: string
      description: string
      logo: string
    }
    callback: (response: FlutterwaveResponse) => Promise<void>
    onclose: () => void
  }
  
  export interface FlutterwaveResponse {
    transaction_id: string
    tx_ref: string
    flw_ref: string
    status: string
    amount: number
    currency: string
    customer: {
      email: string
      name: string
    }
  }
  
  declare global {
    interface Window {
      FlutterwaveCheckout: (config: FlutterwaveConfig) => void
    }
  }
  
  