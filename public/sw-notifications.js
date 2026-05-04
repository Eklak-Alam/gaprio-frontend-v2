// Gaprio Service Worker for Push Notifications
// This runs independently of the main page — works even when tab is in background

const POLL_INTERVAL = 15000; // 15 seconds
let pollTimer = null;
let apiBaseUrl = '';
let authToken = '';
let refreshToken = '';
let knownActionIds = new Set();

// ═══════════════════════════════════════════════
// PERSISTENT STORAGE (survives SW restarts)
// ═══════════════════════════════════════════════

async function saveCredentials() {
    try {
        const cache = await caches.open('gaprio-sw-data');
        const data = JSON.stringify({ apiBaseUrl, authToken, refreshToken, knownIds: Array.from(knownActionIds) });
        await cache.put('/_sw_credentials', new Response(data));
    } catch (e) { /* silent */ }
}

async function loadCredentials() {
    try {
        const cache = await caches.open('gaprio-sw-data');
        const response = await cache.match('/_sw_credentials');
        if (response) {
            const data = JSON.parse(await response.text());
            apiBaseUrl = data.apiBaseUrl || '';
            authToken = data.authToken || '';
            refreshToken = data.refreshToken || '';
            knownActionIds = new Set(data.knownIds || []);
            return true;
        }
    } catch (e) { /* silent */ }
    return false;
}

// ═══════════════════════════════════════════════
// MESSAGE HANDLING (from main app)
// ═══════════════════════════════════════════════

self.addEventListener('message', (event) => {
    const { type, data } = event.data;

    event.waitUntil((async () => {
        switch (type) {
            case 'INIT':
                apiBaseUrl = data.apiBaseUrl;
                authToken = data.authToken;
                refreshToken = data.refreshToken;
                knownActionIds = new Set(data.knownActionIds || []);
                await saveCredentials();
                startPolling();
                console.log('[Gaprio SW] Initialized with API:', apiBaseUrl);
                break;

            case 'UPDATE_TOKEN':
                await loadCredentials(); // Load existing state first so we don't wipe apiBaseUrl
                authToken = data.authToken;
                if (data.refreshToken) refreshToken = data.refreshToken;
                await saveCredentials();
                break;

            case 'UPDATE_KNOWN_IDS':
                await loadCredentials();
                knownActionIds = new Set(data.knownActionIds || []);
                await saveCredentials();
                break;

            case 'ACTION_HANDLED':
                // Used to clear knownActionIds.delete(data.actionId) here, but doing so 
                // caused duplicate notifications if the backend was slow to update.
                // Leaving it in knownActionIds prevents re-triggering.
                await loadCredentials();
                await saveCredentials();
                break;

            case 'STOP':
                stopPolling();
                break;

            case 'POLL_NOW':
                await pollForActions();
                break;
        }
    })());
});

// ═══════════════════════════════════════════════
// NOTIFICATION CLICK — Execute/Dismiss directly
// ═══════════════════════════════════════════════

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const clickedAction = event.action; // 'execute', 'dismiss', or '' (clicked body)
    const notifData = event.notification.data || {};
    const actionId = notifData.actionId;
    // Credentials stored in notification data as fallback (survives SW restarts)
    const notifApiUrl = notifData.apiBaseUrl;
    const notifToken = notifData.authToken;
    const notifRefreshToken = notifData.refreshToken;

    event.waitUntil((async () => {
        // Load credentials from cache if they're not in memory
        if (!apiBaseUrl || !authToken) {
            await loadCredentials();
        }

        // MUST prioritize active/cached token over the token baked into the notification data!
        const finalApiUrl = apiBaseUrl || notifApiUrl;
        let finalToken = authToken || notifToken;

        // Execute: either clicked the "Execute" button OR clicked the notification body
        if (actionId && (clickedAction === 'execute' || clickedAction === '')) {
            if (finalApiUrl && finalToken) {
                try {
                    const performExecute = async (token) => {
                        return fetch(`${finalApiUrl}/monitoring/actions/${actionId}/execute`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });
                    };

                    let resp = await performExecute(finalToken);

                    // Token refresh logic on 401 Unauthorized
                    if (resp.status === 401) {
                        const currentRefreshToken = refreshToken || notifRefreshToken;
                        if (currentRefreshToken) {
                            try {
                                const refreshResp = await fetch(`${finalApiUrl}/auth/refresh-token`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ refreshToken: currentRefreshToken })
                                });
                                if (refreshResp.ok) {
                                    const refreshData = await refreshResp.json();
                                    finalToken = refreshData.data.accessToken;
                                    authToken = finalToken;
                                    await saveCredentials();
                                    resp = await performExecute(finalToken);
                                }
                            } catch (refreshErr) {
                                console.error('SW background refresh failed:', refreshErr.message);
                            }
                        }
                    }

                    console.log('[Gaprio SW] Execute result:', resp.status);

                    if (!resp.ok) {
                        throw new Error(`API returned ${resp.status}: ${await resp.text()}`);
                    }

                    // Notify tabs ONLY IF SUCCESSFUL
                    const allClients = await clients.matchAll({ type: 'window' });
                    allClients.forEach(client => {
                        client.postMessage({ type: 'ACTION_EXECUTED', actionId });
                    });
                } catch (err) {
                    console.error('[Gaprio SW] Execute failed:', err.message);

                    // Send error to backend so we can see it in terminal logs
                    try {
                        await fetch(`${finalApiUrl}/monitoring/debug-sw`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ error: err.message, stack: err.stack, type: 'execute_catch' })
                        });
                    } catch (e) { }
                }
            } else {
                console.warn('[Gaprio SW] No credentials for execute. apiUrl:', !!finalApiUrl, 'token:', !!finalToken);
            }
        } else if (actionId && clickedAction === 'dismiss') {
            if (finalApiUrl && finalToken) {
                try {
                    let resp = await fetch(`${finalApiUrl}/monitoring/actions/${actionId}/reject`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${finalToken}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (resp.status === 401) {
                        const currentRefreshToken = refreshToken || notifRefreshToken;
                        if (currentRefreshToken) {
                            try {
                                const refreshResp = await fetch(`${finalApiUrl}/auth/refresh-token`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ refreshToken: currentRefreshToken })
                                });
                                if (refreshResp.ok) {
                                    const refreshData = await refreshResp.json();
                                    finalToken = refreshData.data.accessToken;
                                    authToken = finalToken;
                                    await saveCredentials();
                                    resp = await fetch(`${finalApiUrl}/monitoring/actions/${actionId}/reject`, {
                                        method: 'POST',
                                        headers: {
                                            'Authorization': `Bearer ${finalToken}`,
                                            'Content-Type': 'application/json'
                                        }
                                    });
                                }
                            } catch (e) { }
                        }
                    }

                    console.log('[Gaprio SW] Dismiss result:', resp.status);

                    if (!resp.ok) {
                        throw new Error(`API returned ${resp.status}: ${await resp.text()}`);
                    }

                    const allClients = await clients.matchAll({ type: 'window' });
                    allClients.forEach(client => {
                        client.postMessage({ type: 'ACTION_DISMISSED', actionId });
                    });
                } catch (err) {
                    console.error('[Gaprio SW] Dismiss failed:', err.message);
                }
            }
        }

        // Always focus or open the dashboard
        const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
        let isFocused = false;

        for (const client of clientList) {
            if (client.url.includes('/dashboard') && 'focus' in client) {
                isFocused = true;
                return client.focus();
            }
        }

        // If no dashboard is open, explicitly open one so the user isn't stuck
        if (!isFocused && clients.openWindow) {
            return clients.openWindow('/dashboard');
        }
    })());
});

