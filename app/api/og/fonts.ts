export async function loadFonts() {
  const [nunitoBold, nunitoRegular] = await Promise.all([
    loadGoogleFont("Nunito", 700),
    loadGoogleFont("Nunito", 400),
  ]);
  return [
    {
      name: "Nunito",
      data: nunitoBold,
      weight: 700 as const,
      style: "normal" as const,
    },
    {
      name: "Nunito",
      data: nunitoRegular,
      weight: 400 as const,
      style: "normal" as const,
    },
  ];
}

async function loadGoogleFont(
  family: string,
  weight: number
): Promise<ArrayBuffer> {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${family.replace(" ", "+")}:wght@${weight}`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
      },
    }
  ).then((r) => r.text());

  const url = css.match(
    /src: url\((.+?)\) format\('(opentype|truetype)'\)/
  )?.[1];
  if (!url)
    throw new Error(`Could not find font URL for ${family} ${weight}`);
  return fetch(url).then((r) => r.arrayBuffer());
}
