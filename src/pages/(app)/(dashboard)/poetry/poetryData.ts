export interface PersonalPoem {
  id: string;
  title: string;
  content: string;
  dateCreated: string;
  mood: string;
  tags: string[];
  status: "Draft" | "Finished" | "Published";
  atmosphere?: string; // e.g., "Dark", "Serene", "Melancholy"
}

export const myPoetryData: PersonalPoem[] = [
  {
    id: "1",
    title: "Shadows in the Digital Mist",
    content: "Lines of code and sparks of light,\nFlickering through the endless night.\nWe build our worlds in binary streams,\nAnd lose our souls in digital dreams.",
    dateCreated: "2026-04-18",
    mood: "Reflective",
    tags: ["Tech", "Modernity"],
    status: "Finished",
    atmosphere: "Cyberpunk"
  },
  {
    id: "2",
    title: "The Silent Garden",
    content: "Where the whispers of the wind reside,\nAnd the secrets of the stones do hide.\nI found a peace I could not name,\nA spark without a burning flame.",
    dateCreated: "2026-04-19",
    mood: "Serene",
    tags: ["Nature", "Peace"],
    status: "Draft",
    atmosphere: "Organic"
  }
];
