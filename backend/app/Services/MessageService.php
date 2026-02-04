<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserMessage;

class MessageService
{
    /**
     * Send a notification to a user
     */
    public static function sendNotification(User $user, string $title, string $content): UserMessage
    {
        return UserMessage::create([
            'user_id' => $user->id,
            'type' => 'notification',
            'title' => $title,
            'content' => $content,
            'read_status' => false,
        ]);
    }

    /**
     * Send a diamond code to a user
     */
    public static function sendCode(User $user, string $title, string $content, string $code): UserMessage
    {
        return UserMessage::create([
            'user_id' => $user->id,
            'type' => 'code',
            'title' => $title,
            'content' => $content,
            'code' => $code,
            'read_status' => false,
        ]);
    }

    /**
     * Send an order confirmation to a user
     */
    public static function sendOrderConfirmation(User $user, string $title, string $content): UserMessage
    {
        return UserMessage::create([
            'user_id' => $user->id,
            'type' => 'order',
            'title' => $title,
            'content' => $content,
            'read_status' => false,
        ]);
    }

    /**
     * Send notification to multiple users
     */
    public static function broadcastNotification(string $title, string $content, ?array $userIds = null): int
    {
        $query = User::query();

        if ($userIds) {
            $query->whereIn('id', $userIds);
        }

        $users = $query->get();
        $count = 0;

        foreach ($users as $user) {
            self::sendNotification($user, $title, $content);
            $count++;
        }

        return $count;
    }
}
