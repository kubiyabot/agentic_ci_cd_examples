import { NextRequest, NextResponse } from 'next/server';
import { createUser, getAllUsers, CreateUserRequest } from '@/lib/user-service';

export async function GET() {
  const users = getAllUsers();
  return NextResponse.json({ success: true, users });
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateUserRequest = await request.json();
    const result = createUser(body);

    return NextResponse.json(result, {
      status: result.success ? 201 : 400,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Invalid request' },
      { status: 400 }
    );
  }
}
