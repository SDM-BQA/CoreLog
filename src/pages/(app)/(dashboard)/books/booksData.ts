export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  rating: number;
  genre: string[];
  status: "Read" | "Reading" | "Want to Read" | "Not Finished";
  review?: string;
  description?: string;
  publicationYear?: string;
  addedOn?: string;
  startedFrom?: string;
  finishedOn?: string;
}

export const booksData: Book[] = [
  {
    id: "1",
    title: "The Midnight Library",
    author: "Matt Haig",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop",
    rating: 4.2,
    genre: ["Fiction", "Fantasy"],
    status: "Read",
    startedFrom: "2024-12-01",
    finishedOn: "2024-12-18",
  },
  {
    id: "2",
    title: "Project Hail Mary",
    author: "Andy Weir",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop",
    rating: 4.9,
    genre: ["Sci-Fi", "Thriller"],
    status: "Read",
  },
  {
    id: "3",
    title: "Klara and the Sun",
    author: "Kazuo Ishiguro",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop",
    rating: 4.0,
    genre: ["Sci-Fi", "Literary"],
    status: "Reading",
    startedFrom: "2026-04-10",
  },
  {
    id: "4",
    title: "Foundation",
    author: "Isaac Asimov",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop",
    rating: 4.5,
    genre: ["Sci-Fi", "Classic"],
    status: "Want to Read",
  },
  {
    id: "5",
    title: "The 7 Habits",
    author: "Stephen Covey",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop",
    rating: 4.8,
    genre: ["Self-Help", "Non-Fiction"],
    status: "Read",
  },
  {
    id: "6",
    title: "Circe",
    author: "Madeline Miller",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop",
    rating: 4.3,
    genre: ["Fantasy", "Mythology"],
    status: "Reading",
  },
  {
    id: "7",
    title: "The Guest List",
    author: "Lucy Foley",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop",
    rating: 3.8,
    genre: ["Mystery", "Thriller"],
    status: "Read",
  },
  {
    id: "8",
    title: "Atomic Habits",
    author: "James Clear",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop",
    rating: 5.0,
    genre: ["Self-Help", "Non-Fiction"],
    status: "Read",
  },
  {
    id: "9",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop",
    rating: 4.4,
    genre: ["Classic", "Fiction"],
    status: "Want to Read",
  },
  {
    id: "10",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop",
    rating: 4.1,
    genre: ["Thriller", "Mystery"],
    status: "Read",
  },
  {
    id: "11",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop",
    rating: 4.1,
    genre: ["Thriller", "Mystery"],
    status: "Read",
  },
  {
    id: "12",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop",
    rating: 4.1,
    genre: ["Thriller", "Mystery"],
    status: "Read",
  },
  {
    id: "13",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop",
    rating: 4.1,
    genre: ["Thriller", "Mystery"],
    status: "Read",
  },
  {
    id: "14",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop",
    rating: 4.1,
    genre: ["Thriller", "Mystery"],
    status: "Read",
  },
  {
    id: "15",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop",
    rating: 4.1,
    genre: ["Thriller", "Mystery"],
    status: "Read",
  },
];
