'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Film, ArrowLeft, Trophy, RotateCcw, Check, X, Star } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Category = 'klassiker' | 'norsk' | 'moderne';
type Difficulty = 'easy' | 'medium' | 'hard';

interface Question {
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  category: Category;
  difficulty: Difficulty;
}

type FilterCategory = 'alle' | Category;

// ---------------------------------------------------------------------------
// Questions (30+)
// ---------------------------------------------------------------------------

const ALL_QUESTIONS: Question[] = [
  // --- KLASSIKERE ---
  {
    question: 'Hvilken film fra 1942 har den berømte replikken "Here\'s looking at you, kid"?',
    options: ['Casablanca', 'Citizen Kane', 'Gone with the Wind', 'The Maltese Falcon'],
    correctIndex: 0,
    category: 'klassiker',
    difficulty: 'easy',
  },
  {
    question: 'Hvem regisserte "Psycho" (1960)?',
    options: ['Billy Wilder', 'Alfred Hitchcock', 'Orson Welles', 'John Ford'],
    correctIndex: 1,
    category: 'klassiker',
    difficulty: 'easy',
  },
  {
    question: 'Hva heter den berømte haien i Steven Spielbergs film fra 1975?',
    options: ['Jaws', 'Shark', 'Bruce', 'Deep Blue'],
    correctIndex: 0,
    category: 'klassiker',
    difficulty: 'medium',
  },
  {
    question: 'Hvem spilte Don Corleone i "Gudfaren" (1972)?',
    options: ['Robert De Niro', 'Al Pacino', 'Marlon Brando', 'Jack Nicholson'],
    correctIndex: 2,
    category: 'klassiker',
    difficulty: 'easy',
  },
  {
    question: 'Hvilket år kom filmen "Singing in the Rain" ut?',
    options: ['1948', '1952', '1956', '1960'],
    correctIndex: 1,
    category: 'klassiker',
    difficulty: 'hard',
  },
  {
    question: 'Hvem regisserte "2001: A Space Odyssey"?',
    options: ['Ridley Scott', 'Stanley Kubrick', 'George Lucas', 'Steven Spielberg'],
    correctIndex: 1,
    category: 'klassiker',
    difficulty: 'medium',
  },
  {
    question: 'Hva er navnet på Charles Foster Kanes siste ord i "Citizen Kane"?',
    options: ['Rosebud', 'Daisy', 'Mother', 'Freedom'],
    correctIndex: 0,
    category: 'klassiker',
    difficulty: 'medium',
  },
  {
    question: 'Hvem spilte hovedrollen i "The Sound of Music" (1965)?',
    options: ['Audrey Hepburn', 'Doris Day', 'Julie Andrews', 'Grace Kelly'],
    correctIndex: 2,
    category: 'klassiker',
    difficulty: 'easy',
  },
  {
    question: 'Hvilken film vant den første Oscar-utdelingen for beste film i 1929?',
    options: ['Sunrise', 'Wings', 'The Jazz Singer', 'Metropolis'],
    correctIndex: 1,
    category: 'klassiker',
    difficulty: 'hard',
  },
  {
    question: 'Hva heter den klassiske westernfilmen fra 1952 med Gary Cooper?',
    options: ['Shane', 'High Noon', 'Rio Bravo', 'The Searchers'],
    correctIndex: 1,
    category: 'klassiker',
    difficulty: 'medium',
  },
  {
    question: 'Hvem regisserte "Lawrence of Arabia" (1962)?',
    options: ['David Lean', 'John Huston', 'William Wyler', 'Fred Zinnemann'],
    correctIndex: 0,
    category: 'klassiker',
    difficulty: 'hard',
  },

  // --- NORSKE FILMER ---
  {
    question: 'Hva heter den norske animasjonsfilmen fra 1975 om et billøp i Flåklypa?',
    options: ['Solan og Ludvig', 'Flåklypa Grand Prix', 'Dyrene i Hakkebakkeskogen', 'Knutsen og Ludansen'],
    correctIndex: 1,
    category: 'norsk',
    difficulty: 'easy',
  },
  {
    question: 'Hvem spilte Max Manus i filmen fra 2008?',
    options: ['Aksel Hennie', 'Kristoffer Joner', 'Nicolai Cleve Broch', 'Anders Baasmo'],
    correctIndex: 0,
    category: 'norsk',
    difficulty: 'easy',
  },
  {
    question: 'Hvilken norsk film handler om en flodbølge som truer bygda Geiranger?',
    options: ['Skjelvet', 'Bølgen', 'Nordsjøen', 'Tunnelen'],
    correctIndex: 1,
    category: 'norsk',
    difficulty: 'easy',
  },
  {
    question: 'Hvem regisserte "Kon-Tiki" (2012)?',
    options: ['Erik Poppe', 'Joachim Rønning og Espen Sandberg', 'Harald Zwart', 'Hans Petter Moland'],
    correctIndex: 1,
    category: 'norsk',
    difficulty: 'medium',
  },
  {
    question: 'Hvilken norsk film fra 2003 handler om en gjeng kamerater på en busstur?',
    options: ['Elling', 'Buddy', 'Hodeskalleansen', 'Mongoland'],
    correctIndex: 1,
    category: 'norsk',
    difficulty: 'medium',
  },
  {
    question: 'Hva heter karakteren som Helge Jordal spiller i "Veiviseren" (1987)?',
    options: ['Aigin', 'Ransen', 'Tsjuden', 'Saransen'],
    correctIndex: 0,
    category: 'norsk',
    difficulty: 'hard',
  },
  {
    question: 'Hvilken norsk film vant Gullbjørnen på filmfestivalen i Berlin i 1999?',
    options: ['Insomnia', 'Junk Mail', 'Budbringeren', 'Elling'],
    correctIndex: 2,
    category: 'norsk',
    difficulty: 'hard',
  },
  {
    question: 'Hvem spilte Elling i filmene basert på Ingvar Ambjørnsens bøker?',
    options: ['Per Christian Ellefsen', 'Sven Nordin', 'Bjørn Sundquist', 'Nils Ole Oftebro'],
    correctIndex: 0,
    category: 'norsk',
    difficulty: 'easy',
  },
  {
    question: 'Hvilken norsk film fra 2014 handler om Roald Amundsens ekspedisjon?',
    options: ['Amundsen', 'Birkebeinerne', 'Kon-Tiki', 'Kampen om tungtvannet'],
    correctIndex: 0,
    category: 'norsk',
    difficulty: 'medium',
  },
  {
    question: 'Hva heter den norske skrekkfilmen fra 2006 om nazi-zombier?',
    options: ['Fritt Vilt', 'Død Snø', 'Villmark', 'Naboer'],
    correctIndex: 1,
    category: 'norsk',
    difficulty: 'medium',
  },
  {
    question: 'Hvem regisserte "Pinchcliffe Grand Prix" (den engelske versjonen av Flåklypa)?',
    options: ['Ivo Caprino', 'Rasmus Breistein', 'Arne Skouen', 'Nils Gaup'],
    correctIndex: 0,
    category: 'norsk',
    difficulty: 'easy',
  },

  // --- MODERNE FILMER ---
  {
    question: 'Hvilket skip synker i James Camerons film fra 1997?',
    options: ['Lusitania', 'Britannic', 'Titanic', 'Olympic'],
    correctIndex: 2,
    category: 'moderne',
    difficulty: 'easy',
  },
  {
    question: 'Hvor mange filmer er det i "Ringenes Herre"-trilogien?',
    options: ['2', '3', '4', '5'],
    correctIndex: 1,
    category: 'moderne',
    difficulty: 'easy',
  },
  {
    question: 'Hvem spiller Harry Potter i filmserien?',
    options: ['Rupert Grint', 'Tom Felton', 'Daniel Radcliffe', 'Eddie Redmayne'],
    correctIndex: 2,
    category: 'moderne',
    difficulty: 'easy',
  },
  {
    question: 'Hvilken planet besøker astronautene i "Avatar" (2009)?',
    options: ['Pandora', 'Endor', 'Tatooine', 'Naboo'],
    correctIndex: 0,
    category: 'moderne',
    difficulty: 'easy',
  },
  {
    question: 'Hvem regisserte "Schindler\'s List" (1993)?',
    options: ['Martin Scorsese', 'Steven Spielberg', 'Francis Ford Coppola', 'Ridley Scott'],
    correctIndex: 1,
    category: 'moderne',
    difficulty: 'medium',
  },
  {
    question: 'Hvilken film vant Oscar for beste film i 2020?',
    options: ['1917', 'Joker', 'Parasite', 'Once Upon a Time in Hollywood'],
    correctIndex: 2,
    category: 'moderne',
    difficulty: 'medium',
  },
  {
    question: 'Hva heter den første filmen i Marvel Cinematic Universe?',
    options: ['The Incredible Hulk', 'Iron Man', 'Captain America', 'Thor'],
    correctIndex: 1,
    category: 'moderne',
    difficulty: 'medium',
  },
  {
    question: 'Hvem spilte Forrest Gump i filmen fra 1994?',
    options: ['Tom Hanks', 'Robin Williams', 'Jim Carrey', 'Bill Murray'],
    correctIndex: 0,
    category: 'moderne',
    difficulty: 'easy',
  },
  {
    question: 'Hvilken Christopher Nolan-film handler om drømmer inni drømmer?',
    options: ['Interstellar', 'Inception', 'Tenet', 'Memento'],
    correctIndex: 1,
    category: 'moderne',
    difficulty: 'medium',
  },
  {
    question: 'Hvem spiller Joker i "The Dark Knight" (2008)?',
    options: ['Jack Nicholson', 'Joaquin Phoenix', 'Jared Leto', 'Heath Ledger'],
    correctIndex: 3,
    category: 'moderne',
    difficulty: 'medium',
  },
  {
    question: 'Hvilken animasjonsfilm fra Pixar handler om en fisk som leter etter sønnen sin?',
    options: ['Shark Tale', 'Finding Nemo', 'Moana', 'The Little Mermaid'],
    correctIndex: 1,
    category: 'moderne',
    difficulty: 'easy',
  },
  {
    question: 'Hvem regisserte "Oppenheimer" (2023)?',
    options: ['Denis Villeneuve', 'Christopher Nolan', 'Ridley Scott', 'Martin Scorsese'],
    correctIndex: 1,
    category: 'moderne',
    difficulty: 'medium',
  },
  {
    question: 'Hva heter planeten Luke Skywalker vokser opp på i Star Wars?',
    options: ['Dagobah', 'Hoth', 'Tatooine', 'Jakku'],
    correctIndex: 2,
    category: 'moderne',
    difficulty: 'medium',
  },
  {
    question: 'Hvilken film har replikken "I see dead people"?',
    options: ['The Others', 'The Sixth Sense', 'Ghost', 'Poltergeist'],
    correctIndex: 1,
    category: 'moderne',
    difficulty: 'easy',
  },
  {
    question: 'Hvem vant Oscar for beste kvinnelige hovedrolle for "La Vie en Rose" (2007)?',
    options: ['Cate Blanchett', 'Marion Cotillard', 'Meryl Streep', 'Kate Winslet'],
    correctIndex: 1,
    category: 'moderne',
    difficulty: 'hard',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const QUESTIONS_PER_ROUND = 10;

function pickQuestions(filter: FilterCategory): Question[] {
  const pool = filter === 'alle'
    ? ALL_QUESTIONS
    : ALL_QUESTIONS.filter((q) => q.category === filter);
  return shuffle(pool).slice(0, QUESTIONS_PER_ROUND);
}

function categoryLabel(cat: Category): string {
  switch (cat) {
    case 'klassiker': return 'Klassiker';
    case 'norsk': return 'Norsk';
    case 'moderne': return 'Moderne';
  }
}

function difficultyStars(d: Difficulty): number {
  return d === 'easy' ? 1 : d === 'medium' ? 2 : 3;
}

function resultMessage(score: number, total: number) {
  const pct = score / total;
  if (pct === 1) return { emoji: '🏆', text: 'Perfekt! Du er en ekte filmekspert!' };
  if (pct >= 0.8) return { emoji: '🌟', text: 'Fantastisk! Du kan virkelig filmene dine!' };
  if (pct >= 0.6) return { emoji: '👏', text: 'Bra jobba! Du har god filmkunnskap!' };
  if (pct >= 0.4) return { emoji: '😊', text: 'Ikke verst! Øv litt mer, så blir du enda bedre!' };
  return { emoji: '🎬', text: 'God innsats! Se noen flere filmer og prøv igjen!' };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type GamePhase = 'menu' | 'playing' | 'result';

export default function FilmQuizPage() {
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('alle');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const currentQuestion = questions[currentIndex] as Question | undefined;
  const totalQuestions = questions.length;

  const startGame = useCallback((cat: FilterCategory) => {
    setFilterCategory(cat);
    setQuestions(pickQuestions(cat));
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setAnswered(false);
    setPhase('playing');
  }, []);

  const handleAnswer = useCallback(
    (index: number) => {
      if (answered || !currentQuestion) return;
      setSelectedOption(index);
      setAnswered(true);
      if (index === currentQuestion.correctIndex) {
        setScore((s) => s + 1);
      }
    },
    [answered, currentQuestion],
  );

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= totalQuestions) {
      setPhase('result');
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setAnswered(false);
    }
  }, [currentIndex, totalQuestions]);

  // ---- RENDER ----

  // Back link (always shown)
  const backLink = (
    <Link
      href="/"
      className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors text-lg"
    >
      <ArrowLeft className="w-5 h-5" />
      <span>Tilbake</span>
    </Link>
  );

  // ------- MENU -------
  if (phase === 'menu') {
    const categories: { key: FilterCategory; label: string }[] = [
      { key: 'alle', label: 'Alle filmer' },
      { key: 'klassiker', label: 'Klassikere' },
      { key: 'norsk', label: 'Norske filmer' },
      { key: 'moderne', label: 'Moderne filmer' },
    ];

    return (
      <main className="min-h-screen bg-slate-50 px-4 py-6 max-w-lg mx-auto">
        <div className="mb-6">{backLink}</div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-4">
            <Film className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Film-quiz</h1>
          <p className="text-slate-500 text-lg">
            Test filmkunnskapen din med 10 spørsmål!
          </p>
        </div>

        <h2 className="text-xl font-semibold text-slate-700 mb-3 text-center">
          Velg kategori
        </h2>

        <div className="grid gap-3">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => startGame(c.key)}
              className="w-full py-4 px-6 rounded-2xl bg-white shadow-sm border border-slate-200 text-left text-lg font-medium text-slate-700 hover:border-emerald-400 hover:shadow-md active:scale-[0.98] transition-all"
            >
              {c.label}
            </button>
          ))}
        </div>
      </main>
    );
  }

  // ------- RESULT -------
  if (phase === 'result') {
    const { emoji, text } = resultMessage(score, totalQuestions);

    return (
      <main className="min-h-screen bg-slate-50 px-4 py-6 max-w-lg mx-auto">
        <div className="mb-6">{backLink}</div>

        <div className="bg-white rounded-3xl shadow-md p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 mb-4">
            <Trophy className="w-10 h-10 text-amber-500" />
          </div>

          <p className="text-5xl mb-4">{emoji}</p>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Resultat</h2>
          <p className="text-5xl font-extrabold text-emerald-600 mb-1">
            {score} / {totalQuestions}
          </p>
          <p className="text-slate-500 text-lg mb-6">{text}</p>

          <div className="grid gap-3">
            <button
              onClick={() => startGame(filterCategory)}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 text-white text-lg font-semibold shadow hover:bg-emerald-700 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Spill igjen
            </button>
            <button
              onClick={() => setPhase('menu')}
              className="w-full py-4 px-6 rounded-2xl bg-white border border-slate-200 text-slate-700 text-lg font-semibold shadow-sm hover:border-emerald-400 active:scale-[0.98] transition-all"
            >
              Velg ny kategori
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ------- PLAYING -------
  if (!currentQuestion) return null;

  const stars = difficultyStars(currentQuestion.difficulty);
  const progressPct = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 max-w-lg mx-auto">
      <div className="mb-4">{backLink}</div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-slate-500 mb-1">
          <span>
            Spørsmål {currentIndex + 1} av {totalQuestions}
          </span>
          <span className="font-semibold text-emerald-600">
            Poeng: {score}
          </span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
        {/* Meta: category + difficulty */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            {categoryLabel(currentQuestion.category)}
          </span>
          <span className="flex items-center gap-0.5" title={`Vanskelighetsgrad: ${currentQuestion.difficulty}`}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < stars ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
              />
            ))}
          </span>
        </div>

        <h2 className="text-xl font-bold text-slate-800 leading-snug mb-6">
          {currentQuestion.question}
        </h2>

        {/* Options */}
        <div className="grid gap-3">
          {currentQuestion.options.map((opt, i) => {
            const isCorrect = i === currentQuestion.correctIndex;
            const isSelected = i === selectedOption;

            let btnClass =
              'w-full py-4 px-5 rounded-2xl border text-left text-lg font-medium transition-all active:scale-[0.98] flex items-center gap-3';

            if (!answered) {
              btnClass += ' bg-white border-slate-200 text-slate-700 hover:border-emerald-400 hover:shadow';
            } else if (isCorrect) {
              btnClass += ' bg-green-50 border-green-400 text-green-800';
            } else if (isSelected && !isCorrect) {
              btnClass += ' bg-red-50 border-red-400 text-red-800';
            } else {
              btnClass += ' bg-white border-slate-100 text-slate-400';
            }

            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={answered}
                className={btnClass}
              >
                <span className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border border-current/20 bg-current/5">
                  {answered && isCorrect ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : answered && isSelected && !isCorrect ? (
                    <X className="w-5 h-5 text-red-600" />
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Next button */}
      {answered && (
        <button
          onClick={handleNext}
          className="w-full py-4 px-6 rounded-2xl bg-emerald-600 text-white text-lg font-semibold shadow hover:bg-emerald-700 active:scale-[0.98] transition-all"
        >
          {currentIndex + 1 >= totalQuestions ? 'Se resultat' : 'Neste spørsmål'}
        </button>
      )}
    </main>
  );
}
