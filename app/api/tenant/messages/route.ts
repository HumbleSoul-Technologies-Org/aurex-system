import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'tenant-messages.json');

export async function GET() {
  try {
    const content = await fs.readFile(dataPath, 'utf8').catch(() => '[]');
    const messages = JSON.parse(content || '[]');
    return NextResponse.json(messages);
  } catch (err) {
    return new NextResponse('Error reading messages', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const raw = await fs.readFile(dataPath, 'utf8').catch(() => '[]');
    const messages = JSON.parse(raw || '[]');

    const message = {
      id: Date.now().toString(),
      text: typeof body.text === 'string' ? body.text : '',
      fromTenant: !!body.fromTenant,
      createdAt: new Date().toISOString(),
    };

    messages.push(message);

    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    await fs.writeFile(dataPath, JSON.stringify(messages, null, 2), 'utf8');

    return NextResponse.json(message, { status: 201 });
  } catch (err) {
    return new NextResponse('Error saving message', { status: 500 });
  }
}
