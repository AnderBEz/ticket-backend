import { PrismaClient, ServiceType } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const TMDB_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_W500 = "https://image.tmdb.org/t/p/w500";
const IMG_W1280 = "https://image.tmdb.org/t/p/w1280";

// ─── TMDB ────────────────────────────────────────────────────────────────────

interface TmdbMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
}

async function fetchTmdb(endpoint: string): Promise<TmdbMovie[]> {
  if (!TMDB_KEY) return [];
  try {
    const res = await fetch(`${TMDB_BASE}${endpoint}?api_key=${TMDB_KEY}&language=es-MX&page=1`);
    const data = (await res.json()) as { results?: TmdbMovie[] };
    return data.results?.slice(0, 8) ?? [];
  } catch {
    return [];
  }
}

// ─── VENUE DATA ───────────────────────────────────────────────────────────────

const CINE_VENUES = [
  {
    name: "Cinemark",
    address: "Av. Insurgentes Sur 1602, CDMX",
    lat: 19.3664, lng: -99.1795,
    services: [ServiceType.TRADITIONAL, ServiceType.VIP, ServiceType.IMAX],
  },
  {
    name: "Cinépolis",
    address: "Av. Patriotismo 875, CDMX",
    lat: 19.3929, lng: -99.1736,
    services: [ServiceType.TRADITIONAL, ServiceType.PLUUS, ServiceType.VIP, ServiceType.FOUR_DX, ServiceType.IMAX, ServiceType.JUNIOR],
  },
  {
    name: "Cinemex",
    address: "Insurgentes Centro 1, CDMX",
    lat: 19.4367, lng: -99.1454,
    services: [ServiceType.TRADITIONAL, ServiceType.VIP, ServiceType.MACRO_XE, ServiceType.IMAX],
  },
  {
    name: "AMC",
    address: "Reforma 222, CDMX",
    lat: 19.4280, lng: -99.1600,
    services: [ServiceType.TRADITIONAL, ServiceType.VIP, ServiceType.IMAX, ServiceType.SCREEN_X, ServiceType.VR],
  },
];

const SERVICE_PRICE: Record<ServiceType, number> = {
  TRADITIONAL: 90,
  VIP: 180,
  IMAX: 200,
  FOUR_DX: 220,
  MACRO_XE: 195,
  PLUUS: 170,
  JUNIOR: 80,
  VR: 250,
  SCREEN_X: 210,
};

const TEATRO_VENUES = [
  { name: "Palacio de Bellas Artes", address: "Av. Juárez s/n, Centro Histórico, CDMX", lat: 19.4354, lng: -99.1416 },
  { name: "Teatro Julio Castillo", address: "Calz. del Bosque s/n, Bosque de Chapultepec, CDMX", lat: 19.4231, lng: -99.1879 },
  { name: "Teatro Insurgentes", address: "Insurgentes Sur 1587, CDMX", lat: 19.3679, lng: -99.1794 },
];

const MUSEO_VENUES = [
  { name: "Louvre", address: "Rue de Rivoli, Paris, France", lat: 48.8606, lng: 2.3376, capacity: 15000 },
  { name: "Metropolitan Museum of Art", address: "1000 5th Ave, New York, USA", lat: 40.7794, lng: -73.9632, capacity: 7000 },
  { name: "Museos Vaticanos", address: "Viale Vaticano, Vatican City", lat: 41.9065, lng: 12.4534, capacity: 6000 },
  { name: "Museo Nacional de Antropología", address: "Av. Paseo de la Reforma s/n, Bosque de Chapultepec, CDMX", lat: 19.4262, lng: -99.1864, capacity: 3000 },
  { name: "Museu Nacional d'Art de Catalunya", address: "Parc de Montjuïc, Barcelona, Spain", lat: 41.3685, lng: 2.1534, capacity: 2500 },
];

// ─── STATIC EVENT DATA ───────────────────────────────────────────────────────

