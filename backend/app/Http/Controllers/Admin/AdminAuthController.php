<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class AdminAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'code' => ['required', 'string', 'min:4', 'max:128'],
        ]);

        $inputCode = (string) $request->input('code');
        $storedCode = SiteSetting::query()->where('key', 'admin_code')->value('value');
        $expectedCode = $storedCode !== null && $storedCode !== ''
            ? (string) $storedCode
            : (string) env('ADMIN_ACCESS_CODE', '123456');

        if (!hash_equals($expectedCode, $inputCode)) {
            return response()->json(['message' => 'Code admin invalide'], 422);
        }

        $token = Str::random(64);
        $hours = max(1, (int) env('ADMIN_SESSION_HOURS', 12));

        Cache::put($this->cacheKey($token), [
            'issued_at' => now()->toIso8601String(),
        ], now()->addHours($hours));

        return response()->json([
            'token' => $token,
            'expires_in_hours' => $hours,
        ]);
    }

    public function session(Request $request)
    {
        $token = (string) $request->attributes->get('admin_token');
        $session = Cache::get($this->cacheKey($token));

        return response()->json([
            'authenticated' => true,
            'session' => $session,
        ]);
    }

    public function logout(Request $request)
    {
        $token = (string) $request->attributes->get('admin_token');
        Cache::forget($this->cacheKey($token));

        return response()->json(['ok' => true]);
    }

    private function cacheKey(string $token): string
    {
        return "admin_session:{$token}";
    }
}