self.addEventListener('notificationclose', (event) => {
    // User swiped away / closed — treat as "later", no API call
});

// Force activate new SW immediately (skip waiting)
self.addEventListener('install', (event) => {
    console.log('[Gaprio SW] Installing...');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[Gaprio SW] Activated!');
    event.waitUntil(clients.claim());
});

// ═══════════════════════════════════════════════
// POLLING
// ═══════════════════════════════════════════════

function startPolling() {
    stopPolling();
    pollForActions();
    pollTimer = setInterval(pollForActions, POLL_INTERVAL);
}

function stopPolling() {
    if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
    }
}

async function pollForActions() {
    if (!apiBaseUrl || !authToken) {
        // Try loading from cache
        const loaded = await loadCredentials();
        if (!loaded || !apiBaseUrl || !authToken) return;
    }

    try {
        const response = await fetch(`${apiBaseUrl}/monitoring/actions?status=pending`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) return;

        const result = await response.json();
        const pendingActions = result.data || [];

        const newActions = pendingActions.filter(a => !knownActionIds.has(a.id));

        if (newActions.length > 0) {
            newActions.forEach(a => knownActionIds.add(a.id));
            saveCredentials();

            for (const action of newActions) {
                await showActionNotification(action);
            }

            const allClients = await clients.matchAll({ type: 'window' });
            allClients.forEach(client => {
                client.postMessage({
                    type: 'NEW_ACTIONS',
                    actions: newActions,
                    pendingCount: pendingActions.length,
                    knownIds: Array.from(knownActionIds)
                });
            });
        }
    } catch (err) {
        // Silent fail
    }
}

// ═══════════════════════════════════════════════
// NOTIFICATION DISPLAY
// ═══════════════════════════════════════════════

const TOOL_LABELS = {
    slack_post_message: 'Slack',
    slack_read_messages: 'Slack',
    asana_create_task: 'Asana',
    asana_list_tasks: 'Asana',
    google_create_draft: 'Gmail',
    google_send_email: 'Gmail',
    google_list_emails: 'Gmail',
    google_create_event: 'Calendar',
    google_list_events: 'Calendar',
    google_create_doc: 'Google Docs',
    github_create_issue: 'GitHub',
};

async function showActionNotification(action) {
    const label = TOOL_LABELS[action.suggested_tool] || 'Action';
    const title = `Gaprio • ${label}`;
    const body = action.description || 'New suggested action available';

    try {
        await self.registration.showNotification(title, {
            body: body + '\n\nClick to execute this action.',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: `gaprio-action-${action.id}`,
            requireInteraction: true,
            data: {
                actionId: action.id,
                tool: action.suggested_tool,
                // Store credentials in notification data as backup
                apiBaseUrl: apiBaseUrl,
                authToken: authToken,
                refreshToken: refreshToken,
                url: '/dashboard'
            },
            actions: [
                { action: 'execute', title: '▶ Execute' },
                { action: 'dismiss', title: '✕ Dismiss' }
            ]
        });
    } catch (err) {
        console.error('[Gaprio SW] showNotification failed:', err);
    }
}