const TEATRO_EVENTS = [
  {
    name: "El Fantasma de la Ópera",
    description: "El clásico musical que ha cautivado audiencias por décadas regresa con una producción espectacular.",
    date: new Date("2026-03-15"),
    price: 800,
    capacity: 500,
    classification: "AA",
    max_per_user: 10,
    dress_code: "Smart casual",
    restrictions: ["No alimentos", "No bebidas", "No mascotas"],
  },
  {
    name: "Hamilton",
    description: "La revolución americana cobra vida en este musical de hip-hop aclamado mundialmente.",
    date: new Date("2026-04-01"),
    price: 1200,
    capacity: 600,
    classification: "B",
    max_per_user: 10,
    dress_code: "Formal",
    restrictions: ["No alimentos", "No bebidas", "No mascotas"],
  },
  {
    name: "Los Miserables",
    description: "La épica historia de Jean Valjean en una nueva puesta en escena.",
    date: new Date("2026-03-20"),
    price: 900,
    capacity: 550,
    classification: "AA",
    max_per_user: 10,
    dress_code: "Smart casual",
    restrictions: ["No alimentos", "No mascotas"],
  },
  {
    name: "Cats",
    description: "Los gatos Jellicle te invitan a una noche mágica de danza y música.",
    date: new Date("2026-05-10"),
    price: 700,
    capacity: 480,
    classification: "AA",
    max_per_user: 10,
    dress_code: null,
    restrictions: ["No mascotas", "No alimentos"],
  },
];

const MUSEO_EVENTS = [
  {
    name: "Frida Kahlo: Más Allá del Dolor",
    description: "Una exposición inmersiva que explora la vida y obra de la artista mexicana más icónica.",
    date: new Date("2026-03-01"),
    price: 350,
    classification: "AA",
    max_per_user: 5,
    access_restrictions: "Prohibido tocar las obras",
    restrictions: ["No fotografías con flash", "No mochilas grandes", "No comida"],
  },
  {
    name: "Van Gogh Alive",
    description: "Experiencia multimedia que sumerge al visitante en las obras maestras de Van Gogh.",
    date: new Date("2026-04-15"),
    price: 400,
    classification: "AA",
    max_per_user: 5,
    access_restrictions: null,
    restrictions: ["No fotografías con flash", "No comida"],
  },
  {
    name: "Cosmos: Viaje al Universo",
    description: "Exposición interactiva sobre el espacio y los descubrimientos astronómicos más recientes.",
    date: new Date("2026-03-25"),
    price: 280,
    classification: "AA",
    max_per_user: 5,
    access_restrictions: null,
    restrictions: ["No comida", "No bebidas"],
  },
  {
    name: "Dinosaurios: Gigantes del Pasado",
    description: "Réplicas a escala real y fósiles auténticos de las criaturas más fascinantes.",
    date: new Date("2026-05-01"),
    price: 300,
    classification: "AA",
    max_per_user: 5,
    access_restrictions: "Prohibido tocar las réplicas",
    restrictions: ["No comida", "No bebidas", "No mascotas"],
  },
];

// ─── DATE HELPERS ─────────────────────────────────────────────────────────────

function nextDays(n: number): Date[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
}

function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

function atHour(date: Date, hour: number, minute = 0): Date {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d;
}

// ─── SEAT GENERATORS ──────────────────────────────────────────────────────────

