import { getTranslations } from "next-intl/server";
import { FaLinkedin } from "react-icons/fa";
import Image from "next/image";

export default async function AboutPage() {
  const tHero = await getTranslations("about.hero");
  const tCards = await getTranslations("about.cards");
  const tTeam = await getTranslations("about.team");

  const cards = [
    {
      title: tCards("vision.title"),
      description: tCards("vision.description"),
    },
    {
      title: tCards("mission.title"),
      description: tCards("mission.description"),
    },
    {
      title: tCards("values.title"),
      description: tCards("values.description"),
    },
  ];

  const teamMembers = tTeam.raw("members") as {
    name: string;
    role: string;
    description: string;
    image: string;
    linkedin: string;
  }[];

  return (
    <main className="px-4 base:px-6 md:px-12 lg:px-20 xl:px-28 2xl:px-32">
      <section className="text-center md:text-left min-h-[80vh] flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="md:hidden"></div>
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-text opacity-90">
            {tHero("title")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground opacity-80">
            {tHero("description")}
          </p>
        </div>

        <div className="relative w-full aspect-[3/2]">
          <Image
            fill
            src="/images/about-hero.png"
            alt="Our Story"
            className="w-full rounded-xl shadow-md object-cover"
          />
        </div>
      </section>
      <section className="py-20">
        <div className="mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-text">
            {tCards("sectionTitle")}
          </h2>
          <p className="text-lg text-muted-foreground opacity-80 mb-12 max-w-3xl mx-auto">
            {tCards("sectionDescription")}
          </p>

          <div className="flex flex-col md:flex-row gap-8">
            {cards.map((card, index) => (
              <div
                key={index}
                className="flex-1 bg-primary rounded-xl shadow-lg p-6"
              >
                <h3 className="text-2xl font-semibold mb-3 text-text">
                  {card.title}
                </h3>
                <p className="text-muted-foreground opacity-80 leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-text">
            {tTeam("sectionTitle")}
          </h2>
          <p className="text-lg text-muted-foreground opacity-80 mb-12 max-w-3xl mx-auto">
            {tTeam("sectionDescription")}
          </p>

          <div className="flex flex-col md:flex-row gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="flex-1  bg-primary rounded-xl shadow-lg p-6 flex flex-col items-center text-center"
              >
                <div className="relative w-full aspect-square mb-4">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="rounded-xl object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>

                <h3 className="text-2xl font-semibold text-text mb-1">
                  {member.name}
                </h3>
                <p className="text-text opacity-90 font-medium mb-2">
                  {member.role}
                </p>
                <p className="text-muted-foreground opacity-80 leading-relaxed mb-4">
                  {member.description}
                </p>
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <FaLinkedin className="w-5 h-5" />
                  LinkedIn
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
