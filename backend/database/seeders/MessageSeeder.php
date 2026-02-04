<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserMessage;
use Illuminate\Database\Seeder;

class MessageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Find or create a test user
        $user = User::first();

        if (!$user) {
            $user = User::create([
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => bcrypt('password'),
            ]);
        }

        // Create sample messages
        UserMessage::create([
            'user_id' => $user->id,
            'type' => 'notification',
            'title' => 'Bienvenue sur Nexi Shop',
            'content' => 'Merci de vous être inscrit ! Explorez notre catalogue de diamants et abonnements exclusifs.',
            'read_status' => false,
        ]);

        UserMessage::create([
            'user_id' => $user->id,
            'type' => 'code',
            'title' => 'Votre code diamants',
            'content' => 'Voici votre code d\'accès pour les diamants que vous avez achetés. Utilisez-le dans Free Fire.',
            'code' => 'FREE-DIAMOND-2024-1A2B3C4D',
            'read_status' => false,
        ]);

        UserMessage::create([
            'user_id' => $user->id,
            'type' => 'order',
            'title' => 'Commande confirmée',
            'content' => 'Votre commande de 220 diamants a été confirmée et traitée avec succès. Les codes seront disponibles immédiatement.',
            'read_status' => true,
        ]);

        UserMessage::create([
            'user_id' => $user->id,
            'type' => 'notification',
            'title' => 'Nouvelle offre disponible',
            'content' => 'Un nouvel abonnement premium est maintenant disponible ! Profitez de 15% de réduction les 7 premiers jours.',
            'read_status' => false,
        ]);
    }
}
