import Contact from "@/models/Contact";

export async function GET(request, context) {
  const { id } = await context.params;
  try {
    await connectDB();
    const message = await Contact.findById(id)
    if (!message) {
      return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: message });
  } catch (error) {
    console.error(`Error fetching message ${id}:`, error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  const { id } = await context.params;
  try {
    await connectDB();
    const deletedMessage = await Contact.findByIdAndDelete(id);

    if (!deletedMessage) {
      return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    console.error(`Error deleting message ${id}:`, error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}