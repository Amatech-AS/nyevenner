import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      
      {/* Velkomst-seksjon */}
      <div className="max-w-2xl bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
        
        <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
          Velkommen til NyeVenner!!!!
        </h1>
        
        <p className="text-xl text-gray-700 mb-8 leading-relaxed">
          En møteplass for deg som vil finne aktiviteter, 
          gå turer eller bare slå av en prat med andre i nabolaget.
        </p>

        <div className="space-y-4">
          {/* Hovedknapp for eldre */}
          <Link 
            href="/login" 
            className="block w-full bg-green-600 hover:bg-green-700 text-white text-2xl font-bold py-6 px-8 rounded-xl transition-colors"
          >
            Logg inn / Bli medlem
          </Link>

          {/* Sekundær informasjon */}
          <p className="text-gray-500 pt-4">
            Er du pårørende? Du kan også logge inn her for å hjelpe til.
          </p>
        </div>

      </div>

      {/* Footer info */}
      <footer className="mt-12 text-gray-500">
        <p>Laget med omtanke for fellesskapet ❤️</p>
      </footer>

    </main>
  );
}