function cinemaSeats(service: ServiceType) {
  const configs: Record<string, { rows: string; cols: number; section: string; price: number }> = {
    TRADITIONAL: { rows: "ABCDEFGHIJ", cols: 10, section: "GENERAL", price: SERVICE_PRICE.TRADITIONAL },
    VIP: { rows: "ABCDE", cols: 8, section: "VIP", price: SERVICE_PRICE.VIP },
    IMAX: { rows: "ABCDEFGHIJKL", cols: 14, section: "IMAX", price: SERVICE_PRICE.IMAX },
    FOUR_DX: { rows: "ABCDEFG", cols: 10, section: "4DX", price: SERVICE_PRICE.FOUR_DX },
    MACRO_XE: { rows: "ABCDEFGHIJ", cols: 12, section: "MACRO_XE", price: SERVICE_PRICE.MACRO_XE },
    PLUUS: { rows: "ABCDE", cols: 8, section: "PLUUS", price: SERVICE_PRICE.PLUUS },
    JUNIOR: { rows: "ABCD", cols: 8, section: "JUNIOR", price: SERVICE_PRICE.JUNIOR },
    VR: { rows: "ABCD", cols: 5, section: "VR", price: SERVICE_PRICE.VR },
    SCREEN_X: { rows: "ABCDEFGHIJ", cols: 12, section: "SCREEN_X", price: SERVICE_PRICE.SCREEN_X },
  };

  const cfg = configs[service] ?? configs.TRADITIONAL;
  return cfg.rows.split("").flatMap((row) =>
    Array.from({ length: cfg.cols }, (_, i) => ({
      label: `${row}${i + 1}`,
      row,
      number: i + 1,
      section: cfg.section,
      price: cfg.price,
    }))
  );
}

