"use client";

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Pencil } from 'lucide-react';

export function InstituteProfileCard() {
  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <div className="h-24 bg-gradient-to-r from-gray-800 to-gray-900 relative">
        {/* Cover Image Placeholder */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=500&q=60')] bg-cover bg-center opacity-40"></div>
      </div>
      <div className="px-6 pb-6 relative">
        <div className="flex justify-between items-end -mt-10 mb-4">
          <div className="relative">
            <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 shadow-lg">
                <div className="h-full w-full bg-white rounded-[10px] flex items-center justify-center overflow-hidden">
                  {/* Logo Placeholder */}
                  <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 text-xs text-center leading-tight">
                    Kiwi<br/>Cloud
                  </span>
                </div>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Kiwi Cloud</h2>
            <p className="text-sm text-gray-500">Institute Admin</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 rounded-full border-blue-600 text-blue-600 hover:bg-blue-50 h-9 text-xs font-medium">
            Public View
          </Button>
          <Button className="flex-1 rounded-full bg-blue-600 hover:bg-blue-700 h-9 text-xs font-medium">
            <Plus className="h-3 w-3 mr-1" /> Create
          </Button>
          <Button variant="outline" size="icon" className="rounded-full h-9 w-9 shrink-0 bg-indigo-100 border-slate-200">
            <Pencil className="h-4 w-4 text-gray-600" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
