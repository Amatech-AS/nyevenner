'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function Personvern() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto">
        
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 font-bold text-sm mb-8 hover:text-slate-900">
          <ArrowLeft size={16} /> Tilbake til forsiden
        </Link>

        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Personvernerklæring</h1>
          <p className="text-slate-500 mb-8">Sist oppdatert: 25. november 2025</p>

          <div className="space-y-8 text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">1. Hva er NyeVenner?</h2>
              <p>NyeVenner er en tjeneste levert av Amatech AS. Vårt mål er å koble mennesker sammen gjennom sosiale aktiviteter. Vi tar ditt personvern på alvor og samler kun inn det som er nødvendig for at tjenesten skal fungere.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">2. Hvilke opplysninger samler vi inn?</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Navn og e-post:</strong> For å opprette en bruker og slik at andre kan se hvem som deltar.</li>
                <li><strong>Aktiviteter:</strong> Informasjon om aktiviteter du oppretter eller melder deg på.</li>
                <li><strong>Adresse/Postnummer:</strong> For å kunne vise deg aktiviteter i nærheten av der du bor.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">3. Hvordan brukes opplysningene?</h2>
              <p>Opplysningene brukes utelukkende til å:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Gi deg tilgang til tjenesten.</li>
                <li>Vise relevante aktiviteter basert på ditt sted.</li>
                <li>La andre deltakere se hvem som kommer på en aktivitet.</li>
              </ul>
              <p className="mt-2">Vi selger aldri dine data til tredjeparter.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">4. Pårørende-kobling</h2>
              <p>Dersom du velger å dele din tilgangskode med en pårørende, gir du samtykke til at denne personen kan se hvilke aktiviteter du har meldt deg på. Du kan når som helst fjerne denne koblingen fra "Min Side".</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">5. Dine rettigheter</h2>
              <p>Du har rett til innsyn i egne opplysninger, og du kan når som helst be om å få slettet din bruker og all data vi har lagret om deg.</p>
            </section>

            <div className="pt-8 border-t border-slate-100">
              <p className="font-bold">Kontakt oss</p>
              <p>Har du spørsmål? Send oss en e-post på post@amatech.no</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}