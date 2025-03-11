import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?._id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const tasks = await Task.find({ user: session.user._id }).sort({ createdAt: -1 });

        return NextResponse.json(tasks);
    } catch (error) {
        return NextResponse.json(
            { error: error.message || 'Error fetching tasks' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?._id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, description } = await request.json();

        if (!title) {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            );
        }

        await connectDB();
        const task = await Task.create({
            title,
            description,
            user: session.user._id,
        });

        return NextResponse.json(task, { status: 201 });
    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json(
            { error: error.message || 'Error creating task' },
            { status: 500 }
        );
    }
} 