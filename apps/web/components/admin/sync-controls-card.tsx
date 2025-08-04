'use client';

import { useState } from 'react';
import { useAction } from 'convex/react';
import { api } from '@/lib/convex-api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@starter/ui';
import { Button } from '@starter/ui';
import { Input } from '@starter/ui';
import { Badge } from '@starter/ui';
import { Progress } from '@starter/ui';
import { Download, Search, User, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface SyncControlsCardProps {
  onSyncComplete?: () => void;
}

interface SyncResult {
  success: boolean;
  totalSynced?: number;
  trace_id?: string;
  user_id?: string;
  syncedAt?: number;
  error?: string;
}

export function SyncControlsCard({ onSyncComplete }: SyncControlsCardProps) {
  const [traceId, setTraceId] = useState('');
  const [userId, setUserId] = useState('');
  const [syncOperation, setSyncOperation] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  const syncAllLogs = useAction(api.workerSync.syncAllLogs);
  const syncByTrace = useAction(api.workerSync.syncByTrace);
  const syncByUser = useAction(api.workerSync.syncByUser);

  const handleSyncAll = async () => {
    setSyncOperation('all');
    setSyncResult(null);

    try {
      const result = await syncAllLogs({});
      setSyncResult({
        success: true,
        totalSynced: result.totalSynced,
        syncedAt: result.syncedAt
      });
      onSyncComplete?.();
    } catch (error) {
      setSyncResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setSyncOperation(null);
    }
  };

  const handleSyncByTrace = async () => {
    if (!traceId.trim()) {
      setSyncResult({
        success: false,
        error: 'Trace ID is required'
      });
      return;
    }

    setSyncOperation('trace');
    setSyncResult(null);

    try {
      const result = await syncByTrace({ trace_id: traceId.trim() });
      setSyncResult({
        success: true,
        totalSynced: result.totalSynced,
        trace_id: result.trace_id,
        syncedAt: result.syncedAt
      });
      onSyncComplete?.();
      setTraceId(''); // Clear input on success
    } catch (error) {
      setSyncResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setSyncOperation(null);
    }
  };

  const handleSyncByUser = async () => {
    if (!userId.trim()) {
      setSyncResult({
        success: false,
        error: 'User ID is required'
      });
      return;
    }

    setSyncOperation('user');
    setSyncResult(null);

    try {
      const result = await syncByUser({ user_id: userId.trim() });
      setSyncResult({
        success: true,
        totalSynced: result.totalSynced,
        user_id: result.user_id,
        syncedAt: result.syncedAt
      });
      onSyncComplete?.();
      setUserId(''); // Clear input on success
    } catch (error) {
      setSyncResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setSyncOperation(null);
    }
  };

  const clearResult = () => {
    setSyncResult(null);
  };

  const isLoading = syncOperation !== null;
  const getLoadingText = () => {
    switch (syncOperation) {
      case 'all': return 'Syncing all logs from Redis...';
      case 'trace': return `Syncing trace ${traceId}...`;
      case 'user': return `Syncing logs for user ${userId}...`;
      default: return 'Processing...';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Data Sync Controls
        </CardTitle>
        <CardDescription>
          Pull log data from Redis buffer to Convex for analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sync All Section */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-medium">Sync All Logs</h4>
              <p className="text-sm text-muted-foreground">
                Import all available logs from Redis to Convex
              </p>
            </div>
            <Button
              onClick={handleSyncAll}
              disabled={isLoading}
              variant="default"
            >
              {syncOperation === 'all' ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Sync All
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Sync by Trace Section */}
        <div className="border rounded-lg p-4">
          <div className="mb-3">
            <h4 className="font-medium flex items-center gap-2">
              <Search className="h-4 w-4" />
              Sync by Trace ID
            </h4>
            <p className="text-sm text-muted-foreground">
              Import logs for a specific trace correlation ID
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Enter trace ID..."
              value={traceId}
              onChange={(e) => setTraceId(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSyncByTrace}
              disabled={isLoading || !traceId.trim()}
              variant="outline"
            >
              {syncOperation === 'trace' ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Sync Trace
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Sync by User Section */}
        <div className="border rounded-lg p-4">
          <div className="mb-3">
            <h4 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Sync by User ID
            </h4>
            <p className="text-sm text-muted-foreground">
              Import logs for a specific user across all traces
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Enter user ID..."
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSyncByUser}
              disabled={isLoading || !userId.trim()}
              variant="outline"
            >
              {syncOperation === 'user' ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <User className="h-4 w-4 mr-2" />
                  Sync User
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Loading Progress */}
        {isLoading && (
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="flex items-center gap-3 mb-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="font-medium">Sync in Progress</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{getLoadingText()}</p>
            <Progress value={undefined} className="h-2" />
          </div>
        )}

        {/* Sync Result */}
        {syncResult && (
          <div className={`border rounded-lg p-4 ${
            syncResult.success 
              ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
              : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {syncResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="font-medium">
                  {syncResult.success ? 'Sync Completed' : 'Sync Failed'}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={clearResult}>
                ✕
              </Button>
            </div>
            
            {syncResult.success ? (
              <div className="space-y-1 text-sm">
                <p>
                  <strong>{syncResult.totalSynced}</strong> logs synced successfully
                </p>
                {syncResult.trace_id && (
                  <p>Trace ID: <Badge variant="outline">{syncResult.trace_id}</Badge></p>
                )}
                {syncResult.user_id && (
                  <p>User ID: <Badge variant="outline">{syncResult.user_id}</Badge></p>
                )}
                {syncResult.syncedAt && (
                  <p className="text-muted-foreground">
                    Synced at: {new Date(syncResult.syncedAt).toLocaleString()}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-red-600 dark:text-red-400">
                {syncResult.error}
              </p>
            )}
          </div>
        )}

        {/* Important Notes */}
        <div className="text-xs text-muted-foreground border-t pt-3 space-y-1">
          <p>• Syncing preserves existing logs and prevents duplicates</p>
          <p>• Large sync operations may take several minutes to complete</p>
          <p>• Redis data has a 1-hour TTL - sync frequently for data preservation</p>
        </div>
      </CardContent>
    </Card>
  );
}