<?php

namespace App\Http\Controllers;

use App\Models\UserMessage;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * Get all messages for the authenticated user
     */
    public function index(Request $request)
    {
        $messages = UserMessage::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $messages,
        ]);
    }

    /**
     * Get unread messages count for the authenticated user
     */
    public function unreadCount(Request $request)
    {
        $count = UserMessage::where('user_id', $request->user()->id)
            ->unread()
            ->count();

        return response()->json([
            'success' => true,
            'unread_count' => $count,
        ]);
    }

    /**
     * Mark a message as read
     */
    public function markAsRead(Request $request, UserMessage $message)
    {
        // Check if the message belongs to the authenticated user
        if ($message->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $message->update(['read_status' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Message marked as read',
        ]);
    }

    /**
     * Mark a message as unread
     */
    public function markAsUnread(Request $request, UserMessage $message)
    {
        // Check if the message belongs to the authenticated user
        if ($message->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $message->update(['read_status' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Message marked as unread',
        ]);
    }

    /**
     * Mark all messages as read
     */
    public function markAllAsRead(Request $request)
    {
        UserMessage::where('user_id', $request->user()->id)
            ->unread()
            ->update(['read_status' => true]);

        return response()->json([
            'success' => true,
            'message' => 'All messages marked as read',
        ]);
    }

    /**
     * Delete a message
     */
    public function destroy(Request $request, UserMessage $message)
    {
        // Check if the message belongs to the authenticated user
        if ($message->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $message->delete();

        return response()->json([
            'success' => true,
            'message' => 'Message deleted',
        ]);
    }
}
