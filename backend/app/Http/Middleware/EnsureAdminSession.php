<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminSession
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken() ?: $request->header('X-Admin-Token');

        if (!$token || !Cache::has($this->cacheKey($token))) {
            return response()->json(['message' => 'Session admin invalide'], 401);
        }

        $request->attributes->set('admin_token', $token);

        return $next($request);
    }

    private function cacheKey(string $token): string
    {
        return "admin_session:{$token}";
    }
}
