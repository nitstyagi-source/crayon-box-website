"use client";

import React, { useState, useEffect } from 'react';
import {
  Globe,
  KeyRound,
  Layers,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Download,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { VastuModuleBanner } from '@/components/common/VastuModuleBanner';

export default function OneRosterIntegrationPage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testEndpoint, setTestEndpoint] = useState<'users' | 'classes' | 'orgs' | 'courses'>('users');
  const [apiResponse, setApiResponse] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const endpoints = [
    { name: 'Roster Users (Students & Faculty)', path: '/api/oneroster/v1p2/users', key: 'users' },
    { name: 'Classes & Sections', path: '/api/oneroster/v1p2/classes', key: 'classes' },
    { name: 'Organizations & Campuses', path: '/api/oneroster/v1p2/orgs', key: 'orgs' },
    { name: 'Courses & Subject Curricula', path: '/api/oneroster/v1p2/courses', key: 'courses' }
  ];

  const fetchSample = async (ep: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/oneroster/v1p2/${ep}?limit=5`);
      const data = await res.json();
      setApiResponse(data);
    } catch (e: any) {
      setApiResponse({ error: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSample(testEndpoint);
  }, [testEndpoint]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      <VastuModuleBanner
        badgeText="1EDTECH GLOBAL INTEROPERABILITY"
        title="OneRoster v1.2 & LTI 1.3 Advantage Gateway"
        description="Connect institutional rosters automatically with Google Classroom, Canvas LMS, Schoology, and Apple School Manager."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: API Keys & Endpoints (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 border-stone-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-600" /> Authorized API Credentials
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-stone-400 block mb-1">
                  Base OneRoster REST URI
                </label>
                <div className="flex items-center gap-2 p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="font-mono text-stone-700 truncate text-[11px] flex-1">
                    https://www.crayonboxschool.com/api/oneroster/v1p2
                  </span>
                  <button
                    onClick={() => copyToClipboard('https://www.crayonboxschool.com/api/oneroster/v1p2', 'uri')}
                    className="text-stone-400 hover:text-stone-800"
                  >
                    {copiedKey === 'uri' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-stone-400 block mb-1">
                  LTI 1.3 OIDC Launch URL
                </label>
                <div className="flex items-center gap-2 p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="font-mono text-stone-700 truncate text-[11px] flex-1">
                    https://www.crayonboxschool.com/api/lti/launch
                  </span>
                  <button
                    onClick={() => copyToClipboard('https://www.crayonboxschool.com/api/lti/launch', 'lti')}
                    className="text-stone-400 hover:text-stone-800"
                  >
                    {copiedKey === 'lti' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/60 text-emerald-900 text-[11px] space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 1EdTech Certified Spec
                </span>
                <p className="text-stone-600 leading-relaxed">
                  Compatible with Google Classroom Roster Sync and Canvas SIS Integration.
                </p>
              </div>
            </div>
          </Card>

          {/* Endpoint Selector */}
          <Card className="p-4 border-stone-200 shadow-xs space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              Inspect Live Endpoints
            </h4>
            {endpoints.map((ep) => (
              <button
                key={ep.key}
                onClick={() => setTestEndpoint(ep.key as any)}
                className={`w-full text-left p-2.5 rounded-xl border transition text-xs font-semibold cursor-pointer ${
                  testEndpoint === ep.key
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div>{ep.name}</div>
                <div className={`font-mono text-[10px] ${testEndpoint === ep.key ? 'text-amber-100' : 'text-stone-400'}`}>
                  {ep.path}
                </div>
              </button>
            ))}
          </Card>
        </div>

        {/* Right Column: Live JSON Output (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="p-5 border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-bold text-stone-800">
                  Live Response: <code className="text-[11px] text-sky-700">/api/oneroster/v1p2/{testEndpoint}</code>
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchSample(testEndpoint)}
                disabled={isLoading}
                className="text-xs font-semibold gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} /> Test Query
              </Button>
            </div>

            <pre className="p-4 bg-stone-900 text-emerald-400 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-[460px] custom-scrollbar">
              {isLoading ? 'Querying OneRoster API...' : JSON.stringify(apiResponse, null, 2)}
            </pre>
          </Card>
        </div>
      </div>
    </div>
  );
}
