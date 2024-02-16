"use client";
import React, { useState } from "react";
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
              <div className=" flex flex-col items-center justify-center">
                <UpdateIcon className="w-6 h-6  animate-spin" />
                <span className=" text-sm font-light  text-zinc-400 dark:text-zinc-400">
                  {" "}
                  Loading
                </span>
              </div>
            </div>
            <iframe
              className=" absolute w-full z-10  h-[calc(100vh-9rem)] mt-12 "
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
                  className="md:p-6 p-2 shadow-none"
                  key={index}
                >
                  <Card className="p-1 shadow-none rounded-2xl">
                    <div className=" w-full  h-full aspect-video relative">
                      <Image
                        className="rounded-xl"
                        src={card.image}
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
          Hi, I am Divyansh Maewal, a UX/UI designer with a passion for creating
          beautiful and functional designs. I have a strong foundation in
          graphic design and a keen eye for detail. I am a creative thinker who
          enjoys solving complex problems and creating intuitive user
          experiences. I am always looking for new challenges and opportunities
          to learn and grow as a designer. I am passionate about creating
          designs that are not only visually appealing but also user-friendly
          and accessible to everyone. I am excited about the future of design
          and the impact it can have on the world. I am always looking for new
          opportunities to collaborate with other designers and developers to
          create innovative and impactful designs.
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
        <p>Email : maewal.divyansh@gmai.com</p>
        <br />
        <br />
      </section>
    </main>
  );
}
