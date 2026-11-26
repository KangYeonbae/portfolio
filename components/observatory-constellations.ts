// Shapes follow the Byeoljari (taro repo) LineArt icons; art is that site's service illustration.
// stars: [azimuth, altitude] offsets in degrees from the anchor.
const octagon = Array.from({ length: 8 }, (_, index) => {
  const angle = index * Math.PI / 4;
  return [+(4.5 * Math.cos(angle)).toFixed(2), +(4.5 * Math.sin(angle)).toFixed(2)];
});

export const constellations = [
  {
    // AstroLineArt: four stars in a ring with one inner star
    id: "astrology", name: "점성술", azimuth: -26, altitude: 50, color: "#d8b4fe", art: "/project-media/byeoljari-art-astrology.webp",
    stars: [[-4, 6], [4, 4], [2, -3.2], [-4.8, -4], [-.8, .8]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0], [4, 1]],
  },
  {
    // SajuLineArt: eight trigram marks around the yin-yang, its two eyes inside
    id: "saju", name: "사주", azimuth: 0, altitude: 51.5, color: "#f4a0b0", art: "/project-media/byeoljari-art-saju.webp",
    stars: [...octagon, [0, 2], [0, -2]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0], [8, 9]],
  },
  {
    // TarotLineArt: card frame with the cross in its center
    id: "tarot", name: "타로", azimuth: 27, altitude: 57, color: "#c084fc", art: "/project-media/byeoljari-art-tarot.webp",
    stars: [[-3.2, 4.5], [3.2, 4.5], [3.2, -4.5], [-3.2, -4.5], [0, 2.2], [0, -1], [-1.6, .6], [1.6, .6]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [6, 7]],
  },
] as const;

export type ConstellationId = (typeof constellations)[number]["id"];
export type ConstellationButtons = Partial<Record<ConstellationId, HTMLButtonElement>>;
