import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, MapPin, CheckCircle } from 'lucide-react';
import { ParcelStatus } from '../types';

export const Tracking: React.FC = () => {
  const { parcels, getOfficeName } = useApp();
  const [searchId, setSearchId] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const found = parcels.find(p => p.trackingId === searchId.trim());
    setResult(found || 'NOT_FOUND');
  };

  const TimelineItem = ({ completed, current, label, time }: any) => (
    <div className="flex items-start mb-8 last:mb-0 relative">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 
        ${completed ? 'bg-emerald-500 border-emerald-600 text-white' : 
          current ? 'bg-sky-500 border-sky-600 text-white' : 'bg-white border-slate-300 text-slate-300'}`}>
        {completed ? <CheckCircle className="w-4 h-4" /> : <div className={`w-2 h-2 rounded-full ${current ? 'bg-white' : 'bg-slate-300'}`} />}
      </div>
      <div className="ml-6">
        <p className={`text-lg font-bold ${completed || current ? 'text-slate-800' : 'text-slate-300'}`}>{label}</p>
        {time && <p className="text-sm text-slate-500 font-medium mt-1">{new Date(time).toLocaleTimeString()}</p>}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">Track Your Parcel</h2>
        <p className="text-slate-500 text-lg">Enter your ID to see where your package is.</p>
      </div>

      <form onSubmit={handleTrack} className="flex gap-3 mb-12 p-3 bg-white rounded-2xl shadow-sm border border-slate-200">
        <input 
          type="text" 
          placeholder="e.g. TRK-123456" 
          className="flex-1 p-4 rounded-xl text-lg font-bold text-slate-800 placeholder:text-slate-300 outline-none"
          value={searchId}
          onChange={e => setSearchId(e.target.value)}
        />
        <button className="bg-teal-600 text-white px-8 rounded-xl font-bold hover:bg-teal-700 border border-teal-700 transition-colors">
          Search
        </button>
      </form>

      {result === 'NOT_FOUND' && (
        <div className="p-6 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-center font-bold">
          We couldn't find that Tracking ID. Please check it.
        </div>
      )}

      {result && result !== 'NOT_FOUND' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
          <div className="bg-slate-50 p-8 border-b border-slate-200">
             <div className="flex justify-between items-end">
                <div>
                   <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Tracking ID</p>
                   <p className="text-3xl font-extrabold text-slate-800">{result.trackingId}</p>
                </div>
                <div className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide border
                    ${result.currentStatus === ParcelStatus.DELIVERED ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-sky-100 text-sky-700 border-sky-200'}`}>
                    {result.currentStatus.replace('_', ' ')}
                </div>
             </div>
          </div>

          <div className="p-8 md:p-10">
             <div className="mb-10 flex gap-4">
                <div className="flex-1 p-5 bg-white border border-slate-200 rounded-2xl">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">From</p>
                    <p className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                        <MapPin className="w-5 h-5 text-teal-500" />
                        {getOfficeName(result.sourceOfficeId)}
                    </p>
                </div>
                <div className="flex-1 p-5 bg-white border border-slate-200 rounded-2xl">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">To</p>
                    <p className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                        <MapPin className="w-5 h-5 text-teal-500" />
                        {getOfficeName(result.destinationOfficeId)}
                    </p>
                </div>
             </div>

             <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
               <TimelineItem 
                 label="Order Booked" 
                 completed={true} 
                 time={result.createdAt}
               />
               <TimelineItem 
                 label="In Transit" 
                 current={result.currentStatus === ParcelStatus.IN_TRANSIT}
                 completed={result.currentStatus === ParcelStatus.ARRIVED || result.currentStatus === ParcelStatus.DELIVERED}
                 time={result.history.find((h:any) => h.status === ParcelStatus.IN_TRANSIT)?.timestamp}
               />
               <TimelineItem 
                 label="Arrived at Facility" 
                 current={result.currentStatus === ParcelStatus.ARRIVED}
                 completed={result.currentStatus === ParcelStatus.DELIVERED}
                 time={result.history.find((h:any) => h.status === ParcelStatus.ARRIVED)?.timestamp}
               />
               <TimelineItem 
                 label="Delivered" 
                 current={result.currentStatus === ParcelStatus.DELIVERED}
                 completed={result.currentStatus === ParcelStatus.DELIVERED}
                 time={result.history.find((h:any) => h.status === ParcelStatus.DELIVERED)?.timestamp}
               />
             </div>
          </div>
        </div>
      )}
    </div>
  );
};