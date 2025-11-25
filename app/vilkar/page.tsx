'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function Vilkar() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto">
        
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 font-bold text-sm mb-8 hover:text-slate-900">
          <ArrowLeft size={16} /> Tilbake til forsiden
        </Link>

        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Vilkår for bruk</h1>
          <p className="text-slate-500 mb-8">Gjeldende fra: 25. november 2025</p>

          <div className="space-y-8 text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">1. Aksept av vilkår</h2>
              <p>Ved å opprette en konto på NyeVenner, godtar du disse vilkårene. Tjenesten er ment for personer over 18 år.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">2. Ansvar for aktiviteter</h2>
              <p>NyeVenner er kun en formidlingstjeneste (en oppslagstavle). Amatech AS er ikke ansvarlig for gjennomføringen av aktivitetene, eller for sikkerheten under arrangementene. All deltakelse skjer på eget ansvar.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">3. Oppførsel</h2>
              <p>Vi ønsker et trygt og hyggelig miljø. Vi forbeholder oss retten til å utestenge brukere som:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Opptrer truende eller trakasserende.</li>
                <li>Bruker falsk identitet.</li>
                <li>Legger ut upassende innhold.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">4. Betaling</h2>
              <p>Noen aktiviteter kan ha en kostnad (f.eks. billett, mat). Eventuelle pengeoverføringer skjer direkte mellom deltakerne (f.eks. via Vipps). NyeVenner håndterer ingen betalinger og tar ingen gebyrer.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">5. Endringer</h2>
              <p>Vi kan endre disse vilkårene. Vesentlige endringer vil bli varslet.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}