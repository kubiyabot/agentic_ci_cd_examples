import { NextRequest, NextResponse } from 'next/server';
import { processPayment, PaymentRequest } from '@/lib/payment-processor';

export async function POST(request: NextRequest) {
  try {
    const body: PaymentRequest = await request.json();

    const result = await processPayment(body);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Invalid request' },
      { status: 400 }
    );
  }
}
