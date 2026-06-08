import React from 'react';
import { EmissionsBreakdown } from '../types';
import { Clock, Calendar, Flame, Zap, Utensils, Leaf, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface HistoryProps {
  calculations: EmissionsBreakdown[];
  isDarkMode: boolean;
}

export default function History({
  calculations,
  isDarkMode
}: HistoryProps) {
  const hasData = calculations && calculations.length > 0;

  return (
    <div className="space-y-8" id="history-section">
      
      {/* Head */}
      <div id="history-head">
        <h1 className="text-2xl font-bold font-display">Chronological Carbon Audit History</h1>
        <p className={`text-xs ${isDarkMode ? 'text-brand-dark-text-sec' : 'text-gray-500'}`}>
          Review past calculations and evaluate long-term trends.
        </p>
      </div>

      {/* Audit table representation */}
      {!hasData ? (
        <div className={`p-12 text-center rounded-2xl border ${isDarkMode ? 'bg-brand-dark-surface/10 border-brand-dark-surface' : 'bg-white border-gray-100 shadow-sm'}`} id="history-empty">
          <div className="mx-auto w-12 h-12 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-4">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold">No Chronological History Found</p>
          <p className="text-xs text-gray-400 mt-1">Complete your carbon calculator audit questionnaire to log your initial baseline carbon parameters.</p>
        </div>
      ) : (
        <div className={`border rounded-2xl overflow-hidden ${isDarkMode ? 'bg-brand-dark-surface/5 border-brand-dark-surface' : 'bg-white border-gray-100 shadow-sm'}`} id="history-grid-wrapper">
          <div className="overflow-x-auto" id="table-scroll">
            <table className="w-full border-collapse" id="table-history">
              <thead className={`text-xs font-semibold ${isDarkMode ? 'bg-brand-dark-surface/35' : 'bg-gray-50 text-gray-500'}`} id="history-thead">
                <tr className="border-b border-gray-400/10">
                  <th className="p-4 text-left w-32">DATE</th>
                  <th className="p-4 text-right">TRANSPORT</th>
                  <th className="p-4 text-right">ELECTRICITY</th>
                  <th className="p-4 text-right">DIET/FOOD</th>
                  <th className="p-4 text-right">LIFESTYLE</th>
                  <th className="p-4 text-right">TOTAL MONTHLY</th>
                  <th className="p-4 text-center">INDEX SCORE</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-400/10 text-xs" id="history-tbody">
                {calculations.slice().reverse().map((rec, idx) => {
                  return (
                    <tr 
                      key={idx}
                      className="hover:bg-gray-500/5 transition-colors"
                      id={`tr-history-${idx}`}
                    >
                      <td className="p-4 font-semibold text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-3.5 h-3.5 text-brand-primary" />
                          <span>{rec.date}</span>
                        </div>
                      </td>

                      <td className="p-4 text-right font-mono text-gray-400 font-semibold">
                        {rec.transportation} kg
                      </td>

                      <td className="p-4 text-right font-mono text-gray-400 font-semibold">
                        {rec.electricity} kg
                      </td>

                      <td className="p-4 text-right font-mono text-gray-400 font-semibold">
                        {rec.food} kg
                      </td>

                      <td className="p-4 text-right font-mono text-gray-400 font-semibold">
                        {rec.lifestyle} kg
                      </td>

                      <td className="p-4 text-right">
                        <span className="font-bold text-brand-primary text-sm font-mono">{rec.total}</span>
                        <span className="text-[10px] text-gray-500 font-mono ml-0.5">kg CO₂e</span>
                      </td>

                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center font-mono font-bold bg-brand-primary/10 text-brand-primary text-sm rounded-lg px-2.5 py-1">
                          {rec.sustainabilityScore}/100
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Simple comparative callout */}
      {calculations.length >= 2 && (
        <div className="p-4 bg-brand-primary/5 rounded-xl border border-brand-primary/10 flex items-start space-x-3 text-xs leading-relaxed" id="environmental-audit-callout">
          <AlertCircle className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-brand-primary">Longitudinal Trend Audit Context</p>
            <p className="text-gray-400 mt-0.5">
              Refining comparison rates: Your baseline calculator record was clocked at <strong>{calculations[0].total} kg</strong>. Your latest assessment was mapped at <strong>{calculations[calculations.length - 1].total} kg</strong>. Keep executing dynamic campaigns to maintain carbon reduction performance curves.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