function teatroSeats() {
  const sections = [
    { section: "LUNETA", rows: "ABCDEFGHIJKLMNOP", cols: 10, price: 800 },
    { section: "PALCO", rows: "ABC", cols: 8, price: 1500 },
    { section: "PREFERENTE", rows: "ABCDEF", cols: 10, price: 600 },
  ];
  return sections.flatMap(({ section, rows, cols, price }) =>
    rows.split("").flatMap((row) =>
      Array.from({ length: cols }, (_, i) => ({
        label: `${section[0]}${row}${i + 1}`,
        row,
        number: i + 1,
        section,
        price,
      }))
    )
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding...");

  // EventTypes
  const [cineType, teatroType, museoType] = await Promise.all([
    prisma.eventType.upsert({ where: { id: "cine" }, update: {}, create: { id: "cine", name: "Cine" } }),
    prisma.eventType.upsert({ where: { id: "teatro" }, update: {}, create: { id: "teatro", name: "Teatro" } }),
    prisma.eventType.upsert({ where: { id: "museos" }, update: {}, create: { id: "museos", name: "Museos" } }),
  ]);

  console.log("✓ EventTypes");

  // Holidays
  const holidays = [
    { date: new Date("2026-05-01"), name: "Día del Trabajo", country: "MX" },
    { date: new Date("2026-09-16"), name: "Día de la Independencia", country: "MX" },
    { date: new Date("2026-11-02"), name: "Día de Muertos", country: "MX" },
    { date: new Date("2026-11-16"), name: "Revolución Mexicana", country: "MX" },
    { date: new Date("2026-12-25"), name: "Navidad", country: "MX" },
    { date: new Date("2026-07-14"), name: "Fête Nationale", country: "FR" },
    { date: new Date("2026-07-04"), name: "Independence Day", country: "US" },
    { date: new Date("2026-08-15"), name: "Ferragosto", country: "IT" },
    { date: new Date("2026-10-12"), name: "Día de la Hispanidad", country: "ES" },
  ];

  for (const h of holidays) {
    await prisma.holiday.upsert({
      where: { id: `holiday-${h.country}-${h.date.toISOString().slice(0, 10)}` },
      update: {},
      create: { id: `holiday-${h.country}-${h.date.toISOString().slice(0, 10)}`, ...h },
    });
  }
  console.log("✓ Holidays");

  // ── CINE ──────────────────────────────────────────────────────────────────

  const [nowPlaying, upcoming] = await Promise.all([
    fetchTmdb("/movie/now_playing"),
    fetchTmdb("/movie/upcoming"),
  ]);

  const allMovies = [...nowPlaying, ...upcoming].reduce<TmdbMovie[]>((acc, m) => {
    if (!acc.find((x) => x.id === m.id)) acc.push(m);
    return acc;
  }, []).slice(0, 10);

  console.log(`✓ TMDB: ${allMovies.length} películas`);

  const days7 = nextDays(7);
  const cineTimes = [12, 14, 17, 19, 22];

  for (const movie of allMovies) {
    const event = await prisma.event.create({
      data: {
        name: movie.title,
        description: movie.overview || "Sin descripción disponible.",
        date: new Date(movie.release_date || new Date()),
        location: "Múltiples sedes",
        capacity: 0,
        price: SERVICE_PRICE.TRADITIONAL,
        tmdb_id: movie.id,
        poster_url: movie.poster_path ? `${IMG_W500}${movie.poster_path}` : null,
        backdrop_url: movie.backdrop_path ? `${IMG_W1280}${movie.backdrop_path}` : null,
        vote_average: movie.vote_average,
        classification: "B",
        restrictions: ["No mascotas", "No grabaciones"],
        eventTypeId: cineType.id,
      },
    });

    for (const venue of CINE_VENUES) {
      for (const service of venue.services) {
        const price = SERVICE_PRICE[service];
        for (const day of days7) {
          for (const hour of cineTimes) {
            const seats = cinemaSeats(service);
            await prisma.showtime.create({
              data: {
                datetime: atHour(day, hour),
                venue_name: venue.name,
                venue_address: venue.address,
                lat: venue.lat,
                lng: venue.lng,
                price,
                available_seats: seats.length,
                service_type: service,
                eventId: event.id,
                seats: { create: seats },
              },
            });
          }
        }
      }
    }
  }

  console.log("✓ Cine events + showtimes + seats");

  // ── TEATRO ────────────────────────────────────────────────────────────────

  const days14 = nextDays(14).filter(isWeekday);
  const teatroHours = [19, 21];

  for (const obra of TEATRO_EVENTS) {
    const venueIdx = TEATRO_EVENTS.indexOf(obra) % TEATRO_VENUES.length;
    const venue = TEATRO_VENUES[venueIdx];

    const event = await prisma.event.create({
      data: {
        name: obra.name,
        description: obra.description,
        date: obra.date,
        location: venue.name,
        capacity: obra.capacity,
        price: obra.price,
        classification: obra.classification,
        restrictions: obra.restrictions,
        dress_code: obra.dress_code,
        max_per_user: obra.max_per_user,
        eventTypeId: teatroType.id,
      },
    });

    const seats = teatroSeats();
    for (const day of days14) {
      for (const hour of teatroHours) {
        await prisma.showtime.create({
          data: {
            datetime: atHour(day, hour),
            venue_name: venue.name,
            venue_address: venue.address,
            lat: venue.lat,
            lng: venue.lng,
            price: obra.price,
            available_seats: seats.length,
            service_type: ServiceType.TRADITIONAL,
            eventId: event.id,
            seats: { create: seats },
          },
        });
      }
    }
  }

  console.log("✓ Teatro events + showtimes + seats");

  // ── MUSEOS ────────────────────────────────────────────────────────────────

  const museoHours = [10, 14];

  for (let i = 0; i < MUSEO_EVENTS.length; i++) {
    const expo = MUSEO_EVENTS[i];
    const venue = MUSEO_VENUES[i % MUSEO_VENUES.length];
    const capacity = venue.capacity;

    const event = await prisma.event.create({
      data: {
        name: expo.name,
        description: expo.description,
        date: expo.date,
        location: venue.name,
        capacity,
        price: expo.price,
        classification: expo.classification,
        restrictions: expo.restrictions,
        max_per_user: expo.max_per_user,
        access_restrictions: expo.access_restrictions,
        eventTypeId: museoType.id,
      },
    });

    for (const day of days14) {
      for (const hour of museoHours) {
        await prisma.showtime.create({
          data: {
            datetime: atHour(day, hour),
            venue_name: venue.name,
            venue_address: venue.address,
            lat: venue.lat,
            lng: venue.lng,
            price: expo.price,
            available_seats: Math.floor(capacity / 2),
            service_type: ServiceType.TRADITIONAL,
            eventId: event.id,
          },
        });
      }
    }
  }

  console.log("✓ Museo events + showtimes");
  console.log("🌱 Seed completo.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
