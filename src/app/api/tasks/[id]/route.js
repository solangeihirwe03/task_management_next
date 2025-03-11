import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const updates = await request.json();

    await connectDB();
    const task = await Task.findOne({ _id: id, user: session.user._id });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    Object.assign(task, updates);
    await task.save();

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Error updating task' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    await connectDB();
    const task = await Task.findOneAndDelete({ _id: id, user: session.user._id });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: error.message || 'Error deleting task' },
      { status: 500 }
    );
  }
} 