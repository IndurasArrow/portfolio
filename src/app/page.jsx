"use client";
import React, { useState, useCallback, useEffect } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
// import { loadAll } from "@/tsparticles/all"; // if you are going to use `loadAll`, install the "@tsparticles/all" package too.
// import { loadFull } from "tsparticles"; // if you are going to use `loadFull`, install the "tsparticles" package too.
import { loadSlim } from "@tsparticles/slim"; // if you are going to use `loadSlim`, install the "@tsparticles/slim" package too.
// import { loadBasic } from "@tsparticles/basic"; // if you are going to use `loadBasic`, install the "@tsparticles/basic" package too.
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UpdateIcon } from "@radix-ui/react-icons";
import Image from "next/image";

export default function Home() {
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState("");
  const [title, setTitle] = useState("");
  const CardList = [
    {
      title: "Plant Care",
      image: "/1.jpg",
      link: "https://drive.google.com/file/d/1-BUgz7JD6IXPZVvAfpzeGbkj4bR3e6-S/preview",
    },
    {
      title: "Health Care",
      image: "/2.jpg",
      link: "https://drive.google.com/file/d/10Vad8qUQWH35hss8drF-Awajn-hrx-Pd/preview",
    },
    {
      title: "Pillo",
      image: "/3.jpg",
      link: "https://drive.google.com/file/d/1tUntOUP5qq2kJ1w14QuydhCiFkTFFHI7/preview",
    },
    {
      title: "Uzumaki",
      image: "/4.jpg",
      link: "https://drive.google.com/file/d/1C-2xUfjGuFXUt9l7YzQbnQX0Z9uWO5lC/preview",
    },
  ];

  const [init, setInit] = useState(false);

  const particlesLoaded = (container) => {
    console.log(container);
  };

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
      // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
      // starting from v2 you can add only the features you need reducing the bundle size
      //await loadAll(engine);
      //await loadFull(engine);
      await loadSlim(engine);
      //await loadBasic(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  return (
    <main className=" w-full flex flex-col  items-center  mt-20 ">
      {open && (
        <div className="fixed top-0 bg-background z-10 left-0 w-full h-full   ">
          <div className="w-full  flex flex-col  h-[calc(100vh-5.2rem)] mt-20 ">
            <div className="  m-auto px-2 w-full max-w-3xl flex justify-between items-center mb-2">
              <h4 className=" text-2xl font-bold">{title}</h4>
              <Button
                variant="outline"
                onClick={() => {
                  setLink("");
                  setTitle("");
                  setOpen(false);
                  document.body.style.overflow = "auto";
                }}
              >
                Close
              </Button>
            </div>
            <div className=" h-full flex flex-col items-center justify-center gap-2 w-full">
              <div className=" flex bg-background flex-col items-center justify-center">
                <UpdateIcon className="w-6 h-6  animate-spin" />
                <span className=" text-sm font-light bg-background  text-zinc-400 dark:text-zinc-400">
                  {" "}
                  Loading
                </span>
              </div>
            </div>
            <iframe
              className="  bg-background absolute w-full z-10  h-[calc(100vh-9rem)] mt-12 "
              src={link}
            ></iframe>
          </div>
        </div>
      )}
      <section className="max-w-7xl  w-11/12 flex flex-col  md:flex-row gap-4 md:items-end justify-end md:justify-start  pb-10 h-[calc(100vh-5rem)]">
        <h1 className="  font-normal text-clamp  leading-[100%]">
          UX/UI <br /> Designer
        </h1>
        <p className=" text-sm md:pb-6  text-zinc-400 dark:text-zinc-400">
          I am a UX/UI designer with a passion for creating <br /> beautiful and
          functional designs.
        </p>
      </section>
      <section id="work" className="max-w-7xl w-11/12 flex  py-2">
        <hr className=" w-full bg-input" />
      </section>
      <br />
      <br />
      <section className="max-w-7xl w-11/12 flex-col ">
        <h2 className="text-5xl font-light tracking-tight ">Work</h2>
        <br />
        <br />
        {
          <div className="grid grid-cols-1 md:grid-cols-2  gap-4">
            {CardList.map((card, index) => {
              return (
                <Card
                  onClick={() => {
                    setOpen(true);
                    setLink(card.link);
                    setTitle(card.title);
                    document.body.style.overflow = "hidden";
                  }}
                  className="md:p-6 p-2 shadow-none cursor-pointer "
                  key={index}
                >
                  <Card className="p-1 shadow-none rounded-2xl">
                    <div className=" w-full  h-full aspect-video relative">
                      <Image
                        className="rounded-xl"
                        src={`${card.image}`}
                        alt={card.title}
                        fill
                      />
                    </div>
                  </Card>
                  <h3 className="text-xl mt-2 ml-1.5  font-medium">
                    {card.title}
                  </h3>
                </Card>
              );
            })}
          </div>
        }
        <br />
        <br />
      </section>
      <section id="about" className="max-w-7xl w-11/12 flex  py-2">
        <hr className=" w-full bg-input" />
      </section>
      <br />
      <br />

      <section className="max-w-7xl w-11/12 flex-col ">
        <h2 className="text-5xl font-light tracking-tight ">About</h2>
        <br />
        <br />
        <p>
          I am a UX designer currently studying cyberlaw. I enjoy puzzles and
          challenges, work well in teams to brainstorm new ideas, along with the
          process of User Research for finding solutions to problems through
          design and thrive under pressure.
        </p>
        <br />
        <br />
      </section>

      <section id="about" className="max-w-7xl w-11/12 flex  py-2">
        <hr className=" w-full bg-input" />
      </section>
      <br />
      <br />

      <section className="max-w-7xl w-11/12 flex-col ">
        <h2 className="text-5xl font-light tracking-tight ">Contact</h2>
        <br />
        <br />
        <p>Email : maewal.divyansh@gmail.com</p>
        <br />
        <br />
      </section>
      <div className=" absolute -z-10 top-0">
        {init && (
          <Particles
            id="tsparticles"
            particlesLoaded={particlesLoaded}
            options={{
              background: {
                color: {
                  value: "#000000",
                },
              },
              fpsLimit: 120,
              interactivity: {
                events: {
                  onClick: {
                    enable: true,
                    mode: "push",
                  },
                  onHover: {
                    enable: true,
                    mode: "repulse",
                  },
                  resize: true,
                },
                modes: {
                  push: {
                    quantity: 4,
                  },
                  repulse: {
                    distance: 200,
                    duration: 0.4,
                  },
                },
              },
              particles: {
                color: {
                  value: "#ffffff",
                },
                links: {
                  color: "#ffffff",
                  distance: 150,
                  enable: false,
                  opacity: 0.5,
                  width: 1,
                },
                move: {
                  direction: "none",
                  enable: true,
                  outModes: {
                    default: "bounce",
                  },
                  random: false,
                  speed: 2,
                  straight: false,
                },
                number: {
                  density: {
                    enable: true,
                    area: 800,
                  },
                  value: 100,
                },
                opacity: {
                  value: 0.5,
                },
                shape: {
                  type: "circle",
                },
                size: {
                  value: { min: 1, max: 3 },
                },
              },
              detectRetina: true,
            }}
          />
        )}
      </div>
    </main>
  );
}
